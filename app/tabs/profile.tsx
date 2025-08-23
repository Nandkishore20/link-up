import { FIREBASE_AUTH } from "@/firebaseConfig";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Animation interpolations
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
    router.push('/profile/edit');
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, { backgroundColor: colors.card, transform: [{ translateY: headerTranslateY }] }]}>
        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: imageScale }, { translateY: imageTranslateY }] }]}>
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        </Animated.View>
      </Animated.View>
      
      <Animated.View style={[styles.compactHeader, { opacity: compactHeaderOpacity }]}>
        <View style={[styles.compactHeaderBackground, { backgroundColor: `${colors.card}e6` , borderBottomColor: colors.border }]} />
        <Text style={[styles.compactHeaderName, { color: colors.text }]}>{user.displayName}</Text>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} onPress={handleEdit}>
            <Feather name="edit-3" size={20} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 100 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        <View style={styles.profileInfoContainer}>
            <Animated.View style={{ opacity: nameOpacity, alignItems: 'center' }}>
                <Text style={[styles.name, { color: colors.text }]}>{user.displayName}</Text>
                <Text style={[styles.location, { color: colors.icon }]}>{user.location || "Location not set"}</Text>
            </Animated.View>
        </View>

        <View style={[styles.section, { paddingHorizontal: 24 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
            <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={theme === 'dark' ? 'moon' : 'sun'} size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
        </View>

        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About Me</Text>
            <Text style={[styles.sectionContent, { color: colors.text }]}>{user.bio || "No bio yet. Tap 'Edit Profile' to add one!"}</Text>
        </View>

        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Interests</Text>
            <View style={styles.tagRow}>
              {(user.interests || []).map((interest) => (
                <View key={interest} style={[styles.interestTag, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}80` }]}>
                    <Text style={[styles.interestTagText, { color: colors.primary }]}>{interest}</Text>
                </View>
              ))}
            </View>
        </View>
        
        <View style={styles.section}>
            <TouchableOpacity style={[styles.actionButton, styles.editButton]} >  
              {/* onPress={handleEdit} */}
                <Feather name="edit-2" size={16} color="#FF0066" />
                <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit Profile</Text>
            </TouchableOpacity>
             <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleSignOut}>
                <Feather name="log-out" size={16} color="#EF4444" />
                <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Log Out</Text>
            </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    height: HEADER_MAX_HEIGHT, 
    alignItems: 'center', 
    zIndex: 1, 
    overflow: 'hidden',
  },
  avatarContainer: { 
    width: '100%', 
    height: '100%',
    
  },
  avatar: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover',
  },
  compactHeader: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    height: HEADER_MIN_HEIGHT, 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingBottom: 16, 
    zIndex: 2,
  },
  compactHeaderBackground: { 
    ...StyleSheet.absoluteFillObject, 
    borderBottomWidth: 1,
  },
  compactHeaderName: { 
    fontSize: 20, 
    fontWeight: 'bold',
  },
  headerButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1,
  },
  profileInfoContainer: { 
    paddingHorizontal: 24, 
    alignItems: 'center', 
    marginTop: -80, 
    zIndex: 3,
  },
  name: { 
    fontSize: 32, 
    fontWeight: "bold",
  },
  location: { 
    fontSize: 16, 
    marginTop: 4,
  },
  section: { 
    marginTop: 24, 
    paddingHorizontal: 24, 
    paddingBottom: 12,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16,
  },
  sectionContent: { 
    fontSize: 16, 
    lineHeight: 24,
  },
  tagRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
  },
  interestTag: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1,
  },
  interestTagText: { 
    fontSize: 14, 
    fontWeight: '600',
  },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginBottom: 12,
  },
  actionButtonText: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8,
  },
  editButton: { 
    backgroundColor: '#FFF0F7', 
    borderColor: '#FFADDD',
  },
  editButtonText: { 
    color: '#FF0066',
  },
  logoutButton: { 
    backgroundColor: '#FEF2F2', 
    borderColor: '#FECACA',
  },
  logoutButtonText: { 
    color: '#EF4444',
  },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1,
  },
  settingText: { 
    fontSize: 16, 
    marginLeft: 16, 
    flex: 1,
  },
});