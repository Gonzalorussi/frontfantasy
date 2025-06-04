import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import SeccionEquipo from '../Components/SeccionEquipo';
import SeccionAlineacion from '../Components/SeccionAlineacion';
import SeccionNoticias from '../Components/SeccionNoticias';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const teamRef = doc(db, 'equipos', currentUser.uid);
          const teamSnap = await getDoc(teamRef);
          console.log(teamSnap);
          if (teamSnap.exists()) {
            console.log(teamSnap.data);
            setTeam(teamSnap.data());
          }

          const rosterRef = doc(db, 'rosters', currentUser.uid);
          const rosterSnap = await getDoc(rosterRef);
          if (rosterSnap.exists()) {
            console.log("Roster encontrado:", rosterSnap.data());
            setRoster(rosterSnap.data());
          }
        } catch (err) {
          console.error('Error al cargar datos:', err);
        }
        setLoading(false);
      } else {
        setUser(null);
        setTeam(null);
        setRoster(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div>
      <Navbar user={user} />
      <main className='md:h-[70vh] flex flex-col bg-gray-200'>
        <h1 className='text-center my-4 font-semibold text-xl text-gray-900'>Bienvenido, {user?.displayName}</h1>

        {loading? (
          <p>Cargando</p>
        ) : !team ? (
          <div>
            <p>¡Todavía no creaste tu equipo!</p>
            <Link to="/mi-equipo">
              <button>Crear mi equipo</button>
            </Link>
          </div>
        ) : (
          <>
          <div className='flex flex-col gap-y-4 md:flex md:flex-row justify-between gap-x-4 mx-4'>
            <SeccionEquipo team={team} />
            <SeccionAlineacion roster={roster} />
          </div>
          </>
        )}
        
      </main>
      <Footer />
    </div>
  );
}

