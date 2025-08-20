import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, LayoutAnimation, UIManager, Platform } from "react-native";
import { collection, onSnapshot, query, setDoc, doc, where } from "firebase/firestore";
import { FIREBASE_DB } from "@/firebaseConfig";
import { useAuth, AppUser } from "../_layout";
import { useRouter } from "expo-router";
import { Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UserCard = ({ user, onWave, hasWaved }: { user: AppUser, onWave: () => void, hasWaved: boolean }) => (
  <View style={styles.card}>
    <Image style={styles.avatar} source={{ uri: user.avatarUrl }} />
    <View style={styles.cardInfo}>
      <Text style={styles.cardName}>{user.displayName}</Text>
      <Text style={styles.cardBio}>{user.bio}</Text>
      <View style={styles.tagRow}>
        {(user.interests || []).slice(0, 3).map((interest) => (
          <Text key={interest} style={styles.interestTag}>{interest}</Text>
        ))}
      </View>
      <TouchableOpacity 
        style={[styles.waveButton, hasWaved && styles.wavedButton]} 
        onPress={onWave}
        disabled={hasWaved}
      >
        <Text style={styles.waveButtonText}>{hasWaved ? "Waved ✔️" : "Wave 👋"}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function Discover() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [wavedUsers, setWavedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Listen for all users
    const usersQuery = query(collection(FIREBASE_DB, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => ({ uid: doc.id, ...doc.data() } as AppUser))
        .filter((profile) => profile.uid !== user.uid);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setUsers(usersData);
      setLoading(false);
    });

    // Listen for waves you've already sent
    const wavesQuery = query(collection(FIREBASE_DB, "waves"), where('from', '==', user.uid));
    const unsubscribeWaves = onSnapshot(wavesQuery, (snapshot) => {
        const wavedIds = new Set(snapshot.docs.map(doc => doc.data().to));
        setWavedUsers(wavedIds);
    });

    return () => {
        unsubscribeUsers();
        unsubscribeWaves();
    };
  }, [user]);

  const handleWave = async (otherUser: AppUser) => {
    if (!user) return;
    
    const waveId = `${user.uid}_${otherUser.uid}`; // Consistent ID
    const waveDocRef = doc(FIREBASE_DB, 'waves', waveId);

    try {
      await setDoc(waveDocRef, {
        from: user.uid,
        to: otherUser.uid,
        status: 'pending',
        createdAt: new Date(),
      });
      // The UI will update automatically via the snapshot listener
    } catch (error) {
        console.error("Failed to send wave:", error);
    }
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserCard 
            user={item} 
            onWave={() => handleWave(item)}
            hasWaved={wavedUsers.has(item.uid)}
          />
        )}
        keyExtractor={(item) => item.uid}
        ListHeaderComponent={<Text style={styles.title}>Discover Others</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>No other users found yet.</Text>}
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 20, paddingHorizontal: 10 },
  emptyText: { textAlign: "center", marginTop: 50, color: "gray" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, marginHorizontal: 10, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 12 },
  cardInfo: { alignItems: 'center' },
  cardName: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  cardBio: { fontSize: 14, color: "#6B7280", textAlign: 'center', marginTop: 4, marginBottom: 12 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: 'center', marginBottom: 16 },
  interestTag: { backgroundColor: "#E0E7FF", color: "#4338CA", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, fontSize: 12, margin: 4, overflow: "hidden" },
  waveButton: { backgroundColor: '#4F46E5', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, width: '100%' },
  wavedButton: { backgroundColor: '#A5B4FC' },
  waveButtonText: { color: 'white', fontWeight: '600', textAlign: 'center' },
});