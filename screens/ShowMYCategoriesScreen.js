import React from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { Button } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/RegisterStyles";
import { useNavigation } from '@react-navigation/native';


export default function ShowMYCategoriesScreen() {
    const { params } = useRoute();
    const categories = params.categories ?? [];
    const navigation = useNavigation();
    console.log(" // SHOW CATEGORIES //");
    console.log(categories);

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
                keyExtractor={(item, index) => index.toString()}
                data={categories}
                numColumns={1}
                renderItem={({ item }) => (
                    <View style={[styles.itembox,{width: "100%", margin: 5,}]}>
                        <Button
                            mode="text"
                            buttonColor="#EAF2EC"
                            textColor="#52946B"
                            style={styles.categoryButton}
                            contentStyle={styles.categoryContentWide}
                            labelStyle={styles.categoryLabel}
                            onPress={() =>
                                navigation.navigate("ShowCategory", { category: item })
                            }
                        >
                            <Text>{item}</Text>
                        </Button>
                    </View>
                )}
                contentContainerStyle={ { paddingBottom: 100 }}
                ListEmptyComponent={<Text style={{ color: "#777" }}>No categories.</Text>}
            />

        </View>
    );
}


