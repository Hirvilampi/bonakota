import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/config";

export function listenToMessages(chatId, callback) {
  const msgRef = collection(db, "messages", chatId, "msgs");
  const q = query(msgRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(msgs);
  });
}