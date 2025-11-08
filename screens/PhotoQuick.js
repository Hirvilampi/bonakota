import React, { useState } from "react";
import { Image, View, Alert, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Button } from "react-native-paper"
import * as ImagePicker from "expo-image-picker";
import { baseURL } from "../services/config";

export default function PhotoQuick({ 
  onDone, 
  label = "Take Photo", 
  border = 5, padding = 5, 
  margin = 10, }) {

  const [uri, setUri] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);



  // function to launch the camera
  const takePhoto = async () => {
    setLoading(true);
    // Kysy kameran käyttöoikeus (iOS/Android)
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Kameran käyttöoikeus tarvitaan.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled) {
      // If an image is selected (not cancelled), 
      // update the file state variable
      const newUri = result.assets[0].uri;
      let nameofitem = hasname;
      let hascategory;
    }

  };

  // Function to pick an image from 
  //the device's media library
  // https://www.geeksforgeeks.org/react-native/how-to-upload-and-preview-an-image-in-react-native/
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // If permission is denied, show an alert
      Alert.alert(
        "Permission Denied",
        `Sorry, we need camera 
                 roll permission to upload images.`
      );
    } else {
      // Launch the image library and get
      // the selected image
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) {
        // update the file state variable
        const newUri = result.assets[0].uri;
        let nameofitem = hasname;
        let hascategory;
      }
    }
  };



  return (
    <View style={{ padding: padding }}>
      {label === "Take Photo" ? (
        <Button loading={uploading} mode="contained" style={[styles.camerabutton, { borderRadius: border, margin: margin }]} onPress={takePhoto}>
          <Text style={styles.camerabuttontext}>{label}</Text>
        </Button>
      ) : (
        <Button loading={uploading} mode="contained" style={[styles.camerabutton, { borderRadius: border, margin: margin }]} onPress={pickImage}>
          <Text style={styles.camerabuttontext}>{label}</Text>
        </Button>
      )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  camerabutton: {
    backgroundColor: '#EAF2EC',
    color: '#0D1A12',
    fontWeight: 'bold',
  },
  camerabuttontext: {
    backgroundColor: '#EAF2EC',
    color: '#0D1A12',
    fontWeight: 'bold',
    padding: 10,
    margin: 0,

  },


});