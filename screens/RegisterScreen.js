import { ScrollView, Image, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useState } from 'react';
import { signup } from "../services/auth"
import styles from '../styles/RegisterStyles';
import { useNavigation } from '@react-navigation/native';
import { saveUserData } from "../services/firebaseDataBase";
import Loader from "../components/Loader";
import { auth } from '../services/config';



export default function RegisterScreen() {
    const [email, setEmail] = useState("lampinen.timo@gmail.com");
    const [password, setPassword] = useState("testi123");
    const [username, setUsername] = useState("timolampinen");
    const [loading, setLoading] = useState(false);
    const [firstname, setFirstname] = useState("Timo");
    const [lastname, setLastname] = useState("Lampinen");

    const navigation = useNavigation();


    const handleSignUp = async () => {
        setLoading(true);
        try {
            const user = await signup(email, password);
            if (user) {
                const id = user.id;
                await saveUserData(id, {
                    username: username,
                    firstname: firstname,
                    lastname: lastname,
                    email: email
                });
                //            navigation.navigate("Profile");
            }
        } catch (error) {
            setLoading(false);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('The email address is already in use by another account.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('The email address is not valid.');
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('The password is too weak. Please choose a stronger password.');
            } else {
                Alert.alert('Error during sign up', error.message);
            }
        }
    }

    const handleLogin = () => {
        navigation.navigate("Login");
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.inputView}>
                <Image source={require('../assets/bonakota_logo.png')} style={styles.logo} />

                <Text>Register</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstname}
                    onChangeText={setFirstname}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastname}
                    onChangeText={setLastname}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {loading ? (<Loader />) : (<TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>)}
                <TouchableOpacity onPress={handleLogin}>
                    <Text style={styles.linkText}>Already have an account? Log In</Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
};

