import { collection, addDoc } from "firebase/firestore";

export async function sendMessage(chatId, senderId, text) {
  const msgRef = collection(db, "messages", chatId, "msgs");

  await addDoc(msgRef, {
    senderId,
    text,
    createdAt: Date.now(),
    readBy: [senderId]
  });
}