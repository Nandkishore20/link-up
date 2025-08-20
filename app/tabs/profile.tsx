// app/(tabs)/profile.tsx
import React from "react";
import { View, Text, StyleSheet, Button, Image, ScrollView, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "@/firebaseConfig";
import { useAuth } from "../_layout";
import { Feather } from "@expo/vector-icons";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading indicator
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.location}>{user.location || "Location not set"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bio</Text>
        <Text style={styles.cardContent}>{user.bio || "No bio yet."}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Interests</Text>
        <View style={styles.tagRow}>
          {(user.interests || []).map((interest) => (
            <Text key={interest} style={styles.interestTag}>
              {interest}
            </Text>
          ))}
        </View>
      </View>
      
      <TouchableOpacity style={styles.editButton}>
        <Feather name="edit-2" size={16} color="#4F46E5" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <Button title="Log Out" onPress={() => signOut(FIREBASE_AUTH)} color="#EF4444" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  header: { alignItems: "center", paddingVertical: 30, backgroundColor: 'white' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#4F46E5' },
  name: { fontSize: 28, fontWeight: "bold", marginTop: 12, color: '#111827' },
  location: { fontSize: 16, color: 'gray', marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginHorizontal: 20, marginTop: 20 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: '#374151', marginBottom: 8 },
  cardContent: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  interestTag: { backgroundColor: '#E0E7FF', color: '#4338CA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, fontSize: 14, marginRight: 8, marginBottom: 8, overflow: 'hidden' },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', paddingVertical: 12, borderRadius: 12, marginHorizontal: 20, marginTop: 20 },
  editButtonText: { color: '#4F46E5', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});