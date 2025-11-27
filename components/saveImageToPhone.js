import * as FileSystem from 'expo-file-system/legacy';

export default async function saveImageToPhone(url) {
  if (!url) return null;
  const filename = url.split('/').pop() || `image-${Date.now()}.jpg`;
  const target = `${FileSystem.cacheDirectory}${filename}`;
  const { uri } = await FileSystem.downloadAsync(url, target);
  return uri; // file://... local URI
}

 