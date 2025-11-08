import React from 'react';
import { IconButton } from 'react-native-paper';
import { getAuth, signOut } from 'firebase/auth';

export default function LogOutButton() {
    const auth = getAuth();

    const onPress = async() =>{
    signOut(auth)
        .then(() => {
            console.log("user signed out");
        })
        .catch((error) => {
            console.error("Error signing out", error);
        });
    };

    return <IconButton icon="logout" onPress={onPress} />;
}