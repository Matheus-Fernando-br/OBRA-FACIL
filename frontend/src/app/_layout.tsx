import { Stack } from "expo-router";

import { AuthProvider } from "@/contexts/AuthContext";

import { useFonts } from "expo-font";
import {
  IntelOneMono_400Regular,
  IntelOneMono_500Medium,
  IntelOneMono_700Bold,
} from "@expo-google-fonts/intel-one-mono";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IntelOneMono_400Regular,
    IntelOneMono_500Medium,
    IntelOneMono_700Bold,
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
