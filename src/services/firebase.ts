// FIX: Use Firebase compat library to ensure proper initialization across different build environments.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getFirestore } from 'firebase/firestore';

// ATENÇÃO: Substitua este objeto pelas credenciais reais do seu projeto Firebase.
// Estas são credenciais de exemplo e não funcionarão em produção.
const firebaseConfig = {
  apiKey: "AIzaSyDDNIBRwvoP9TzfBUdEKQMgYiMLIUotoWU",
  authDomain: "flora-4b14c.firebaseapp.com",
  projectId: "flora-4b14c",
  storageBucket: "flora-4b14c.firebasestorage.app",
  messagingSenderId: "356514736805",
  appId: "1:356514736805:web:95c8230cc27d1b857a7b4c"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);

// Obtém uma referência ao serviço Firestore.
const db = getFirestore(app);

export { db };
