import { auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";

export function initAuth(onUserAuthenticated, onUserSignedOut) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onUserAuthenticated(user);
    } else {
      onUserSignedOut();
    }
  });
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Signout error:", error);
    throw error;
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}