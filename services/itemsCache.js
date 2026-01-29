import AsyncStorage from "@react-native-async-storage/async-storage";

const itemsKey = (userId) => `@items_cache_${userId}`;
const tsKey = (userId) => `@items_cache_ts_${userId}`;
const refreshKey = (userId) => `@items_cache_refresh_${userId}`;

export function maxTimestamp(items) {
  let max = null;
  for (const item of items || []) {
    if (!item?.timestamp) continue;
    if (!max || item.timestamp > max) max = item.timestamp;
  }
  return max;
}

export async function loadItemsCache(userId) {
  if (!userId) return { items: [], lastSync: null };
  try {
    const raw = await AsyncStorage.getItem(itemsKey(userId));
    const ts = await AsyncStorage.getItem(tsKey(userId));
    return {
      items: raw ? JSON.parse(raw) : [],
      lastSync: ts || null,
    };
  } catch (e) {
    console.log("items cache load error", e);
    return { items: [], lastSync: null };
  }
}

export async function saveItemsCache(userId, items, lastSync) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(itemsKey(userId), JSON.stringify(items || []));
    if (lastSync) {
      await AsyncStorage.setItem(tsKey(userId), lastSync);
    }
  } catch (e) {
    console.log("items cache save error", e);
  }
}

export async function clearItemsCache(userId) {
  if (!userId) return;
  try {
    await AsyncStorage.removeItem(itemsKey(userId));
    await AsyncStorage.removeItem(tsKey(userId));
  } catch (e) {
    console.log("items cache clear error", e);
  }
}

export async function requestItemsRefresh(userId) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(refreshKey(userId), "1");
  } catch (e) {
    console.log("items refresh request error", e);
  }
}

export async function consumeItemsRefresh(userId) {
  if (!userId) return false;
  try {
    const flag = await AsyncStorage.getItem(refreshKey(userId));
    if (flag) {
      await AsyncStorage.removeItem(refreshKey(userId));
      return true;
    }
    return false;
  } catch (e) {
    console.log("items refresh consume error", e);
    return false;
  }
}
