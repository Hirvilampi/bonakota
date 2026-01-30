// components/Loader.js
import React from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";

export default function Loader({ visible = true, mode = "overlay", label, size, color = "#52946B" }) {
  if (!visible) return null;
  const indicatorSize = size ?? (mode === "inline" ? "small" : "large");

  if (mode === "inline") {
    return (
      <View style={styles.inline}>
        <ActivityIndicator size={indicatorSize} color={color} />
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator size={indicatorSize} color={color} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  inline: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  label: {
    marginTop: 8,
    color: "#0D1A12",
    fontSize: 14,
  },
});
