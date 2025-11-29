import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import styles from "../styles/RegisterStyles";
import { auth, database } from "../services/config";
import { getDatabase, ref, query, set, get, orderByChild, equalTo, onValue, update } from 'firebase/database';


export default function ShowCategoryScreen() {
    const { params } = useRoute();
    const categoryName = params?.category ?? [];
    const navigation = useNavigation();
    const [items, setItems] = useState([]);
    const [user_id, setUser_id] = useState(null);
    console.log(" // CATEGORY //");
    console.log(categoryName);
    // Get the Authentication instance
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            //   console.log("Current user ID:", currentUser.uid);
            setUser_id(currentUser.uid);
            console.log("Current user_ID:", user_id);
        } else {
            console.log("No user signed in.");
        }
    }, [currentUser]);
    console.log("Current user_ID:", user_id);

    const getCategoryItems = async () => {
        console.log("haetaan itemit categoriasta:");
        console.log(categoryName);
        console.log("user_id:llä", user_id);
        const itemsRef = ref(database, 'items/');
        const userItemsQuery = query(itemsRef, orderByChild('owner_id'), equalTo(user_id));
        const unsubscribe = onValue(userItemsQuery, async (snapshot) => {
            console.log("onValue - on käyty");
            const data = snapshot.val();
            const itemsList = data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : [];
            const itemsbycategory = itemsList.filter(item => item.category_name?.toLowerCase() === categoryName?.toLowerCase());
            setItems(itemsbycategory);
            console.log(" // CATEGORY ITEMS //");
            console.log(items);
        });
    }

    useFocusEffect(
        useCallback(() => {
            if (!user_id || !categoryName) return;
            console.log("haetaan itemit categoriasta:", categoryName);
            const itemsRef = ref(database, "items/");
            const q = query(itemsRef, orderByChild("owner_id"), equalTo(user_id));
            const unsubscribe = onValue(q, snap => {
                const data = snap.val();
                const list = data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : [];
                setItems(list.filter(it => (it.category_name ?? it.category)?.toLowerCase() === categoryName.toLowerCase()));
            });

            return () => unsubscribe();
        }, [user_id, categoryName])
    );

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
                data={items}
                numColumns={3}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("ShowItemScreen", { item })}
                        style={styles.itemboxrow}
                    >
                        <View style={{ padding: 5 }}>
                             <Image source={{ uri: item.uri }} style={styles.showimage} />
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


