import React from "react";
import { useState, useEffect } from "react";
import { View, Text, Platform, FlatList, StyleSheet, Image, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { Button } from "react-native-paper";
import { app, auth, db, database, storage } from '../services/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/RegisterStyles';
// Firestore-funktiot
import { fetchUserChats } from "../components/fetchUserChats";
import { listenToUserChats } from "../components/listenToUserChats";

export default function AllChatsScreen() {
    const [user_id, setUser_id] = useState(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [downloading, setDownloading] = useState(false);
    const [data, setData] = useState([]);
    const [updateItems, setUpdateItems] = useState([]);
    const [messages, setMessages] = useState([]);
    console.log(" ### WELCOME TO CHATS ###");

    // Get the Authentication instance
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            //   console.log("Current user ID:", currentUser.uid);
            setUser_id(currentUser.uid);
            console.log("Current user_ID:", user_id);
        } else  console.log("No user signed in.");   
    }, [currentUser]);
    console.log("Current user_ID:", user_id);


    useEffect(() => {
        if (!user_id) return;
        console.log('haetaan kerran chat messaged');
        //     const chats = listenToUserChats(user_id);
        fetchUserChats(user_id).then(setMessages).catch(console.log);

        console.log('pistetään kuuntelija hommiiin');
        console.log('chatit', messages);
        // realtime-kuuntelu
        const unsub = listenToUserChats(user_id, chats => setMessages(chats));
        console.log(" ### MESSAGES ###");
        console.log(messages);
        return () => unsub?.();
    }, [user_id]);


  return (
    <View style={styles.container}>

    <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Chats</Text>
                            <FlatList
                                data={messages}
                                keyExtractor={item => item.id}
                                contentContainerStyle={{ paddingRight: 20 }}
                                renderItem={({ item }) => {
                                    const chatItem = item.id;
                                    const otherUserId = item.members.find((m) => m !== user_id);
                                    return (
                                        <Button
                                            mode="text"
                                            buttonColor="#EAF2EC"
                                            textColor="#52946B"
                                            style={[styles.categoryButton, {marginBottom: 10,}]}
                                            contentStyle={styles.categoryContent}
                                            labelStyle={styles.categoryLabel}
                                            onPress={() =>
                                                navigation.navigate("ChatScreen", {
                                                    chatId: item.id,
                                                    itemId: item.itemId,
                                                    itemName: item.itemName,
                                                    title: item.itemName ?? "Chat",
                                                    otherUserId,
                                                    item: chatItem,
                                                })
                                            }
                                        >
                                            <Text>{item.itemName ?? item.itemId}</Text>
                                        </Button>
                                    );
                                }}
                            />

                        </View>
           
    </View>
  );
}

