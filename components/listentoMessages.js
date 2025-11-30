import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/config";
// https://www.freecodecamp.org/news/building-a-real-time-chat-app-with-reactjs-and-firebase/

export function listenToMessages(chatId, callback) {
  const msgRef = collection(db, "messages", chatId, "msgs");
  const q = query(msgRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(msgs);
  });
}