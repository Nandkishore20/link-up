import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// --- Your App's Theme Colors ---
const COLORS = {
  primary: '#6366F1',     // Active icon and tint color
  inactive: '#9CA3AF',    // Inactive icon color
  background: '#202838c2',  // Floating tab bar background
  activeBackground: '#FFFFFF', // Active icon circular background
};

// --- Custom Tab Bar Component ---
const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // This allows us to get the icon component from the screen options
          const tabBarIcon = options.tabBarIcon;
          
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabBarButton}
            >
              <View style={isFocused ? styles.activeIconContainer : styles.iconContainer}>
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

// --- Main Tabs Layout ---
export default function TabLayout() {
  return (
    <Tabs
      // Use our custom component for the tab bar
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Feather name="map-pin" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

// --- Styles ---
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
    backgroundColor: COLORS.background,
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
    borderRadius: 75,
    backgroundColor: COLORS.activeBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
});