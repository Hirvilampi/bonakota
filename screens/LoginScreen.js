import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword, signInAnonymously, signOut, deleteUser } from "firebase/auth";
import { auth, app } from "../services/config";
import styles from "../styles/RegisterStyles";
import { firstuser, scouttiuser } from "../services/myinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";


// used https://www.youtube.com/watch?v=BsOik6ycGqk to get started

export default function LoginScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Removes the back button
    });
  }, [navigation]);
  //   useEffect(() => {
  //   const auth = getAuth();
  //   signOut(auth).catch(() => {
  //     console.log("Sign-out failed or user already signed out.");
  //   });
  // }, []);


  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  // testataan firebase yhteys - luodaan anonyymi käyttäjä ja poistetaan se heti
  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Älä koske jos käyttäjä on jo kirjautunut sisään sähköpostilla tms.
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          console.log("✅ Firebase-yhteys ok (kirjautunut käyttäjä olemassa)");
          return;
        }
        // Kirjaudu anonyymisti vain testausta varten
        await signInAnonymously(auth);
        console.log("✅ Firebase-yhteys toimii ja auth vastasi!");
        // Poista juuri luotu anonyymi käyttäjä, jotta ei kerry tilejä
        if (auth.currentUser && auth.currentUser.isAnonymous) {
          await deleteUser(auth.currentUser);
        } else {
          // Varatoimi: jos ei ole anonyymi, kirjaudu ulos
          await signOut(auth);
        }
      } catch (e) {
        console.error("❌ Firebase virhe:", e.message);
      }
    };
    testFirebase();
  }, []);

  // testataan async-storagen yhteys
  useEffect(() => {
    const testStorage = async () => {
      try {
        await AsyncStorage.setItem("testKey", "works!");
        const val = await AsyncStorage.getItem("testKey");
        console.log("🔍 AsyncStorage toimii:", val);
      } catch (e) {
        console.error("🚨 AsyncStorage ei toimi:", e);
      }
    };
    testStorage();
  }, []);


  const setLoginTimo = () => {
    setEmail(firstuser.email);
    setPassword(firstuser.password);
  }

  const setLoginScoutti = () => {
    setEmail(scouttiuser.email);
    setPassword(scouttiuser.password);
  }


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {

      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", email);
      // siirry eteenpäin, esim. omaan päänäkymään:
      navigation.replace("MainTabs");
    } catch (error) {
      console.error(error);
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#52946B"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#52946B"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.loginregisterbutton, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[styles.loginregisterbutton, loading && { opacity: 0.7 }]}
        onPress={() => navigation.navigate("RegisterScreen")}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginregisterbutton, loading && { opacity: 0.7 }]}
        onPress={setLoginTimo}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "set Timo"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginregisterbutton, loading && { opacity: 0.7 }]}
        onPress={setLoginScoutti}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "set Scoutti"}
        </Text>
      </TouchableOpacity>
    </View>
  );

}
