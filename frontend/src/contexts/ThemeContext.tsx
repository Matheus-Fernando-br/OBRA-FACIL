import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/services/api";

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
const isPreference = (v: unknown): v is ThemePreference => v === "dark" || v === "light" || v === "system";

/*
 * Tema: claro por padrão. A escolha fica salva no aparelho (AsyncStorage,
 * que no site é o localStorage) e na conta do usuário — ao entrar em outro
 * aparelho ou navegador, o tema escolhido é restaurado.
 */
export function ThemeProvider({ children }: Props) {
  const { user, token, setUser } = useAuth();
  const [preference, setPreference] = useState<ThemePreference>("light");
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

      if (isPreference(savedTheme)) setPreference(savedTheme);
    } catch (error) {
      console.log("Erro ao carregar tema:", error);
    } finally {
      setLoaded(true);
    }
  }

  // Ao entrar na conta, aplica o tema salvo nela.
  const appliedFor = useRef<string | null>(null);
  useEffect(() => {
    const saved = user?.preferencias?.tema;
    if (!user?._id || appliedFor.current === user._id) return;
    appliedFor.current = user._id;
    if (isPreference(saved)) {
      setPreference(saved);
      AsyncStorage.setItem(THEME_STORAGE_KEY, saved).catch(() => {});
    }
  }, [user]);

  async function setTheme(themeMode: ThemePreference) {
    setPreference(themeMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
      console.log("Erro ao salvar tema:", error);
    }
    if (user?._id && token && user.preferencias?.tema !== themeMode) {
      setUser({ ...user, preferencias: { ...user.preferencias, tema: themeMode } });
      updateUser(user._id, { preferencias: { tema: themeMode } }, token).catch((error) =>
        console.log("Não foi possível salvar o tema na conta:", error?.message),
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, preference, theme, styles, user, token],
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
