import {
  createContext,
  useContext,
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

  login(
    email: string,
    senha: string
  ): Promise<void>;

  logout(): Promise<void>;

  refresh(): Promise<void>;

  setUser(user: User | null): void;

  setToken(token: string | null): void;
}

const AuthContext =
  createContext({} as AuthContextData);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function login(
    email: string,
    senha: string
  ) {
    setLoading(true);

    try {
      const response =
        await apiLogin(email, senha);

      setToken(response.accessToken);

      const loggedUser =
        await getUser(response.accessToken);

      setUser(loggedUser);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!token) return;

    try {
      const response =
        await refreshToken(token);

      if (response.accessToken) {
        setToken(response.accessToken);

        const loggedUser =
          await getUser(response.accessToken);

        setUser(loggedUser);
      }
    } catch (error) {
      console.log(error);

      await logout();
    }
  }

  async function logout() {
    try {
      if (token) {
        await apiLogout(token);
      }
    } catch {}

    setUser(null);

    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,

        loading,

        login,
        logout,
        refresh,

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