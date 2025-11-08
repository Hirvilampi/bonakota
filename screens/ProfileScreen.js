import React from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import styles from "../styles/RegisterStyles";
import { useState, useEffect } from 'react';
import { getDatabase, push, ref, onValue } from 'firebase/database';
import { useItemData, clearItemData, updateItemData } from "../config/ItemDataState";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../services/config";

export default function ProfileScreen() {
  const [items, setItems] = useState([]);
  // Get the Authentication instance
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userId = currentUser.uid;
//    console.log("Current user ID:", userId);
    // Use userId for fetching data, personalizing UI, etc.
  } else {
    console.log("No user signed in.");
  }
  const database = getDatabase(app);
  const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);
  // const insets = useSafeAreaInsets();

  const getItems = async () => {
    const itemsRef = ref(database, 'items/');
 //   console.log("itemsref", itemsRef);
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
  //      console.log("data", data);
 //       console.log("data values object", Object.values(data));
        const datavalues = Object.values(data);
        setItems(datavalues);
 //       console.log("items:", items);
      } else {
        setItems([]); // Handle the case when there are no items
      }
    })
  }

  useEffect(() => {
    getItems();
  }, []);

  const handlePress = () => {
    console.log("Refreshing items...");
    getItems();
  }


  return (
    <View style={[styles.container, { flex: 1 }]}>
      <Text style={styles.title}>🚧 ProfileScreen Under Construction 🚧</Text>
      <Text style={styles.subtitle}>
        This screen is currently being built.
      </Text>
      <Button title="REFESSAA" onPress={handlePress} />
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) =>

          <Text style={{ fontSize: 18 }}>{item.itemName}, {item.description}</Text>
        }

      />
    </View>
  );
}
