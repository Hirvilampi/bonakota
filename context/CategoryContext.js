import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { database } from "../services/config";
import { ref, get } from "firebase/database";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = "@categories_cache";
  const TIMESTAMP_KEY = "@categories_timestamp";

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 1. Yritä hakea AsyncStoragesta (offline)
        const localData = await AsyncStorage.getItem(STORAGE_KEY);
        const localTimestamp = await AsyncStorage.getItem(TIMESTAMP_KEY);

        if (localData) {
          setCategories(JSON.parse(localData));
        }

        // 2. Hae Firebase timestampista
        const tsSnap = await get(ref(database, "categories_timestamp"));
        const serverTimestamp = tsSnap.exists() ? tsSnap.val() : 0;

        // Jos ei ole server timestampia → hae silti data
        const mustRefresh =
          !localTimestamp || Number(localTimestamp) < Number(serverTimestamp);

        if (mustRefresh || !localData) {
          console.log("Refreshing categories from Firebase…");

          // 3. Hae Firebase data
          const catSnap = await get(ref(database, "categories"));
          if (catSnap.exists()) {
            const serverData = catSnap.val();

            // 4. Tallenna AsyncStorageen
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
            await AsyncStorage.setItem(
              TIMESTAMP_KEY,
              serverTimestamp.toString()
            );
            setCategories(serverData);
          }
        }

      } catch (err) {
        console.log("Category load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
