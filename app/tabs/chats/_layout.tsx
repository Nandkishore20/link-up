// app/tabs/chats/_layout.tsx
import { useTheme } from '@/app/context/ThemeContext';
import { Stack } from 'expo-router';

export default function ChatsLayout() {
  const { colors } = useTheme();

  return (
    <Stack screenOptions={{ 
        headerShown: false, 
        contentStyle: { backgroundColor: colors.background }
      }}>
      {/* The 'index' screen will show the tab bar */}
      <Stack.Screen name="index" />
      {/* The '[id]' screen will hide the tab bar */}
      <Stack.Screen name="[id]" options={{ tabBarStyle: { display: 'none' } }} />
    </Stack>
  );
}