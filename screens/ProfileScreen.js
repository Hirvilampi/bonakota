import React from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import styles from "../styles/RegisterStyles";
import { useState, useEffect } from 'react';
import { getDatabase, push, ref, onValue } from 'firebase/database';
import { doc, getDoc } from "firebase/firestore";
import { useItemData, clearItemData, updateItemData } from "../config/ItemDataState";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, auth, database, db } from "../services/config";
import { useNavigation } from "expo-router";

export default function ProfileScreen() {
  const [items, setItems] = useState([]);
  const navigation = useNavigation();
  const [user_id, setUser_id] = useState();
  const [yourInfo, setYourInfo] = useState([]);
  // Get the Authentication instance
  //  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userId = currentUser.uid;
    //    console.log("Current user ID:", userId);
    // Use userId for fetching data, personalizing UI, etc.
  } else {
    console.log("No user signed in.");
  }
  //  const database = getDatabase(app);
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

  const getYourInfo = async () => {
    console.log("Getting your info")
    const docRef = doc(db, "users", currentUser.uid);
    const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    setYourInfo(data);
    console.log("data:", data);
  } else {
    console.log("No such document");
    setYourInfo(null);
  }
    // console.log(snap);
  }

  useEffect(() => {
    getItems();
    getYourInfo();
  }, []);

  const handlePress = () => {
    console.log("Refreshing items...");
    getItems();
    getYourInfo();
  }

  const handlePressFirestoreTest = () => {
    navigation.navigate("FirestoreTest");
  }

 //       <Text style={styles.title}>🚧 ProfileScreen Under Construction 🚧</Text>
      //  <Text style={styles.subtitle}>
      //   This screen is currently being built.
      // </Text>
  return (
    <View style={[styles.container, { flex: 1 }]}>


      <View style={[styles.itemTitle, {margin: 20,}]}>
      <Text  style={[styles.itemTitle, {fontSize: 20, fontWeight: "normal"}]}>Your info in Bonakota</Text>
      <Text style={[styles.itemTitle, {fontSize: 20}]}>username: {yourInfo.username}</Text>
      <Text style={[styles.itemTitle, {fontSize: 20}]}>firstname: {yourInfo.firstname}</Text>
      <Text style={[styles.itemTitle, {fontSize: 20}]}>lastname: {yourInfo.lastname}</Text>
      <Text style={[styles.itemTitle, {fontSize: 20}]}>email: {yourInfo.email}</Text>
      </View>
      <Button title="Testaa FireStore yhteys" onPress={handlePressFirestoreTest} />
  {/* 
      <Button title="REFRESH" onPress={handlePress} />
      <Text>All items in database</Text>
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) =>

          <Text style={{ fontSize: 18 }}>{item.itemName}, {item.description}</Text>
        }

      />
      */}
    </View>
  );
}
