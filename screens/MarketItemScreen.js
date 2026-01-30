import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useFocusEffect, useNavigation, NavigationContainer, getParent } from '@react-navigation/native';
import { app, database, auth } from "../services/config";
import { getDatabase, ref, get, push, onValue, update, remove } from "firebase/database";
import { useItemData, updateItemData, itemData } from "../config/ItemDataState";
import styles from '../styles/RegisterStyles';
import { openChat } from "../components/openChat";
import { getFirstName } from "../components/getFirstName";


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
    const [currentUserFirstName, setCurrentUserFirstName] = useState(null);
    const [ownerFirstName, setOwnerFirstName] = useState(null);
    
    useEffect(() => {
        if (params?.item) {
            updateItemData(params.item);
            // console.log("item updated", params.item);
        }
    }, [params]);

    // Hae nimet Firestoresta
    useEffect(() => {
        if (!user_id) return;
        getFirstName(user_id).then(setCurrentUserFirstName).catch((e) => console.log("get current user first name error", e));
    }, [user_id]);

    useEffect(() => {
        if (!itemData.owner_id) return;
        getFirstName(itemData.owner_id).then(setOwnerFirstName).catch((e) => console.log("get owner first name error", e));
    }, [itemData.owner_id]);

    useEffect(() => {
        const id = itemData.id ?? itemData.item_id;
        if (!id || itemData.downloadURL) return;
        //        fetchDownloadURL(itemId).then(url => updateItemData({ downloadURL: url }));
        const fetchItem = async () => {
            try {
                console.log('Had no photo- trying to get all info');
                const snap = await get(ref(database, `items/${id}`));
                if (snap.exists()) {
                    updateItemData(snap.val());
                }
            } catch (e) {
                console.error("Error fetching download URL", e);
            }
        }
        fetchItem();
    }, [itemData.downloadURL]);

    const chatWithUser = async () => {
        // console.log('sending you to chatscreen - hopefully');
        const title = `About ${itemData.itemName}`;
        // console.log('about title', title);
        const itemId = itemData.id ?? itemData.item_id;
        const ownerId = itemData.owner_id;

        if (!user_id || !ownerId || !itemId) {
            console.log('Missing ids', { user_id, ownerId, itemId });
            return;
        }

        // hae olemassa oleva tai luo uusi
        const chatId = await openChat(
            user_id,
            itemData.owner_id,
            itemId,
            itemData.itemName,
            currentUserFirstName,
            ownerFirstName
        );
        // console.log('sit navigoidaan chatscreeniin');
        navigation.navigate("ChatScreen", {
            chatId,
            title,
            otherUserId: itemData.owner_id,
            itemId,
            itemName: itemData.itemName,
            item: itemData,
        })
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
