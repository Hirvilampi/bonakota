import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/config";
// https://www.freecodecamp.org/news/building-a-real-time-chat-app-with-reactjs-and-firebase/

export async function fetchUserChats(userId) {
  const q = query(collection(db, "chats"), where("members", "array-contains", userId));
  const snap = await getDocs(q);
  
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
