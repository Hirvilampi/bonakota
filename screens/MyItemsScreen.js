import { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, TextInput, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Button } from "react-native-paper";
import { getInfoAsync } from "expo-file-system/legacy";
import saveImageToPhone from '../components/saveImageToPhone';
import { auth, database } from '../services/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/RegisterStyles';
import Loader from "../components/Loader";
import ImageWithLoader from "../components/ImageWithLoader";
// Firestore-funktiot
import { ref, query, get, orderByChild, equalTo, onValue, update } from 'firebase/database';
import { onAuthStateChanged } from "firebase/auth";
import { useItemData} from "../config/ItemDataState";
import { fetchUserChats } from "../components/fetchUserChats";
import { listenToUserChats } from "../components/listenToUserChats";
import { loadImageCache, saveImageCache } from "../services/itemsImageCache";

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
    const [imageCache, setImageCache] = useState({});
    const [messages, setMessages] = useState([]);

    // Get the Authentication instance
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            //   console.log("Current user ID:", currentUser.uid);
            setUser_id(currentUser.uid);
            console.log("Current user_ID:", user_id);
        } else console.log("No user signed in.");

    }, [currentUser]);
    // console.log("Current user_ID:", user_id);

    //  const database = getDatabase(app);
    const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);
    // const insets = useSafeAreaInsets();

    // tarkastaa onko lokaalisti olemassa image tiedostoa
    const fileExists = async (uri) => {
        if (!uri || !uri.startsWith('file://')) return false;
        try {
            const info = await getInfoAsync(uri);
            // console.log("exits info", info.exists, info);
            return info.exists;
        } catch (e) {
            console.log('File getInfo failed', e);
            return false;
        }
    };

    // hakee kaikki käyttäjän itemit sekä etsii käyttäjän lokaatiot ja kategoriat itemeistä
    const getItems = async () => {
        console.log("haetaan itemit");
        // console.log("user_id:llä", user_id);
        const itemsRef = ref(database, 'items/');
        // console.log("we have user id");
        // console.log("typeof user_id:", typeof user_id);
        // console.log("user_id:", JSON.stringify(user_id))
        const userItemsQuery = query(itemsRef, orderByChild('owner_id'), equalTo(user_id));
        const unsubscribe = onValue(userItemsQuery, async (snapshot) => {
            // console.log("onValue - on käyty");
            const data = snapshot.val();
            const itemsList = data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : [];
            const cachedMap = await loadImageCache(user_id);
            setImageCache(cachedMap);
            setItems(itemsList);
            updateItemData(itemsList);
            let cacheChanged = false;
            for (const item of itemsList) {
                const cachedUri = cachedMap?.[item.id];
                const localUri = cachedUri || item.uri; // prefer cached per-device uri
                const remoteUri = item.downloadURL || item.uri; // remote fallback
                const exists = await fileExists(localUri);
                if (exists) {
                    if (cachedUri && item.uri !== cachedUri) {
                        setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, uri: cachedUri } : it));
                    }
                    continue;
                }
                if (!exists && remoteUri?.startsWith('http')) {
                    const newLocal = await downloadImage(remoteUri);
                    if (newLocal) {
                        cacheChanged = true;
                        cachedMap[item.id] = newLocal;
                        setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, uri: newLocal, timestamp: getTimeStamp() } : it));
                    }
                }
            }
            if (cacheChanged) {
                setImageCache({ ...cachedMap });
                await saveImageCache(user_id, cachedMap);
            }
            // tehdään olemassaolevat kategoriat listaksi
            const itemcategories = (itemsList.map(item => item.category_name));
            const uniquecategories = [...new Set((itemsList.map(item => item.category_name)))];
            //           console.log("!! MY CATEGORIES !!", uniquecategories);
            setCategories(uniquecategories);
            // tehdään itemien lokaatiosta lista omista lokaatiosta
            const uniquelocations = [...new Set((itemsList.map(item => item.location)))];
            setLocations(uniquelocations);
            //           console.log("!! MY LOCATIONS !! ", uniquelocations);
        });
        // no firebase update for local cache
        return () => unsub?.();
    }

    // hakee kategoriat, mutta tällä ei ole mitää käyttöä, koska kaikkia kategorioita ei ole 
    // järkevää näyttää tässä
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

    // save local image uri info to backend - this happens if we load pics from backend
    const saveChangedToFirebase = async () => {
        try {
            // updates jaotellaan tiedot muotoon, jota firebase update komennolla ymmärtää
            const updates = updateItems.reduce((acc, item) => {
                acc[`items/${item.id}`] = item;      // tai valitse vain päivitettävät kentät
                return acc;
            }, {});
            // console.log("updates", updates);
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
            // console.log('downloaded image from storage');
            return url;
        } catch (error) {
            console.log('File getInfo failed', error);
            return false;
        } finally {
            setDownloading(false);
        }
    }

    const loadAllCategories = async () => {
        //    const cats = await getCategories();
        //      setCategories(cats);
    }

    useEffect(() => {
        setRecentItems(
            (items || []).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        );

    }, [items]);

    useEffect(() => {
        if (!user_id) return;
        getItems();

    }, [user_id]);

    useEffect(() => {
        if (!user_id) return;
        // console.log('haetaan kerran chat messaged');
        //     const chats = listenToUserChats(user_id);
        fetchUserChats(user_id).then(setMessages).catch(console.log);

        // console.log('pistetään kuuntelija hommiiin');
        // console.log('chatit', messages);
        // realtime-kuuntelu
        const unsub = listenToUserChats(user_id, chats => setMessages(chats));
        // console.log(" ### MESSAGES ###");
        // console.log(messages);
        return () => unsub?.();
    }, [user_id]);

    // jos auth muuttuu, niin reagoidaan?
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => setUser_id(user?.uid ?? null));
        return unsub;
    }, []);

    // logiin messaget, jos ne muuttuu
    // useEffect(() => {
    //     console.log('### MESSAGES ###', messages);
    // }, [messages]);

    const handlePress = () => {
        console.log("Refreshing items...");
        // console.log("Haetaan itemit user_id:llä:", user_id);
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
        <View style={{ flex: 1 }}>
        <View style={styles.container}>
            {/* 🔍 Search */}
            <TextInput
                style={styles.input}
                placeholder="Search from items"
                placeholderTextColor="#52946B"
                onChangeText={setLookingfor}
                value={lookingfor}
            />

            {/* Tälle ei pitäisi olla käyttöä eikä tarvetta
            <Button
                mode="text"
                buttonColor="#EAF2EC"
                textColor="#52946B"
                onPress={() => handlePress()} >
                REFRESS
            </Button>
*/}
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
                            {/*      <Pressable
                                onPress={() => navigation.getParent()?.navigate("ShowMyItemsScreen") ?? console.log("No parent navigator found")}
                            ><Text style={styles.sectionTitle}>Recent Items</Text> </Pressable> */}
                            <Text style={styles.sectionTitle}>Recent Items</Text>
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
                                        <ImageWithLoader source={{ uri: item.uri }} style={styles.showimage} />
                                        <Text style={styles.itemTitle}>{item.itemName.slice(0, 17)}</Text>
                                        <Text style={styles.itemCategory}>{item.description}</Text>
                                        {/*          <Text style={styles.itemCategory}>
                                            {item.category_name || "no category"}
                                        </Text> */}
                                    </Pressable>
                                )}
                            />
                        </View>

                        {/* 📍 My Locations */}
                        <View style={styles.sectionIons}>
                            <Pressable
                                onPress={() => navigation.getParent()?.navigate("ShowMyLocations", { locations })}
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
                                                navigation.navigate("LocationScreen", { location: item })
                                            }
                                        >
                                            {item}
                                        </Button>
                                    </View>
                                )}
                            />
                        </View>

                        {/* 🗂️ My Categories */}
                        <View style={styles.sectionIons}>
                            <Pressable
                                onPress={() => navigation.getParent()?.navigate("ShowMyCategories", { categories }) ?? console.log("No parent navigator found")}
                            >
                                <Text style={styles.sectionTitle}>My Categories</Text>
                            </Pressable>

                            <FlatList
                                keyExtractor={(item, index) => index?.toString()}
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
                                                navigation.navigate("CategoryScreen", { category: item })
                                            }
                                        >
                                            <Text>{item}</Text>
                                        </Button>
                                    </View>
                                )}
                            />
                        </View>

                        {/* My Items */}
                        <View style={styles.section}>
                            <Pressable
                                onPress={() => navigation.getParent()?.navigate("ShowMyItemsScreen", { items }) ?? console.log("No parent navigator found")}
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
                                        <ImageWithLoader source={{ uri: item.uri }} style={styles.showimage} />
                                        <Text style={styles.itemTitle}>{item.itemName.slice(0, 17)}</Text>
                                        <Text style={styles.itemCategory}>{item.description}</Text>
                                        {/*          <Text style={styles.itemCategory}>
                                            {item.category_name || "no category"}
                                        </Text> */}
                                    </Pressable>
                                )}

                            />
                        </View>

                        {/* Chats */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Chats</Text>
                            <FlatList
                                data={messages}
                                keyExtractor={item => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}
                                renderItem={({ item }) => {
                                    const chatItem = items.find((it) => it.id === item.itemId || it.item_id === item.itemId);
                                    const otherUserId = item.members.find((m) => m !== user_id);
                                    return (
                                        <Button
                                            mode="text"
                                            buttonColor="#EAF2EC"
                                            textColor="#52946B"
                                            style={styles.categoryButton}
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
                                <ImageWithLoader source={{ uri: item.uri }} style={styles.cameraimage} />
                                <Text style={styles.itemTitle}>{item.itemName}</Text>
                            </Pressable>
                        )}
                    />
                </>
            )}
        </View>
        <Loader visible={downloading} mode="overlay" label="Downloading images..." />
        </View>

    );
}
