import React, { useState, useEffect, createContext, useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, User as FirebaseAuthUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/firebaseConfig";

// Define the complete, app-wide User Profile type
export interface AppUser {
  uid: string;
  email: string | null;
  fullName: string;
  displayName: string;
  bio: string;
  interests: string[];
  location: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(FIREBASE_DB, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDocSnap.data() } as AppUser);
        } else {
          // This handles the brief moment after signup but before the profile is created
          // It keeps the user logged in so they can complete onboarding.
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'New User',
          } as AppUser); // Cast as AppUser to satisfy the type
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inTabsGroup = segments[0] === "tabs";

    if (user && !inTabsGroup) {
      router.replace("/tabs/discover");
    } else if (!user) {
      // If the user is not signed in, route them to the login screen.
      // This is a robust way to protect routes.
      router.replace("/auth/login");
    }
  }, [user, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}