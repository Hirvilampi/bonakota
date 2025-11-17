import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TextInput, Button } from "react-native";
import { listenToMessages } from "../components/listentoMessages";
import { sendMessage } from "../components/sendMessage.js";
import { auth } from "../services/config";

export default function ChatScreen({ route }) {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const unsub = listenToMessages(chatId, setMessages);
    return () => unsub(); 
  }, [chatId]);

  const handleSend = () => {
    sendMessage(chatId, auth.currentUser.uid, text);
    setText("");
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{item.senderId}: {item.text}</Text>
        )}
      />

      <TextInput 
        value={text} 
        onChangeText={setText} 
        placeholder="Type a message..."
        style={{ borderWidth: 1, padding: 8 }}
      />

      <Button title="Send" onPress={handleSend} />
    </View>
  );
}