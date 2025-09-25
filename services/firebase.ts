// Fix: Updated Firebase imports to use scoped packages to resolve module resolution errors.
import { initializeApp, getApps, getApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';

// --- ATENÇÃO: AÇÃO NECESSÁRIA ---
// 1. Crie um projeto no Firebase: https://console.firebase.google.com/
// 2. Vá para "Configurações do projeto" > "Geral".
// 3. Em "Seus apps", crie um novo "App da Web" (ícone </>).
// 4. Copie o objeto `firebaseConfig` fornecido e cole-o aqui, substituindo o de exemplo.
// 5. Vá para "Firestore Database" no menu à esquerda, crie um banco de dados e, em "Regras", 
//    configure para permitir leitura/escrita (para testes, use `allow read, write: if true;`).
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializa o Firebase de forma segura, evitando reinicialização.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Obtém uma referência para o serviço do Firestore.
const db = getFirestore(app);

export { db };