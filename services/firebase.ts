// FIX: Changed to a namespace import to solve module resolution errors.
import * as firebaseApp from "firebase/app";
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


// Inicializa o Firebase usando a sintaxe modular v9, evitando reinicializações.
// FIX: Use functions from the namespace import to fix the module resolution error.
const app = firebaseApp.getApps().length === 0 ? firebaseApp.initializeApp(firebaseConfig) : firebaseApp.getApp();

// Obtém uma referência para o serviço do Firestore.
const db = getFirestore(app);

export { db };
