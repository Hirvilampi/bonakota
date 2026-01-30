import { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Button } from "react-native-paper";
import { auth, database } from '../services/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/RegisterStyles';
// Firestore-funktiot
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import ensureLocalImage from "../components/ensureLocalImage";
import ImageWithLoader from "../components/ImageWithLoader";


export default function MarketScreen() {
  const [itemsOnMarket, setItemsOnMarket] = useState([]);
  const [displayItemsOnMarket, setDisplayItemsOnMarket] = useState([]);
  const [ownItemsOnMarket, setOwnItemsOnMarket] = useState([]);
  const [allMarketItems, setAllMarketItems] = useState([]);
  const [lookingfor, setLookingfor] = useState('');
  const [searchItems, setSearchItems] = useState([]);
  const [categories] = useState([]);
  const [user_id, setUser_id] = useState(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      //   console.log("Current user ID:", currentUser.uid);
      setUser_id(currentUser.uid);
      // console.log("GOT Current user_ID:", user_id);
    } else {
      console.log("No user signed in.");
    }
  }, [currentUser]);
  // console.log("Current user_ID:", user_id);


  //  const database = getDatabase(app);
  // tää kaatoi koko homman aiemmin const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);

  const getItemsOnMarket = async () => {
    // console.log("haetaan itemit, jotka on asetettu marketplazelle");
    // console.log("user_id:llä", user_id);
    const itemsRef = ref(database, 'items/');
    const marketItemsQuery = query(itemsRef, orderByChild('on_market_place'), equalTo(1));
    const kaavin = onValue(marketItemsQuery, async (snapshot) => {
      // console.log("Market On value");
      const data = snapshot.val();
      //      console.log("=== MARKETTIDATA ===",data);
      const marketList = data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : [];
      //      console.log("-- MARKETTILISTA --",marketList);
      const filteredListNoUsersItems = marketList.filter(item => item.owner_id !== user_id);
      const filteredListMyItems = marketList.filter(item => item.owner_id == user_id);
      setAllMarketItems(marketList);
      setItemsOnMarket(filteredListNoUsersItems);
      if (filteredListNoUsersItems.length > 0) {
        console.log("Loaded on market items");
      }
      setOwnItemsOnMarket(filteredListMyItems);
    })
  }

  useEffect(() => {
    if (user_id) { // if user_id is not null, lets go and get this users items
      getItemsOnMarket();
    }
  }, [user_id]);

  useEffect(() => {
    let mounted = true;
    setDisplayItemsOnMarket(itemsOnMarket || []);
    const hydrate = async () => {
      const enriched = await Promise.all(
        (itemsOnMarket || []).map(async (item) => {
          const localUri = await ensureLocalImage(item.downloadURL);
          return { ...item, localUri };
        })
      );
      if (mounted) setDisplayItemsOnMarket(enriched);
    };
    hydrate();
    return () => { mounted = false; };
  }, [itemsOnMarket]);

  // filtteröidään listasta lookingfor stringin mukaan
  const updateSearchList = async (lookingfor) => {
    const looking = lookingfor.toLowerCase();
    const result = displayItemsOnMarket.filter(item =>
      item.itemName?.toLowerCase().includes(looking) ||
      item.description?.toLowerCase().includes(looking) ||
      item.category_name?.toLowerCase().includes(looking) ||
      item.location?.toLowerCase().includes(looking)
    );
 //   console.log(result);
    setSearchItems(result);
  }

  useEffect(() => {
    updateSearchList(lookingfor);
  }, [lookingfor, displayItemsOnMarket]);



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
      <View styles={{ padding: 50, }}>
        <Button
          mode="text"
          buttonColor="#EAF2EC"
          textColor="#52946B"
          onPress={() => navigation.navigate("YourMarketItems", { items: ownItemsOnMarket })}
        >
          <Text style={{ fontWeight: "bold" }}> YOUR ITEMS ON MARKET</Text>
        </Button>
      </View>

      {!lookingfor ? (
        allMarketItems?.length > 0 ? (
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={displayItemsOnMarket}
            vertical
            showsVerticalScrollIndicator
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20, paddingTop:10, }}
            renderItem={({ item }) => (

              <Pressable
                onPress={() => navigation.navigate("MarketItemScreen", { item }) ?? console.log("No parent navigator found")}
                style={styles.itembox}
              >
                <View style={{ flexDirection: "row", padding: 5, }}>
                  <ImageWithLoader source={{ uri: item.localUri || item.downloadURL || item.uri }} style={styles.showimage} />
                  <View>
                    <Text style={styles.itemTitle}>{item.itemName}</Text>
                    <Text style={styles.itemCategory}>{item.description}</Text>
                    <Text style={styles.itemCategory}>{item.price} €</Text>
                    <Text style={styles.itemCategory}>{item.key}</Text>
                    {categories?.length > 0 && (
                      <Text style={styles.itemCategory}>
                        {categories.find(
                          (cat) => cat.value == String(item.category_id)
                        )?.label || ""}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>

            )}
          />
        ) : (<Text>No items to show</Text>)

      ) : (
        <>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={searchItems}
            vertical
            showsVerticalScrollIndicator
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => navigation.navigate("MarketItemScreen", { item }) ?? console.log("No parent navigator found")}
                style={styles.itembox}
              >
                <ImageWithLoader source={{ uri: item.localUri || item.downloadURL || item.uri }} style={styles.showimage} />
                <Text style={styles.itemTitle}>{item.itemName}</Text>
                <Text style={styles.itemCategory}>{item.description}</Text>
                <Text style={styles.itemCategory}>price: {item.price} €</Text>
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
        </>
      )}

    </View>
  );
}
