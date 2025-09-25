
// FIX: The original modular imports from "firebase/app" were causing module resolution errors.
// Switched to the firebase/compat/app to ensure broader compatibility. This initializes
// the app using the v8-compatible API but allows us to get a v9 modular Firestore instance below.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";

// --- ATENÇÃO: AÇÃO NECESSÁRIA ---
// 1. Crie um projeto no Firebase: https://console.firebase.google.com/
// 2. Vá para "Configurações do projeto" > "Geral".
// 3. Em "Seus apps", crie um novo "App da Web" (ícone </>).
// 4. Copie o objeto `firebaseConfig` fornecido e cole-o aqui, substituindo o de exemplo.
// 5. Vá para "Firestore Database" no menu à esquerda, crie um banco de dados e, em "Regras", 
//    configure para permitir leitura/escrita (para testes, use `allow read, write: if true;`).
const firebaseConfig = {
  apiKey: "AIzaSyDDNIBRwvoP9TzfBUdEKQMgYiMLIUotoWU",
  authDomain: "flora-4b14c.firebaseapp.com",
  projectId: "flora-4b14c",
  storageBucket: "flora-4b14c.firebasestorage.app",
  messagingSenderId: "356514736805",
  appId: "1:356514736805:web:95c8230cc27d1b857a7b4c"
};


// Inicializa o Firebase usando a API de compatibilidade para evitar erros de importação modular.
const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();

// Obtém uma referência para o serviço do Firestore (instância modular v9).
const db = getFirestore(app);

export { db };
