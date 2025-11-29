import { onSnapshot, query, collection, where } from "firebase/firestore";
import { db } from "../services/config";

export function listenToUserChats(userId, cb) {
  if (!userId || !cb) return () => {};
  const q = query(collection(db, "chats"), where("members", "array-contains", userId));
  return onSnapshot(q, snap => {
    const chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    cb(chats);
  });
}
