import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className='gap-y-4 text-center juestify-center grid md:flex items-center md:justify-between p-10 bg-gray-900 text-gray-200 font-semibold'>
      <ul className='grid justify-center gap-y-1 md:flex gap-x-10 items-center'>
        <li className='hover:text-amber-400'><Link to="/">Inicio</Link></li>
        <li className='hover:text-amber-400'><Link to="/mi-equipo">Mi equipo</Link></li>
        <li className='hover:text-amber-400'><Link to="/mercado">Mercado</Link></li>
        <li className='hover:text-amber-400'><Link to="/posiciones">Posiciones</Link></li>
        <li className='hover:text-amber-400'><Link to="/reglas">Reglas</Link></li>
      </ul>
      <div className='justify-center grid md:flex gap-x-4'>
        {user && (
          <>
            <span>{user.displayName}</span>
            <button onClick={handleLogout} className='cursor-pointer hover:text-red-800'>Salir</button>
          </>
        )}
      </div>
    </nav>
  );
}