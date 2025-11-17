import React from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Image, TextInput, Pressable, Alert, Platform } from "react-native";
import { Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import styles from '../styles/RegisterStyles';
import { useItemData } from "../config/ItemDataState";
// Import Firebase Authentication if you're getting the user ID from there
import { getDatabase, ref, push } from "firebase/database";
import { ref as storageRef, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";
import { app, storage, database, db, auth, } from "../services/config";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";



export default function AddItem() {
  const insets = useSafeAreaInsets();
  const [uploading, setUploading] = useState(false);
  const [user_id, setUser_id] = useState(null);

  // Get the Authentication instance
  //  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { itemData, updateItemData, clearItemData } = useItemData(currentUser?.uid ?? null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.uid) {
        setUser_id(user.uid);
      } else {
        setUser_id(null);
        console.log("No user signed in.");
      }
    });
    return unsub;
  }, []);


  // async function fileUriToBase64(uri) {
  //   const response = await fetch(uri);
  //   const blob = await response.blob();

  //   return await new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => resolve(reader.result.split(',')[1]);  // ilman "data:*"
  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob);
  //   });
  // }

  // const getBase64 = async (imageUri) => {
  //   const manipResult = await manipulateAsync(
  //     imageUri,
  //     [],
  //     {
  //       compress: 0.2,
  //       format: SaveFormat.PNG,
  //       base64: true,
  //     }
  //   );
  //   return manipResult.base64;
  // };

  // upload image to firebase storage
  // async function uploadImageAsync(uri) {
  //   if (!uri) { return null };
  //   setUploading(true);

  //   try {
  //     const response = await fetch(uri);
  //     const blob = await response.blob();

  //     const filename = `${user_id}/${Date.now()}.jpg`;
  //     const imgRef = storageRef(storage, filename);
  //     console.log("Trying to upload blob to:", filename);

  //     await uploadBytes(imgRef, blob);
  //     console.log("ohi uploadBytesin. !!! HUHHUHH VIHDOIN !!!!")
  //     if (blob.close()) {
  //       blob.close();
  //     }

  //     console.log("Awaiting download url");
  //     const downloadURL = await getDownloadURL(imgRef);
  //     console.log("Pic loaded to storage image URL:", downloadURL);
  //     return downloadURL;
  //   } catch (error) {
  //     Alert.alert("ei saatana onnistu", error);
  //     return null;
  //   } finally {
  //     setUploading(false);
  //   }


  //   //     try {
  //   //       // get Base64 formatted string
  //   //       const base64 = await getBase64(uri);

  //   //       const filename = `${user_id}/${Date.now()}.jpg`;
  //   //       const imgRef = storageRef(storage, filename);
  //   //       console.log("Trying upload base64 to:", {filename});

  //   //       await uploadString(imgRef, base64, 'base64', {contentType: "image/png",}).then((snapshot) => {
  //   //         console.log('Uploaded a base64 string!');
  //   //       });

  //   //       // Odota lataustehtävän valmistumista
  //   //  //     await uploadTask; // Tämä odottaa, että koko latausprosessi on valmis (tai epäonnistuu)

  //   //       console.log("awaiting downloadurl");
  //   //       const downloadURL = await getDownloadURL(imgRef);
  //   //       console.log("Picture loaded to storage image URL:", downloadURL);
  //   //       return downloadURL;
  //   //     } catch (error) {
  //   //       console.error("Firebase Storage virhe tapahtui");
  //   //       // console.error("Virhekoodi (error.code):", error.code);     // Esim. 'storage/unauthorized'
  //   //       // console.error("Virheviesti (error.message):", error.message); // Esim. 'User does not have permission...'
  //   //       // console.error("Virhetyyppi (error.name):", error.name);   // Yleensä 'FirebaseStorageError'
  //   //       console.error("Koko virheobjekti:", error);                 // Tulostaa kaikki tiedot, mukaan lukien stack tracen
  //   //       Alert.alert("Problem loading picture to firebase storage", error.message);
  //   //       return null;
  //   //     } finally {
  //   //       setUploading(false);
  //   //     }
  // }
