import React from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/RegisterStyles";
import {  useNavigation } from '@react-navigation/native';
import { useEffect, useState } from "react";
import ensureLocalImage from "../components/ensureLocalImage";

export default function YourMarketItemsScreen() {
    const { params } = useRoute();
    const items = params?.items ?? [];
    const [displayItems, setDisplayItems] = useState([]);
    const navigation = useNavigation();
    console.log(" // YOUR MARKET ITEMS //");
 //   console.log(items);

    useEffect(() => {
        let mounted = true;
        const hydrate = async () => {
            const enriched = await Promise.all(
                (items || []).map(async (item) => {
                    const localUri = await ensureLocalImage(item.downloadURL);
                    return { ...item, localUri };
                })
            );
            if (mounted) setDisplayItems(enriched);
        };
        hydrate();
        return () => { mounted = false; };
    }, [items]);

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
                data={displayItems}
                numColumns={2}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("ShowItemScreen", { item })}
                        style={styles.itemboxrow}
                    >
                        <View style={{padding: 5}}>
                            <Image source={{ uri: item.localUri || item.downloadURL || item.uri }} style={[styles.cameraimage, {width: "150", height: "150"}]} />
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
