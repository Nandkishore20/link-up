import { FIREBASE_AUTH, FIREBASE_DB } from "@/firebaseConfig";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- DATA FOR INTERESTS ---
const interestData = {
  "Hobbies & Activities": ["Photography", "Hiking", "Gaming", "Cooking", "Reading", "Art", "Writing", "Fitness"],
  "Vibes": ["Coffee Shops", "Spontaneous Adventures", "Rainy Days", "Live Music", "Cozy Nights In", "Deep Conversations"],
  "Music": ["Indie", "Pop", "Hip Hop", "Electronic", "Rock", "Classical"],
};

type OnboardForm = {
  fullName: string;
  email: string;
  password: string;
  displayName: string;
  bio: string;
  interests: string[]; // Changed to array for easier state management
  location: string;
  avatarUrl: string;
};

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardForm>({
    fullName: "",
    email: "",
    password: "",
    displayName: "",
    bio: "",
    interests: [],
    location: "",
    avatarUrl: "",
  });

  function update(field: keyof OnboardForm, value: string | string[]) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  const handleInterestToggle = (interest: string) => {
    setForm(prevState => {
      const newInterests = prevState.interests.includes(interest)
        ? prevState.interests.filter(i => i !== interest)
        : [...prevState.interests, interest];
      return { ...prevState, interests: newInterests };
    });
  };

  function validateStep() {
    if (step === 1) {
      if (!form.fullName.trim()) return "Please enter your full name.";
      if (!form.email.includes("@")) return "Please enter a valid email.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
    }
    if (step === 2) {
      if (!form.displayName.trim()) return "Please choose a display name.";
    }
    if (step === 3) {
      if (form.interests.length < 3) return "Please select at least 3 interests.";
    }
    return null;
  }

  async function finish() {
    const err = validateStep();
    if (err) return Alert.alert("Validation", err);

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(FIREBASE_AUTH, form.email.trim(), form.password);
      const user = cred.user;

      const avatar = form.avatarUrl?.trim() || `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(form.fullName)}`;
      try {
        await updateProfile(user, {
          displayName: form.displayName || form.fullName,
          photoURL: avatar,
        });
      } catch (e) {
        console.warn("updateProfile failed:", e);
      }

      const userDoc = {
        uid: user.uid,
        fullName: form.fullName,
        displayName: form.displayName || form.fullName,
        email: user.email || null,
        bio: form.bio || "",
        interests: form.interests,
        location: form.location || "",
        avatarUrl: avatar,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      } as const;

      await setDoc(doc(FIREBASE_DB, "users", user.uid), userDoc);
      router.replace("/tabs/discover");
    } catch (e: any) {
      console.error("Sign up failed:", e);
      let message = "Could not create account. Please try again.";
      if (e.code === 'auth/email-already-in-use') {
        message = 'This email address is already in use.';
      }
      Alert.alert("Sign up failed", message);
    } finally {
      setLoading(false);
    }
  }

  const nextStep = () => {
    const err = validateStep();
    if (err) return Alert.alert("Hold on!", err);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep((s) => Math.min(4, s + 1));
  };

  const prevStep = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep((s) => Math.max(1, s - 1));
  };
  
  const totalSteps = 4;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        {step > 1 && (
          <TouchableOpacity onPress={prevStep} style={[styles.backButton, { top: insets.top + 15 }]}>
            <Feather name="chevron-left" size={28} color="#111827" />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.title}>Let's create your account</Text>
            <Text style={styles.label}>Full Name</Text>
            <TextInput value={form.fullName} onChangeText={(t) => update("fullName", t)} placeholder="e.g. Alex Doe" style={styles.input} />
            <Text style={styles.label}>Email Address</Text>
            <TextInput value={form.email} onChangeText={(t) => update("email", t)} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" style={styles.input} />
            <Text style={styles.label}>Password</Text>
            <TextInput value={form.password} onChangeText={(t) => update("password", t)} secureTextEntry placeholder="Minimum 6 characters" style={styles.input} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.label}>Display Name</Text>
            <TextInput value={form.displayName} onChangeText={(t) => update("displayName", t)} placeholder="What should people call you?" style={styles.input} />
            <Text style={styles.label}>Your Bio</Text>
            <TextInput value={form.bio} onChangeText={(t) => update("bio", t)} placeholder="A short and sweet intro..." style={[styles.input, { height: 100 }]} multiline />
            <Text style={styles.label}>Location (Optional)</Text>
            <TextInput value={form.location} onChangeText={(t) => update("location", t)} placeholder="City, Country" style={styles.input} />
          </View>
        )}
        
        {step === 3 && (
            <View>
                <Text style={styles.title}>What are you into?</Text>
                <Text style={styles.subtitle}>Select at least 3. This helps us connect you with the right people.</Text>
                {Object.entries(interestData).map(([category, interests]) => (
                    <View key={category} style={styles.interestCategory}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        <View style={styles.interestGrid}>
                            {interests.map((interest) => (
                                <TouchableOpacity key={interest} style={[styles.interestChip, form.interests.includes(interest) && styles.interestChipSelected]} onPress={() => handleInterestToggle(interest)}>
                                    <Text style={[styles.interestText, form.interests.includes(interest) && styles.interestTextSelected]}>{interest}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        )}

        {/* --- FIXED THIS SECTION --- */}
        {step === 4 && (
          <View>
            <Text style={styles.title}>Set your profile picture</Text>
            <Text style={styles.subtitle}>You can add a link to an image, or leave it blank for an auto-generated avatar.</Text>
            <Text style={styles.label}>Avatar Image URL (Optional)</Text>
            <TextInput value={form.avatarUrl} onChangeText={(t) => update("avatarUrl", t)} placeholder="https://..." style={styles.input} />
          </View>
        )}
        {/* --- END OF FIX --- */}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={step < totalSteps ? nextStep : finish} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{step < totalSteps ? "Continue" : "Finish & Create Account"}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.replace("/auth/login")} style={{ marginTop: 24 }}>
          <Text style={styles.footerText}>Already have an account? <Text style={{fontWeight: 'bold', color: '#162660'}}>Log In</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingHorizontal: 20 },
  backButton: { position: 'absolute', left: 15, zIndex: 10, padding: 5 },
  progressContainer: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#162660', borderRadius: 4 },
  content: { flex: 1, padding: 25, justifyContent: 'center' },
  footer: { padding: 25, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#162660', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: { height: 50, backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: '#D0E6FD' },
  button: { 
    backgroundColor: "#162660", 
    height: 56, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: "#162660", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 6, 
    elevation: 5,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  buttonText: { color: "white", fontWeight: 'bold', fontSize: 16 },
  footerText: { color: "#6B7280", textAlign: 'center' },
  smallText: { color: "#6B7280", fontSize: 13, textAlign: 'center', marginTop: 12 },
  // --- Interest Styles ---
  interestCategory: { marginBottom: 20 },
  categoryTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  interestChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D0E6FD' },
  interestChipSelected: { backgroundColor: '#F1E4D1', borderColor: '#162660' },
  interestText: { color: '#374151', fontWeight: '500' },
  interestTextSelected: { color: '#162660' },
});