import { signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  async login(email: string, password: string) {
    if (!auth) {
      throw new Error('Firebase auth not initialized. Please configure Firebase credentials.');
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('adminToken', token);
      return { user: userCredential.user, token };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async logout() {
    if (!auth) {
      localStorage.removeItem('adminToken');
      return;
    }
    try {
      await signOut(auth);
      localStorage.removeItem('adminToken');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  getCurrentUser(): FirebaseUser | null {
    if (!auth) return null;
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (!auth) return () => {};
    return auth.onAuthStateChanged(callback);
  }
}

export const authService = new AuthService();
