// firebaseConfig.ts
/* HMR-safe Firebase + RN persistence setup
   - Uses runtime require to avoid TS error: "Module 'firebase/auth' has no exported member 'getReactNativePersistence'"
   - Stores singletons on globalThis so hot reloads won't redeclare variables
*/

declare const require: any; // allow runtime require in TS

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Auth, getAuth, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGi7YdyyYC5TRDHegSUnJSYTUFUtAxy2M",
  authDomain: "link-up-ffe0e.firebaseapp.com",
  projectId: "link-up-ffe0e",
  storageBucket: "link-up-ffe0e.appspot.com",
  messagingSenderId: "696033053467",
  appId: "1:696033053467:web:f4f3c55ca5eb3b6a43a1be",
};

type FirebaseBundle = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

declare global {
  var __FIREBASE_BUNDLE__: FirebaseBundle | undefined;
}

if (!globalThis.__FIREBASE_BUNDLE__) {
  // init app (or reuse existing)
  const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

  // Try to get getReactNativePersistence at runtime to avoid TS export issues.
  let getReactNativePersistence: ((storage: any) => any) | undefined = undefined;
  try {
    // runtime require avoids the "has no exported member" TS error
    const authPkg = require("firebase/auth");
    // function may be present at runtime; guard defensively
    if (authPkg && typeof authPkg.getReactNativePersistence === "function") {
      getReactNativePersistence = authPkg.getReactNativePersistence;
    }
  } catch (e) {
    // ignore - we'll gracefully fallback to getAuth()
  }

  // Initialize Auth: prefer initializeAuth + RN persistence when available
  let auth: Auth;
  if (typeof getReactNativePersistence === "function") {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (e) {
      // initializeAuth may throw if auth already exists for this app
      auth = getAuth(app);
    }
  } else {
    // Fallback: either the runtime function wasn't found or something went wrong
    auth = getAuth(app);
  }

  const db = getFirestore(app);

  globalThis.__FIREBASE_BUNDLE__ = { app, auth, db };
}

export const FIREBASE_APP = globalThis.__FIREBASE_BUNDLE__!.app;
export const FIREBASE_AUTH = globalThis.__FIREBASE_BUNDLE__!.auth;
export const FIREBASE_DB = globalThis.__FIREBASE_BUNDLE__!.db;
