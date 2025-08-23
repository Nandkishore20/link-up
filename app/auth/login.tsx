// app/auth/login.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    StyleSheet,
    View
} from "react-native";
import {
    Button,
    Surface,
    Text,
    useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    router.push("/auth/login-form");
  };

  const handleSignUp = () => {
    router.push("/auth/onboarding");
  };

  return (
    <View style={styles.container}>
      {/* Background bubble gradient effect */}
      <View style={styles.backgroundGradient}>
        <View style={styles.bubble1} />
        <View style={styles.bubble2} />
        <View style={styles.bubble3} />
        <View style={styles.bubble4} />
        <View style={styles.bubble5} />
        <View style={styles.bubble6} />
      </View>
      
      {/* Main content */}
      <View style={[styles.contentContainer, { paddingTop: insets.top + height * 0.08 }]}>
        {/* App icon/logo placeholder */}
        <View style={styles.logoContainer}>
          <Surface style={styles.logoSurface} elevation={8}>
            <Text style={styles.logoText}>💫</Text>
          </Surface>
        </View>

        {/* Main Headline */}
        <Text style={styles.headline}>
          Link up. Sync up.
        </Text>
        <Text style={styles.headlineHighlight}>
          Chill up.
        </Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Where meaningful friendships happen
        </Text>

        {/* Subtext */}
        <Text style={styles.subtext}>
          Connect with amazing people who share your interests, values, and vibe. 
          Start building meaningful friendships today!
        </Text>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            buttonColor={theme.colors.primary}
          >
            Get Started
          </Button>

          <Button
            mode="outlined"
            onPress={handleSignUp}
            style={styles.signupButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            textColor={theme.colors.primary}
            outlineColor={theme.colors.primary}
          >
            I already have an account
          </Button>
        </View>

        {/* Footer text */}
        <Text style={styles.footerText}>
          Join thousands of people making new friends every day
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    backgroundColor: '#D0E6FD',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: 'hidden',
  },
  // Bubble gradient elements
  bubble1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1E4D1',
    top: height * 0.1,
    right: -30,
    opacity: 0.6,
  },
  bubble2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#162660',
    top: height * 0.15,
    left: -20,
    opacity: 0.3,
  },
  bubble3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1E4D1',
    top: height * 0.25,
    right: 50,
    opacity: 0.4,
  },
  bubble4: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#162660',
    top: height * 0.35,
    left: 40,
    opacity: 0.2,
  },
  bubble5: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1E4D1',
    top: height * 0.45,
    right: 20,
    opacity: 0.5,
  },
  bubble6: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#162660',
    top: height * 0.5,
    left: -10,
    opacity: 0.25,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: height * 0.05,
  },
  logoContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  logoSurface: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#162660',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  logoText: {
    fontSize: 52,
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#162660',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -1,
    lineHeight: 42,
  },
  headlineHighlight: {
    fontSize: 36,
    fontWeight: '800',
    color: '#162660',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
    lineHeight: 42,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F1E4D1',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.5,
    backgroundColor: '#162660',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  subtext: {
    fontSize: 17,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
    paddingHorizontal: 24,
    maxWidth: width * 0.85,
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 40,
  },
  loginButton: {
    borderRadius: 28,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#162660',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButton: {
    borderRadius: 28,
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  footerText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});