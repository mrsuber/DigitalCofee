/**
 * Digital Coffee - Firebase Service
 * Handles Firebase authentication using Web SDK for Expo compatibility
 */

import {initializeApp, getApps} from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {firebaseConfig} from '../config/firebase';

// Initialize Firebase
let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Initialize Auth with AsyncStorage persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

class FirebaseService {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{error?: string; user?: User}> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Send email verification
      await userCredential.user.reload(); // Ensure user object is fresh
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
      }

      // Get ID token
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('authToken', token);

      return {user: userCredential.user};
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {error: this.getErrorMessage(error.code)};
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{error?: string; user?: User}> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get ID token
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('authToken', token);

      return {user: userCredential.user};
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {error: this.getErrorMessage(error.code)};
    }
  }

  // Sign in with Google
  async signInWithGoogle(idToken: string): Promise<{error?: string; user?: User}> {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      // Get ID token
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem('authToken', token);

      return {user: userCredential.user};
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return {error: this.getErrorMessage(error.code)};
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get fresh ID token
  async getIdToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (user) {
      const token = await user.getIdToken(true);
      await AsyncStorage.setItem('authToken', token);
      return token;
    }
    return null;
  }

  // Password reset
  async resetPassword(email: string): Promise<{error?: string; success?: boolean}> {
    try {
      await sendPasswordResetEmail(auth, email);
      return {success: true};
    } catch (error: any) {
      return {error: this.getErrorMessage(error.code)};
    }
  }

  // Link email/password to existing account (for Google users)
  async linkEmailPassword(
    email: string,
    password: string,
  ): Promise<{error?: string; success?: boolean}> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        return {error: 'No user is currently signed in'};
      }

      // Create email credential
      const credential = EmailAuthProvider.credential(email, password);

      // Link credential to existing account
      await linkWithCredential(user, credential);

      // Send email verification
      await sendEmailVerification(user);

      return {success: true};
    } catch (error: any) {
      console.error('Link email/password error:', error);
      return {error: this.getErrorMessage(error.code)};
    }
  }

  // Get list of sign-in methods for current user
  getSignInMethods(): string[] {
    const user = this.getCurrentUser();
    if (!user) {
      return [];
    }

    // Get provider data from user object
    const providers = user.providerData.map(provider => provider.providerId);
    return providers;
  }

  // Check if user has email/password sign-in method
  hasPasswordAuth(): boolean {
    const methods = this.getSignInMethods();
    return methods.includes('password');
  }

  // Check if user has Google sign-in method
  hasGoogleAuth(): boolean {
    const methods = this.getSignInMethods();
    return methods.includes('google.com');
  }

  // Helper to get user-friendly error messages
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/invalid-credential':
        return 'Invalid credentials provided';
      case 'auth/provider-already-linked':
        return 'This account is already linked with this sign-in method';
      case 'auth/credential-already-in-use':
        return 'This email is already associated with another account';
      default:
        return 'An error occurred. Please try again';
    }
  }
}

export const firebaseService = new FirebaseService();
