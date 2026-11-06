/**
 * FLOWDAY Configuration File
 * 
 * Instructions:
 * 1. Firebase Config: Obtain from Firebase Console > Project Settings > General > Your Apps > Web App.
 *    - These are public identifiers safe for frontend use, secured via Firebase Auth & Firestore Security Rules.
 * 2. Google OAuth Client ID: Obtain from Google Cloud Console > APIs & Services > Credentials.
 *    - Configure Authorized JavaScript origins (e.g., http://localhost:5500 or your GitHub Pages URL).
 */
export const CONFIG = {
  firebase: {
    apiKey: "AIzaSyDzrzl4fIl5h6mpzk0nb7KffBPQZ8i5ue0", // Public Firebase Web API Key
    authDomain: "flowday-2981f.firebaseapp.com", // Firebase Auth Domain
    projectId: "flowday-2981f", // Firestore Project ID
    storageBucket: "flowday-2981f.firebasestorage.app", // Storage Bucket (Optional)
    messagingSenderId: "1076094116307", // Messaging Sender ID
    appId: "1:1076094116307:web:30373973a6686b02228f26", // Firebase App ID
    measurementId: "G-HL3580BXBJ",
  },
  google: {
    clientId: "3824158589-8qfsba50rjfeie98uh9e9eieg276rg6h.apps.googleusercontent.com", // Google OAuth 2.0 Client ID
    scopes: "https://www.googleapis.com/auth/calendar.readonly"
  },
  app: {
    defaultTimezone: "Asia/Kolkata"
  }
};
