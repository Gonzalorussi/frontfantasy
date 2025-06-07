import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { calcularPuntajeEquipo } from "../utils/puntajes";  // Importamos la función
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topTeams, setTopTeams] = useState([]);
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

  return (
    <div>
      <Navbar user={user} />
      <main className="md:h-[70vh] flex flex-col bg-gray-200">
        <h1 className="text-center my-4 font-semibold text-xl text-gray-900">
          Bienvenido, {user?.displayName}
        </h1>

        {loading ? (
          <div className="h-[70vh] flex justify-center items-center">
            <p className="text-gray-900 font-semibold text-4xl">Cargando...</p>
          </div>
        ) : (
          <>
            <div className="h-[70vh] flex flex-col mx-4">
              {/* Tabla de Top 3 */}
              <div className="rounded-xl bg-gray-900">
                <h2 className="text-center text-2xl font-semibold text-gray-200 my-4">
                  TOP 3
                </h2>
                <hr className="text-white" />
                <table className="text-gray-200 w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b text-left">#</th>
                      <th className="px-4 py-2 border-b text-left">Equipo</th>
                      <th className="px-4 py-2 border-b text-left">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTeams.map((team, index) => (
                      <tr key={team.id}>
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{team.nombreequipo}</td>
                        <td className="px-4 py-2">{team.puntaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Novedades */}
              <div>
                <h2 className="text-center text-2xl font-semibold text-gray-900 my-4">
                  NOVEDADES
                </h2>
                <div className="p-4 border-2 bg-gray-400 rounded-lg shadow-md">
                  <ul className="mt-4 space-y-2">
                    <li>
                      📅 Actualización semanal en el sistema de ranking.
                    </li>

                    <li>
                      🔔 Recordá que tenes que confirmar tu Roster antes del comienzo de cada ronda.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
