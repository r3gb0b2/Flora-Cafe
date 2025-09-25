// Fix: Use Firebase v8 namespaced imports instead of v9 modular imports.
import firebase from "firebase/app";
import "firebase/firestore";

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

// Inicializa o Firebase
// Fix: Use v8 namespaced `initializeApp` and check for existing apps to avoid re-initialization errors.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Inicializa o Cloud Firestore e obtém uma referência para o serviço
// Fix: Use v8 namespaced `firestore()` method.
const db = firebase.firestore();

export { db };
