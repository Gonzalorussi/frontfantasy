import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import useRondaActual from "../hooks/useRondaActual";
import {FaRegCalendarAlt, FaTrophy  } from "react-icons/fa"

export default function Home() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [topTeams, setTopTeams] = useState([]);
  const [posicion, setPosicion] = useState(null);
  const [puntosUltimaRonda, setPuntosUltimaRonda] = useState(0);
  const [puntosAcumulados, setPuntosAcumulados] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const {
    rondaActual,
    rondaAnterior,
    proximaRonda,
    loading: loadingRondas,
  } = useRondaActual();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const teamRef = doc(db, "equipos", user.uid);
        const teamSnap = await getDoc(teamRef);

        if (teamSnap.exists()) {
          const teamData = teamSnap.data();
          setTeam(teamData);

          // Puntaje acumulado:
          setPuntosAcumulados(teamData.totalpuntos || 0);

          // Puntaje de última ronda terminada:
          let numeroRondaParaPuntaje = null;

          if (rondaAnterior) {
            numeroRondaParaPuntaje = rondaAnterior.numero;
          } else if (!rondaActual && !rondaAnterior && proximaRonda === null) {
            const rondasSnapshot = await getDocs(collection(db, "rondas"));
            let maxNumero = 0;
            rondasSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.numero > maxNumero) maxNumero = data.numero;
            });
            numeroRondaParaPuntaje = maxNumero;
          }

          if (numeroRondaParaPuntaje !== null) {
            const puntos =
              teamData.puntajesronda?.[`ronda${numeroRondaParaPuntaje}`] || 0;
            setPuntosUltimaRonda(puntos);
          } else {
            setPuntosUltimaRonda(0);
          }

          // Obtener todos los equipos para ranking y posición
          const teamsSnapshot = await getDocs(collection(db, "equipos"));
          const teamsList = teamsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const ordenados = teamsList.sort(
            (a, b) => (b.totalpuntos || 0) - (a.totalpuntos || 0)
          );
          setTopTeams(ordenados.slice(0, 3));

          const posicionUsuario =
            ordenados.findIndex((team) => team.id === user.uid) + 1;
          setPosicion(posicionUsuario);
        } else {
          setTeam(null);
          setPuntosAcumulados(0);
          setPuntosUltimaRonda(0);
          setPosicion(null);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!loadingRondas) {
      cargarDatos();
    }
  }, [user, rondaActual, rondaAnterior, proximaRonda, loadingRondas]);

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex flex-col flex-1 py-6 bg-gray-800">
        <div className="max-w-[1200px] mx-auto w-full">
        <h1 className="text-center mb-6 font-semibold text-2xl">
          Bienvenido, {user?.displayName}
        </h1>

        {loading ? (
          <div className="h-[70vh] flex justify-center items-center">
            <p className="text-gray-200 font-semibold text-4xl">Cargando...</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-8 overflow-auto px-4">

            <div className="flex flex-col md:flex-row md:justify-between gap-6">
        <div className="bg-gray-700 w-full md:w-[340px] p-4 rounded-lg shadow-lg text-center">
          <p className="text-lg font-medium text-gray-400">TU POSICIÓN</p>
          <p className="text-2xl font-bold text-yellow-400">#{posicion ?? "-"}</p>
        </div>

        <div className="bg-gray-700 w-full md:w-[340px] p-4 rounded-lg shadow-lg text-center">
          <p className="text-lg font-medium text-gray-400">PUNTOS ÚLTIMA RONDA</p>
          <p className="text-2xl font-bold text-yellow-400">{puntosUltimaRonda.toFixed(2)}</p>
        </div>

        <div className="bg-gray-700 w-full md:w-[340px] p-4 rounded-lg shadow-lg text-center">
          <p className="text-lg font-medium text-gray-400">TOTAL PUNTOS</p>
          <p className="text-2xl font-bold text-yellow-400">{puntosAcumulados.toFixed(2)}</p>
        </div>
      </div>
            {/* Top 3 Fecha y Ranking */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="w-full md:w-1/2 rounded-xl bg-gray-700 p-6">
                <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold mb-4">
                  <FaRegCalendarAlt className="w-6 h-6 text-yellow-400" />
                  TOP 3 FECHA
                </h2>
                <hr className="border-t border-gray-600 mb-4" />
                <table className="w-full text-gray-200 border-collapse">
                  <thead>
                    <tr className="bg-gray-600">
                      <th className="px-6 py-3 border-b text-left text-lg font-medium">#</th>
                      <th className="px-6 py-3 border-b text-left text-lg font-medium">Equipo</th>
                      <th className="px-6 py-3 border-b text-left text-lg font-medium">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTeams.map((team, index) => (
                      <tr
                        key={team.id}
                        className="bg-gray-800 hover:bg-gray-700 transition duration-200"
                      >
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">{team.nombreequipo}</td>
                        <td className="px-6 py-4">{team.totalpuntos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="w-full md:w-1/2 rounded-xl bg-gray-700 p-6">
                <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold mb-4">
                  <FaTrophy className="w-6 h-6 text-yellow-400" />
                  TOP 3 RANKING
                </h2>
                <hr className="border-t border-gray-600 mb-4" />
                <table className="w-full text-gray-200 border-collapse">
                  <thead>
                    <tr className="bg-gray-600">
                      <th className="px-6 py-3 border-b text-left text-lg font-medium">#</th>
                      <th className="px-6 py-3 border-b text-left text-lg font-medium">Equipo</th>
                      <th className="px-6 py-3 border-b text-left text-lg font-medium">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTeams.map((team, index) => (
                      <tr
                        key={team.id}
                        className="bg-gray-800 hover:bg-gray-700 transition duration-200"
                      >
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">{team.nombreequipo}</td>
                        <td className="px-6 py-4">{team.totalpuntos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Roster */}
            <div className="w-full rounded-xl bg-gray-700 p-6">
              <h2 className="text-center text-2xl font-semibold mb-4">TOP ROSTER</h2>
              <hr className="border-t border-gray-600 mb-4" />
              {/* Aquí iría el contenido del TOP ROSTER */}
            </div>

            {/* Jugadores de la fecha y más elegido */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 rounded-xl bg-gray-700 p-6">
                <h2 className="text-center text-2xl font-semibold mb-4">JUGADOR DE LA FECHA</h2>
                <hr className="border-t border-gray-600 mb-4" />
                {/* Aquí contenido jugador de la fecha */}
              </div>
              <div className="w-full md:w-1/2 rounded-xl bg-gray-700 p-6">
                <h2 className="text-center text-2xl font-semibold mb-4">JUGADOR MAS ELEGIDO</h2>
                <hr className="border-t border-gray-600 mb-4" />
                {/* Aquí contenido jugador más elegido */}
              </div>
            </div>

            {/* Novedades */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-center text-2xl font-semibold mb-4">NOVEDADES</h2>
              <hr className="border-t border-gray-600 mb-4" />
              <div className="space-y-4">
                <div className="text-lg font-medium text-gray-400 flex items-center">
                  <span className="mr-2">⚠️</span> Actualización del ranking al finalizar cada ronda.
                </div>
                <div className="text-lg font-medium text-gray-400 flex items-center">
                  <span className="mr-2">🔔</span> Recordá que tenés que confirmar tu Roster antes del comienzo de cada ronda.
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
