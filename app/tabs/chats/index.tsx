// app/tabs/chats/index.tsx
import { AppUser, useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChatList() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [incomingWaves, setIncomingWaves] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Listener for incoming waves
    const wavesQuery = query(collection(FIREBASE_DB, 'waves'), where('to', '==', user.uid));
    const unsubscribeWaves = onSnapshot(wavesQuery, async (snapshot) => {
        const wavePromises = snapshot.docs.map(async (d) => {
            const waveData = d.data();
            const fromUserDoc = await getDoc(doc(FIREBASE_DB, 'users', waveData.from));
            if (!fromUserDoc.exists()) return null;
            return { waveId: d.id, fromUser: { uid: waveData.from, ...fromUserDoc.data() } as AppUser };
        });
        const wavesData = (await Promise.all(wavePromises)).filter(Boolean);
        setIncomingWaves(wavesData);
        setLoading(false);
    });

    // Listener for existing chats
    const chatsQuery = query(collection(FIREBASE_DB, 'chats'), where('participants', 'array-contains', user.uid));
    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      const chatPromises = snapshot.docs.map(async (d) => {
        const chatData = d.data();
        const otherId = chatData.participants.find((id: string) => id !== user.uid);
        if (!otherId) return null;
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', otherId));
        return {
          chatId: d.id,
          lastMessage: chatData.lastMessage || { text: 'Start chatting!' },
          otherUser: { uid: otherId, ...userDoc.data() } as AppUser,
        };
      });
      const chatsData = (await Promise.all(chatPromises)).filter(Boolean);
      setChats(chatsData);
      setLoading(false);
    });

    return () => {
        unsubscribeWaves();
        unsubscribeChats();
    };
  }, [user]);

  const handleAcceptWave = async (wave: any) => {
    if (!user) return;
    const otherUser = wave.fromUser;
    
    const chatId = [user.uid, otherUser.uid].sort().join('_');
    const chatDocRef = doc(FIREBASE_DB, 'chats', chatId);
    await setDoc(chatDocRef, {
      participants: [user.uid, otherUser.uid],
      createdAt: serverTimestamp(),
    }, { merge: true });

    await deleteDoc(doc(FIREBASE_DB, 'waves', wave.waveId));

    router.push({
      pathname: `/tabs/chats/${chatId}`,
      params: { otherUserName: otherUser.displayName }
    });
  };
  
  const sections = [
    { title: 'Incoming Waves', data: incomingWaves },
    { title: 'Conversations', data: chats },
  ];

  const styles = createStyles(colors);

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.chatId || item.waveId}
        renderItem={({ item, section }) => {
            if (section.title === 'Incoming Waves') {
                return (
                    <View style={styles.waveItem}>
                        <Image source={{ uri: item.fromUser.avatarUrl }} style={styles.avatar} />
                        <View style={styles.waveInfo}>
                           <Text style={styles.waveText}><Text style={{fontWeight: 'bold'}}>{item.fromUser.displayName}</Text> waved at you!</Text>
                        </View>
                        <TouchableOpacity style={styles.waveBackButton} onPress={() => handleAcceptWave(item)}>
                            <Text style={styles.waveBackButtonText}>Wave Back</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
            return (
              <TouchableOpacity style={styles.chatItem} onPress={() => router.push({ pathname: `/tabs/chats/${item.chatId}`, params: { otherUserName: item.otherUser.displayName }})}>
                <Image source={{ uri: item.otherUser.avatarUrl }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                  <Text style={styles.userName}>{item.otherUser.displayName}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage.text}</Text>
                </View>
              </TouchableOpacity>
            )
        }}
        renderSectionHeader={({ section: { title, data } }) => (
            data.length > 0 ? <Text style={styles.sectionHeader}>{title}</Text> : null
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages or waves yet.</Text>}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background,marginTop:20 },
  title: { fontSize: 32, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 20, color: colors.text },
  sectionHeader: { fontSize: 16, fontWeight: '600', color: colors.icon, backgroundColor: colors.background, paddingVertical: 8, paddingHorizontal: 20 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  chatInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: colors.text },
  lastMessage: { color: colors.icon, marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.icon },
  waveItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 20, marginBottom: 10, backgroundColor: colors.card, borderRadius: 12 },
  waveInfo: { flex: 1, marginLeft: 12 },
  waveText: { color: colors.text },
  waveBackButton: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  waveBackButtonText: { color: 'white', fontWeight: '600' },
});