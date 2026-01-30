import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, TextInput } from "react-native";
import { Button } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import styles from "../styles/RegisterStyles";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from "../services/config";
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";

export default function ShowMYCategoriesScreen() {
  const { params } = useRoute();
  const categoryNames = params?.categories ?? [];
  const navigation = useNavigation();
  const currentUser = auth.currentUser;
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [activeActionsFor, setActiveActionsFor] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const normalizeKey = (value) => (value ?? "").toString().trim().toLowerCase();

  const normalizeCategories = (list) => {
    const seen = new Set();
    const out = [];
    let hasEmpty = false;
    (list || []).forEach((cat) => {
      const key = normalizeKey(cat);
      if (!key) {
        hasEmpty = true;
        return;
      }
      if (!seen.has(key)) {
        seen.add(key);
        out.push(cat.trim());
      }
    });
    if (hasEmpty && !seen.has("")) {
      out.push("");
    }
    return out;
  };

  useEffect(() => {
    setCategories(normalizeCategories(categoryNames));
  }, [categoryNames]);

  const updateCategoryForUserItems = async (oldCategory, newCategoryOrNull) => {
    const userId = currentUser?.uid;
    if (!userId) {
      Alert.alert("Error", "No user signed in.");
      return;
    }
    if (oldCategory === null || oldCategory === undefined) return;
    const oldKey = normalizeKey(oldCategory);

    const itemsRef = ref(database, "items/");
    const q = query(itemsRef, orderByChild("owner_id"), equalTo(userId));
    const snapshot = await get(q);
    if (!snapshot.exists()) return;

    const updates = {};
    const items = snapshot.val();
    Object.entries(items).forEach(([id, item]) => {
      const nameKey = normalizeKey(item?.category_name);
      const legacyKey = normalizeKey(item?.category);
      if (nameKey === oldKey || legacyKey === oldKey) {
        updates[`items/${id}/category_name`] = newCategoryOrNull;
        updates[`items/${id}/category`] = newCategoryOrNull;
      }
    });

    if (Object.keys(updates).length === 0) return;
    await update(ref(database), updates);
  };

  const startEdit = (cat) => {
    setEditingCategory(cat);
    setEditValue(cat);
    setActiveActionsFor(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    const oldCategory = editingCategory;
    const newCategoryValue = (editValue ?? "").trim();
    if (oldCategory === null || oldCategory === undefined) return;
    if (!newCategoryValue) {
      Alert.alert("Error", "Category name cannot be empty.");
      return;
    }

    const oldKey = normalizeKey(oldCategory);
    const newKey = normalizeKey(newCategoryValue);
    if (oldKey === newKey) {
      setCategories((prev) =>
        normalizeCategories(prev.map((c) => (normalizeKey(c) === oldKey ? newCategoryValue : c)))
      );
      cancelEdit();
      return;
    }

    try {
      await updateCategoryForUserItems(oldCategory, newCategoryValue);
      setCategories((prev) =>
        normalizeCategories(prev.map((c) => (normalizeKey(c) === oldKey ? newCategoryValue : c)))
      );
      cancelEdit();
    } catch (e) {
      Alert.alert("Error", "Failed to update category.");
    }
  };

  const confirmDelete = (cat) => {
    Alert.alert(
      "Delete category",
      "This will remove the category from all your items.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCategory(cat),
        },
      ]
    );
  };

  const deleteCategory = async (cat) => {
    try {
      await updateCategoryForUserItems(cat, null);
      const key = normalizeKey(cat);
      setCategories((prev) => prev.filter((c) => normalizeKey(c) !== key));
      if (editingCategory && normalizeKey(editingCategory) === key) {
        cancelEdit();
      }
      if (activeActionsFor && normalizeKey(activeActionsFor) === key) {
        setActiveActionsFor(null);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to delete category.");
    }
  };

  const startAdd = () => {
    setAdding(true);
    setNewCategory("");
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewCategory("");
  };

  const saveAdd = () => {
    const value = (newCategory ?? "").trim();
    if (!value) {
      Alert.alert("Error", "Category name cannot be empty.");
      return;
    }
    setCategories((prev) => normalizeCategories([...prev, value]));
    cancelAdd();
  };

  return (
    <View style={styles.container}>
      <View style={{ padding: 5, gap: 8 }}>
        {adding ? (
          <View style={{ gap: 8 }}>
            <TextInput
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="New category"
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
            Add new category
          </Button>
        )}
      </View>

      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={categories}
        renderItem={({ item }) => (
          <View style={{ padding: 5 }}>
            {editingCategory !== null && normalizeKey(editingCategory) === normalizeKey(item) ? (
              <View style={{ gap: 8 }}>
                <TextInput
                  style={styles.input}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder="Category name"
                  placeholderTextColor="#52946B"
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button mode="contained" onPress={saveEdit} buttonColor="#EAF2EC" textColor="#52946B" style={{borderRadius:10}}>
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
                  onPress={() => navigation.navigate("CategoryScreen", { category: item })}
                  onLongPress={() => setActiveActionsFor(item)}
                >
                  <Text style={{ fontWeight: "bold" }}>{item === "" ? "(empty)" : item}</Text>
                </Button>
                {activeActionsFor !== null && normalizeKey(activeActionsFor) === normalizeKey(item) ? (
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
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={{ color: "#777" }}>No categories.</Text>}
      />
    </View>
  );
}
