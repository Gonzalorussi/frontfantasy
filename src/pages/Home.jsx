import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import useRondaActual from "../hooks/useRondaActual";

export default function Home() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [topTeams, setTopTeams] = useState([]);
  const [posicion, setPosicion] = useState(null);
  const [puntosUltimaRonda, setPuntosUltimaRonda] = useState(0);
  const [puntosAcumulados, setPuntosAcumulados] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { rondaActual, rondaAnterior, proximaRonda, loading: loadingRondas } = useRondaActual();

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
          // Usamos rondaAnterior si existe, sino la última ronda disponible
          let numeroRondaParaPuntaje = null;

          if (rondaAnterior) {
            numeroRondaParaPuntaje = rondaAnterior.numero;
          } else if (!rondaActual && !rondaAnterior && proximaRonda === null) {
            // Si no hay ronda actual ni próxima, se asume que ya terminaron todas, 
            // tomamos la ronda con mayor número (última ronda)
            const rondasSnapshot = await getDocs(collection(db, 'rondas'));
            let maxNumero = 0;
            rondasSnapshot.forEach(doc => {
              const data = doc.data();
              if (data.numero > maxNumero) maxNumero = data.numero;
            });
            numeroRondaParaPuntaje = maxNumero;
          }

          if (numeroRondaParaPuntaje !== null) {
            const puntos = teamData.puntajesronda?.[`ronda${numeroRondaParaPuntaje}`] || 0;
            setPuntosUltimaRonda(puntos);
          } else {
            setPuntosUltimaRonda(0);
          }

          // Obtener todos los equipos para ranking y posición
          const teamsSnapshot = await getDocs(collection(db, "equipos"));
          const teamsList = teamsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const ordenados = teamsList.sort((a, b) => (b.totalpuntos || 0) - (a.totalpuntos || 0));
          setTopTeams(ordenados.slice(0, 3));

          const posicionUsuario = ordenados.findIndex(team => team.id === user.uid) + 1;
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
    <div>
      <Navbar user={user} />
      <main className="flex flex-col bg-gray-200 min-h-screen">
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
                      <td className="px-6 py-4">{team.totalpuntos}</td>
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
            <div className="flex justify-between gap-x-4 my-4 flex-wrap">
              <div className="bg-gray-400 w-full md:w-1/3 p-4 rounded-lg shadow-lg text-center">
                <p className="text-lg font-medium text-gray-700">TU POSICIÓN</p>
                <p className="text-2xl font-bold text-blue-600">#{posicion ?? '-'}</p>
              </div>

              <div className="bg-gray-400 w-full md:w-1/3 p-4 rounded-lg shadow-lg text-center">
                <p className="text-lg font-medium text-gray-700">PUNTOS ÚLTIMA RONDA</p>
                <p className="text-2xl font-bold text-green-600">{puntosUltimaRonda.toFixed(2)}</p>
              </div>

              <div className="bg-gray-400 w-full md:w-1/3 p-4 rounded-lg shadow-lg text-center">
                <p className="text-lg font-medium text-gray-700">TOTAL PUNTOS</p>
                <p className="text-2xl font-bold text-green-600">{puntosAcumulados.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
