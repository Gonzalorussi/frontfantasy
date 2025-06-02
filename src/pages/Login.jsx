import React from 'react';
import { auth } from '../firebase';
import { db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import img from '../assets/img/login_es.avif';
import Footer from '../Components/Footer';
import logo from '../assets/MSILOGO.png'
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
      <div className='flex flex-col items-center bg-gray-900'>
        <img className='mt-4 w-20 h-24' src={logo} alt="Logo MSI" />
        <p className='mt-4 text-gray-200 font-semibold text-xl'>TU</p>
        <h1 className='text-gray-200 font-semibold text-xl'>MSI 2025</h1>
        <p className='text-gray-200 font-semibold text-xl'>COMIENZA AHORA</p>
        <button
          onClick={handleGoogleLogin}
          className='my-4 cursor-pointer bg-red-800 hover:bg-red-900 p-2 rounded-lg font-semibold text-sm text-gray-200'
        >
          Iniciar sesión con Google
        </button>
        <img src={img} alt="login" />
      </div>
      <Footer />
    </>
  );
}
