import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import SeccionEquipo from '../Components/SeccionEquipo';
import SeccionAlineacion from '../Components/SeccionAlineacion';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';

export default function Equipo() {
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
        {loading ? (
          <p>Cargando</p>
        ) : !team ? (
          <div>
            <p className="text-xl font-semibold text-gray-800 mb-4">¡Todavía no creaste tu equipo!</p>
            <Link to="/mi-equipo">
              <button className="bg-red-800 text-white px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition duration-300 ease-in-out transform hover:bg-blue-500 hover:scale-105">
                Crear mi equipo
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="md:my-auto flex flex-col gap-y-4 md:flex md:flex-row justify-center gap-x-4 mx-auto">
              <SeccionEquipo team={team} />
              <SeccionAlineacion roster={roster?.ronda1} />
            </div>
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}