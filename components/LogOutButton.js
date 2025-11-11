import React from 'react';
import { IconButton } from 'react-native-paper';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from 'expo-router';

export default function LogOutButton() {
    const auth = getAuth();
    const navigation = useNavigation();

    const onPress = async() =>{
    signOut(auth)
        .then(() => {
            console.log("user signed out");
            navigation.navigate("LoginScreen");
        })
        .catch((error) => {
            console.error("Error signing out", error);
        });
    };

    return <IconButton icon="logout" onPress={onPress} />;
}
