import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/config";

export async function sendMessage(chatId, senderId, text) {
  const msgRef = collection(db, "messages", chatId, "msgs");

  await addDoc(msgRef, {
    senderId,
    text,
    createdAt: Date.now(),
    readBy: [senderId]
  });
}