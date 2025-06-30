import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import useRondaActual from "../hooks/useRondaActual";
import { FaRegCalendarAlt, FaTrophy } from "react-icons/fa";
import TopRosterCard from "../Components/TopRosterCard";
import { getCachedOrFetch } from "../utils/cache";

export default function Home() {
  const [user, setUser] = useState(null);
  const [posicion, setPosicion] = useState(null);
  const [puntosUltimaRonda, setPuntosUltimaRonda] = useState(0);
  const [puntosAcumulados, setPuntosAcumulados] = useState(0);
  const [topRoster, setTopRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topPromedios, setTopPromedios] = useState([]);
  const [topPickeados, setTopPickeados] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [top3Ronda, setTop3Ronda] = useState([]);
  const [top3Acumulado, setTop3Acumulado] = useState([]);
  const [hayPuntajes, setHayPuntajes] = useState(false); // Estado para controlar si hay puntajes
  const navigate = useNavigate();

  const { rondaActual, rondaAnterior, proximaRonda, loading: loadingRondas} = useRondaActual();
  const TTL_DIARIO = 1000 * 60 * 60 * 24;

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
    if (!user || !rondaAnterior) return;

    const cargarDatos = async () => {
      setLoading(true);
      try {
        const rankingAcum = await getCachedOrFetch(
          "rankingacumulado",
          () => getDoc(doc(db, "rankings", "rankingacumulado")).then(d => d.data()),
          TTL_DIARIO
        );
        const rankingRonda = await getCachedOrFetch(
          `rankingronda_${rondaAnterior.numero}`,
          () => getDoc(doc(db, "rankings", `rankingronda${rondaAnterior.numero}`)).then(d => d.data()),
          TTL_DIARIO
        );

        const rankingAcumList = rankingAcum?.equipos || [];
        const rankingRondaList = rankingRonda?.equipos || [];
        
        const equipoUsuarioAcum = rankingAcumList.find((e) => e.usuarioid === user.uid);
        const equipoUsuarioRonda = rankingRondaList.find((e) => e.usuarioid === user.uid);

        const top3Acum = rankingAcumList.slice(0, 3);
        const top3Ronda = rankingRondaList.slice(0, 3);
        const hayPuntajes = rankingRondaList.some((team) => (team.puntos ?? 0) > 0);

        // Sumar los puntos acumulados
        setPosicion(equipoUsuarioAcum?.posicion ?? 0);
        setPuntosAcumulados(equipoUsuarioAcum?.puntos ?? 0);
        setPuntosUltimaRonda(equipoUsuarioRonda?.puntos ?? 0);
        setTop3Acumulado(top3Acum);
        setTop3Ronda(top3Ronda);
        setHayPuntajes(hayPuntajes);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user, rondaAnterior]);

  useEffect(() => {
    if (!rondaAnterior) return;

    const cargarTopRoster = async () => {
      try {
        const data = await getCachedOrFetch(
          `rosterideal_ronda${rondaAnterior.numero}`,
          () => getDoc(doc(db, "rosterideal", `ronda${rondaAnterior.numero}`)).then(d => d.data()),
          TTL_DIARIO
        );
        const roles = ["top", "jungle", "mid", "bottom", "support"];
        const topPorRol = roles.map(rol => data?.[rol] ? { ...data[rol], rol } : null).filter(Boolean);
        setTopRoster(topPorRol);
      } catch (err) {
        console.error("Error al cargar Top Roster desde cache o FS:", err);
        setTopRoster([]);
      }
    };

    cargarTopRoster();
  }, [rondaAnterior]);

  useEffect(() => {
    const cargarEstadisticasDesdeBackend = async () => {
      try {
        const [promediosData, seleccionadosData] = await Promise.all([
          getCachedOrFetch("top5promedios", () => getDoc(doc(db, "topplayers", "top5promedios")).then(d => d.data()), TTL_DIARIO),
          getCachedOrFetch("top5seleccionados", () => getDoc(doc(db, "topplayers", "top5seleccionados")).then(d => d.data()), TTL_DIARIO),
        ]);

        setTopPromedios(promediosData?.jugadores || []);
        setTopPickeados(seleccionadosData?.jugadores || []);
      } catch (err) {
        console.error("Error al cargar estadísticas desde backend:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    cargarEstadisticasDesdeBackend();
  }, []);


  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex flex-col flex-1 py-6 bg-gray-800">
        <div className="max-w-[1200px] mx-auto w-full">
          <h1 className="text-center mb-6 font-semibold text-2xl">
            Bienvenido!!!
          </h1>

          {/* Novedades */}
          <div className="ring-1 ring-red-700 m-4 bg-gray-700 p-6 rounded-lg">
            <h2 className="text-center text-2xl font-semibold mb-4">NOVEDADES</h2>
            <hr className="border-t border-gray-600 mb-4" />
            <div className="space-y-4">
              <div className="text-xl font-medium text-gray-200 flex items-center">
                <span className="mr-2">⚠️</span> RECORDÁ QUE TENÉS QUE CONFIRMAR TU ROSTER ANTES DEL COMIENZO DE CADA RONDA.
              </div>
              <div className="text-xl font-medium text-gray-200 flex items-center">
                <span className="mr-2">⚠️</span> SI CONFIRMAS TU ROSTER PERO NO ARMAS TU EQUIPO, ESCUDO Y NOMBRE, NO ESTAS EN 'POSICIONES'.
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-[70vh] flex justify-center items-center">
              <span className="loader"></span>
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
                      {top3Ronda.map((team, index) => (
                        <tr
                          key={team.id}
                          className="bg-gray-800 hover:bg-gray-700 transition duration-200"
                        >
                          <td className="px-6 py-4">{index + 1}</td>
                          <td className="px-6 py-4">{team.nombreequipo}</td>
                          <td className="px-6 py-4">{team.puntos.toFixed(2)}</td>
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
                      {top3Acumulado.map((team, index) => (
                        <tr
                          key={team.id}
                          className="bg-gray-800 hover:bg-gray-700 transition duration-200"
                        >
                          <td className="px-6 py-4">{index + 1}</td>
                          <td className="px-6 py-4">{team.nombreequipo}</td>
                          <td className="px-6 py-4">{team.puntos.toFixed(2)}</td>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {topRoster.map((jugador) => (
                    <TopRosterCard key={`${jugador.rol}-${jugador.nombre}`} jugador={jugador} />
                  ))}
                </div>
              </div> 

              {/* TOP 5 PROMEDIOS */}
              <div className="w-full rounded-xl bg-gray-700 p-6 overflow-x-auto">
                <h2 className="text-center text-2xl font-semibold mb-4">TOP 5 PROMEDIO DEL TORNEO</h2>
                <hr className="border-t border-gray-600 mb-4" />
                {loadingStats ? (
                  <span className="loader"></span>
                ) : (
                  <table className="w-full text-gray-200 border-collapse">
                    <thead className="bg-gray-600">
                      <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">Nombre</th>
                        <th className="px-4 py-2">Club</th>
                        <th className="px-4 py-2">Rol</th>
                        <th className="px-4 py-2">Valor</th>
                        <th className="px-4 py-2">Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPromedios.map((jugador, index) => (
                        <tr key={jugador.id} className="bg-gray-800 hover:bg-gray-700 transition duration-200">
                          <td className="px-4 py-2 text-center">{index + 1}</td>
                          <td className="px-4 py-2 text-center">{jugador.nombre}</td>
                          <td className="px-4 py-2 text-center">{jugador.club}</td>
                          <td className="px-4 py-2 text-center">{jugador.rol}</td>
                          <td className="px-4 py-2 text-center">{jugador.valor}</td>
                          <td className="px-4 py-2 text-center">{jugador.promediopuntos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* TOP 5 MAS PICKEADOS */}
              <div className="w-full rounded-xl bg-gray-700 p-6 overflow-x-auto">
                <h2 className="text-center text-2xl font-semibold mb-4">TOP 5 MÁS PICKEADOS</h2>
                <hr className="border-t border-gray-600 mb-4" />
                {loadingStats ? (
                  <span className="loader"></span>
                ) : (
                  <table className="w-full text-gray-200 border-collapse">
                    <thead className="bg-gray-600">
                      <tr>
                        <th className="px-4 py-2 text-center">#</th>
                        <th className="px-4 py-2 text-center">Nombre</th>
                        <th className="px-4 py-2 text-center">Club</th>
                        <th className="px-4 py-2 text-center">Rol</th>
                        <th className="px-4 py-2 text-center">Valor</th>
                        <th className="px-4 py-2 text-center">Veces Pickeado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPickeados.map((jugador, index) => (
                        <tr key={jugador.id} className="bg-gray-800 hover:bg-gray-700 transition duration-200">
                          <td className="px-4 py-2 text-center">{index + 1}</td>
                          <td className="px-4 py-2 text-center">{jugador.nombre}</td>
                          <td className="px-4 py-2 text-center">{jugador.club}</td>
                          <td className="px-4 py-2 text-center">{jugador.rol}</td>
                          <td className="px-4 py-2 text-center">{jugador.valor}</td>
                          <td className="px-4 py-2 text-center">{jugador.selecciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
