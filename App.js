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
import { PaperProvider } from "react-native-paper";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./services/Config";
import { app } from "./services/Config";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export default function App() {

  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const auth = getAuth(app);
  const [initializing, setInitializing] = React.useState(true);
  const [user, setUser] = React.useState(null);

  // Handle user state changes
  const onAuthStateChangedHandler = (user) => {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChangedHandler);

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  function Tabs() {
    <Tab.Navigator theme={MyTheme}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'Home':
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Item" component={AddItemScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  }



  return (
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
            </>

          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}


        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>

  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    color: '0D1A12',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
