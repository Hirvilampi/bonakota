// One-time migration: create per-user categories and backfill categoryId on items.
// Usage (in app, e.g. after login):
//   import { migrateUserCategories } from "../services/migrateCategories";
//   await migrateUserCategories(auth.currentUser.uid);

import { ref, get, update, push } from "firebase/database";
import { database } from "./config";

const normalizeKey = (value) => (value ?? "").toString().trim().toLowerCase();

export async function migrateUserCategories(userId) {
  if (!userId) throw new Error("migrateUserCategories: userId required");

  // 1) Load user items
  const itemsSnap = await get(ref(database, "items"));
  if (!itemsSnap.exists()) return { created: 0, updated: 0 };

  const items = itemsSnap.val();

  // 2) Build category name -> id map for this user
  const userCategoriesRef = ref(database, `users/${userId}/categories`);
  const categoriesSnap = await get(userCategoriesRef);
  const existingCategories = categoriesSnap.exists() ? categoriesSnap.val() : {};
  const nameToId = {};

  Object.entries(existingCategories).forEach(([id, cat]) => {
    const key = normalizeKey(cat?.name);
    if (key) nameToId[key] = id;
  });

  // 3) Collect unique category names from user's items
  const categoryNames = new Set();
  Object.entries(items).forEach(([id, item]) => {
    if (item?.owner_id !== userId) return;
    const name = item?.category_name ?? item?.category ?? "";
    const key = normalizeKey(name);
    if (key) categoryNames.add(name.toString().trim());
  });

  // 4) Create missing categories
  const updates = {};
  let created = 0;
  for (const name of categoryNames) {
    const key = normalizeKey(name);
    if (nameToId[key]) continue;
    const newRef = push(userCategoriesRef);
    updates[`users/${userId}/categories/${newRef.key}`] = {
      name,
      createdAt: new Date().toISOString(),
    };
    nameToId[key] = newRef.key;
    created += 1;
  }

  // 5) Backfill categoryId on items
  let updated = 0;
  Object.entries(items).forEach(([id, item]) => {
    if (item?.owner_id !== userId) return;
    if (item?.categoryId) return;
    const name = item?.category_name ?? item?.category ?? "";
    const key = normalizeKey(name);
    if (!key) return;
    const categoryId = nameToId[key];
    if (!categoryId) return;
    updates[`items/${id}/categoryId`] = categoryId;
    updated += 1;
  });

  if (Object.keys(updates).length > 0) {
    await update(ref(database), updates);
  }

  return { created, updated };
}
