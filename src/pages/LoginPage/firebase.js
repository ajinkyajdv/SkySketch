import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyByjzAlBJsfZh2bLiIbasKCuw_iEXfdLpE",
  authDomain: "skysketch.firebaseapp.com",
  projectId: "skysketch",
  storageBucket: "skysketch.firebasestorage.app",
  messagingSenderId: "596747438317",
  appId: "1:596747438317:web:96b7247d91f5eeabb2a4e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;