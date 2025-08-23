// app/tabs/posts.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

// --- FINAL FIX: Using absolute path alias '@/' ---
import { useTheme } from '@/app/context/ThemeContext';

const mockPosts = [
  { id: '1', text: 'Just discovered the best coffee shop in Jaipur! The vibe is immaculate.', user: 'Elena', colors: ['#ff9a9e', '#fad0c4'] },
  { id: '2', text: 'React Native animations are so satisfying to get right. #developerlife', user: 'Chris', colors: ['#a1c4fd', '#c2e9fb'] },
  { id: '3', text: 'Looking for recommendations for a weekend getaway near the city. Any ideas?', user: 'Priya', colors: ['#84fab0', '#8fd3f4'] },
  { id: '4', text: 'The sunset over Nahargarh Fort today was absolutely breathtaking. ✨', user: 'Marco', colors: ['#f6d365', '#fda085'] },
];

const PostCard = ({ item }: { item: typeof mockPosts[0] }) => {
  return (
    <View style={styles.cardContainer}>
      <LinearGradient colors={item.colors} style={styles.card}>
        <Text style={styles.postText}>{item.text}</Text>
        <Text style={styles.postUser}>– {item.user}</Text>
      </LinearGradient>
    </View>
  );
};

export default function PostsScreen() {
  const { theme, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Community Posts</Text>
      </View>
      <FlatList
        data={mockPosts}
        renderItem={PostCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  header: { padding: 24, borderBottomWidth: 1, },
  headerTitle: { fontSize: 28, fontWeight: '800', },
  listContent: { padding: 20, },
  cardContainer: { marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8, },
  card: { borderRadius: 20, padding: 24, minHeight: 180, justifyContent: 'center', },
  postText: { fontSize: 22, fontWeight: '700', color: 'rgba(0,0,0,0.7)', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif', lineHeight: 30, },
  postUser: { fontSize: 14, fontWeight: '600', color: 'rgba(0,0,0,0.6)', position: 'absolute', bottom: 20, right: 24, fontStyle: 'italic', },
});