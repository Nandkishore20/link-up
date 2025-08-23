import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, useSegments } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors, theme } = useTheme();

  // The COLORS object is now inside the component to access theme properties
  const COLORS = {
    primary: colors.primary,
    inactive: colors.tabIconDefault,
    background: theme === 'dark' ? '#202838' : '#FFFFFF', // Using a solid color
    activeBackground: theme === 'dark' ? '#4B5563' : '#F3F4F6',
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar, { backgroundColor: COLORS.background, shadowColor: theme === 'dark' ? '#000' : '#2d2c2cff' }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });
          const tabBarIcon = options.tabBarIcon;
          
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabBarButton}
            >
              {/* This structure uses the 'activeIconContainer' style you provided */}
              <View style={isFocused ? [styles.activeIconContainer, { backgroundColor: COLORS.activeBackground }] : styles.iconContainer}>
                {tabBarIcon && tabBarIcon({ 
                  color: isFocused ? COLORS.primary : COLORS.inactive,
                  size: 24,
                  focused: isFocused
                })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function TabLayout() {
  const { colors } = useTheme();
  const segments = useSegments();
  const isChatScreen = segments.includes('[id]');

  return (
    <Tabs
  tabBar={(props) => (isChatScreen ? <></> : <CustomTabBar {...props} />)}
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.tabIconDefault,
  }}
>
  <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />, }} />
  <Tabs.Screen name="posts" options={{ title: 'Posts', tabBarIcon: ({ color, size }) => <Feather name="message-square" size={size} color={color} />, }} />
  <Tabs.Screen name="chats" options={{ title: 'Chats', tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />, }} />
  <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />, }} />
</Tabs>
  );
}

// --- STYLESHEET UPDATED TO YOUR EXACT SPECIFICATIONS ---
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 7,
    left: 16,
    right: 16,
    elevation: 5,
    shadowColor: '#2d2c2cff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    // Background color is now applied dynamically in the component
    borderRadius: 35,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Corrected from 75 to make it a circle
    // Background color is now applied dynamically in the component
    justifyContent: 'center',
    alignItems: 'center',
  },
});