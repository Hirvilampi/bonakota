import React from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function ShowImageScreen() {
      const route = useRoute();
      const { itemData, imageUri: routeImageUri } = route.params ?? {};
      const imageUri = routeImageUri || itemData?.uri || itemData?.downloadURL;

return (
    <View style={styles.container}>
        {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
            <Text style={styles.empty}>No image</Text>
        )}
    </View>
)

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    empty: {
        color: "#fff",
        textAlign: "center",
        marginTop: 20,
    },
});
