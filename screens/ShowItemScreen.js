import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useRoute, useFocusEffect, useNavigation, NavigationContainer, getParent } from '@react-navigation/native';
import { Button, TextInput } from "react-native-paper";
import { app, database, auth } from "../services/config";
import { getDatabase, ref, push, onValue, update, remove, query, equalTo, orderByChild } from "firebase/database";
import { useItemData, updateItemData, itemData } from "../config/ItemDataState";
import styles from '../styles/RegisterStyles';
import { useCategories } from "../context/CategoryContext";
import CategoryPicker from "../components/CategoryPicker";
import LocationPicker from "../components/LocationPicker";
import ensureLocalImage from "../components/ensureLocalImage";
import Loader from "../components/Loader";

export default function ShowItemScreen() {
  const { params } = useRoute();
  const [user_id, setUser_id] = useState();
  console.log(" ---- Show ITEM -----");

  // Get the Authentication instance
  //  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { categories, loading } = useCategories();
  const [ location, setLocation] = useState();
  const [category_id, setCategory_id] = useState();
  const [ locations, setLocations ] = useState(); 

  if (loading || !categories) {
    return <Loader mode="inline" label="Loading categories..." />
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
  const [localUri, setLocalUri] = useState(null);

  useEffect(() => {
    if (params?.item) {
      updateItemData(params.item);
      setLocation(params.item.location);
//      console.log("item updated", params.item);
    }
  }, [params]);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      const uri = await ensureLocalImage(itemData?.downloadURL);
      if (mounted) setLocalUri(uri);
    };
    hydrate();
    return () => { mounted = false; };
  }, [itemData?.downloadURL]);

    useFocusEffect(
      useCallback(() => {
        if (!user_id) return;
        // console.log("haetaan userin itemit ja eristetään niistä lokaatiot:");
        const itemsRef = ref(database, "items/");
        const q = query(itemsRef, orderByChild("owner_id"), equalTo(user_id));
        const unsubscribe = onValue(q, snap => {
          const data = snap.val();
          const list = data ? Object.entries(data).map(([id, item]) => ({ id, ...item })) : [];
          const uniquelocations = [...new Set((list.map(item => item.location)))];
          const hardcodedlocations = [
            "Carage",
            "Living Room",
            "Kitchen",
            "Walk-in closet",
            "Kids room",
            "Study",
            "Attic",
            "Basement",
            "Hall",
            "Master Bedroom"
          ];
          const combinedlocations = [
            ...uniquelocations,
            ...hardcodedlocations.filter(loc => !uniquelocations.includes(loc))
          ];
          setLocations(
            combinedlocations.map(loc => ({
              label: loc,
              value: loc,
            })));
        });
        return () => unsubscribe();
      }, [user_id])
    );
  
    useEffect(() => {
      if (location !== itemData.location) {
        updateItemData({location});
      }
    }, [location, itemData.location]);

  const deleteItem = async () => {
    // console.log('trying to delete item from firebase');
    if (itemData.id) {
 //     console.log("meillä on poistettavalle itemData.itemName id:llä", itemData.itemName, itemData.id);
      const itemRef = ref(database, `items/${itemData.id}`);
      try {
        await remove(itemRef);
 //       console.log("Item poistettu onnistuneesti:", itemData.id);
        Alert.alert("Poistettu", `Item ${itemData.itemName} poistettu.`);
        clearItemData();
        navigation.navigate('MainTabs', { screen: 'My Items' });
      } catch (error) { Alert.alert("virhe poistettaessa"); }
    } else { Alert.alert('To delete, item has to have id') };
  }

  const getTimeStamp = async () => {
    let now = new Date();
    const newtimestamp = now.toISOString().split('.')[0];
    return newtimestamp;
  }

  const saveItem = async () => {
    // console.log('trying to save item');
    const ts = await getTimeStamp();
    const payload = { ...itemData, timestamp: ts };
    updateItemData({timestamp : ts});
    const userRef = ref(database, 'users/' + user_id);
//    console.log("Tallennusyritys itemdata", itemData);
//    console.log("userRef - käyttäjän polku", userRef);
    if (itemData.itemName) {
//      console.log("meillä on itemData.itemName id:llä", itemData.itemName, itemData.id);
      const itemRef = ref(database, `items/${itemData.id}`);
      update(itemRef, payload)
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
          {itemData?.uri || itemData?.downloadURL || localUri ? (
            <Image source={{ uri: localUri || itemData.downloadURL || itemData.uri }} style={styles.cameraimage} />
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
                onChangeCategory={({ id, name}) =>
                updateItemData({ category_id: id, category_name: name})
                }
              />
        </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '90%' }}>
              <TextInput
                placeholder='Location'
                placeholderTextColor="#52946B"
                style={styles.inputLocation}
                onChangeText={(text) => {
                  setLocation(text);
                  updateItemData({ location: text });
                }}
                value={itemData.location ?? location ?? ""}
              />
              <LocationPicker locations={locations} location={location} setLocation={setLocation} minheight='35' />
            </View>
        <TextInput
          mode="flat"
          style={[styles.input]}
          value={itemData.size}
          label="size"
          onChangeText={text => updateItemData({ size: text })}
        />


        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }} >
          <Button style={[styles.tomarketbutton, {}]} onPress={toggleMarketPlace}>
            {itemData.on_market_place === 0 ? "SELL" : "DON'T SELL"}
           
            </Button>
          <Text style={styles.text} onPress={toggleMarketPlace} >On Market Place: {itemData.on_market_place ? "Yes" : "No"} </Text>
          <TextInput
            mode="flat"
            style={[styles.input, { width: '20%' }]}
            keyboardType={'numeric'}
            value={String(itemData.price ?? '')}
            placeholder="price"
            onChangeText={text => updateItemData({ price: text })}
          />
          <Text style={styles.text}>€</Text>
        </View>

            {/* Save ja Delete napit */}
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
