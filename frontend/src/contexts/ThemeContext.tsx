import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { COLORS, createGlobalStyles } from "@/styles/globalStyles";

type ThemeMode = "light" | "dark";

interface ThemeContextData {
  isDark: boolean;
  theme: typeof COLORS;
  styles: ReturnType<typeof createGlobalStyles>;
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

      backgroundDestaque: "rgba(0, 0, 0, 0.55)",

      gradientStart: "#0F172A",
      gradientEnd: "#243257",

      white: "#0F172A",

      card: "#1E293B",
      cardHover: "#334155",

      text: "#FFFFFF",
      textSecondary: "#CBD5E1",
      placeholder: "#94A3B8",

      border: "#334155",
      borderNull: "#475569",
    };
  }, [mode]);

  const styles = useMemo(() => {
    return createGlobalStyles(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      isDark: mode === "dark",
      theme,
      styles,
      toggleTheme,
      setTheme,
    }),
    [mode, theme, styles],
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
