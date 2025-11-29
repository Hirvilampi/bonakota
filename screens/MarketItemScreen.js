import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer, getParent } from '@react-navigation/native';
import { TextInput } from "react-native-paper";
import DropDownPicker from 'react-native-dropdown-picker';
import { app, database, auth } from "../services/config";
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useItemData, updateItemData, itemData } from "../config/ItemDataState";
import styles from '../styles/RegisterStyles';
import { collection, addDoc } from "firebase/firestore";
import { openChat } from "../components/openChat";


export default function MarketItemScreen() {
    const { params } = useRoute();
    const [user_id, setUser_id] = useState();
    const navigation = useNavigation();
    console.log(" ---- Show ITEM -----");
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            //   console.log("Current user ID:", currentUser.uid);
            setUser_id(currentUser.uid);
            //     console.log("Current user_ID:", user_id);
        } else {
            //     console.log("No user signed in.");
        }
    }, [currentUser]);

    const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);

    useEffect(() => {
        if (params?.item) {
            updateItemData(params.item);
            console.log("item updated", params.item);
        }
    }, [params]);

    const chatWithUser = async () => {
        const itemchattitle = "About " + itemData.itemName;
        const chatti_id = itemData.itemName + new Date().toISOString().split('.')[0];
        navigation.navigate("ChatScreen", {
            chatId: chatti_id,
            otherUserId: itemData.owner_id,
            itemId: item.id,
            title: itemchattitle,
        })
        const chat = await openChat(user_id, itemData.owner_id, itemData.item_id);
    }

    return (
        <ScrollView
            style={{ backgroundColor: '#F8FBFA' }}
            bounces={false}
            overScrollMode="never"
            llyAdjustKeyboardInsets={true}
            contentContainerStyle={styles.scrollContainer}
            maintainVisibleContentPosition={{ minIndexForVisible: 10, }}

        >
            <View style={styles.container}>
                <View style={styles.itembox}>
                    {itemData?.downloadURL ? (
                        <Image source={{ uri: itemData.downloadURL }} style={styles.cameraimage} />
                    ) : (
                        <Text style={{ color: 'gray' }}>No picture available</Text>
                    )}
                </View>
                <Text>Item: {itemData.itemName}</Text>
                <Text>Description: {itemData.description}</Text>
                <Text>Size: {itemData.size}</Text>
                <Text>Category: {itemData.category}</Text>
                <Text>Price: {itemData.price}</Text>
                <Text>Owner: {itemData.owner_id}</Text>

                <View style={{ flexDirection: 'row' }} >
                    <Pressable
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed ? 'green' : 'lightgreen',
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginVertical: 10,
                                shadowColor: '#000',
                                width: '30%',
                                alignSelf: 'center',
                                zIndex: 10,
                                position: 'relative',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            },
                        ]}
                        onPress={() => {
                            chatWithUser();
                        }}>
                        <Text style={{ color: '#0D1A12', fontSize: 16, fontWeight: 'bold' }}>Send message to owner</Text>
                    </Pressable>


                </View>
            </View>

        </ScrollView>
    );
}


