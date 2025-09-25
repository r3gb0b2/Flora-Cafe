// FIX: The original named import for 'firebase/app' was causing errors where members like
// 'initializeApp' were not found. Changed to a wildcard import to resolve potential
// module resolution issues.
import * as firebase from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- ATENÇÃO ---
// Substitua o objeto de configuração abaixo pelas credenciais do SEU projeto Firebase.
// Você pode encontrá-las no Console do Firebase em:
// Configurações do projeto > Geral > Seus apps > App da Web > Configuração e instalação do SDK
const firebaseConfig = {
  apiKey: "AIzaSyDsi6VpfhLQW8UWgAp5c4TRV7vqOkDyauU",
  authDomain: "stingressos-e0a5f.firebaseapp.com",
  projectId: "stingressos-e0a5f",
  storageBucket: "stingressos-e0a5f.firebasestorage.app",
  messagingSenderId: "424186734009",
  appId: "1:424186734009:web:c4f601ce043761cd784268",
  measurementId: "G-M30E0D9TP2"
};


// Inicializa o Firebase, evitando reinicializações
// FIX: Updated function calls to use the 'firebase' namespace from the wildcard import.
const app = !firebase.getApps().length ? firebase.initializeApp(firebaseConfig) : firebase.getApp();

// Inicializa o Cloud Firestore e obtém uma referência para o serviço
const db = getFirestore(app);

export { db };
