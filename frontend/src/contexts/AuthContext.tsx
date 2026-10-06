import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
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
}

const AuthContext = createContext({} as AuthContextData);
const TOKEN_KEY = "@obra_facil_access_token";

async function saveToken(value: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(TOKEN_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function readToken() {
  if (Platform.OS === "web") return AsyncStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function removeToken() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
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

      const loggedUser = await getUser(savedToken);
      setToken(savedToken);
      setUser(loggedUser);
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

      const loggedUser = await getUser(savedToken);
      setToken(savedToken);
      setUser(loggedUser);
    } catch (error) {
      console.log("Sessão salva expirada:", error);
      await removeToken();
    } finally {
      setInitializing(false);
    }
  }

  async function login(email: string, senha: string) {
    setLoading(true);

    try {
      const response = await apiLogin(email, senha);
      await saveToken(response.accessToken);
      setToken(response.accessToken);

      const loggedUser = await getUser(response.accessToken);
      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!token) return;

    try {
      const response = await refreshToken(token);
      if (response.accessToken) {
        await saveToken(response.accessToken);
        setToken(response.accessToken);
        setUser(await getUser(response.accessToken));
      }
    } catch (error) {
      console.log(error);
      await logout();
    }
  }

  async function logout() {
    try {
      if (token) await apiLogout(token);
    } catch (error) {
      console.log(error);
    } finally {
      await removeToken();
      setUser(null);
      setToken(null);
    }
  }

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
