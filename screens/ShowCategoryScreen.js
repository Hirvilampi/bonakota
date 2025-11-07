import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ShowCategoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚧 show category Under Construction 🚧</Text>
      <Text style={styles.subtitle}>
        This screen is currently being built.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFA",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#52946B",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#0D1A12",
    textAlign: "center",
  },
});