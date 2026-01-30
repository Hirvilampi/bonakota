import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, TextInput } from "react-native";
import { Button } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/RegisterStyles";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from "../services/config";
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";

export default function ShowMyLocationsScreen() {
  const { params } = useRoute();
  const locationNames = params?.locations ?? [];
  const navigation = useNavigation();
  const currentUser = auth.currentUser;
  const [locations, setLocations] = useState([]);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [activeActionsFor, setActiveActionsFor] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newLocation, setNewLocation] = useState("");

  const normalizeKey = (value) => (value ?? "").toString().trim().toLowerCase();

  const normalizeLocations = (list) => {
    const seen = new Set();
    const out = [];
    (list || []).forEach((loc) => {
      const key = normalizeKey(loc);
      if (!key) return;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(loc.trim());
      }
    });
    return out;
  };

  useEffect(() => {
    setLocations(normalizeLocations(locationNames));
  }, [locationNames]);

  const updateLocationForUserItems = async (oldLocation, newLocationOrNull) => {
    const userId = currentUser?.uid;
    if (!userId) {
      Alert.alert("Error", "No user signed in.");
      return;
    }
    const oldKey = normalizeKey(oldLocation);
    if (!oldKey) return;

    const itemsRef = ref(database, "items/");
    const q = query(itemsRef, orderByChild("owner_id"), equalTo(userId));
    const snapshot = await get(q);
    if (!snapshot.exists()) return;

    const updates = {};
    const items = snapshot.val();
    Object.entries(items).forEach(([id, item]) => {
      const itemKey = normalizeKey(item?.location);
      if (itemKey === oldKey) {
        updates[`items/${id}/location`] = newLocationOrNull;
      }
    });

    if (Object.keys(updates).length === 0) return;
    await update(ref(database), updates);
  };

  const startEdit = (loc) => {
    setEditingLocation(loc);
    setEditValue(loc);
    setActiveActionsFor(null);
  };

  const cancelEdit = () => {
    setEditingLocation(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    const oldLocation = editingLocation;
    const newLocation = (editValue ?? "").trim();
    if (!oldLocation) return;
    if (!newLocation) {
      Alert.alert("Error", "Location name cannot be empty.");
      return;
    }

    const oldKey = normalizeKey(oldLocation);
    const newKey = normalizeKey(newLocation);
    if (oldKey === newKey) {
      setLocations((prev) =>
        normalizeLocations(prev.map((l) => (normalizeKey(l) === oldKey ? newLocation : l)))
      );
      cancelEdit();
      return;
    }

    try {
      await updateLocationForUserItems(oldLocation, newLocation);
      setLocations((prev) =>
        normalizeLocations(prev.map((l) => (normalizeKey(l) === oldKey ? newLocation : l)))
      );
      cancelEdit();
    } catch (e) {
      Alert.alert("Error", "Failed to update location.");
    }
  };

  const confirmDelete = (loc) => {
    Alert.alert(
      "Delete location",
      "This will remove the location from all your items.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteLocation(loc),
        },
      ]
    );
  };

  const deleteLocation = async (loc) => {
    try {
      await updateLocationForUserItems(loc, null);
      const key = normalizeKey(loc);
      setLocations((prev) => prev.filter((l) => normalizeKey(l) !== key));
      if (editingLocation && normalizeKey(editingLocation) === key) {
        cancelEdit();
      }
      if (activeActionsFor && normalizeKey(activeActionsFor) === key) {
        setActiveActionsFor(null);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to delete location.");
    }
  };

  const startAdd = () => {
    setAdding(true);
    setNewLocation("");
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewLocation("");
  };

  const saveAdd = () => {
    const value = (newLocation ?? "").trim();
    if (!value) {
      Alert.alert("Error", "Location name cannot be empty.");
      return;
    }
    setLocations((prev) => normalizeLocations([...prev, value]));
    cancelAdd();
  };

  return (
    <View style={styles.container}>
      <View style={{ padding: 5, gap: 8 }}>
        {adding ? (
          <View style={{ gap: 8 }}>
            <TextInput
              style={styles.input}
              value={newLocation}
              onChangeText={setNewLocation}
              placeholder="New location"
              placeholderTextColor="#52946B"
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button mode="contained" onPress={saveAdd} buttonColor="#EAF2EC" textColor="#52946B" style={{borderRadius:10}}>
                Add
              </Button>
              <Button mode="text" onPress={cancelAdd} textColor="#52946B">
                Cancel
              </Button>
            </View>
          </View>
        ) : (
          <Button mode="contained" onPress={startAdd} buttonColor="#EAF2EC" textColor="#52946B" style={styles.addNewLocButton}>
            Add new location
          </Button>
        )}
      </View>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={locations}
        renderItem={({ item }) => (
          <View style={{ padding: 5 }}>
            {editingLocation && normalizeKey(editingLocation) === normalizeKey(item) ? (
              <View style={{ gap: 8 }}>
                <TextInput
                  style={styles.input}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder="Location name"
                  placeholderTextColor="#52946B"
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button mode="contained" onPress={saveEdit} buttonColor="#EAF2EC" textColor="#52946B" style={{borderRadius:10}} >
                    Save
                  </Button>
                  <Button mode="text" onPress={cancelEdit} textColor="#52946B">
                    Cancel
                  </Button>
                </View>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <Button
                  mode="text"
                  buttonColor="#EAF2EC"
                  textColor="#52946B"
                  style={styles.categoryButton}
                  contentStyle={styles.categoryContentWide}
                  labelStyle={styles.categoryLabel}
                  onPress={() => navigation.navigate("LocationScreen", { location: item })}
                  onLongPress={() => setActiveActionsFor(item)}
                >
                  <Text style={{ fontWeight: "bold" }}>{item}</Text>
                </Button>
                {activeActionsFor && normalizeKey(activeActionsFor) === normalizeKey(item) ? (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Button mode="text" onPress={() => startEdit(item)} textColor="#52946B">
                      Edit
                    </Button>
                    <Button mode="text" onPress={() => confirmDelete(item)} textColor="#C0392B">
                      Delete
                    </Button>
                    <Button mode="text" onPress={() => setActiveActionsFor(null)} textColor="#52946B">
                      Cancel
                    </Button>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        )}
        contentContainerStyle={[styles.gridContainer, { paddingBottom: 100 }]}
        ListEmptyComponent={<Text style={{ color: "#777" }}>No items yet.</Text>}
      />
    </View>
  );
}
