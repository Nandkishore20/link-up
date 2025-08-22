import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  Haptics,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { collection, onSnapshot, query, setDoc, doc, where } from "firebase/firestore";
import { FIREBASE_DB } from "@/firebaseConfig";
import { useAuth, AppUser } from "../_layout";
import { Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom Layout Animation Presets
const CustomLayoutAnimation = {
  smooth: {
    duration: 250,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'easeInEaseOut' },
    delete: { type: 'easeInEaseOut', property: 'opacity' }
  }
};

// --- ENHANCED PULSE ANIMATION FOR AVATAR ---
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


// --- ENHANCED SWIPEABLE USER CARD ---
const UserCard = ({ user, isExpanded, onWave, hasWaved, onPress, index }: {
  user: AppUser;
  isExpanded: boolean;
  onWave: () => void;
  hasWaved: boolean;
  onPress: () => void;
  index: number;
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Staggered entrance animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleWavePress = () => {
    if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onWave();
  };

  const translateY = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });
  const opacity = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale: scaleAnim }], opacity }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, isExpanded && styles.expandedCard]}
        activeOpacity={0.95}
      >
        {isExpanded && <LinearGradient colors={['rgba(255, 0, 102, 0.05)', 'rgba(255, 0, 102, 0.02)']} style={StyleSheet.absoluteFill} />}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <PulsingAvatar uri={user.avatarUrl} style={styles.avatar} isPulsing={isExpanded} />
            <View style={[styles.onlineIndicator, hasWaved && styles.wavedIndicator]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>{user.displayName}</Text>
            {!isExpanded && <Text numberOfLines={2} style={styles.cardBioPreview}>{user.bio || "No bio available"}</Text>}
          </View>
          <View style={styles.chevronContainer}><Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" /></View>
        </View>
        {isExpanded && (
          <View style={styles.cardBody}>
            <Text style={styles.cardBioFull}>{user.bio || "No bio available"}</Text>
            {user.interests && user.interests.length > 0 && (
              <View style={styles.tagRow}>
                {user.interests.slice(0, 4).map(interest => (
                  <View key={interest} style={styles.interestTag}><Text style={styles.interestTagText}>{interest}</Text></View>
                ))}
                {user.interests.length > 4 && <View style={[styles.interestTag, styles.moreTag]}><Text style={styles.moreTagText}>+{user.interests.length - 4}</Text></View>}
              </View>
            )}
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


// --- MAIN DISCOVER COMPONENT ---
export default function Discover() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [wavedUsers, setWavedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in animation for the whole list
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
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveUserId(activeUserId === item.uid ? null : item.uid);
    setTimeout(() => flatListRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0.3 }), 100);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, you might re-fetch data here.
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0066" />
          <Text style={styles.loadingText}>Discovering amazing people...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <BlurView intensity={95} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
            <View>
                <Text style={styles.headerTitle}>Discover</Text>
                <Text style={styles.headerSubtitle}>{users.length} {users.length === 1 ? 'person' : 'people'} found</Text>
            </View>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7} onPress={handleRefresh}>
                <Feather name="refresh-cw" size={20} color="#6B7280" />
            </TouchableOpacity>
        </View>
      </BlurView>
      
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        <FlatList
          ref={flatListRef}
          data={users}
          renderItem={({ item, index }) => (
            <UserCard
              user={item}
              isExpanded={activeUserId === item.uid}
              onPress={() => handleCardPress(item, index)}
              onWave={() => handleWave(item)}
              hasWaved={wavedUsers.has(item.uid)}
              index={index}
            />
          )}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF",marginTop: 20, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  loadingText: { marginTop: 20, fontSize: 18, fontWeight: '600', color: "#1F2937" },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.6)', zIndex: 100 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#111827" },
  headerSubtitle: { fontSize: 14, color: "#6B7280", fontWeight: '500', marginTop: 2 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(243, 244, 246, 0.8)', justifyContent: 'center', alignItems: 'center' },
  mainContent: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 100 },
  
  // Enhanced Card Styles
  card: { backgroundColor: 'white', marginVertical: 8, marginHorizontal: 12, borderRadius: 20, padding: 16, shadowColor: "#475569", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: 'rgba(229, 231, 235, 0.5)' },
  expandedCard: { shadowColor: "#FF0066", shadowOpacity: 0.15, shadowRadius: 20, elevation: 12, transform: [{ scale: 1.02 }], borderColor: 'rgba(255, 0, 102, 0.2)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'white' },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#10B981', borderWidth: 2, borderColor: 'white' },
  wavedIndicator: { backgroundColor: '#8B5CF6' },
  cardInfo: { flex: 1, marginLeft: 16, marginRight: 12 },
  cardName: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  cardBioPreview: { fontSize: 14, color: '#6B7280', marginTop: 4, lineHeight: 20 },
  chevronContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(243, 244, 246, 0.8)', justifyContent: 'center', alignItems: 'center' },
  cardBody: { paddingTop: 20 },
  cardBioFull: { fontSize: 15, color: '#374151', lineHeight: 24, marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
  interestTag: { backgroundColor: '#FEF7FF', borderWidth: 1, borderColor: '#E879F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  interestTagText: { color: '#A21CAF', fontSize: 12, fontWeight: '600' },
  moreTag: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  moreTagText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  waveButton: { borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#FF0066', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  wavedButton: { shadowColor: '#10B981' },
  waveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20, gap: 10 },
  waveButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});