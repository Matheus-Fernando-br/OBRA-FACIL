import { Stack } from "expo-router";

import { AuthProvider } from "@/contexts/AuthContext";

import { useFonts } from "expo-font";
import {
  IntelOneMono_400Regular,
  IntelOneMono_500Medium,
  IntelOneMono_700Bold,
} from "@expo-google-fonts/intel-one-mono";

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IntelOneMono_400Regular,
    IntelOneMono_500Medium,
    IntelOneMono_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="(tabs)" />
    </Stack>
    </AuthProvider>
  );
}
