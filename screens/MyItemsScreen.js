import React from "react";
import { useState, useEffect } from "react";
import { View, Text, Platform, FlatList, StyleSheet, Image, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from "react-native-paper";
import * as FileSystem from 'expo-file-system/legacy';
import { getInfoAsync } from "expo-file-system/legacy";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import saveImageToPhone from '../components/saveImageToPhone';
import * as MediaLibrary from 'expo-media-library';
// import { useItemsActions, useItemsData } from "../ItemContext";
// import { useSQLiteContext } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';
// import Toast from "react-native-toast-message";
import { app, auth, db, database, storage } from '../services/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/RegisterStyles';
// Firestore-funktiot
import { collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, query, set, get, orderByChild, equalTo, onValue, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useItemData, clearItemData, updateItemData } from "../config/ItemDataState";

export default function MyItemsScreen() {
    const [items, setItems] = useState([]);
    const [recentItems, setRecentItems] = useState([]);
    const [lookingfor, setLookingfor] = useState('');
    const [searchItems, setSearchItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [user_id, setUser_id] = useState(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [downloading, setDownloading] = useState(false);
    const [data, setData] = useState([]);
    const [updateItems, setUpdateItems] = useState([]);


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


    //  const database = getDatabase(app);
    const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);
    // const insets = useSafeAreaInsets();

    const fileExists = async (uri) => {
        if (!uri || !uri.startsWith('file://')) return false;
        try {
            const info = await getInfoAsync(uri);
            console.log("exits info", info.exists);
            return info.exists;
        } catch (e) {
            console.log('File getInfo failed', e);
            return false;
        }
    };

    const getItems = async () => {
        console.log("haetaan itemit");
        console.log("user_id:llä", user_id);
        const itemsRef = ref(database, 'items/');
        console.log("we have user id");
        console.log("typeof user_id:", typeof user_id);
        console.log("user_id:", JSON.stringify(user_id))
        const userItemsQuery = query(itemsRef, orderByChild('owner_id'), equalTo(user_id));
        const unsubscribe = onValue(userItemsQuery, async (snapshot) => {
            console.log("onValue - on käyty");
            const data = snapshot.val();
            const itemsList = data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : [];
            setItems(itemsList);
            for (const item of itemsList) {
                const localUri = item.uri; // jos tämä on file://
                const remoteUri = item.downloadURL || item.uri; // remote fallback
                const exists = await fileExists(localUri); // file exists tarkastaa onko lokaalia tiedostoa olemassa
                if (!exists && remoteUri?.startsWith('http')) {
                    const newLocal = await downloadImage(remoteUri);
                    updateItemData({ ...item, uri: newLocal });
                    setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, uri: newLocal, timestamp: getTimeStamp() } : it));
                    // päivitä listaan/DB:hen, esim. setItems(... tai kirjoita databaseen)
                    // tähän  lisätään, jos juuri tällä kuvalla ei ole paikallista kuvaa, myöhempää kuvan hakua varten
                    setUpdateItems((prev) => [...prev, { ...item, uri: newLocal, timestamp: getTimeStamp() }]);

                }
            }
            // tehdään olemassaolevat kategoriat listaksi
            const itemcategories = (itemsList.map(item => item.category_name));
            const uniquecategories = [...new Set((itemsList.map(item => item.category_name)))];
            console.log("!! MY CATEGORIES !!", uniquecategories);
            setCategories(uniquecategories);
            // tehdään itemien lokaatiosta lista omista lokaatiosta
            const uniquelocations = [...new Set((itemsList.map(item => item.location)))];
            setLocations(uniquelocations);
            console.log("!! MY LOCATIONS !! ", uniquelocations);
        });
        if (updateItems.length > 0) {
            console.log("Let's save to firebase");
            await saveChangedToFirebase();
        }

    }

    const getCategories = async () => {
        try {
            const catRef = ref(database, 'categories');
            const snapshot = await get(catRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                //                console.log("Ladattiin kategoriat",data);
                const globalCategories = Object.entries(data).map(([key, value]) => ({
                    key, ...value
                }));
                //                console.log("Muutettiin arrayksi",globalCategories);
                return globalCategories;
            } else {
                console.log("No data available");
                return null;
            }
        } catch (e) {
            console.error("Error fecthing categories", error);
        }
    }

    const getTimeStamp = () => {
        return new Date().toISOString().split('.')[0];
    }

    // save the pics from backend
    const saveChangedToFirebase = async () => {
        try {
            // updates jaotellaan tiedot muotoon, jota firebase update komennolla ymmärtää
            const updates = updateItems.reduce((acc, item) => {
                acc[`items/${item.id}`] = item;      // tai valitse vain päivitettävät kentät
                return acc;
            }, {});
            console.log("updates", updates);
            await update(ref(database), updates); // updatetaan olemassa olevat tiedot
            console.log('updated info to firebase');
        } catch (e) {
            console.log('save to firebase error', e);
        }
    }

    // we are using this to get image from storage
    async function downloadImage(uri) {
        setDownloading(true);
        try {
            const url = await saveImageToPhone(uri);
            console.log('downloaded image from storage');
            return url;
        } catch (error) {
            console.log('File getInfo failed', error);
            return false;
        }
    }

    const loadAllCategories = async () => {
        const cats = await getCategories();
        //      setCategories(cats);
    }

    useEffect(() => {
        setRecentItems(
            (items || []).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        );
    }, [items]);

    const saveImage = async (uri) => {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (!perm.granted) return;

        await MediaLibrary.saveToLibraryAsync(uri);
        console.log("Saved!");
    };

    useEffect(() => {
        if (user_id) { // if user_id is not null, lets go and get this users items
            getItems();
        }
        loadAllCategories();
    }, [user_id]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setUser_id(user?.uid ?? null));
        return unsub;
    }, []);

    const handlePress = () => {
        console.log("Refreshing items...");
        console.log("Haetaan itemit user_id:llä:", user_id);
        getItems();
        //        console.log('==== ITEMS ====', items);
    }

    // filtteröidään listasta lookingfor stringin mukaan
    const updateSearchList = async (lookingfor) => {
        const looking = lookingfor.toLowerCase();
        const result = items.filter(item =>
            item.itemName?.toLowerCase().includes(looking) ||
            item.description?.toLowerCase().includes(looking) ||
            item.category_name?.toLowerCase().includes(looking) ||
            item.location?.toLowerCase().includes(looking)
        );
        //       console.log(result);
        setSearchItems(result);
    }

    useEffect(() => {
        updateSearchList(lookingfor);
    }, [lookingfor]);


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
                onPress={() => handlePress()} >
                REFRESS
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
                        {/* 🕓 Recent Items */}
                        <View style={styles.section}>
                            <Pressable
                                onPress={() => navigation.getParent()?.navigate("ShowMyItemsScreen") ?? console.log("No parent navigator found")}
                            >
                                <Text style={styles.sectionTitle}>Recent Items</Text>
                            </Pressable>
                            <FlatList
                                keyExtractor={(item, index) => item.id.toString()}
                                data={recentItems}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => navigation.navigate("ShowItemScreen", { item }) ?? console.log("No parent navigator found")}
                                        style={styles.itembox}
                                    >
                                        <Image source={{ uri: item.uri }} style={styles.showimage} />
                                        <Text style={styles.itemTitle}>{item.itemName.slice(0, 17)}</Text>
                                        <Text style={styles.itemCategory}>{item.description}</Text>
                                        <Text style={styles.itemCategory}>{item.key}</Text>             
                                            <Text style={styles.itemCategory}>
                                                {item.category_name || "no category"}
                                            </Text>             
                                    </Pressable>
                                )}
                            />
                        </View>

                        {/* 📍 My Locations */}
                        <View style={styles.section}>
                            <Pressable
                                onPress={() => navigation.navigate("LocationScreen", {})}
                            >
                                <Text style={styles.sectionTitle}>My Locations</Text>
                            </Pressable>
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                data={locations}
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
                                            {item}
                                        </Button>
                                    </View>
                                )}
                            />
                        </View>

                        {/* 🗂️ My Categories */}
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
                                            <Text>{item}</Text> 
                                        </Button>
                                    </View>
                                )}
                            />
                        </View>

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
                                        <Text style={styles.itemTitle}>{item.itemName.slice(0, 17)}</Text>
                                        <Text style={styles.itemCategory}>{item.description}</Text>
                                        <Text style={styles.itemCategory}>{item.key}</Text>
                                            <Text style={styles.itemCategory}>
                                                {item.category_name || "no category"}
                                            </Text>   
                                    </Pressable>
                                )}

                            />
                        </View>
                    </ScrollView>

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
