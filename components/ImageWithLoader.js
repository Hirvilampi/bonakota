import React, { useState } from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";

export default function ImageWithLoader({ source, style, loaderColor = "#52946B", loaderSize = "small" }) {
  const [loading, setLoading] = useState(false);
  const uri = source?.uri;

  if (!uri) {
    return <View style={[styles.container, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[StyleSheet.absoluteFillObject, style]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
        resizeMode="cover"
      />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size={loaderSize} color={loaderColor} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#EAF2EC",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
