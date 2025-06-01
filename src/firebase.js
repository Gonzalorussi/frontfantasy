import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDRn8TASvDQU8Xiw42j8sN_Zd8XwHDnQlg",
    authDomain: "msifantasy.firebaseapp.com",
    projectId: "msifantasy",
    storageBucket: "msifantasy.firebasestorage.app",
    messagingSenderId: "992787803068",
    appId: "1:992787803068:web:9df1bf15d6de4e625e19b9",
    measurementId: "G-N3W1SF12FH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

