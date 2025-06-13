import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import SeccionEquipo from '../Components/SeccionEquipo';
import SeccionAlineacion from '../Components/SeccionAlineacion';
import { useNavigate, Link } from 'react-router-dom';
import useRondaActual from '../hooks/useRondaActual';

export default function Equipo() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { rondaActual, rondaAnterior, proximaRonda, loading: rondaLoading } = useRondaActual();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, currentUser => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
      setTeam(null);
      setRoster(null);
      navigate('/login');
    }
  });
  return () => unsubscribe();
}, [navigate]);

  useEffect(() => {
  if (!user) return;

  async function fetchData() {
    try {
      const teamRef = doc(db, 'equipos', user.uid);
      const teamSnap = await getDoc(teamRef);
      if (teamSnap.exists()) setTeam(teamSnap.data());

      const rosterRef = doc(db, 'rosters', user.uid);
      const rosterSnap = await getDoc(rosterRef);
      if (rosterSnap.exists()) {
        const rosterData = rosterSnap.data();

        if (rondaActual) {
          const rosterRondaActual = rosterData[`ronda${rondaActual.numero}`];
          setRoster(rosterRondaActual || null);
          }else {
          const rondasConfirmadas = Object.keys(rosterData)
            .filter(key => key.startsWith('ronda'))
            .map(key => parseInt(key.replace('ronda', ''), 10))
            .sort((a, b) => b - a);

          if (rondasConfirmadas.length > 0) {
            setRoster(rosterData[`ronda${rondasConfirmadas[0]}`]);
          }else {
            setRoster(null);
          }
        }
      }else {
        setRoster(null);
      }
    }catch (err) {
      console.error(err);
      setRoster(null);
    }finally {
      setLoading(false);
    }
  }

  fetchData();

}, [user, rondaActual]);


  if (loading || rondaLoading) {
    return (
      <div>
        <Navbar user={user} />
        <main className="flex justify-center items-center h-[70vh] bg-gray-200">
          <p className="text-xl font-semibold text-gray-700">Cargando datos...</p>
        </main>
        <Footer />
      </div>
    );
  }

  let textoEstadoRonda = '';
  if (rondaActual) {
    textoEstadoRonda = `Ronda actual: ${rondaActual.numero} en progreso`;
    console.log(textoEstadoRonda)
  } else if (rondaAnterior) {
    const fechaFormateada = rondaAnterior.Fechafin
      .setLocale('es')
      .toFormat("dd 'de' LLLL 'de' yyyy - HH:mm");
    textoEstadoRonda = `Última ronda finalizada: Ronda ${rondaAnterior.numero} el día ${fechaFormateada}`;
    console.log(rondaAnterior)
    console.log(textoEstadoRonda)
  } else if (proximaRonda) {
    textoEstadoRonda = `Temporada aún no comenzó. Tu roster inicial será para la Ronda ${proximaRonda.numero}`;
    console.log(textoEstadoRonda)
  } else {
    textoEstadoRonda = 'No hay rondas disponibles actualmente';
    console.log(textoEstadoRonda)
  }

  return (
    <div>
      <Navbar user={user} />
      <main className='md:h-[70vh] flex flex-col bg-gray-200'>
        { !team ? (
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
            <div className="text-center my-4 text-lg text-gray-800 font-semibold">
              {textoEstadoRonda}
            </div>
            <div className="md:my-auto flex flex-col gap-y-4 md:flex md:flex-row justify-center gap-x-4 mx-auto">
              <SeccionEquipo team={team} />
              {roster ? (
                <SeccionAlineacion roster={roster} />
              ) : (
                <div className="text-center text-gray-500 p-4">
                  No tenés alineación confirmada para esta ronda.
                </div>
              )}
            </div>
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}