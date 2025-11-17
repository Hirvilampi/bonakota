// screens/FirestoreTest.js
import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { db } from "../services/config";       // <-- your config.js path
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

export default function FirestoreTest() {
  const [output, setOutput] = useState("Running Firestore test...");

  const testFirestore = async () => {
    try {
      setOutput("Writing document...");

      // 1. Write a simple doc
      const docRef = await addDoc(collection(db, "testCollection"), {
        message: "Hello from Firestore!",
        createdAt: Date.now(),
      });

      console.log("Document ID:", docRef.id);

      // 2. Read them back
      setOutput("Reading documents...");
      const snapshot = await getDocs(collection(db, "testCollection"));

      let result = "Documents:\n";
      snapshot.forEach((doc) => {
        result += `${doc.id}: ${JSON.stringify(doc.data())}\n`;
      });

      setOutput(result);
    } catch (err) {
      console.error("FIRESTORE ERROR:", err);
      setOutput("Error: " + err.message);
    }
  };

  useEffect(() => {
    testFirestore();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Firestore Test
      </Text>

      <Text selectable style={{ fontFamily: "Courier" }}>
        {output}
      </Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Run Again" onPress={testFirestore} />
      </View>
    </View>
  );
}