import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  COLORS,
  DARK_COLORS,
  ThemeColors,
  createGlobalStyles,
} from "@/styles/globalStyles";

type ThemeMode = "light" | "dark";
/** Preferência salva: tema fixo ou acompanhar o sistema. */
export type ThemePreference = ThemeMode | "system";

interface ThemeContextData {
  isDark: boolean;
  preference: ThemePreference;
  theme: ThemeColors;
  styles: ReturnType<typeof createGlobalStyles>;
  toggleTheme: () => void;
  setTheme: (mode: ThemePreference) => void;
}

interface Props {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const THEME_STORAGE_KEY = "@obra_facil_theme";

export function ThemeProvider({ children }: Props) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const systemScheme = useColorScheme();
  const mode: ThemeMode =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
        setPreference(savedTheme);
      }
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    } finally {
      setLoaded(true);
    }
  }

  async function setTheme(themeMode: ThemePreference) {
    try {
      setPreference(themeMode);

      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
      console.log("Erro ao salvar tema:", error);
    }
  }

  function toggleTheme() {
    setTheme(mode === "dark" ? "light" : "dark");
  }

  const theme = useMemo(
    () => (mode === "dark" ? DARK_COLORS : COLORS),
    [mode],
  );

  const styles = useMemo(() => {
    return createGlobalStyles(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      isDark: mode === "dark",
      preference,
      theme,
      styles,
      toggleTheme,
      setTheme,
    }),
    [mode, preference, theme, styles],
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
