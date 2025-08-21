import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "@/firebaseConfig";
import { useAuth } from "../_layout";
import { Feather } from "@expo/vector-icons";

const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function Profile() {
  const { user } = useAuth();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }
  
  // --- Animation Interpolations ---
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 40],
    extrapolate: 'clamp',
  });
  
  const nameOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });
  
  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const handleSignOut = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => signOut(FIREBASE_AUTH) }
      ]
    );
  };
  
  const handleEdit = () => {
    Alert.alert("Edit Profile", "This feature is coming soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Collapsing Header --- */}
      <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}>
        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: imageScale }, { translateY: imageTranslateY }] }]}>
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        </Animated.View>
      </Animated.View>
      
      {/* --- Compact Header (Appears on scroll) --- */}
      <Animated.View style={[styles.compactHeader, { opacity: compactHeaderOpacity }]}>
        <View style={styles.compactHeaderBackground} />
        <Text style={styles.compactHeaderName}>{user.displayName}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Feather name="edit-3" size={20} color="#1F2937" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 40 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        <View style={styles.profileInfoContainer}>
            <Animated.View style={{ opacity: nameOpacity }}>
                <Text style={styles.name}>{user.displayName}</Text>
                <Text style={styles.location}>{user.location || "Location not set"}</Text>
            </Animated.View>

            {/* Social Stats */}
            <View style={styles.statsContainer}>
            </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.sectionContent}>{user.bio || "No bio yet. Tap 'Edit Profile' to add one!"}</Text>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tagRow}>
              {(user.interests || []).map((interest) => (
                <View key={interest} style={styles.interestTag}><Text style={styles.interestTagText}>{interest}</Text></View>
              ))}
            </View>
        </View>
        
        {/* Actions Section */}
        <View style={styles.section}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Feather name="edit-2" size={16} color="#FF0066" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
             <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <Feather name="log-out" size={16} color="#EF4444" />
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  header: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_MAX_HEIGHT, backgroundColor: '#FFFFFF', alignItems: 'center', zIndex: 1, overflow: 'hidden' },
  avatarContainer: { width: '100%', height: '100%' },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  compactHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_MIN_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16, zIndex: 2 },
  compactHeaderBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)' },
  compactHeaderName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(243, 244, 246, 0.9)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(229, 231, 235, 0.7)' },

  profileInfoContainer: { paddingHorizontal: 24, alignItems: 'center', marginTop: -80, zIndex: 3 },
  name: { fontSize: 32, fontWeight: "bold", color: '#1F2937' },
  location: { fontSize: 16, color: '#4B5563', marginTop: 4 },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 24, borderRadius: 16, padding: 20},
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },

  section: { marginTop: 24, paddingHorizontal: 24, paddingBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  sectionContent: { fontSize: 16, color: '#374151', lineHeight: 24 },
  
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  interestTag: { backgroundColor: '#FFF0F7', borderWidth: 1, borderColor: '#FFADDD', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  interestTagText: { color: '#86198F', fontSize: 14, fontWeight: '600' },
  
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F7', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FFADDD', marginBottom: 12 },
  editButtonText: { color: '#FF0066', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  logoutButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});