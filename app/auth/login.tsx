// app/auth/login.tsx
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FIREBASE_AUTH } from "../../firebaseConfig"; // adjust path if your alias differs

const { width } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
      <View style={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>LinkUp</Text>
          <Text style={styles.subtitle}>Welcome back! Sign in to your account</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused,
                email && styles.inputFilled
              ]}
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(t) => setEmail(t)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[
                styles.input,
                passwordFocused && styles.inputFocused,
                password && styles.inputFilled
              ]}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(t) => setPassword(t)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF0066" />
                <Text style={styles.loadingText}>Signing you in...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={[
                    styles.primaryButton,
                    (!email || !password) && styles.buttonDisabled
                  ]} 
                  onPress={handleSignIn}
                  activeOpacity={0.8}
                  disabled={!email || !password}
                >
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={handleSignUp}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Create New Account</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={() => router.push("/auth/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.helpText}>Need help signing in?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAFBFF" 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: width > 600 ? 400 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: { 
    fontSize: 46, 
    fontWeight: "900", 
    textAlign: "center", 
    color: "#1E1B4B",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: { 
    height: 56, 
    borderColor: "#E5E7EB", 
    borderWidth: 1.5, 
    borderRadius: 16, 
    paddingHorizontal: 20, 
    backgroundColor: "white",
    fontSize: 16,
    color: "#111827",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    transition: 'all 0.2s ease',
  },
  inputFocused: {
    borderColor: "#FF0066",
    shadowColor: "#FF0066",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputFilled: {
    borderColor: "#059669",
  },
  buttonContainer: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  primaryButton: { 
    backgroundColor: "#FF0066", 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: "center", 
    marginBottom: 16,
    shadowColor: "#FF0066",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: { 
    color: "white", 
    fontWeight: "700", 
    fontSize: 18,
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0.1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: { 
    backgroundColor: "white", 
    borderWidth: 2, 
    borderColor: "#FF0066",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: { 
    color: "#FF0066", 
    fontWeight: "600", 
    fontSize: 16,
    letterSpacing: 0.25,
  },
  footer: {
    alignItems: 'center',
  },
  helpButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  helpText: { 
    color: "#6B7280", 
    textAlign: "center",
    fontSize: 15,
    fontWeight: "500",
  },
});