import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../services/config";
// https://www.freecodecamp.org/news/building-a-real-time-chat-app-with-reactjs-and-firebase/

export async function openChat(userA, userB, itemId, itemName, userAName, userBName) {
    const chatsRef = collection(db, "chats");

    // check if there are previous chats between the two users
    const q = query(
        chatsRef,
        where("members", "in", [
            [userA, userB],
            [userB, userA]
        ]),
        where("itemId", "==", itemId)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return snapshot.docs[0].id;
    }

    // if not, create a new chat
    const chatDoc = await addDoc(chatsRef, {
        members: [userA, userB],
        itemId,
        itemName,
        memberNames: {
            [userA]: userAName ?? null,
            [userB]: userBName ?? null,
        },
        createdAt: Date.now()
    });

    return chatDoc.id;
}