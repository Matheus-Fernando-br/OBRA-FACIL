import { createContext, useContext, useState, ReactNode } from "react";

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

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;

  signOut: () => void;
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  function signOut() {
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}