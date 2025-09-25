// FIX: Use Firebase compat library to resolve module import errors.
// The modular API was failing to import `initializeApp`, `getApps`, and `getApp`.
// Using the compat layer for initialization works around this while the rest of the app can use the modular API.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDNIBRwvoP9TzfBUdEKQMgYiMLIUotoWU",
  authDomain: "flora-4b14c.firebaseapp.com",
  projectId: "flora-4b14c",
  storageBucket: "flora-4b14c.firebasestorage.app",
  messagingSenderId: "356514736805",
  appId: "1:356514736805:web:95c8230cc27d1b857a7b4c"
};

// Inicializa o Firebase, prevenindo reinicialização em ambientes de desenvolvimento
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

const db = getFirestore(app);

export { db };
