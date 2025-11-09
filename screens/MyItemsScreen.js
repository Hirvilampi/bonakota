import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from "react-native-paper";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useItemsActions, useItemsData } from "../ItemContext";
// import { useSQLiteContext } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';
// import Toast from "react-native-toast-message";
import { baseURL, app, auth, db } from '../services/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/RegisterStyles';
// Firestore-funktiot
import { collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, query, set, orderByChild, equalTo, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useItemData, clearItemData, updateItemData } from "../config/ItemDataState";

export default function MyItemsScreen() {
    const [items, setItems] = useState([]);
    const [lookingfor, setLookingfor] = useState('');
    const [searchItems, setSearchItems] = useState([]);
    const [categories] = useState([]);
    const [user_id, setUser_id] = useState(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();


    const [data, setData] = useState([]);


    // Get the Authentication instance
    const auth = getAuth();
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

    const database = getDatabase(app);
    const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);
    // const insets = useSafeAreaInsets();

    const getItems = async () => {
        console.log("haetaan itemit");
        console.log("user_id:llä", user_id);
        const itemsRef = ref(database, 'items/');

        console.log("we have user id");
        console.log("typeof user_id:", typeof user_id);
        console.log("user_id:", JSON.stringify(user_id))
        const userItemsQuery = query(itemsRef, orderByChild('owner_id'), equalTo(user_id));
        onValue(userItemsQuery, (snapshot) => {
            console.log("onValue - on käyty");

//             if (snapshot.exists()) {
//                 // Käytetään forEach-metodia, joka on DataSnapshot-spesifinen ja kätevä listoille
//                 snapshot.forEach((childSnapshot) => {
//                     const itemKey = childSnapshot.key;     // Jokaisen lapsen ID
//                     const itemData = childSnapshot.val();  // Jokaisen lapsen tiedot

// //                    console.log("Listan itemin ID:", itemKey);
// //                    console.log("Listan itemin tiedot:", itemData);

//                     //         itemsList.push({ id: itemKey, ...itemData }); // Lisätään ID osaksi item-objektia
//                 });
//             } else {
//                 console.log("Ei itemeitä löytynyt /items-polusta.");
//             }

            const data = snapshot.val();
            //         const itemKey = snapshot.key; // firebasen itemID talteen - ei vielä käytössä
            if (data) {
                //      console.log("data", data);
                //       console.log("data values object", Object.values(data));
                // const datavalues = Object.values(data);
                // setItems(datavalues);
                //              console.log(datavalues)
                //       console.log("items:", items);

                const itemsList = Object.entries(data).map(([id, item]) => ({
                    id,
                    ...item,
                }));
                setItems(itemsList);
 //               console.log("------- TÄÄÄ ON SE LISTA -----",itemsList);
            } else {
                setItems([]); // Handle the case when there are no items
            }
        })

    }

    useEffect(() => {
        // const db = getDatabase();
        // const refAll = ref(db, "items/");
        // onValue(refAll, (snapshot) => {
        //     console.log("Kaikki itemit:", snapshot.val());
        // });

        if (user_id) { // if user_id is not null, lets go and get this users items
            getItems();
        }
    }, [user_id]);

    const handlePress = () => {
        console.log("Refreshing items...");
        console.log("Haetaan itemit user_id:llä:", user_id);
        getItems();
    }
    //
    const RealtimeDbTestComponent = () => {
        console.log("testing db on component");
        useEffect(() => {
            const testWrite = async () => {
                try {
                    await set(ref(database, 'test/hello'), 'world');
                    console.log("Realtime Database testikirjoitus onnistui!");
                } catch (error) {
                    console.error("Realtime Database testikirjoitus epäonnistui:", error);
                }
            };
            testWrite();
        }, []);
        return null; // Tai jokin yksinkertainen tekstikomponentti
    };


    const updateList = async () => {
    }

    const updateSearchList = async (lookingfor) => {
    }


    return (

        <View style={styles.container}>
            {/* 🔍 Search */}
            <TextInput
                style={styles.input}
                placeholder="Search"
                placeholderTextColor="#52946B"
                onChangeText={setLookingfor}
                value={lookingfor}
            />
            <Button
                mode="text"
                buttonColor="#EAF2EC"
                textColor="#52946B"
                onPress={() => updateSearchList(lookingfor)}
            >
                SEARCH
            </Button>
            <Button
                mode="text"
                buttonColor="#EAF2EC"
                textColor="#52946B"
                onPress={() => handlePress()} >
                REFRESSAA
            </Button>

            {/* Jos ei haeta → näytetään lohkot */}
            {!lookingfor ? (
                <>
                    <ScrollView
                        style={{ backgroundColor: "#F8FBFA" }}
                        bounces={false}
                        overScrollMode="never"
                        contentContainerStyle={styles.scrollContainer}
                    >
                        {/* 🏠 My Items */}
                        <View style={styles.section}>
                            <Pressable
                                onPress={() => navigation.getParent()?.navigate("ShowMyItemsScreen") ?? console.log("No parent navigator found")}
                            >
                                <Text style={styles.sectionTitle}>My Items</Text>

                            </Pressable>
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                data={items}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => navigation.navigate("ShowItemScreen", { item }) ?? console.log("No parent navigator found")}
                                        style={styles.itembox}
                                    >
                                        <Image source={{ uri: item.uri }} style={styles.showimage} />
                                        <Text style={styles.itemTitle}>{item.itemName}</Text>
                                        <Text style={styles.itemCategory}>{item.description}</Text>
                                        <Text style={styles.itemCategory}>{item.key}</Text>
                                        {categories?.length > 0 && (
                                            <Text style={styles.itemCategory}>
                                                {categories.find(
                                                    (cat) => cat.value == String(item.category_id)
                                                )?.label || ""}
                                            </Text>

                                        )}
                                    </Pressable>
                                )}

                            />
                        </View>
                    </ScrollView>
                    {/* 
                        {/* 🗂️ My Categories 
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>My Categories</Text>
                            <FlatList
                                keyExtractor={(item) => item.value?.toString() || item.key}
                                data={categories}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View style={styles.itemboxrow}>
                                        <Button
                                            mode="text"
                                            buttonColor="#EAF2EC"
                                            textColor="#52946B"
                                            style={styles.categoryButton}
                                            contentStyle={styles.categoryContent}
                                            labelStyle={styles.categoryLabel}
                                            onPress={() =>
                                                navigation.navigate("ShowCategory", { category: item })
                                            }
                                        >
                                            {item.label}
                                        </Button>
                                    </View>
                                )}
                            />
                        </View>


                        {/* 🕓 Recent Items 
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Items</Text>
                            <FlatList
                                keyExtractor={(item) => item.id.toString()}
                                data={recentItems}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => navigation.navigate("ShowItem", { item })}
                                        style={styles.itembox}
                                    >
                                        <Image source={{ uri: item.image }} style={styles.showimage} />
                                        <Text style={styles.itemTitle}>{item.name}</Text>
                                        {categories?.length > 0 && (
                                            <Text style={styles.itemCategory}>
                                                {categories.find(
                                                    (cat) => cat.value == String(item.category_id)
                                                )?.label || ""}
                                            </Text>

                                        )}
                                    </Pressable>
                                )}
                            />
                        </View>

                        {/* 📍 My Locations 
                        <View style={styles.section}>
                            <Pressable
                                onPress={() => navigation.navigate("LocationScreen", {})}
                            >
                                <Text style={styles.sectionTitle}>My Locations</Text>
                                <Text style={[styles.sectionTitle, { color: 'red' }]}>under construction</Text>
                            </Pressable>
                        </View>
*/}
                </>
            ) : (
                // 🔍 Hakutulos
                <>
                    <Text>Hakutulos</Text>
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        data={searchItems}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => navigation.navigate("ShowItemScreen", { item }) ?? console.log("No parent navigator found")}
                                style={styles.itemboxrow}
                            >
                                <Image source={{ uri: item.uri }} style={styles.cameraimage} />
                                <Text style={styles.itemTitle}>{item.itemName}</Text>
                            </Pressable>
                        )}
                    />
                </>
            )}
        </View>

    );
}
