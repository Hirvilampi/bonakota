import React from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function LogOutButton() {
    const auth = getAuth();
    const navigation = useNavigation();

    const onPress = async () => {
        signOut(auth)
            .then(() => {
                console.log("user signed out");
                navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'LoginScreen' }] }));
            })
            .catch((error) => {
                console.error("Error signing out", error);
            });
    };

    return (
        <View
            style={{
                width: 44,
                height: 44,
                alignItems: "center",
                borderColor: "blue",
                // backgroundColor: "#F8FBFA",
                color: "#F8FBFA",
                borderwidth: 0,
            }}
        >
            <IconButton
                icon="logout"
                onPress={onPress}
                style={{ alignItems: "center", }}
                contentStyle={{ alignItems: "center", justifyContent: "flex-start", borderwidth: 0,  }}
            />
        </View>
    );
}
