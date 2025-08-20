import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// A friendly, multi-step onboarding flow that creates the auth user
// and writes a user document to Firestore. Drop into `app/(auth)/onboarding.tsx` or
// `app/onboarding.tsx` depending on your routing structure.

type OnboardForm = {
  fullName: string;
  email: string;
  password: string;
  displayName: string;
  bio: string;
  interests: string; // comma separated
  location: string;
  avatarUrl: string;
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardForm>({
    fullName: "",
    email: "",
    password: "",
    displayName: "",
    bio: "",
    interests: "",
    location: "",
    avatarUrl: "",
  });

  function update(field: keyof OnboardForm, value: string) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  function validateStep() {
    if (step === 1) {
      if (!form.fullName.trim()) return "Please enter your full name.";
      if (!form.email.includes("@")) return "Please enter a valid email.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
    }
    if (step === 2) {
      if (!form.displayName.trim()) return "Please choose a display name.";
    }
    return null;
  }

  async function finish() {
    const err = validateStep();
    if (err) return Alert.alert("Validation", err);

    setLoading(true);
    try {
      // 1) Create auth user
      const cred = await createUserWithEmailAndPassword(FIREBASE_AUTH, form.email.trim(), form.password);
      const user = cred.user;

      // 2) Update displayName + photoURL on the Firebase Auth profile
      const avatar = form.avatarUrl?.trim() || `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(form.fullName)}`;
      try {
        await updateProfile(user, {
          displayName: form.displayName || form.fullName,
          photoURL: avatar,
        });
      } catch (e) {
        // not fatal — we still write the Firestore doc below
        console.warn("updateProfile failed:", e);
      }

      // 3) Write the user document in Firestore
      const interestsArray = form.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const userDoc = {
        uid: user.uid,
        fullName: form.fullName,
        displayName: form.displayName || form.fullName,
        email: user.email || null,
        bio: form.bio || "",
        interests: interestsArray,
        location: form.location || "",
        avatarUrl: avatar,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      } as const;

      await setDoc(doc(FIREBASE_DB, "users", user.uid), userDoc);

      // 4) Redirect into the app (tabs/discover)
      router.replace("/tabs/discover");
    } catch (e: any) {
      console.error("Sign up failed:", e);
      const message = e?.message || "Could not create account. Please try again.";
      Alert.alert("Sign up failed", message);
    } finally {
      setLoading(false);
    }
  }

  function next() {
    const err = validateStep();
    if (err) return Alert.alert("Validation", err);
    setStep((s) => Math.min(4, s + 1));
  }

  function prev() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Create your account</Text>

      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.label}>Full name</Text>
          <TextInput value={form.fullName} onChangeText={(t) => update("fullName", t)} placeholder="e.g. Ananya Patel" style={styles.input} />

          <Text style={styles.label}>Email</Text>
          <TextInput value={form.email} onChangeText={(t) => update("email", t)} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" style={styles.input} />

          <Text style={styles.label}>Password</Text>
          <TextInput value={form.password} onChangeText={(t) => update("password", t)} secureTextEntry placeholder="At least 6 characters" style={styles.input} />
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.label}>Display name</Text>
          <TextInput value={form.displayName} onChangeText={(t) => update("displayName", t)} placeholder="What should others call you?" style={styles.input} />

          <Text style={styles.label}>Short bio</Text>
          <TextInput value={form.bio} onChangeText={(t) => update("bio", t)} placeholder="Tell people who you are in one line" style={[styles.input, { height: 80 }]} multiline />
        </View>
      )}

      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.label}>Interests (comma-separated)</Text>
          <TextInput value={form.interests} onChangeText={(t) => update("interests", t)} placeholder="photography, coffee, hiking" style={styles.input} />

          <Text style={styles.label}>Location (optional)</Text>
          <TextInput value={form.location} onChangeText={(t) => update("location", t)} placeholder="City, Country" style={styles.input} />
        </View>
      )}

      {step === 4 && (
        <View style={styles.card}>
          <Text style={styles.label}>Avatar image URL (optional)</Text>
          <TextInput value={form.avatarUrl} onChangeText={(t) => update("avatarUrl", t)} placeholder="https://... or leave blank for auto avatar" style={styles.input} />

          <Text style={[styles.small, { marginTop: 12 }]}>Tip: leave blank to auto-generate a friendly avatar.</Text>
        </View>
      )}

      <View style={styles.footerRow}>
        {step > 1 ? (
          <TouchableOpacity style={[styles.button, styles.ghost]} onPress={prev} disabled={loading}>
            <Text style={styles.ghostText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 100 }} />
        )}

        {step < 4 ? (
          <TouchableOpacity style={styles.button} onPress={next} disabled={loading}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={finish} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginTop: 18 }}>
        <Text style={styles.small}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.replace("/auth/login")}> 
          <Text style={[styles.small, { color: "#4F46E5", marginTop: 8 }]}>Log in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, flexGrow: 1, backgroundColor: "#FFF" },
  header: { fontSize: 28, fontWeight: "700", marginBottom: 18, color: "#111827" },
  card: { backgroundColor: "#F8FAFF", borderRadius: 12, padding: 14, marginBottom: 18, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6 },
  label: { fontSize: 14, color: "#374151", marginBottom: 8 },
  input: { backgroundColor: "#FFF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  button: { backgroundColor: "#4F46E5", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, minWidth: 120, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600" },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#D1D5DB" },
  ghostText: { color: "#374151" },
  small: { color: "#6B7280", fontSize: 13, textAlign: "center" },
});
