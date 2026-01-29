import * as FileSystem from 'expo-file-system/legacy';

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export default async function ensureLocalImage(remoteUrl) {
  if (!remoteUrl || !remoteUrl.startsWith('http')) return null;
  const extMatch = remoteUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '.jpg';
  const filename = `${hashString(remoteUrl)}${ext}`;
  const target = `${FileSystem.cacheDirectory}${filename}`;
  try {
    const info = await FileSystem.getInfoAsync(target);
    if (info.exists) return target;
    const { uri } = await FileSystem.downloadAsync(remoteUrl, target);
    return uri;
  } catch (e) {
    console.log('ensureLocalImage failed', e);
    return null;
  }
}
