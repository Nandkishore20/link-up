// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

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
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}