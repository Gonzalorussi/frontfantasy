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
            setRoster(rosterData[`ronda${rondasConfirmadas[0]}`]|| {});
          }else {
            setRoster({});
          }
        }
      }else {
        setRoster({});
      }
    }catch (err) {
      console.error(err);
      setRoster({});
    }finally {
      setLoading(false);
    }
  }

  fetchData();

}, [user, rondaActual]);


if (loading || rondaLoading) {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex justify-center items-center h-[70vh] bg-gray-800">
            <p className="text-gray-200 font-semibold text-4xl">Cargando...</p>
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
  <div className="bg-gray-900 min-h-screen flex flex-col">
    <Navbar user={user} />
    <main className='md:h-[70vh] flex flex-col flex-grow bg-gray-800'>
      {!team ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <p className="text-xl font-semibold text-gray-200 mb-4">
            ¡Todavía no creaste tu equipo!
          </p>
          <Link to="/mi-equipo">
            <button className="cursor-pointer bg-red-800 text-white px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition duration-300 ease-in-out transform hover:bg-red-500 hover:scale-105">
              Crear mi equipo
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-gray-900 text-center w-[340px] md:w-auto mx-auto px-4 rounded-sm flex justify-center mt-10 text-lg text-gray-200 font-semibold">
            {textoEstadoRonda}
          </div>
          <div className="my-4 md:my-auto flex flex-col gap-y-4 md:flex md:flex-row justify-center gap-x-4 mx-auto">
            <SeccionEquipo team={team} />
            <SeccionAlineacion roster={roster} size="large" />
          </div>
        </>
      )}
    </main>
    <Footer />
  </div>
);
}