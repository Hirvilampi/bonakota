import React, { useState } from "react";
import { Image, View, Alert, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Button } from "react-native-paper"
import * as ImagePicker from "expo-image-picker";
import { baseURL } from "../services/config";
import Loader from "../components/Loader";

// en sit saanut tätä toimimaan AddItemScreenin kanssa

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
    // console.log("IN PHOTOQUICK!!!! - in take photo");
    setLoading(true);
    try {
      // Kysy kameran käyttöoikeus (iOS/Android)
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Kameran käyttöoikeus tarvitaan.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
        exif: true,
      });

      // console.log("result",result.uri);
      // console.log("tuliko result, tuliko uri??");

      if (!result.canceled) {
        // If an image is selected (not cancelled), 
        // update the file state variable
        const newUri = result.assets[0].uri;
        setUri(newUri);
        onDone?.({
          newUri,
          fileName: asset.fileName ?? null,
          type: asset.type ?? null,
          exif: asset.exif ?? null
        });
      }
    } finally {
      setLoading(false);
    }

  };

  // Function to pick an image from the device's media library
  // https://www.geeksforgeeks.org/react-native/how-to-upload-and-preview-an-image-in-react-native/
  const pickImage = async () => {
    // console.log("IN PHOTOQUICK!!!! - in image picker");
    setLoading(true);
    try {
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
        // console.log("trying to open library image async");
        const result = await ImagePicker.launchImageLibraryAsync({
          // only images
          allowsEditing: true, // Allow basic editing like cropping
          aspect: [4, 3],// Aspect ratio for cropping
          quality: 0.7, // Image quality (1 = highest)
        });

        if (!result.canceled) {
          // update the file state variable
          // console.log("result",result);
          const newUri = result.assets[0].uri;
          // console.log("newUri",newUri)
          setUri(newUri);
          onDone?.({
            newUri,
            fileName: asset.fileName ?? null,
            type: asset.type ?? null,
            exif: asset.exif ?? null
          });
        } else {
          Alert.alert("no result");
        }
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={{ padding: padding }}>
      <Loader visible={loading} mode="overlay" label="Opening image picker..." />
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
