import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Platform, KeyboardAvoidingView, ActivityIndicator, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, setDoc, orderBy } from 'firebase/firestore';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useAuth } from '../../_layout';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const HEADER_HEIGHT = 12 + 16 + 28;

export default function ChatScreen() {
  const { id: chatId, otherUserName } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const flatListRef = useRef<FlatList<any>>(null);
  const textInputRef = useRef<TextInput>(null);

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  
  const [isLayoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    if (tabBarHeight > 0) {
      setLayoutReady(true);
    }
  }, [tabBarHeight]);

  useEffect(() => {
    if (isLayoutReady) {
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLayoutReady]);

  useEffect(() => {
    if (!chatId) return;
    const messagesQuery = query(collection(FIREBASE_DB, `chats/${chatId}/messages`), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [chatId]);

  // --- MODIFIED SECTION: Backend interaction code updated ---
  const onSend = useCallback(async () => {
    if (!input.trim() || !user || !chatId) return;
    const messageText = input.trim();
    setInput('');
    
    const messageData = {
      text: messageText,
      createdAt: serverTimestamp(),
      user: {
        _id: user.uid,
        name: user.displayName || 'Anonymous',
        avatar: user.avatarUrl || undefined,
      },
    };

    try {
      // This code now safely handles potential errors from Firebase
      await addDoc(collection(FIREBASE_DB, `chats/${chatId}/messages`), messageData);
      await setDoc(doc(FIREBASE_DB, 'chats', chatId as string), { lastMessage: messageData }, { merge: true });
    } catch (error) {
      console.error("Error sending message to Firebase:", error);
      // You can add user-facing error handling here, like an alert.
    }
  }, [input, user, chatId]);
  // --- END OF MODIFIED SECTION ---

  const handleInputChange = (text: string) => {
    // Check if the text ends with a newline character, which indicates the "Enter" key was pressed.
    if (text.endsWith('\n')) {
      // Only send if there is actual text (not just whitespace).
      if (input.trim()) {
        onSend();
      }
    } else {
      // If it's any other key press, just update the input state as normal.
      setInput(text);
    }
  };

  if (!isLayoutReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: tabBarHeight }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={HEADER_HEIGHT - 35}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.user._id === user?.uid ? styles.myMessageContainer : styles.theirMessageContainer
            ]}>
              <View style={[styles.messageBubble, item.user._id === user?.uid ? styles.myMessage : styles.theirMessage]}>
                <Text style={item.user._id === user?.uid ? styles.myMessageText : styles.theirMessageText}>
                  {item.text}
                </Text>
              </View>
            </View>
          )}
        />
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <TextInput
            ref={textInputRef}
            style={styles.input} 
            value={input} 
            onChangeText={handleInputChange}
            placeholder="Type a message..." 
            placeholderTextColor="#9CA3AF"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSend} disabled={!input.trim()}>
            <Feather name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB',
    marginBottom:10,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 16 },
  keyboardAvoidingContainer: { flex: 1 },
  listContentContainer: { paddingHorizontal: 10, paddingTop: 10 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  input: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 20, 
    paddingHorizontal: 18,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    marginRight: 8, 
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center' 
  },
  messageContainer: { marginVertical: 4, width: '100%' },
  myMessageContainer: { alignItems: 'flex-end' },
  theirMessageContainer: { alignItems: 'flex-start' },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, maxWidth: '75%' },
  myMessage: { backgroundColor: '#6366F1', borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderBottomLeftRadius: 4 },
  myMessageText: { color: 'white' },
  theirMessageText: { color: '#1F2937' },
});