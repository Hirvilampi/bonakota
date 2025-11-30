import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/config";
// https://www.freecodecamp.org/news/building-a-real-time-chat-app-with-reactjs-and-firebase/

export async function sendMessage(chatId, senderId, text) {
  const msgRef = collection(db, "messages", chatId, "msgs");

  await addDoc(msgRef, {
    senderId,
    text,
    createdAt: Date.now(),
    readBy: [senderId]
  });
}