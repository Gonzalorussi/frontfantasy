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
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#333', color: '#fff' }}>
      <div>
        <Link to="/" style={linkStyle}>Inicio</Link>
        <Link to="/mi-equipo" style={linkStyle}>Mi equipo</Link>
        <Link to="/mercado" style={linkStyle}>Mercado</Link>
        <Link to="/posiciones" style={linkStyle}>Posiciones</Link>
        <Link to="/reglas" style={linkStyle}>Reglas</Link>
      </div>
      <div>
        {user && (
          <>
            <span style={{ marginRight: '1rem' }}>{user.displayName}</span>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>Salir</button>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  marginRight: '1rem',
  textDecoration: 'none',
  color: '#fff'
};
