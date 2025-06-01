import React from 'react';
import { auth } from '../firebase';
import { db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import img from '../assets/img/login_es.avif';
import Footer from '../Components/Footer';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Referencia al documento del usuario en Firestore
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Si no existe, lo guardamos
        await setDoc(userRef, {
          nombre: user.displayName,
          email: user.email,
          fechaCreacion: serverTimestamp(),
        });
        console.log('Usuario nuevo creado:', user.displayName);
      } else {
        console.log('Usuario ya existente:', user.displayName);
      }

      // Redirigimos al home
      navigate('/');
    } catch (error) {
      console.error('Error en login con Google:', error);
    }
  };

  return (
    <>
      <div
        style={{
          textAlign: 'center',
          marginTop: '100px',
          background: 'linear-gradient(to bottom, #e0e0e0, #c0c0c0)',
        }}
      >
        <p>TU</p>
        <h1>MSI 2025</h1>
        <p>COMIENZA AHORA</p>
        <button
          onClick={handleGoogleLogin}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Iniciar sesión con Google
        </button>
        <img src={img} alt="login" />
      </div>
      <Footer />
    </>
  );
}
