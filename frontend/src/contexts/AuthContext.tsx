import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import {
  login as apiLogin,
  getUser,
  logout as apiLogout,
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

  login: (
    email: string,
    senha: string
  ) => Promise<void>;

  refreshUser: () => Promise<void>;

  logout: () => Promise<void>;

  setUser: (user: User |null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext({} as AuthContextData);

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
    try {

      setLoading(true);

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

  async function refreshUser() {

    if (!token) return;

    const loggedUser =
      await getUser(token);

    setUser(loggedUser);

  }

  async function logout() {

    try {

      await apiLogout();

    } finally {

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

        login,
        logout,
        refreshUser,

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