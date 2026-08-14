import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { COLORS } from "@/styles/globalStyles";

type ThemeMode = "light" | "dark";

interface ThemeContextData {
  isDark: boolean;
  theme: typeof COLORS;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

interface Props {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const THEME_STORAGE_KEY = "@obra_facil_theme";

export function ThemeProvider({ children }: Props) {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (savedTheme === "dark" || savedTheme === "light") {
        setMode(savedTheme);
      }
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    } finally {
      setLoaded(true);
    }
  }

  async function setTheme(themeMode: ThemeMode) {
    try {
      setMode(themeMode);

      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
      console.log("Erro ao salvar tema:", error);
    }
  }

  function toggleTheme() {
    setTheme(mode === "dark" ? "light" : "dark");
  }

  const theme = useMemo(() => {
    if (mode === "light") {
      return COLORS;
    }

    return {
      ...COLORS,

      // Estrutura
      backgroundDestaque: "rgba(255, 255, 255, 0.10)",

      // Cards
      card: "#1E293B",
      cardHover: "#D9D7D7",

      // Textos
      text: "#FFFFFF",
      textSecondary: "#D1D5DB",
      placeholder: "#A1A1AA",

      // Bordas
      border: "#374151",
      borderNull: "#4B5563",
    };
  }, [mode]);

  const value = useMemo(
    () => ({
      isDark: mode === "dark",
      theme,
      toggleTheme,
      setTheme,
    }),
    [mode, theme],
  );

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
