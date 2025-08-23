// app/tabs/discover.tsx
import { FIREBASE_DB } from "@/firebaseConfig";
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Platform,
  SafeAreaView, StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// --- CORRECTED IMPORT PATHS ---
import { AppUser, useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PulsingAvatar = ({ uri, style, isPulsing = false }: { uri: string; style: any; isPulsing?: boolean }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isPulsing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
        Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [isPulsing]);
  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Image style={style} source={{ uri }} />
    </Animated.View>
  );
};

const UserCard = ({ user, isExpanded, onWave, hasWaved, onPress, index }: {
  user: AppUser;
  isExpanded: boolean;
  onWave: () => void;
  hasWaved: boolean;
  onPress: () => void;
  index: number;
}) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: 1, duration: 600, delay: index * 100, useNativeDriver: true, }).start();
  }, []);

  const handlePressIn = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start(); };
  const handlePressOut = () => { Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start(); };
  const handleWavePress = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onWave(); };
  const translateY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });
  const opacity = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale: scaleAnim }], opacity }}>
      <TouchableOpacity
        onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, isExpanded && styles.expandedCard]}
        activeOpacity={0.95}
      >
        <View style={styles.cardHeader}>
          <View>
            <PulsingAvatar uri={user.avatarUrl} style={styles.avatar} isPulsing={isExpanded} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{user.displayName}</Text>
            {!isExpanded && <Text numberOfLines={2} style={[styles.cardBioPreview, { color: colors.icon }]}>{user.bio || "No bio available"}</Text>}
          </View>
          <View style={styles.chevronContainer}><Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" /></View>
        </View>
        {isExpanded && (
          <View style={styles.cardBody}>
            <Text style={[styles.cardBioFull, { color: colors.text }]}>{user.bio || "No bio available"}</Text>
            <TouchableOpacity style={[styles.waveButton, hasWaved && styles.wavedButton]} onPress={handleWavePress} disabled={hasWaved}>
              <LinearGradient colors={hasWaved ? ['#10B981', '#059669'] : ['#FF0066', '#E11D48']} style={styles.waveButtonGradient}>
                <Feather name={hasWaved ? "check-circle" : "send"} size={18} color="white" />
                <Text style={styles.waveButtonText}>{hasWaved ? "Waved ✨" : "Send Wave"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Discover() {
  const { user } = useAuth();
  const { theme, colors } = useTheme();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [wavedUsers, setWavedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [loading]);

  useEffect(() => {
    if (!user) return;
    const usersQuery = query(collection(FIREBASE_DB, "users"), where("uid", "!=", user.uid));
    const unsubscribeUsers = onSnapshot(usersQuery, snapshot => { setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser))); setLoading(false); });
    const wavesQuery = query(collection(FIREBASE_DB, "waves"), where('from', '==', user.uid));
    const unsubscribeWaves = onSnapshot(wavesQuery, snapshot => setWavedUsers(new Set(snapshot.docs.map(doc => doc.data().to))));
    return () => { unsubscribeUsers(); unsubscribeWaves(); };
  }, [user]);

  const handleWave = async (otherUser: AppUser) => {
    if (!user) return;
    const waveId = `${user.uid}_${otherUser.uid}`;
    await setDoc(doc(FIREBASE_DB, 'waves', waveId), { from: user.uid, to: otherUser.uid, status: 'pending', createdAt: new Date() });
    setActiveUserId(null);
  };
  
  const handleCardPress = (item: AppUser, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveUserId(activeUserId === item.uid ? null : item.uid);
    setTimeout(() => flatListRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0.3 }), 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0066" />
          <Text style={[styles.loadingText, { color: colors.text }]}>Discovering amazing people...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Discover</Text>
      </View>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          ref={flatListRef}
          data={users}
          renderItem={({ item, index }) => (
            <UserCard user={item} isExpanded={activeUserId === item.uid} onPress={() => handleCardPress(item, index)} onWave={() => handleWave(item)} hasWaved={wavedUsers.has(item.uid)} index={index}/>
          )}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  loadingText: { marginTop: 20, fontSize: 18, fontWeight: '600', },
  header: { padding: 24, borderBottomWidth: 1, },
  headerTitle: { fontSize: 28, fontWeight: "800", },
  listContent: { padding: 12, paddingBottom: 100 },
  card: { marginVertical: 8, marginHorizontal: 12, borderRadius: 20, padding: 16, borderWidth: 1, shadowColor: "#475569", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5, },
  expandedCard: { shadowColor: "#FF0066", shadowOpacity: 0.15, shadowRadius: 20, elevation: 12, transform: [{ scale: 1.02 }], borderColor: 'rgba(255, 0, 102, 0.2)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'white' },
  cardInfo: { flex: 1, marginLeft: 16, marginRight: 12 },
  cardName: { fontSize: 18, fontWeight: "700", },
  cardBioPreview: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  chevronContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(243, 244, 246, 0.8)', justifyContent: 'center', alignItems: 'center' },
  cardBody: { paddingTop: 20 },
  cardBioFull: { fontSize: 15, lineHeight: 24, marginBottom: 16 },
  waveButton: { borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#FF0066', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  wavedButton: { shadowColor: '#10B981' },
  waveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20, gap: 10 },
  waveButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});