async function uploadAsBase64(uri) {
  console.log("uploadAsBase64");
  console.log("userId:",user_id);
  try {
    const compressed = await manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: SaveFormat.JPEG, base64: true }
    );
    console.log("uploadAsBase64 2");
    if (!compressed?.base64) throw new Error("No base64 from manipulator");

    const filename = `${user_id ?? "missing-user"}/${Date.now()}.jpg`;
    const imgRef = storageRef(storage, filename);

    console.log("uploadAsBase64 3", filename);
    await uploadString(imgRef, compressed.base64, "base64", {
      contentType: "image/jpeg",
    });
    console.log("uploadAsBase64 4");
    return await getDownloadURL(imgRef);
  } catch (err) {
    console.log("uploadAsBase64 error", err);
    throw err;
  }
}
async function uploadImage(uri) {
  console.log("uploadImage");
  setUploading(true);
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `${user_id ?? "missing-user"}/${Date.now()}.jpg`;
    const imgRef = storageRef(storage, filename);

    console.log("uploadImage uploading", filename);
    await uploadBytes(imgRef, blob);
    const url = await getDownloadURL(imgRef);
    console.log("uploadImage done");
    return url;
  } catch (err) {
    console.log("uploadImage error", err);
    console.log("uploadImage error details", {
      code: err?.code,
      message: err?.message,
      customData: err?.customData,
      serverResponse: err?.serverResponse,
      uri,
    });
    Alert.alert("Image upload failed", err?.message ?? "Unknown error");
    return null;
  } finally {
    setUploading(false);
  }
}
  const getTimeStamp = () => {
    const now = new Date();
    console.log('newtimestamp', now.toISOString().split('.')[0]);
    return now.toISOString().split('.')[0];
  }


  // save to firebase
  const handleSave = async () => {
    console.log("tallennusfunktio");
    if (!user_id) {
      console.log("No user_id, aborting save");
      return;
    };
    console.log("tallennusfunktio 2");
    let dloadURL = null;
    if (itemData.uri) {
      console.log("tallennusfunktio 3");
      dloadURL = await uploadImage(itemData.uri);
      console.log("tallennusfunktio 4");
    }
    //  updateItemData({ downloadURL: dloadURL, timestamp: getTimeStamp() });
    console.log("Tallennusyritys");
    const assedID = itemData.assedId;
    const finalData = {
      ...itemData,
      downloadURL: dloadURL,
      timestamp: getTimeStamp(),
    };

    if (finalData.itemName) {
      console.log("meillä on itemData.itemName");
      push(ref(database, 'items/'), finalData)
        .then((newRef) => {
          // Tähän koodiin tullaan, jos kirjoitus palvelimelle onnistui
          console.log("Tiedot tallennettu onnistuneesti!");
          //          console.log("Uusi avain (push ID):", newRef.key);
          //          console.log("Tallenneetu data:", itemData);
          clearItemData();
          // Voit tehdä tässä muita toimintoja, esim. näyttää käyttäjälle onnistumisviestin
          Alert.alert('Tallennus onnistui!', `Item ${itemData.itemName} tallennettu.`);
        })
        .catch((error) => {
          // Tähän koodiin tullaan, jos kirjoitus palvelimelle epäonnistui
          //       console.error("Tietojen tallennus epäonnistui:", error);
          // Voit näyttää käyttäjälle virheilmoituksen
          Alert.alert('Virhe!', `Tallennus epäonnistui: ${error.message}`);
        });
    } else { Alert.alert('To save, item has to have name'); }
  }



  const pickImage = async (pick) => {
    console.log("IN PICK IMAGE");
    let result;
    if (pick === "library") {
      console.log("LIBRARY SELECTION");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        // If permission is denied, show an alert
        Alert.alert("Permission Denied", "Sorry, we need library permission to upload images.");
      } else {
        // Launch the image library and getthe selected image
        console.log("trying to open library image async");
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true, // Allow basic editing like cropping
          aspect: [4, 3],// Aspect ratio for cropping
          quality: 0.7, // Image quality (1 = highest)
        });
        // if (!result.canceled) {
        //   // update the file state variable
        //   console.log("result", result);
        //   const newUri = result.assets[0].uri;
        //   console.log("newUri", newUri)
        //   updateItemData({ uri: newUri });
        // } else {
        //   Alert.alert("no result");
        // }
      }
    } else {
      console.log("CAMERA MODE");
      // Kysy kameran käyttöoikeus 
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Kameran käyttöoikeus tarvitaan.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
        exif: true,
      });

    }
    if (!result.canceled) {
      // update the file state variable
      console.log("result", result);
      const newUri = result.assets[0].uri;
      console.log("newUri", newUri)
      updateItemData({ uri: newUri });
    } else {
      Alert.alert("no result");
    }
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
                <Image source={{ uri: itemData.uri }} style={styles.cameraimage} />
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
              <Button loading={uploading} mode="contained" style={[styles.camerabutton, { borderRadius: 5, margin: 10 }]} onPress={() => pickImage("library")}>
                {itemData.uri ? (
                  <Text style={styles.camerabuttontext}>Change Image</Text>
                ) : (
                  <Text style={styles.camerabuttontext}>Add Image</Text>
                )}
              </Button>

              {/* Another button - take photo or take new photo */}
              <Button loading={uploading} mode="contained" style={[styles.camerabutton, { borderRadius: 5, margin: 10 }]} onPress={() => pickImage("photo")}>
                {itemData.uri ? (
                  <Text style={styles.camerabuttontext}>Change photo</Text>
                ) : (
                  <Text style={styles.camerabuttontext}>Take photo</Text>
                )}
              </Button>

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


            <View style={{ zIndex: 1000, width: '90%', marginVertical: 10, position: 'relative', zIndex: 10, }}>
              <Text>Category valinta tähän</Text>
            </View>



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
