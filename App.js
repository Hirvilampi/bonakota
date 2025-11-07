import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from '@expo/vector-icons/Ionicons';
import Foundation from '@expo/vector-icons/Foundation';
import Octicons from '@expo/vector-icons/Octicons';
import MyItemsScreen from "./screens/MyItemsScreen";
import AddItemScreen from "./screens/AddItemScreen";
import MarketScreen from "./screens/MarketScreen";
import GroupsScreen from "./screens/GroupsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ShowItem from "./screens/ShowItem";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { PaperProvider } from "react-native-paper";
// import { SQLiteProvider } from './services/sqlite';
import { auth } from "./services/config";
import { onAuthStateChanged } from 'firebase/auth';
import styles from "./styles/RegisterStyles";
import ShowCategoryScreen from './screens/ShowCategoryScreen';
import LocationScreen from './screens/LocationScreen';

// for authorization used info from https://www.youtube.com/watch?v=a0KJ7l5sNGw&t=29s


export default function App() {

  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  /*
  const onAuthStateChangedHandler = (u) => {
    setUser(u);
    if (initializing) {
      setInitializing(false);
    }
  };


//  useEffect(() => {
//    const unsubscribe = onAuthStateChanged(auth, onAuthStateChangedHandler);
//    return unsubscribe;
//  }, []);

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  */

  function Tabs() {
    return (
      <Tab.Navigator theme={DefaultTheme}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            switch (route.name) {
              case 'MyItemsScreen':
                return <Foundation name="home" size={size} color={color} />;

              case 'Add Item':
                return <Octicons name="diff-added" size={size} color={color} />;

              case 'Market':
                return <Ionicons name="storefront-outline" size={size} color={color} />;

              case 'Groups':
                return <Ionicons name="people" size={size} color={color} />;

              case 'Profile':
                return <Ionicons name="person" size={size} color={color} />;

              default:
                return null;
            }
          },

          sceneContainerStyle: { backgroundColor: "#F8FBFA" },
          headerStyle: {
            backgroundColor: "#F8FBFA",
            elevation: 0,  // Android-varjo
            shadowOpacity: 0, // iOS-varjo
            borderBottomWidth: 0,
            shadowColor: "#52946B",
          },
          headerTintColor: "#0D1A12",

          tabBarStyle: {
            backgroundColor: "#F8FBFA",
            height: 80,
            paddingBottom: 10,
            paddignTop: 10,
          },
          tabBarItemStyle: {
            paddingVertical: 15,
          },
          tabBarLabelStyle: {
            marginBottom: 10,
          },
          tabBarActiveTintColor: "#0D1A12",
          tabBarInactiveTintColor: "#52946B",
        })}
      >
        <Tab.Screen name="MyItemsScreen" component={MyItemsScreen} />
        <Tab.Screen name="Add Item" component={AddItemScreen} />
        <Tab.Screen name="Market" component={MarketScreen} />
        <Tab.Screen name="Groups" component={GroupsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />

      </Tab.Navigator>
    );
  }



  return (
    //  <SQLiteProvider>
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen
                name="Back"
                component={Tabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ShowItem"
                component={ShowItem}
                options={{
                  title: 'Edit item',        // haluamasi otsikko
                  headerBackTitleVisible: false,
                  // jos haluat ilman yläreunan headeria:
                  // headerShown: false,
                  // tai modaalina iOS-tyyliin:
                  // presentation: 'modal',
                }} />
                              <Stack.Screen
                name="ShowItem"
                component={LocationScreen}
                options={{
                  title: 'Locations',        // haluamasi otsikko
                  headerBackTitleVisible: false,
                  // jos haluat ilman yläreunan headeria:
                  // headerShown: false,
                  // tai modaalina iOS-tyyliin:
                  // presentation: 'modal',
                }} />
              <Stack.Screen
                name="ShowItem"
                component={ShowCategoryScreen}
                options={{
                  title: 'ShowItem',        // haluamasi otsikko
                  headerBackTitleVisible: false,
                  // jos haluat ilman yläreunan headeria:
                  // headerShown: false,
                  // tai modaalina iOS-tyyliin:
                  // presentation: 'modal',
                }} />


            </>
          ) : (
            <>
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
               <Stack.Screen
                name="MainTabs"
                component={Tabs}
                options={{ headerShown: false }}
              />
            </>
          )}


        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
    // </SQLiteProvider>

  );
}



