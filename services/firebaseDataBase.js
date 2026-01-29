import { doc, setDoc } from 'firebase/firestore';
import { db } from './config';

// Save user data under collection 'users' with document id = uid
export async function saveUserData(uid, data) {
  if (!uid) throw new Error('Missing uid for saveUserData');
  const ref = doc(db, 'users', uid);
  await setDoc(ref, data, { merge: true });
}

export default { saveUserData };
