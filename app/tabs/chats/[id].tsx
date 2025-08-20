import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, setDoc, orderBy } from 'firebase/firestore';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useAuth } from '../../_layout';
import { Feather } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id: chatId, otherUserName, otherUserAvatar, otherUserId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!chatId) return;
    const messagesQuery = query(collection(FIREBASE_DB, `chats/${chatId}/messages`), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [chatId]);

  const onSend = useCallback(async () => {
    if (!input.trim() || !user || !chatId) return;

    const messageText = input.trim();
    setInput('');
    
    const messageData = {
      text: messageText,
      createdAt: serverTimestamp(),
      user: {
        _id: user.uid,
        name: user.displayName,
        avatar: user.avatarUrl,
      },
    };

    // Add message to subcollection and update last message on chat doc
    await addDoc(collection(FIREBASE_DB, `chats/${chatId}/messages`), messageData);
    await setDoc(doc(FIREBASE_DB, 'chats', chatId as string), { lastMessage: messageData }, { merge: true });

  }, [input, user, chatId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 90}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.user._id === user?.uid ? styles.myMessage : styles.theirMessage]}>
              <Text style={item.user._id === user?.uid ? styles.myMessageText : styles.theirMessageText}>{item.text}</Text>
            </View>
          )}
          inverted
          contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}
        />
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..." multiline />
          <TouchableOpacity style={styles.sendButton} onPress={onSend}><Feather name="send" size={20} color="white" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, fontSize: 15 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, maxWidth: '75%', marginVertical: 4 },
  myMessage: { backgroundColor: '#4F46E5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: '#E5E7EB', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  myMessageText: { color: 'white' },
  theirMessageText: { color: '#1F2937' },
});