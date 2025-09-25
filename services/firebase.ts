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
  apiKey: "YOUR_API_KEY", // SUBSTITUA com sua chave
  authDomain: "your-project-id.firebaseapp.com", // SUBSTITUA com seu domínio
  projectId: "your-project-id", // SUBSTITUA com seu ID de projeto
  storageBucket: "your-project-id.appspot.com", // SUBSTITUA com seu bucket
  messagingSenderId: "your-sender-id", // SUBSTITUA com seu ID de remetente
  appId: "your-app-id", // SUBSTITUA com seu ID de aplicativo
};


// Inicializa o Firebase usando a sintaxe modular v9, evitando reinicializações.
// FIX: Use functions from the namespace import to fix the module resolution error.
const app = firebaseApp.getApps().length === 0 ? firebaseApp.initializeApp(firebaseConfig) : firebaseApp.getApp();

// Obtém uma referência para o serviço do Firestore.
const db = getFirestore(app);

export { db };
