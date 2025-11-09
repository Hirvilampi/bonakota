import React from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Image, TextInput, Pressable, Alert, Platform } from "react-native";
import { Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import styles from '../styles/RegisterStyles';
import { useItemData, clearItemData, updateItemData } from "../config/ItemDataState";
import PhotoQuick from "./PhotoQuick";
// Import Firebase Authentication if you're getting the user ID from there
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push } from "firebase/database";
import { app } from "../services/config";

export default function AddItem() {
  const insets = useSafeAreaInsets();

  // Get the Authentication instance
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userId = currentUser.uid;
    console.log("Current user ID:", userId);
    // Use userId for fetching data, personalizing UI, etc.
  } else {
    console.log("No user signed in.");
  }

  const database = getDatabase(app);
  const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);

  const handleSave = () => {
    updateItemData();
    console.log("Tallennusyritys itemdata", itemData)
    if (itemData.itemName) {
      console.log("meillä on itemData.itemName");
      push(ref(database, 'items/'), itemData)
        .then((newRef) => {
          // Tähän koodiin tullaan, jos kirjoitus palvelimelle onnistui
          console.log("Tiedot tallennettu onnistuneesti!");
          console.log("Uusi avain (push ID):", newRef.key);
          console.log("Tallenneetu data:", itemData);
          clearItemData();
          // Voit tehdä tässä muita toimintoja, esim. näyttää käyttäjälle onnistumisviestin
          Alert.alert('Tallennus onnistui!', `Item ${itemData.itemName} tallennettu.`);
        })
        .catch((error) => {
          // Tähän koodiin tullaan, jos kirjoitus palvelimelle epäonnistui
          console.error("Tietojen tallennus epäonnistui:", error);
          // Voit näyttää käyttäjälle virheilmoituksen
          Alert.alert('Virhe!', `Tallennus epäonnistui: ${error.message}`);
        });

    } else { Alert.alert('To save, item has to have name'); }
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FBFA' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: '#F8FBFA' }}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.scrollContaineradditem}
        >
          <View style={styles.innerContainer}>
            <View style={{ flexDirection: 'row', marginBottom: 5, gap: 10, paddingTop: 15, }}>
              <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={clearItemData}>CLEAR</Button>
              <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={handleSave}>SAVE</Button>
            </View>

            <View style={[styles.cameraviewadditem, { flexDirection: 'column', width: '60%', }]}>

              {itemData.uri ? (
                <Image source={itemData.uri} style={styles.cameraimage} />
              ) : (
                <>
                  <View style={{ alignItems: "center", padding: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>Add Image</Text>
                    <Text style={{ textAlign: "center" }}>
                      Take a photo or select from gallery
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View style={{ marginTop: 0, flexDirection: "row", gap: 10 }}>
              {/* first button - change or add image */}
              <PhotoQuick
                label={itemData.uri ? "Change Image" : "Add Image"}
                mode="addimage"
                onDone={({ newUri }) => {
                  updateItemData({
                    uri: newUri,
                    fileName: fileName
                  })

                }}
              />

              {/* Another button - take photo or take new photo */}
              <PhotoQuick
                label={itemData.uri ? "Take new photo" : "Take Photo"}
                mode="takephoto"
                onDone={({ newUri }) => {
                  updateItemData({
                    uri: newUri,
                    fileName: fileName
                  })
                }}
              />

            </View>

            <TextInput
              style={[styles.input, { marginTop: 10, }]}
              placeholder='Item Name'
              placeholderTextColor="#52946B"
              onChangeText={(text) => updateItemData({ itemName: text })}
              value={itemData.itemName}
            />
            <TextInput
              style={[styles.inputdescription]}
              placeholder='Description'
              placeholderTextColor="#52946B"
              multiline={true}
              numberOfLines={3}
              onChangeText={(text) => updateItemData({ description: text })}
              value={itemData.description}
            />

            <TextInput
              style={[styles.input, { marginTop: 10, }]}
              placeholder='Size'
              placeholderTextColor="#52946B"
              onChangeText={(text) => updateItemData({ size: text })}
              value={itemData.size}
            />

            {/*
            <View style={{ zIndex: 1000, width: '90%', marginVertical: 10, position: 'relative', zIndex: 10, }}>
              <CategoryPicker
                category_id={category_id}
                setCategory_id={setCategory_id}
              />
            </View>

*/}

            <TextInput
              placeholder='Location'
              placeholderTextColor="#52946B"
              style={styles.input}
              onChangeText={(text) => updateItemData({ location: text })}
              value={itemData.location}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
}
