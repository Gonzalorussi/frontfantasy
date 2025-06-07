import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import SeccionEquipo from "../Components/SeccionEquipo";
import SeccionAlineacion from "../Components/SeccionAlineacion";
import SeccionNoticias from "../Components/SeccionNoticias";
import { Routes, Route, useNavigate, Link } from "react-router-dom";

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
          const teamRef = doc(db, "equipos", currentUser.uid);
          const teamSnap = await getDoc(teamRef);
          console.log(teamSnap);
          if (teamSnap.exists()) {
            console.log(teamSnap.data);
            setTeam(teamSnap.data());
          }

          const rosterRef = doc(db, "rosters", currentUser.uid);
          const rosterSnap = await getDoc(rosterRef);
          if (rosterSnap.exists()) {
            console.log("Roster encontrado:", rosterSnap.data());
            setRoster(rosterSnap.data());
          }
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
              <div className="flex flex-col mx-4 mt-8">
                {/* Tabla de Top 3 */}
                <div className="rounded-xl bg-gray-900">
                  <h2 className="text-center text-2xl font-semibold text-gray-200 my-4">
                    TOP 3
                  </h2>
                  <hr className="text-white"/>
                  <table className="text-gray-200 w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b text-left">#</th>
                        <th className="px-4 py-2 border-b text-left">
                          Jugador
                        </th>
                        <th className="px-4 py-2 border-b text-left">Puntos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Placeholder de los datos del TOP 3 */}
                      <tr>
                        <td className="px-4 py-2">1</td>
                        <td className="px-4 py-2">Datos de prueba</td>
                        <td className="px-4 py-2">150</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">2</td>
                        <td className="px-4 py-2">Datos de prueba</td>
                        <td className="px-4 py-2">145</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">3</td>
                        <td className="px-4 py-2">Datos de prueba</td>
                        <td className="px-4 py-2">140</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Novedades */}
                <div>
                  <h2 className="text-center text-2xl font-semibold text-gray-900 my-4">
                    NOVEDADES
                  </h2>
                  <div className="p-4 border-2 bg-gray-400 rounded-lg shadow-md">
                    <p className="font-semibold text-centertext-xl text-gray-900">
                      Acá vas a encontrar las últimas novedades sobre el MSI
                    </p>
                    <ul className="mt-4 space-y-2">
                      <li>📅 Actualización semanal en el sistema de ranking.</li>
                      <li>
                        🔔 Recordá que tenes que confirmar tu Roster antes del comienzo de cada ronda.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
          </>
        )};
      </main>
      <Footer />
    </div>
  );
};
