import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/config";

export async function getFirstName(userId) {
    if (!userId) return null;
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? snap.data().firstname ?? null : null;
}