import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import styles from "../styles/RegisterStyles";
import { auth, database } from "../services/config";
import { getDatabase, ref, query, set, get, orderByChild, equalTo, onValue, update } from 'firebase/database';
import ensureLocalImage from "../components/ensureLocalImage";

export default function LocationScreen() {
    const { params } = useRoute();
    const locationName = params?.location ?? [];
    const navigation = useNavigation();
    const [items, setItems] = useState([]);
    const [displayItems, setDisplayItems] = useState([]);
    const [user_id, setUser_id] = useState(null);
    console.log(" // LOCATION //");
    // Get the Authentication instance
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            //   console.log("Current user ID:", currentUser.uid);
            setUser_id(currentUser.uid);
            // console.log("Current user_ID:", user_id);
        } else {
            console.log("No user signed in.");
        }
    }, [currentUser]);
    // console.log("Current user_ID:", user_id);

    useFocusEffect(
        useCallback(() => {
            if (!user_id || !locationName) return;
            // console.log("haetaan itemit lokaatiosta:", locationName);
            const itemsRef = ref(database, "items/");
            const q = query(itemsRef, orderByChild("owner_id"), equalTo(user_id));
            const unsubscribe = onValue(q, snap => {
                const data = snap.val();
                const list = data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : [];
                setItems(list.filter(it => it.location?.toLowerCase() === locationName.toLowerCase()));
            });
            return () => unsubscribe();
        }, [user_id, locationName])
    );

    useEffect(() => {
        let mounted = true;
        const hydrate = async () => {
            const enriched = await Promise.all(
                (items || []).map(async (item) => {
                    const localUri = await ensureLocalImage(item.downloadURL);
                    return { ...item, localUri };
                })
            );
            if (mounted) setDisplayItems(enriched);
        };
        hydrate();
        return () => { mounted = false; };
    }, [items]);

    return (
        <View style={styles.container}>
            {/* 🔍 Search 
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor="#52946B"
                    onChangeText={setLookingfor}
                    value={lookingfor}
                /> */}
            {/* Jos ei haeta → näytetään lohkot */}

            <FlatList
                keyExtractor={(item) => item.id.toString()}
                data={displayItems}
                numColumns={3}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("ShowItemScreen", { item })}
                        style={styles.itemboxrow}
                    >
                        <View style={{ padding: 5 }}>
                             <Image source={{ uri: item.localUri || item.downloadURL || item.uri }} style={styles.showimage} />
                            <Text style={styles.itemTitle}>{item.itemName.slice(0, 17)}</Text>
                             <Text style={styles.itemCategory}>{item.description}</Text>
                        </View>
                    </Pressable>
                )}
                contentContainerStyle={[styles.gridContainer, { paddingBottom: 100 }]}
                ListEmptyComponent={<Text style={{ color: "#777" }}>No items yet.</Text>}
            />

        </View>
    );
}
