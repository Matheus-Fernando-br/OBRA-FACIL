import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextData {
  user: User | null;

  signIn: (email: string, password: string) => Promise<void>;

  signOut: () => void;
}

const AuthContext = createContext({} as AuthContextData);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  async function signIn(email: string, password: string) {
    // Simulação futura API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUser({
      name: "Matheus",
      email,
    });
  }

  function signOut() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
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
