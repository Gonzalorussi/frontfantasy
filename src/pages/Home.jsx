import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import useRondaActual from "../hooks/useRondaActual";
import {FaRegCalendarAlt, FaTrophy  } from "react-icons/fa"
import TopRosterCard from "../Components/TopRosterCard"; 

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
      // Ranking acumulado
      const rankingAcumSnap = await getDoc(doc(db, "rankings", "rankingacumulado"));
      const rankingAcum = rankingAcumSnap.exists() ? rankingAcumSnap.data().equipos || [] : [];

      // Top 3 acumulado
      const top3Acum = rankingAcum.slice(0, 3);

      // Buscar el equipo del usuario      
      const equipoUsuarioAcum = rankingAcum.findIndex((e) => e.usuarioid === user.uid);
        if (!equipoUsuarioAcum) {
        console.warn("No se encontró el equipo del usuario en el ranking acumulado");
}
      const posicion = equipoUsuarioAcum?.posicion ?? null;
      const puntosAcumulados = equipoUsuarioAcum?.puntos ?? 0;

      // Ranking de la última ronda
      const rankingRondaSnap = await getDoc(doc(db, "rankings", `rankingronda${rondaAnterior.numero}`));
      const rankingRonda = rankingRondaSnap.exists() ? rankingRondaSnap.data().equipos || [] : [];

      // Top 3 ronda
      const top3Ronda = rankingRonda.slice(0, 3);

      // Buscar el puntaje de la última ronda
      
      const equipoUsuarioRonda = rankingRonda.find((e) => e.userid === user.uid);
      const puntosUltimaRonda = equipoUsuarioRonda?.puntos ?? 0;

      // Setear estados
      setPosicion(posicion);
      setPuntosAcumulados(puntosAcumulados);
      setPuntosUltimaRonda(puntosUltimaRonda);
      setTop3Acumulado(top3Acum); // ya no se llama top3Acum, pero lo usás así en el render
      setTop3Ronda(top3Ronda);

    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!loadingRondas) {
    cargarDatos();
  }
}, [user, rondaAnterior, loadingRondas]);

  useEffect(() => {
  const cargarTopRoster = async () => {
    if (!rondaAnterior) return;
    try {
      const jugadoresSnapshot = await getDocs(collection(db, "jugadores"));
      const jugadores = jugadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const roles = ["top", "jungle", "mid", "bottom", "support"];
      const topPorRol = roles.map(rol => {
        const jugadoresDelRol = jugadores.filter(j => j.rol === rol);
        let mejor = null;
        let mejorPuntaje = -Infinity;

        for (const jugador of jugadoresDelRol) {
          const puntaje = jugador.puntajeronda?.[`ronda${rondaAnterior.numero}`] ?? 0;
          if (puntaje > mejorPuntaje) {
            mejor = { ...jugador, puntaje };
            mejorPuntaje = puntaje;
          }
        }
        return mejor;
      }).filter(j => j); // filtramos posibles null

      setTopRoster(topPorRol);
    } catch (error) {
      console.error("Error al cargar Top Roster:", error);
    }
  };

  cargarTopRoster();
}, [rondaAnterior]);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!rondaAnterior) {
        setLoadingStats(false);
       return;
      }

      try { const jugadoresSnapshot = await getDocs(collection(db, "jugadores"));
        const jugadoresList = jugadoresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const promedios = jugadoresList.map(jugador => {
        const puntajesRonda = jugador.puntajeronda || {};
        const puntajesValidos = Object.values(puntajesRonda).filter(p => p > 0);
        const totalPuntos = puntajesValidos.reduce((acc, val) => acc + val, 0);
        const cantidadJugadas = puntajesValidos.length;
        const promedio = cantidadJugadas > 0 ? totalPuntos / cantidadJugadas : 0;
        return {
          id: jugador.id,
          nombre: jugador.nombre,
          club: jugador.club,
          rol: jugador.rol,
          valor: jugador.valor,
          promedio: promedio.toFixed(2),
          };
        });

        promedios.sort((a, b) => {
          if (b.promedio !== a.promedio) {
            return b.promedio - a.promedio;
          }
          return a.valor - b.valor;
        });

        setTopPromedios(promedios.slice(0, 5));

        const rostersSnapshot = await getDocs(collection(db, "rosters"));
        const conteo = {};

        rostersSnapshot.forEach(doc => {
  const data = doc.data();
  Object.keys(data).forEach(campo => {
    if (campo.startsWith("ronda")) {
      const numeroRonda = parseInt(campo.replace("ronda", ""), 10);
      if (numeroRonda <= rondaAnterior.numero) {
        const ronda = data[campo];
        ["top", "mid", "jungle", "botton", "support"].forEach(posicion => {
          const jugadorObj = ronda[posicion];
          const jugadorId = jugadorObj?.id;
          if (jugadorId) {
            conteo[jugadorId] = (conteo[jugadorId] || 0) + 1;
          }
        });
      }
    }
  });
});
        const pickeados = Object.entries(conteo).map(([id, cantidad]) => {
          const jugador = jugadoresList.find(j => j.id === id);
          return {
            id,
            nombre: jugador?.nombre || "Desconocido",
            club: jugador?.club || "-",
            rol: jugador?.rol || "-",
            valor: jugador?.valor || 0,
            cantidad
          };
        });

        pickeados.sort((a, b) => b.cantidad - a.cantidad);
        setTopPickeados(pickeados.slice(0, 5));
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        } finally {
        setLoadingStats(false);
      }
    };

    cargarEstadisticas();
  }, [rondaAnterior]);

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex flex-col flex-1 py-6 bg-gray-800">
        <div className="max-w-[1200px] mx-auto w-full">
        <h1 className="text-center mb-6 font-semibold text-2xl">
          Bienvenido!!!
        </h1>

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
                    {top3Acumulado.map((team, index) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {topRoster.map((jugador) => (
                <TopRosterCard key={jugador.id} jugador={jugador} />
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
                        <td className="px-4 py-2 text-center">{jugador.promedio}</td>
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
                        <td className="px-4 py-2 text-center">{jugador.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
