import React from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/RegisterStyles";
import {  useNavigation } from '@react-navigation/native';

export default function ShowMyItemsScreen() {
    const { params } = useRoute();
    const items = params?.items ?? [];
        const navigation = useNavigation();
    console.log(" // MY ITEMS //");
 //   console.log(items);

  return (
        <View style={styles.container}>
            {/* 🔍 Search 
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor="#52946B"
                    onChangeText={setLookingfor}
                    value={lookingfor}
                /> */}
            {/* Jos ei haeta → näytetään lohkot */}

            <FlatList
                keyExtractor={(item) => item.id.toString()}
                data={items}
                numColumns={2}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("ShowItemScreen", { item })}
                        style={styles.itemboxrow}
                    >
                        <View style={{padding: 5}}>
                            <Image source={{ uri: item.uri }} style={[styles.cameraimage, {width: "150", height: "150"}]} />
                            <Text style={styles.itemTitle}>{item.itemName}</Text>
                            <Text style={styles.itemCategory}>{item.description}</Text>
                        </View>
                    </Pressable>
                )}
                contentContainerStyle={[styles.gridContainer, { paddingBottom: 100 }]}
                ListEmptyComponent={<Text style={{ color: "#777" }}>No items yet.</Text>}
            />

        </View>
  );
}

