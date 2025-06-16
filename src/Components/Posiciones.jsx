import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import VistaPreviaEscudo from "./VistaPreviaEscudo";
import { Listbox, Transition } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { FaTrophy  } from "react-icons/fa"

function Posiciones() {
  const [user, setUser] = useState(null); // Estado para el usuario
  const [teams, setTeams] = useState([]);
  const [modoVista, setModoVista] = useState("total");
  const [rondasDisponibles, setRondasDisponibles] = useState([]);
  const [rondaSeleccionada, setRondaSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revisar el estado de autenticación del usuario
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRondas = async () => {
      const snapshot = await getDocs(collection(db, "rondas"));
      const rondas = snapshot.docs
        .map((doc) => doc.data())
        .sort((a, b) => a.numero - b.numero);

      setRondasDisponibles(rondas);
      if (rondas.length > 0 && !rondaSeleccionada) {
        setRondaSeleccionada(`ronda${rondas[rondas.length - 1].numero}`);
      }
    };

    fetchRondas();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsSnapshot = await getDocs(collection(db, "equipos"));
      const teamsList = [];

      for (const teamDoc of teamsSnapshot.docs) {
        const teamData = teamDoc.data();

        const userRef = doc(db, "usuarios", teamData.usuarioid);
        const userSnap = await getDoc(userRef);
        const ownerName = userSnap.exists() ? userSnap.data().nombre : "—";

        teamsList.push({
          id: teamDoc.id,
          name: teamData.nombreequipo || "Nombre no disponible",
          ownerName,
          totalpuntos: teamData.totalpuntos || 0,
          puntajesronda: teamData.puntajesronda || {},
          escudoid: teamData.escudoid,
          rellenoid: teamData.rellenoid,
          colorprimario: teamData.colorprimario,
          colorsecundario: teamData.colorsecundario,
        });
      }

      setTeams(teamsList);
      setLoading(false);
    };

    fetchTeams();
  }, []);

  const teamsOrdenados = [...teams].sort((a, b) => {
    if (modoVista === "total") {
      return b.totalpuntos - a.totalpuntos;
    } else if (modoVista === "ronda" && rondaSeleccionada) {
      const puntosA = a.puntajesronda?.[rondaSeleccionada] || 0;
      const puntosB = b.puntajesronda?.[rondaSeleccionada] || 0;
      return puntosB - puntosA;
    }
    return 0;
  });

  const hayPuntajes =
    modoVista === "ronda"
      ? teams.some((team) => (team.puntajesronda?.[rondaSeleccionada] ?? 0) > 0)
      : true;

  if (loading) {
    return (
      <div>
        <Navbar user={user} /> {/* Pasamos el estado de user al Navbar */}
        <main className="flex justify-center items-center h-[70vh] bg-gray-900">
          <span className="loader"></span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar user={user} /> {/* Pasamos el estado de user al Navbar */}

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <h2 className="flex items-center justify-center gap-2 text-center font-semibold text-2xl md:text-4xl mb-4"> <FaTrophy className="w-6 h-6 text-yellow-400" />RANKING</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-700 pb-4">
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={() => setModoVista("total")}
              className={`px-4 py-2 font-semibold rounded-md border transition-all duration-300 transform
              ${
                modoVista === "total"
                  ? "cursor-pointer bg-yellow-600 text-gray-200 border-yellow-600 shadow-lg scale-105"
                  : "cursor-pointer bg-transparent text-gray-200 border border-gray-200 hover:text-yellow-400 hover:border-yellow-400 hover:shadow-md active:scale-95"
              }`}
            >
              Total
            </button>

            <button
              onClick={() => setModoVista("ronda")}
              className={`font-semibold px-4 py-2 rounded-md border transition-all duration-300 transform
              ${
                modoVista === "ronda"
                  ? "cursor-pointer bg-yellow-600 text-gray-200 border-yellow-600 shadow-lg scale-105"
                  : "cursor-pointer bg-transparent text-gray-200 border border-gray-200 hover:text-yellow-400 hover:border-yellow-400 hover:shadow-md active:scale-95"
              }`}
            >
              Por Ronda
            </button>

            <Transition
              show={modoVista === "ronda"}
              enter="transition-opacity transition-transform duration-500"
              enterFrom="opacity-0 -translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition-opacity transition-transform duration-500"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-4"
            >
              <div className="relative w-64">
                <Listbox
                  value={rondaSeleccionada}
                  onChange={setRondaSeleccionada}
                >
                  <div className="relative">
                    <Listbox.Button className="flex items-center justify-between px-4 py-2 border border-gray-700 rounded bg-gray-800 shadow cursor-pointer w-60 text-white">
                      {rondasDisponibles.find(
                        (r) => `ronda${r.numero}` === rondaSeleccionada
                      )?.nombre || "Seleccionar ronda"}
                      <FaChevronDown className="ml-2 text-gray-400" />
                    </Listbox.Button>

                    <Listbox.Options className="absolute z-40 mt-1 w-60 bg-gray-800 shadow-lg border border-gray-700 rounded max-h-60 overflow-auto text-white">
                      {rondasDisponibles.map((ronda) => (
                        <Listbox.Option
                          key={ronda.numero}
                          value={`ronda${ronda.numero}`}
                          className={({ active }) =>
                            `px-4 py-2 cursor-pointer ${
                              active ? "bg-yellow-600" : "bg-transparent"
                            }`
                          }
                        >
                          Ronda {ronda.numero} - {ronda.nombre}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </Transition>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto mt-6">
              <div className="text-center grid grid-cols-[50px_80px_1fr_1fr_100px] gap-4 bg-gray-800 rounded-t-lg py-3 font-semibold text-sm md:text-base">
                <div>#</div>
                <div>Escudo</div>
                <div>Equipo</div>
                <div>Usuario</div>
                <div>Puntos</div>
              </div>

              {!hayPuntajes && (
                <div className="text-center py-8 text-gray-400 font-semibold">
                  Los puntos para esta ronda aún no han sido calculados.
                </div>
              )}

              {hayPuntajes &&
                teamsOrdenados.map((team, index) => {
                  const puntos =
                    modoVista === "total"
                      ? team.totalpuntos
                      : team.puntajesronda?.[rondaSeleccionada] || 0;

                  return (
                    <div
                      key={team.id}
                      className="grid grid-cols-[50px_80px_1fr_1fr_100px] items-center gap-4 text-center border-b border-gray-700 hover:bg-gray-800 py-3 transition-all text-sm md:text-base"
                    >
                      <div>{index + 1}</div>
                      <div className="flex justify-center w-20 h-20 md:w-24 md:h-24 scale-35">
                        <VistaPreviaEscudo
                          escudoId={team.escudoid}
                          rellenoId={team.rellenoid}
                          colorPrimario={team.colorprimario}
                          colorSecundario={team.colorsecundario}
                          escudoSize={80}
                          rellenoSize={70}
                        />
                      </div>
                      <div>{team.name}</div>
                      <div>{team.ownerName}</div>
                      <div className="font-semibold">{puntos.toFixed(2)}</div>
                    </div>
                  );
                })}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex flex-col gap-3 mt-6">
              {teamsOrdenados.map((team, index) => {
                const puntos =
                  modoVista === "total"
                    ? team.totalpuntos
                    : team.puntajesronda?.[rondaSeleccionada] || 0;

                return (
                  <div
                    key={team.id}
                    className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-yellow-400 text-lg">
                        #{index + 1}
                      </span>
                      <span className="text-yellow-400 font-semibold text-lg">
                        {puntos.toFixed(2)} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                        <VistaPreviaEscudo
                          escudoId={team.escudoid}
                          rellenoId={team.rellenoid}
                          colorPrimario={team.colorprimario}
                          colorSecundario={team.colorsecundario}
                          escudoSize={40}
                          rellenoSize={35}
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="font-semibold">{team.name}</div>
                        <div className="text-sm text-gray-400">
                          {team.ownerName}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Posiciones;
