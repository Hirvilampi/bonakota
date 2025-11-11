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
import { app, auth, db, database } from '../services/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/RegisterStyles';
// Firestore-funktiot
import { collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, query, set, get, orderByChild, equalTo, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useItemData, clearItemData, updateItemData } from "../config/ItemDataState";

export default function MarketScreen() {
  const [itemsOnMarket, setItemsOnMarket] = useState([]);
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
      console.log("GOT Current user_ID:", user_id);
    } else {
      console.log("No user signed in.");
    }
  }, [currentUser]);
  // console.log("Current user_ID:", user_id);


  //  const database = getDatabase(app);
  // tää kaatoi koko homman aiemmin const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);

  const getItems = async () => {
    console.log("haetaan itemit, jotka on asetettu marketplazelle");
    console.log("user_id:llä", user_id);
    const itemsRef = ref(database, 'items/');
    const marketItemsQuery = query(itemsRef, orderByChild('on_market_place'), equalTo(1));

      try {
        console.log("!! TYING TO GET ON MARKET ITEMS !!")
        const snapshot1 = await get(marketItemsQuery);
        console.log("GOT QUERY");
        if (snapshot1.exists()) {
          console.log("!! SNAPSHOT 1 SAATU");
          const data = snapshot1.val();
          if (data) {
            const itemsList = Object.entries(data).map(([id, item]) => ({
              id,
              ...item,
            }

            ));
            console.log("itemslist", itemsList);
            const filteredListNoUsersItems = itemsList.filter(item => item.owner_id !== user_id);
            const filteredListMyItems = itemsList.filter(item => item.owner_id == user_id);
            setAllMarketItems(itemsList);
            setItemsOnMarket(filteredListNoUsersItems);
            setOwnItemsOnMarket(filteredListMyItems);
          } else {
            setItemsOnMarket([]);
          }
        }

      } catch (error) {
        Alert.alert("Error getting on market items", error);
      }
    
    //         onValue(userItemsQuery, (snapshot) => {
    //             console.log("onValue - on käyty");
    //             const data = snapshot.val();
    //             if (data) {
    //                 const itemsList = Object.entries(data).map(([id, item]) => ({
    //                     id,
    //                     ...item,
    //                 }));
    //                 setItemsOnMarket(itemsList);
    //  //               console.log("------- TÄÄÄ ON SE LISTA -----",itemsList);
    //             } else {
    //                 setItemsOnMarket([]); // Handle the case when there are no items
    //             }
    //         })

  }

  useEffect(() => {
    if (user_id) { // if user_id is not null, lets go and get this users items
      getItems();
    }
  }, [user_id]);

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
      {!lookingfor ? (
        allMarketItems?.length > 0 ? ( 
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={allMarketItems}
          vertical
          showsVerticalScrollIndicator
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
              <Text style={styles.itemCategory}>{item.price}</Text>
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
        ) : (<Text>No items to show</Text>)

      ) : (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={itemsOnMarket}
        vertical
        showsVerticalScrollIndicator
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
            <Text style={styles.itemCategory}>price: {item.price}</Text>
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
      )}

    </View>
  );
}

