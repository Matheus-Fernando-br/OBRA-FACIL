import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { router } from "expo-router";

import {
  api,
  login as apiLogin,
  logout as apiLogout,
  refreshToken,
  getUser,
} from "../services/api";

export interface User {
  _id: string;
  nome: string;
  email: string;
  CPF?: string;
  CNPJ?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  biometricAvailable: boolean;
  login(email: string, senha: string): Promise<void>;
  loginWithBiometrics(): Promise<boolean>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
  authenticateWithBiometrics(): Promise<boolean>;
  setUser(user: User | null): void;
  setToken(token: string | null): void;
  /** Guarda a sessão nova devolvida pela API (ex.: após trocar a senha). */
  updateAccessToken(token: string, refreshToken?: string): Promise<void>;
}

const AuthContext = createContext({} as AuthContextData);
// O SecureStore só aceita letras, números, ".", "-" e "_" (sem "@").
const TOKEN_KEY = "obra_facil_access_token";
const REFRESH_KEY = "obra_facil_refresh_token";

/*
 * Sessão: access token curto (1 h) + refresh token (30 dias), ambos no
 * armazenamento seguro do aparelho. O refresh token é trocado a cada uso.
 */
async function storeItem(key: string, value: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function readItem(key: string) {
  if (Platform.OS === "web") return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

const saveToken = (value: string) => storeItem(TOKEN_KEY, value);
const readToken = () => readItem(TOKEN_KEY);

async function saveSession(accessToken: string, refresh?: string) {
  await saveToken(accessToken);
  if (refresh) await storeItem(REFRESH_KEY, refresh);
}

async function removeToken() {
  await Promise.all([deleteItem(TOKEN_KEY), deleteItem(REFRESH_KEY)]);
}

/** Erros 401 de regra de negócio (ex.: senha atual errada) não encerram a sessão. */
const NOT_SESSION_ERRORS = ["WRONG_PASSWORD", "CURRENT_PASSWORD_REQUIRED", "INVALID_CREDENTIALS"];

/** Renova a sessão com o refresh token salvo. Devolve o access token novo ou null. */
async function renewSession(): Promise<string | null> {
  const stored = await readItem(REFRESH_KEY);
  if (!stored) return null;
  try {
    const response = await refreshToken(stored);
    if (!response?.accessToken) return null;
    await saveSession(response.accessToken, response.refreshToken);
    return response.accessToken;
  } catch (error: any) {
    // Só descarta a sessão se o servidor recusar; falha de rede mantém.
    if (error?.response?.status === 401) await removeToken();
    return null;
  }
}

/** Carrega o usuário; se o token expirou, renova uma vez e tenta de novo. */
async function loadUserWithRenewal(savedToken: string) {
  try {
    return { token: savedToken, user: await getUser(savedToken) };
  } catch (error: any) {
    if (error?.response?.status !== 401) throw error;
    const next = await renewSession();
    if (!next) throw error;
    return { token: next, user: await getUser(next) };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    bootstrapSession();
  }, []);

  async function checkBiometrics() {
    if (Platform.OS === "web") return false;

    try {
      const [hardware, enrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      const available = hardware && enrolled;
      setBiometricAvailable(available);
      return available;
    } catch {
      return false;
    }
  }

  async function authenticateWithBiometrics() {
    if (!(await checkBiometrics())) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloqueie o Obra Fácil",
      fallbackLabel: "Usar senha",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false,
    });

    return result.success;
  }

  async function loginWithBiometrics() {
    try {
      const savedToken = await readToken();
      if (!savedToken || !(await authenticateWithBiometrics())) return false;

      const session = await loadUserWithRenewal(savedToken);
      setToken(session.token);
      setUser(session.user);
      return true;
    } catch (error) {
      console.log("Não foi possível desbloquear a sessão:", error);
      await removeToken();
      return false;
    }
  }

  async function bootstrapSession() {
    try {
      const savedToken = await readToken();
      if (!savedToken) return;

      const available = await checkBiometrics();
      if (available) {
        const unlocked = await authenticateWithBiometrics();
        if (!unlocked) return;
      }

      const session = await loadUserWithRenewal(savedToken);
      setToken(session.token);
      setUser(session.user);
    } catch (error: any) {
      // Só descarta a sessão se o servidor recusar o token; falha de rede
      // ou servidor acordando não deve deslogar o usuário.
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        console.log("Sessão salva expirada:", status);
        await removeToken();
      } else {
        console.log("Não foi possível validar a sessão (rede):", error?.message);
      }
    } finally {
      setInitializing(false);
    }
  }

  async function login(email: string, senha: string) {
    setLoading(true);

    try {
      const response = await apiLogin(email, senha);
      await saveSession(response.accessToken, response.refreshToken);
      setToken(response.accessToken);
      setUser(response.user ?? (await getUser(response.accessToken)));
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!token) return;

    const next = await renewSession();
    if (next) {
      setToken(next);
      setUser(await getUser(next));
    } else if (!(await readItem(REFRESH_KEY))) {
      await logout();
    }
  }

  async function updateAccessToken(next: string, nextRefresh?: string) {
    await saveSession(next, nextRefresh);
    setToken(next);
  }

  async function logout() {
    try {
      await apiLogout(await readItem(REFRESH_KEY));
    } catch (error) {
      console.log(error);
    } finally {
      await removeToken();
      setUser(null);
      setToken(null);
    }
  }

  /*
   * Sessão expirada: se a API responder 401 numa rota autenticada, tenta
   * renovar o token uma única vez e repete a requisição. Se não der,
   * encerra a sessão e volta para o login.
   */
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;
  const refreshing = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    const id = api.interceptors.response.use(undefined, async (error) => {
      const original = error?.config;
      const status = error?.response?.status;
      const url: string = original?.url ?? "";
      const current = tokenRef.current;

      const code = error?.response?.data?.code;
      if (
        status !== 401 ||
        !current ||
        url.startsWith("/auth/") ||
        original?._retried ||
        NOT_SESSION_ERRORS.includes(code)
      ) {
        return Promise.reject(error);
      }

      original._retried = true;

      refreshing.current ??= renewSession()
        .then((next) => {
          if (next) setToken(next);
          return next;
        })
        .finally(() => {
          refreshing.current = null;
        });

      const next = await refreshing.current;

      if (next) {
        original.headers = { ...original.headers, Authorization: `Bearer ${next}` };
        return api.request(original);
      }

      // Sem internet na hora de renovar: mantém a sessão e só falha esta chamada.
      if (await readItem(REFRESH_KEY)) return Promise.reject(error);

      await removeToken();
      setUser(null);
      setToken(null);
      router.replace({ pathname: "/login", params: { sessao: "expirada" } });
      return Promise.reject(error);
    });

    return () => api.interceptors.response.eject(id);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initializing,
        biometricAvailable,
        login,
        loginWithBiometrics,
        logout,
        refresh,
        authenticateWithBiometrics,
        setUser,
        setToken,
        updateAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
