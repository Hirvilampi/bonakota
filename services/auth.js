import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config';

// signup wrapper: returns an object with id property (to match existing callers)
export async function signup(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  return { id: user.uid, raw: user };
}

export default { signup };
