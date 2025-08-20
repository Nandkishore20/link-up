import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, SectionList } from 'react-native';
import { collection, query, where, onSnapshot, getDoc, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useAuth, AppUser } from '../../_layout';
import { useRouter } from 'expo-router';

export default function ChatList() {
  const { user } = useAuth();
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
    
    // Create a new chat
    const chatId = [user.uid, otherUser.uid].sort().join('_');
    const chatDocRef = doc(FIREBASE_DB, 'chats', chatId);
    await setDoc(chatDocRef, {
      participants: [user.uid, otherUser.uid],
      createdAt: serverTimestamp(),
    });

    // Delete the wave notification
    await deleteDoc(doc(FIREBASE_DB, 'waves', wave.waveId));

    // Navigate to the newly created chat
    router.push({
      pathname: `/tabs/chats/${chatId}`,
      params: { otherUserName: otherUser.displayName, otherUserAvatar: otherUser.avatarUrl, otherUserId: otherUser.uid }
    });
  };
  
  const sections = [
    { title: 'Incoming Waves', data: incomingWaves },
    { title: 'Conversations', data: chats },
  ];

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.chatId || item.waveId + index}
        renderItem={({ item, section }) => {
            if (section.title === 'Incoming Waves') {
                return (
                    <View style={styles.waveItem}>
                        <Image source={{ uri: item.fromUser.avatarUrl }} style={styles.avatar} />
                        <View style={styles.waveInfo}>
                           <Text><Text style={{fontWeight: 'bold'}}>{item.fromUser.displayName}</Text> waved at you!</Text>
                        </View>
                        <TouchableOpacity style={styles.waveBackButton} onPress={() => handleAcceptWave(item)}>
                            <Text style={styles.waveBackButtonText}>Wave Back</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
            return (
              <TouchableOpacity style={styles.chatItem} onPress={() => router.push({ pathname: `/tabs/chats/${item.chatId}`, params: { otherUserName: item.otherUser.displayName, otherUserAvatar: item.otherUser.avatarUrl, otherUserId: item.otherUser.uid }})}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: '600', color: 'gray', backgroundColor: '#F8FAFF', paddingVertical: 8, paddingHorizontal: 20 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  chatInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '600' },
  lastMessage: { color: 'gray', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
  waveItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 20, marginBottom: 10, backgroundColor: '#EFF6FF', borderRadius: 12 },
  waveInfo: { flex: 1, marginLeft: 12 },
  waveBackButton: { backgroundColor: '#4F46E5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  waveBackButtonText: { color: 'white', fontWeight: '600' },
});