import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer, getParent } from '@react-navigation/native';
import { TextInput } from "react-native-paper";
import DropDownPicker from 'react-native-dropdown-picker';
import { app, database, auth } from "../services/config";
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useItemData, updateItemData, itemData } from "../config/ItemDataState";
import styles from '../styles/RegisterStyles';
import { useCategories } from "../context/CategoryContext";
import CategoryPicker from "../components/CategoryPicker";

export default function ShowItemScreen() {
  const { params } = useRoute();
  const [user_id, setUser_id] = useState();
  console.log(" ---- Show ITEM -----");

  // Get the Authentication instance
  //  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { categories, loading } = useCategories();
  const [category_id, setCategory_id] = useState();

  if (loading || !categories) {
    return <Text>Loading categories...</Text>
  }

  useEffect(() => {
    if (currentUser) {
      //   console.log("Current user ID:", currentUser.uid);
      setUser_id(currentUser.uid);
      //     console.log("Current user_ID:", user_id);
    } else {
      //     console.log("No user signed in.");
    }
  }, [currentUser]);

  // console.log("Current user_ID:", user_id);

  const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);
  const navigation = useNavigation();

  useEffect(() => {
    if (params?.item) {
      updateItemData(params.item);
      console.log("item updated", params.item);
    }
  }, [params]);

  const deleteItem = async () => {
    console.log('trying to delete item from firebase');
    if (itemData.id) {
      console.log("meillä on poistettavalle itemData.itemName id:llä", itemData.itemName, itemData.id);
      const itemRef = ref(database, `items/${itemData.id}`);
      try {
        await remove(itemRef);
        console.log("Item poistettu onnistuneesti:", itemData.id);
        Alert.alert("Poistettu", `Item ${itemData.itemName} poistettu.`);
        clearItemData();
        navigation.navigate('MainTabs', { screen: 'My Items' });
      } catch (error) { Alert.alert("virhe poistettaessa"); }
    } else { Alert.alert('To delete, item has to have id') };
  }

  const getTimeStamp = async () => {
    let now = new Date();
    const newtimestamp = now.toISOString().split('.')[0];
    console.log('newtimestamp', newtimestamp);
    return newtimestamp;
  }

  const saveItem = async () => {
    console.log('trying to save item');
    const userRef = ref(database, 'users/' + user_id);
    console.log("Tallennusyritys itemdata", itemData);
    console.log("userRef - käyttäjän polku", userRef);
    if (itemData.itemName) {
      console.log("meillä on itemData.itemName id:llä", itemData.itemName, itemData.id);
      const itemRef = ref(database, `items/${itemData.id}`);
      update(itemRef, itemData)
        .then(() => {
          // Tähän koodiin tullaan, jos kirjoitus palvelimelle onnistui
          //         console.log("Tiedot tallennettu onnistuneesti!");
          //         console.log("Tallenneetu data:", itemData);

          Alert.alert('Tallennus onnistui!', `Item ${itemData.itemName} tallennettu.`);
          clearItemData();
          navigation.navigate('MainTabs', { screen: 'My Items' });
        })
        .catch((error) => {
          // Tähän koodiin tullaan, jos kirjoitus palvelimelle epäonnistui
          //         console.error("Tietojen tallennus epäonnistui:", error);
          // Voit näyttää käyttäjälle virheilmoituksen
          Alert.alert('Virhe!', `Tallennus epäonnistui: ${error.message}`);
        });

    } else { Alert.alert('To save, item has to have name'); }
  }

  const confirmDelete = () => {
    Alert.alert(
      'Delete item',
      '',
      [
        {
          text: 'No',
          onPress: () => console.log('Canceled'),
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: () => { console.log('Delete executing'); deleteItem(); },
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };

  const toggleMarketPlace = () => {
    updateItemData({
      on_market_place: itemData.on_market_place === 0 ? 1 : 0
    });
  }

  <Image source={{ uri: itemData.uri }} style={styles.cameraimage} />

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
          {itemData?.uri ? (
            <Image source={{ uri: itemData.uri }} style={styles.cameraimage} />
          ) : (
            <Text style={{ color: 'gray' }}>Paikallinen kuva, ei ladattavissa</Text>
          )}


        </View>
        <TextInput
          mode="flat"
          dense
          style={[styles.input]}
          contentStyle={{ height: 35, fontSize: 15 }}
          value={itemData.itemName}
          label="name"
          onChangeText={(text) => updateItemData({ itemName: text })}
        />
        <TextInput
          mode="flat"
          style={[styles.inputdescription]}
          multiline
          contentStyle={{ height: 40, fontSize: 16 }}
          value={itemData.description}
          label="description"
          onChangeText={text => updateItemData({ description: text })}
        />


        <View style={{ zIndex: 1000, width: '90%', marginVertical: 5, position: 'relative', zIndex: 10, }}>
          <CategoryPicker
            category_id={itemData.category_id}
            setCategory_id={(val) => updateItemData({ category_id: val })}
          />
        </View>

        <TextInput
          mode="flat"
          style={[styles.input]}
          value={itemData.location}
          label="location"
          onChangeText={text => updateItemData({ location: text })}
        />
        <TextInput
          mode="flat"
          style={[styles.input]}
          value={itemData.size}
          label="size"
          onChangeText={text => updateItemData({ size: text })}
        />


        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }} >
          <Text style={styles.text} onPress={toggleMarketPlace} >On Market Place: {itemData.on_market_place ? "Yes" : "No"} </Text>
          <TextInput
            mode="flat"
            style={[styles.input, { width: '40%' }]}
            keyboardType={'numeric'}
            value={String(itemData.price ?? '')}
            placeholder="price"
            onChangeText={text => updateItemData({ price: text })}
          />
          <Text style={styles.text}>€</Text>
        </View>


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
              saveItem();
            }}>
            <Text style={{ color: '#0D1A12', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'darkred' : 'red',
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
                marginLeft: 10,
              },
            ]}
            onPress={() => {
              confirmDelete();
            }}>
            <Text style={{ color: '#0D1A12', fontSize: 16, fontWeight: 'bold' }} >Delete</Text>
          </Pressable>
        </View>
      </View>

    </ScrollView>
  );
}
