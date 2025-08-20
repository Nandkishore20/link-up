// app/auth/login.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../../firebaseConfig"; // adjust path if your alias differs

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email.trim(), password);
      // AuthProvider redirects automatically
    } catch (error: any) {
      Alert.alert("Login Error", error?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (loading) return;
    // if (!email.includes("@") || password.length < 6) {
    //   return Alert.alert("Validation", "Please enter a valid email and a password with at least 6 characters.");
    // }
    setLoading(true);
    try {
      
      // Redirect into the onboarding flow and pass uid + email
      // Use replace so user can't go "back" to the signup form
      router.replace({
        pathname: "/auth/onboarding",
      });
    } catch (error: any) {
      let message = "An error occurred during sign-up.";
      if (error.code === "auth/email-already-in-use") message = "This email is already in use.";
      else if (error.code === "auth/weak-password") message = "The password must be at least 6 characters long.";
      Alert.alert("Sign Up Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.title}>LinkUp</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(t) => setEmail(t)}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(t) => setPassword(t)}
        secureTextEntry
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 8 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={handleSignUp}>
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.push("/auth/login")}>
            <Text style={{ color: "#6B7280", textAlign: "center" }}>Need help signing in?</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F8FAFF" },
  title: { fontSize: 34, fontWeight: "800", textAlign: "center", marginBottom: 28, color: "#3730A3" },
  input: { height: 52, borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, backgroundColor: "white" },
  button: { backgroundColor: "#6366F1", padding: 14, borderRadius: 12, alignItems: "center", marginVertical: 6 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  buttonOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#6366F1" },
  buttonOutlineText: { color: "#6366F1" },
});
