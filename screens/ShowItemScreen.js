import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer, getParent } from '@react-navigation/native';
import { TextInput } from "react-native-paper";
import DropDownPicker from 'react-native-dropdown-picker';
import { app } from "../services/config";
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useItemData, updateItemData, itemData } from "../config/ItemDataState";
import styles from '../styles/RegisterStyles';


export default function ShowItemScreen() {
  const { params } = useRoute();
  const [user_id, setUser_id] = useState();
  console.log(" ---- Show ITEM -----");

  // Get the Authentication instance
  const auth = getAuth();
  const currentUser = auth.currentUser;


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

  const database = getDatabase(app);
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
          {itemData.uri && itemData.uri.startsWith('file')
            ? <Text style={{ color: 'gray' }}>Paikallinen kuva, ei ladattavissa</Text>
            : itemData.uri
              ? <Image source={{ uri: itemData.uri }} style={styles.cameraimage} />
              : null
          }
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

        <View style={{ zIndex: 1000, width: '90%', marginVertical: 5 }}>
          <Text>Category here</Text>
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
            keyboardType="numeric"
            value={itemData.price}
            placeholder="price"
            onChangeText={text => updateItemData({ price: Number(text) || 0 })}
          />
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

// const styles = StyleSheet.create({
//   button: {
//     borderRadius: 25,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingRight: 20,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FBFA',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     paddingTop: 20,
//   },
//   text: {
//     color: "#52946B",
//     fontSize: 15,
//     padding: 5,
//   },
//   cameraimage: {
//     aspectRatio: 1.5,
//     height: '200',
//     resizeMode: 'contain',
//     borderRadius: 5,
//     marginRight: 10,
//     zIndex: 0,
//   },
//   itembox: {
//     alignItems: 'center',
//   },
//   textinput: {
//     width: '90%',
//     fontSize: 15,
//     backgroundColor: '#EAF2EC', // kevyt vihertävä tausta esim.
//     color: '#52946B',
//     marginVertical: 6,
//     alignSelf: 'center',
//   },
//   input: {
//     height: 45,
//     backgroundColor: '#EAF2EC',
//     borderWidth: 0,
//     paddingHorizontal: 10,
//     color: '#52946B', // Text color
//     width: '90%',
//     marginVertical: 4,
//     borderRadius: 5,
//   },
//   inputdescription: {
//     height: 70,
//     backgroundColor: '#EAF2EC',
//     borderWidth: 0,
//     paddingHorizontal: 10,
//     color: '#52946B', // Text color
//     width: '90%',

//     justifyContent: 'space-around',
//     margin: 4,
//     borderTopLeftRadius: 5,
//     borderTopRightRadius: 5,
//     borderBottomLeftRadius: 5,
//     borderBottomRightRadius: 5,
//     textAlignVertical: 'top',
//   },
//   dropdown: {
//     backgroundColor: '#EAF2EC',
//     borderColor: '#52946B',
//     borderWidth: 0,
//     borderRadius: 8,
//     minHeight: 45,
//   },
//   dropdownContainer: {
//     backgroundColor: '#F8FBFA',
//     borderColor: '#52946B',
//     borderWidth: 1,
//     borderRadius: 8,
//   },
//   dropdownText: {
//     fontSize: 16,
//     color: '#52946B',
//   },
//   dropdownPlaceholder: {
//     color: '#777',
//     fontStyle: 'italic',
//   },
//   dropdownItemContainer: {
//     paddingVertical: 10,
//   },
//   dropdownItemLabel: {
//     color: '#333',
//     fontSize: 16,
//   },
//   dropdownSelectedItemLabel: {
//     fontWeight: 'bold',
//     color: '#52946B',
//   },
//   dropdownArrow: {
//     tintColor: '#52946B',
//   },
//   dropdownTick: {
//     tintColor: '#52946B',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingHorizontal: 12,
//     paddingBottom: 220,

//   },
// });