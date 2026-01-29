import AsyncStorage from "@react-native-async-storage/async-storage";

const cacheKey = (userId) => `@items_image_cache_${userId}`;

export async function loadImageCache(userId) {
  if (!userId) return {};
  try {
    const raw = await AsyncStorage.getItem(cacheKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.log("image cache load error", e);
    return {};
  }
}

export async function saveImageCache(userId, cache) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(cache || {}));
  } catch (e) {
    console.log("image cache save error", e);
  }
}
