# FLOWDAY — Google Calendar Execution Dashboard

FLOWDAY is a high-performance, minimalist personal execution dashboard that connects directly to Google Calendar and tracks whether you actually complete your scheduled events.

## Features
- **Secure Google Authentication**: Firebase Auth + Google Identity Services with minimum scopes (`calendar.readonly`).
- **Differential Sync**: Preserves manual completion statuses while pulling updates from Google Calendar.
- **Automatic Missed Event Detection**: Calculates missed events based on end times and local timezones.
- **Offline-First Persistence**: Powered by Cloud Firestore with strict user security rules.
- **iOS-Inspired UI**: Smooth dark/light themes, GPU-accelerated animations, and responsive layouts.

---

## Setup & Configuration Guide

### 1. Firebase Project Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and follow the prompts.
3. In your Firebase project settings, add a **Web App** and copy the configuration snippet.

### 2. Enable Authentication
1. In the Firebase Console, navigate to **Authentication** > **Sign-in method**.
2. Enable **Google** as a sign-in provider and configure your support email.

### 3. Enable Cloud Firestore
1. Navigate to **Firestore Database** and click **Create database**.
2. Start in **Production mode** (or test mode, then apply security rules).
3. Deploy the provided `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
