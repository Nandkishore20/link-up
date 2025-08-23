// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Custom theme for the friendship app
const friendshipTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#162660', // Dark blue
    secondary: '#D0E6FD', // Light blue
    tertiary: '#F1E4D1', // Cream
    surface: '#FFFFFF',
    background: '#F8FAFC',
    onPrimary: '#FFFFFF',
    onSecondary: '#162660',
    onTertiary: '#162660',
  },
};

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inAppGroup = segments[0] === "tabs" || segments[0] === "profile";

    if (user && !inAppGroup) {
      router.replace("/tabs/discover");
    } else if (!user && !inAuthGroup) {
      router.replace("/auth/login");
    }
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="profile/edit"
        options={{ presentation: 'modal', headerShown: true, title: 'Edit Profile' }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={friendshipTheme}>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}