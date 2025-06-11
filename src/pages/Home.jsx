import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import { calcularPuntajeEquipo } from '../utils/puntajes';

export default function Home() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topTeams, setTopTeams] = useState([]);
  const [puntosRondaActual, setPuntosRondaActual] = useState(0);  // Para los puntos de la ronda actual
  const [puntosAcumulados, setPuntosAcumulados] = useState(0);    // Para los puntos acumulados
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Obtener datos del equipo
          const teamRef = doc(db, "equipos", currentUser.uid);
          const teamSnap = await getDoc(teamRef);
          if (teamSnap.exists()) {
            setTeam(teamSnap.data());
          }

          // Obtener datos del roster
          const rosterRef = doc(db, "rosters", currentUser.uid);
          const rosterSnap = await getDoc(rosterRef);
          if (rosterSnap.exists()) {
            setRoster(rosterSnap.data());

            // Calcular puntos de la ronda actual
            const puntosDeRonda = calcularPuntosRonda(rosterSnap.data().jugadores);
            setPuntosRondaActual(puntosDeRonda);
          }

          // Traer los equipos y calcular los puntajes
          const teamsSnapshot = await getDocs(collection(db, "equipos"));
          const teamsList = [];

          // Obtener puntaje de cada equipo
          for (const teamDoc of teamsSnapshot.docs) {
            const teamData = teamDoc.data();
            let puntaje = 0;

            try {
              puntaje = await calcularPuntajeEquipo(teamDoc.id);
            } catch (error) {
              console.error("Error al calcular puntaje", error);
            }

            // Agregar equipo con puntaje calculado
            teamsList.push({ ...teamData, id: teamDoc.id, puntaje });
          }

          // Ordenar por puntaje descendente y tomar los primeros 3
          teamsList.sort((a, b) => b.puntaje - a.puntaje);
          setTopTeams(teamsList.slice(0, 3));

        } catch (err) {
          console.error("Error al cargar datos:", err);
        }
        setLoading(false);
      } else {
        setUser(null);
        setTeam(null);
        setRoster(null);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Función para calcular los puntos de la ronda
  const calcularPuntosRonda = (jugadores, rondaActual) => {
    // Sumar los puntos de cada jugador para la ronda actual
    return jugadores.reduce((total, jugador) => {
      // Acceder al puntaje de la ronda específica dentro del campo 'puntajeronda'
      const puntajeRonda = jugador.puntajeronda[rondaActual] || 0; // Si no tiene puntaje, asumimos que es 0
      return total + puntajeRonda;
    }, 0);
  };

  // Acumular los puntos
  const confirmarRoster = () => {
    setPuntosAcumulados(prev => prev + puntosRondaActual);  // Acumular puntos de la ronda actual
    // No resetear los puntos de la ronda actual si ya se confirmó antes
  };

  return (
    <div>
      <Navbar user={user} />
      <main className="flex flex-col bg-gray-200">
        <h1 className="text-center my-4 font-semibold text-2xl text-gray-900">
          Bienvenido, {user?.displayName}
        </h1>

        {loading ? (
          <div className="h-[70vh] flex justify-center items-center">
            <p className="text-gray-900 font-semibold text-4xl">Cargando...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto px-4">
            {/* Tabla de Top 3 */}
            <div className="rounded-xl bg-gray-800 p-6 mb-6">
              <h2 className="text-center text-2xl font-semibold text-gray-200 mb-4">
                TOP 3
              </h2>
              <hr className="border-t border-gray-600 mb-4" />
              <table className="w-full text-gray-200 border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-6 py-3 border-b text-left text-lg font-medium">#</th>
                    <th className="px-6 py-3 border-b text-left text-lg font-medium">Equipo</th>
                    <th className="px-6 py-3 border-b text-left text-lg font-medium">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {topTeams.map((team, index) => (
                    <tr key={team.id} className="bg-gray-900 hover:bg-gray-700">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">{team.nombreequipo}</td>
                      <td className="px-6 py-4">{team.puntaje}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Novedades */}
            <div className="my-6">
              <h2 className="text-center text-2xl font-semibold text-gray-900 mb-4">
                NOVEDADES
              </h2>
              <div className="p-6 bg-gray-400 rounded-lg shadow-lg">
                <ul className="space-y-3">
                  <li className="text-lg font-medium text-gray-700 flex items-center">
                    <span className="mr-2">📅</span> Actualización semanal en el sistema de ranking.
                  </li>
                  <li className="text-lg font-medium text-gray-700 flex items-center">
                    <span className="mr-2">🔔</span> Recordá que tenés que confirmar tu Roster antes del comienzo de cada ronda.
                  </li>
                </ul>
              </div>
            </div>

            {/* Estadísticas */}
            <p className="mt-4 text-center font-semibold text-2xl">ESTADÍSTICAS</p>
            <div className="flex justify-between gap-x-4 my-4">
              <div className="bg-gray-400 w-full p-4 rounded-lg shadow-lg text-center">
                <p className="text-lg font-medium text-gray-700">TU POSICIÓN</p>
                <p className="text-2xl font-bold text-blue-600">#1</p> {/* Aquí puedes poner el número real */}
              </div>

              <div className="flex justify-between gap-x-4 my-4">
                <div className="bg-gray-400 w-full p-4 rounded-lg shadow-lg text-center">
                  <p className="text-lg font-medium text-gray-700">TOTAL RONDA</p>
                  <p className="text-2xl font-bold text-green-600">{puntosRondaActual}</p>  {/* Puntos de la ronda actual */}
                </div>

                <div className="bg-gray-400 w-full p-4 rounded-lg shadow-lg text-center">
                  <p className="text-lg font-medium text-gray-700">TOTAL PUNTOS</p>
                  <p className="text-2xl font-bold text-green-600">{puntosAcumulados}</p>  {/* Puntos acumulados */}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
