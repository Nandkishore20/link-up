// app/tabs/chats/[id].tsx
import { FIREBASE_DB } from '@/firebaseConfig';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- FINAL FIX: Using absolute path alias '@/' ---
import { AppUser, useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';

const MessageBubble = ({ item, user, onLongPress }: { item: any; user: AppUser | null; onLongPress: (item: any) => void; }) => {
    const { colors } = useTheme();
    const isMyMessage = item.user._id === user?.uid;
    const styles = createStyles(colors);

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (item.isMeetup) {
        return (
            <View style={styles.meetupContainer}>
                <Feather name="map-pin" size={16} color={colors.primary} />
                <Text style={styles.meetupText}>{isMyMessage ? "You" : item.user.name} suggested a meet up!</Text>
            </View>
        );
    }
    
    return (
        <Pressable onLongPress={() => isMyMessage && onLongPress(item)} style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.theirMessageRow]}>
            <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
                <Text style={isMyMessage ? styles.myMessageText : styles.theirMessageText}>{item.text}</Text>
                {item.edited && <Text style={styles.editedText}> (edited)</Text>}
            </View>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
        </Pressable>
    );
};

export default function ChatScreen() {
  const { id: chatId, otherUserName } = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<any>>(null);

  const styles = createStyles(colors);

  useEffect(() => {
    if (!chatId) return;
    const messagesQuery = query(collection(FIREBASE_DB, `chats/${chatId}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [chatId]);

  const onSend = useCallback(async (messageText: string, isMeetup = false) => {
    if ((!messageText.trim() && !isMeetup) || !user || !chatId) return;
    setInput('');
    const messageData = { text: messageText.trim(), createdAt: serverTimestamp(), user: { _id: user.uid, name: user.displayName || 'Anonymous' }, isMeetup: isMeetup, edited: false };
    try { await addDoc(collection(FIREBASE_DB, `chats/${chatId}/messages`), messageData); } catch (error) { Alert.alert("Error", "Could not send message."); }
  }, [user, chatId]);

  const handleLongPress = (message: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert( 'Message Options', 'What would you like to do?', [ { text: 'Cancel', style: 'cancel' }, { text: 'Delete Message', style: 'destructive', onPress: () => deleteMessage(message.id) }, { text: 'Edit Message', style: 'default', onPress: () => editMessage(message) }, ] );
  };

  const deleteMessage = async (messageId: string) => { try { await deleteDoc(doc(FIREBASE_DB, `chats/${chatId}/messages`, messageId)); } catch (error) { Alert.alert('Error', 'Could not delete message.'); } };
  const editMessage = (message: any) => { Alert.prompt('Edit Message', 'Enter your new message:', async (newText) => { if (newText && newText.trim() !== message.text) { try { const messageRef = doc(FIREBASE_DB, `chats/${chatId}/messages`, message.id); await updateDoc(messageRef, { text: newText.trim(), edited: true }); } catch (error) { Alert.alert('Error', 'Could not edit message.'); } } }, 'plain-text', message.text); };
  const handleMeetup = () => { Alert.alert( "Suggest a Meet Up?", "This will send a special message.", [ { text: "Cancel", style: "cancel" }, { text: "Send Invite", style: "default", onPress: () => onSend("Let's meet up!", true) } ] ); };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="chevron-left" size={28} color={colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 65 : 0}>
        <FlatList data={messages} keyExtractor={item => item.id} contentContainerStyle={styles.listContentContainer} ref={flatListRef} onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })} onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })} renderItem={({ item }) => <MessageBubble item={item} user={user} onLongPress={handleLongPress} />} />
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMeetup}><Feather name="map-pin" size={22} color={colors.primary} /></TouchableOpacity>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..." placeholderTextColor={colors.icon} multiline />
          <TouchableOpacity style={styles.sendButton} onPress={() => onSend(input)} disabled={!input.trim()}><Feather name="send" size={20} color="white" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background,marginTop:20, },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 16, color: colors.text },
  listContentContainer: { paddingHorizontal: 10, paddingTop: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  input: { flex: 1, backgroundColor: colors.inputBackground, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, paddingTop: Platform.OS === 'ios' ? 12 : 10, marginRight: 8, fontSize: 16, color: colors.text, maxHeight: 120 },
  actionButton: { padding: 8 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  messageRow: { marginVertical: 4, maxWidth: '80%' },
  myMessageRow: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirMessageRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  myMessage: { backgroundColor: colors.myMessage, borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: colors.theirMessage, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  myMessageText: { color: 'white', fontSize: 16 },
  theirMessageText: { color: colors.text, fontSize: 16 },
  timestamp: { fontSize: 10, color: colors.icon, marginTop: 4, marginHorizontal: 8 },
  editedText: { fontSize: 10, fontStyle: 'italic', color: '#FFFFFF99', alignSelf: 'flex-end', marginTop: 2 },
  meetupContainer: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.primary}20`, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginVertical: 8 },
  meetupText: { color: colors.primary, marginLeft: 8, fontWeight: '600' },
});