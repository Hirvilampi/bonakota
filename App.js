import React, { useEffect, useState } from 'react';
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
import ShowItemScreen from "./screens/ShowItemScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { PaperProvider } from "react-native-paper";
// import { SQLiteProvider } from './services/sqlite';
import CategoryScreen from './screens/CategoryScreen';
import LocationScreen from './screens/LocationScreen';
import LogOutButton from "./components/LogOutButton";
import ShowMyItemsScreen from "./screens/ShowMyItemsScreen";
import FirestoreTest from './screens/FirestoreTest';
import MarketItemScreen from './screens/MarketItemScreen';
import ChatScreen from './screens/ChatScreen';
import { CategoryProvider } from './context/CategoryContext';
import ShowMYCategoriesScreen from './screens/ShowMYCategoriesScreen';
import ShowMyLocationsScreen from './screens/ShowMyLocationsScreen';
import YourMarketItemsScreen from './screens/YourMarketItemsScreen';
import AllChatsScreen from './screens/AllChatsScreen';

// for authorization used info from https://www.youtube.com/watch?v=a0KJ7l5sNGw&t=29s


export default function App() {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  function Tabs() {
    return (
      <Tab.Navigator theme={DefaultTheme}
        screenOptions={({ route }) => ({
          headerRight: () => <LogOutButton />,
          tabBarIcon: ({ focused, color, size }) => {
            switch (route.name) {
              case 'My Items':
                return <Foundation name="home" size={size} color={color} />;
              case 'Add Item':
                return <Octicons name="diff-added" size={size} color={color} />;
              case 'Market':
                return <Ionicons name="storefront-outline" size={size} color={color} />;
              case 'Chats':
                return <Ionicons name="chatbubbles-outline" size={size} color={color} />;
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
            paddingBottom: 30,
            paddingTop: 10,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
          },
          tabBarLabelStyle: {
            marginBottom: 10,
          },
          tabBarActiveTintColor: "#0D1A12",
          tabBarInactiveTintColor: "#52946B",
        })}
      >
        <Tab.Screen name="My Items" component={MyItemsScreen} />
        <Tab.Screen name="Add Item" component={AddItemScreen} />
        <Tab.Screen name="Market" component={MarketScreen} />
        <Tab.Screen name="Chats" component={AllChatsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />

      </Tab.Navigator>
    );
  }

  return (
    <CategoryProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={user ? "Back" : "LoginScreen"}
            screenOptions={{ headerRight: () => <LogOutButton /> }}
          >
            {/* Always-register detail screens so they can be navigated to from nested navigators */}
            <Stack.Screen
              name="ShowItemScreen"
              component={ShowItemScreen}
              options={{
                title: 'Edit item',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="ShowLocation"
              component={LocationScreen}
              options={{
                title: 'Items in Location',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="ShowCategory"
              component={CategoryScreen}
              options={{
                title: 'Categories',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="ShowMyItemsScreen"
              component={ShowMyItemsScreen}
              options={{
                title: 'My Items',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="MarketItemScreen"
              component={MarketItemScreen}
              options={{
                title: 'See item on market',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="ShowMyCategories"
              component={ShowMYCategoriesScreen}
              options={{
                title: 'My Categories',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="ShowMyLocations"
              component={ShowMyLocationsScreen}
              options={{
                title: 'My Locations',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="ChatScreen"
              component={ChatScreen}
              options={{
                title: 'Chat screen',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="YourMarketItems"
              component={YourMarketItemsScreen}
              options={{
                title: 'Your Items On Market',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen name="FirestoreTest" component={FirestoreTest} />
            {user ? (
              <>
                <Stack.Screen
                  name="Back"
                  component={Tabs}
                  options={{ headerShown: false }}
                />
              </>
            ) : (
              <>
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                <Stack.Screen name="MainTabs" component={Tabs} options={{ headerShown: false }} />
              </>
            )}

          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </CategoryProvider>
  );
}

