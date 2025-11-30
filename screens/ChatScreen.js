import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { listenToMessages } from "../components/listentoMessages";
import { sendMessage } from "../components/sendMessage.js";
import { auth } from "../services/config";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen({ route }) {
  const navigation = useNavigation();
  const { chatId, title, otherUserId, itemId, item, itemName } = route?.params ?? {};
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();
  const user_id = auth.currentUser.uid;
  const HEADER_HEIGHT = 80;

  if (!chatId) {
    return <Text>Missing chat</Text>;
  }

  useEffect(() => {
    const unsub = listenToMessages(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  const nameFor = (senderId) => {
    if (senderId === user_id) return "You"
    else return "Other";
  }

  const handleSend = () => {
    sendMessage(chatId, auth.currentUser.uid, text);
    const now = new Date();
    const ts = `${now.getDate()}/${now.getMonth() + 1} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const time = `${ts}-${now.getTime()}`;
    console.log("you're sending", ts, "You", text);
    setMessages(prev => [
      ...prev, { id: ts, senderId: "You", text }
    ]);
    setText("");
    console.log(messages);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + HEADER_HEIGHT : HEADER_HEIGHT}
    >
      <View style={{ flex: 1, padding: 10 }}>
        {/*  Muokataan tämä myöhemmin, että siis pääsee myös katsomaan tietoja suoraan - tämähän toimii muuten, mutta kuvaa ei näy
        
     
        <Pressable
          onPress={() => navigation.navigate("MarketItemScreen", item ? { item } : { itemId })}
          style={{ marginBottom: 12 }}
        >
          <Text style={{ fontWeight: "bold", fontColor: "#52946B" }}>
            - Chat about {itemName ?? title ?? itemId} -
          </Text>
        </Pressable>
*/}
          <Text style={{ fontWeight: "bold", fontColor: "#52946B" }}>
            - Chat about {itemName ?? title ?? itemId} -
          </Text>

        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text>{nameFor(item.senderId)}: {item.text}</Text>
          )}
        />

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          style={{ borderWidth: 1, padding: 8 }}
        />

        <Button mode="contained" onPress={handleSend} style={{ marginTop: 8, backgroundColor: "#52946B" }}>
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
