import React, {useState, useEffect} from "react";
import {  View, Text, TextInput, TouchableOpacity,  StyleSheet,  Alert,nput } from "react-native";
import { signInWithEmailAndPassword, signInAnonymously, getAuth } from "firebase/auth";
import { auth, app } from "../services/config";
import styles from "../styles/RegisterStyles";

// used https://www.youtube.com/watch?v=BsOik6ycGqk to get started

export default function LoginScreen ({navigation}) {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
const [email, setEmail] = useState("");
const [city, setCity] = useState("");
const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


    // testataan firebase yhteys - tää ilmaoittaa vaan, että ei yhteyttä
    useEffect(() => {
    const testFirebase = async () => {
      try {
        const auth = getAuth(app);
        await signInAnonymously(auth);
        console.log("✅ Firebase-yhteys toimii ja auth vastasi!");
      } catch (e) {
        console.error("❌ Firebase virhe:", e.message);
      }
    };
    testFirebase();
  }, []);


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
    </View>
  );

}