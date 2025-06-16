import React, { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  getFirestore,
  getDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import silueta from "../assets/img/silueta.webp";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SeccionAlineacion from "./SeccionAlineacion";
import { FaPlus, FaTrash, FaExchangeAlt, FaSearch } from "react-icons/fa";
import top from "../assets/iconos/top.svg?react";
import jungle from "../assets/iconos/jungle.svg?react";
import mid from "../assets/iconos/mid.svg?react";
import bottom from "../assets/iconos/bottom.svg?react";
import support from "../assets/iconos/support.svg?react";
import { DateTime } from "luxon";
import useRondaActual from "../hooks/useRondaActual";
import anillo from '../assets/img/anillo.png'
import Swal from 'sweetalert2';

const roles = ["top", "jungle", "mid", "bottom", "support"];
const iconosRoles = {
  top: top,
  jungle: jungle,
  mid: mid,
  bottom: bottom,
  support: support,
};

function Mercado() {
  const [busqueda, setBusqueda] = useState("");
  const [rolActivo, setRolActivo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [alineacion, setAlineacion] = useState({});
  const [presupuesto, setPresupuesto] = useState(50);
  const [usuarioId, setUsuarioId] = useState(null);
  const [edicionHabilitada, setEdicionHabilitada] = useState(false);
  const [user, setUser] = useState(null); // Estado para el usuario
  const [cargando, setCargando] = useState(true); // Estado de carga

  const db = getFirestore();
  const { rondaActual, proximaRonda, loading: loadingRondas } = useRondaActual();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Actualiza el estado del usuario
        setUsuarioId(user.uid);
      } else {
        setUser(null); // Si el usuario no está autenticado
        console.warn("Usuario no autenticado");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function obtenerJugadores() {
      try {
        const db = getFirestore();
        const jugadoresSnapshot = await getDocs(collection(db, "jugadores"));

        const equiposPermitidos = [
          "t1",
          "geng",
          "g2",
          "koi",
          "blg",
          "al",
          "furia",
          "fly",
          "c9",
          "gam",
          "ctbc",
        ];

        const jugadoresData = jugadoresSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              nombre: data.nombre || data.Nombre || "",
              club: (data.club || data.Club || "").toLowerCase(),
              rol: data.rol || data.Rol || "",
              valor: data.valor || data.Valor || 0,
              foto: data.foto || data.Foto || silueta,
            };
          })
          .filter((jugador) => equiposPermitidos.includes(jugador.club));

        setJugadores(jugadoresData);
        console.log(jugadoresData);
      } catch (error) {
        console.error("Error al obtener jugadores del MSI:", error);
      } finally {
        setCargando(false); // Termina la carga
      }
    }

    obtenerJugadores();
  }, []);

  useEffect(() => {
    if (!loadingRondas) {
      const ahora = DateTime.now().setZone("America/Argentina/Buenos_Aires");

      const puedeEditar =
        !rondaActual &&
        proximaRonda &&
        proximaRonda.Fechainicio.diff(ahora, "hours").hours >= 1;

      setEdicionHabilitada(puedeEditar);
    }
  }, [rondaActual, proximaRonda, loadingRondas]);

  useEffect(() => {
    if (!usuarioId || loadingRondas) return;

    async function obtenerRoster() {
      const rosterRef = doc(db, "rosters", usuarioId);
      const snapshot = await getDoc(rosterRef);
      if (!snapshot.exists()) return;

      let campoRonda = null;

      if (rondaActual) {
        campoRonda = `ronda${rondaActual.numero}`;
      } else if (proximaRonda) {
        campoRonda = `ronda${proximaRonda.numero}`;
      }

      const data = snapshot.data();
      const rosterData = data[campoRonda] || {};

      setAlineacion(rosterData);

      const presupuestoUsado = Object.values(rosterData).reduce(
        (sum, j) => sum + (j?.valor || 0), 0
      );
      setPresupuesto(50 - presupuestoUsado);
    }

    obtenerRoster();
  }, [usuarioId, rondaActual, proximaRonda, loadingRondas, db]);

  const seleccionarJugador = (jugador) => {
    if (!edicionHabilitada) return;
    const actual = alineacion[jugador.rol];

    if (actual?.id === jugador.id) {
      const nuevo = { ...alineacion };
      delete nuevo[jugador.rol];
      setAlineacion(nuevo);
      setPresupuesto(presupuesto + jugador.valor);
    } else if (actual) {
      const nuevoPresupuesto = presupuesto + actual.valor - jugador.valor;
      if (nuevoPresupuesto >= 0) {
        setAlineacion({ ...alineacion, [jugador.rol]: jugador });
        setPresupuesto(nuevoPresupuesto);
      }
    } else if (jugador.valor <= presupuesto) {
      setAlineacion({ ...alineacion, [jugador.rol]: jugador });
      setPresupuesto(presupuesto - jugador.valor);
    }
  };

  const confirmarRoster = async () => {
    if (
      !usuarioId ||
      Object.keys(alineacion).length !== 5 ||
      !edicionHabilitada ||
      !proximaRonda
    )
      return;

    const rosterRef = doc(db, "rosters", usuarioId);
    const snapshot = await getDoc(rosterRef);
    const campoRonda = `ronda${proximaRonda.numero}`;

    const nuevoRoster = {
      [campoRonda]: alineacion,
      lastupdate: serverTimestamp(),
      userid: usuarioId,
    };

    if (!snapshot.exists()) {
      nuevoRoster.createdat = serverTimestamp();
      await setDoc(rosterRef, nuevoRoster);
    } else {
      await setDoc(rosterRef, nuevoRoster, { merge: true });
    }

    Swal.fire({
    icon: 'success',
    title: 'Roster confirmado',
    text: 'Tu alineación fue guardada exitosamente.',
    confirmButtonColor: '#d33',
    confirmButtonText: '¡Perfecto!'
    });
  };

  const filtrarJugadores = () => {
    return jugadores.filter((j) => {
      const coincideRol = rolActivo ? j.rol === rolActivo : true;
      const coincideBusqueda = j.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      return coincideRol && coincideBusqueda;
    });
  };

  if (cargando || loadingRondas) {
    return (
      <div>
        <Navbar user={user} />
        <main className="flex justify-center items-center h-[70vh] bg-gray-900">
         <span className="loader"></span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      <Navbar user={user} />
      <div className="max-w-[1400px] mx-auto p-4 flex flex-col gap-4">
        <div className="md:sticky top-0 z-10 bg-gray-800 rounded p-4 flex flex-col items-center gap-6">
          <div className="text-center w-containter bg-gray-700 rounded text-xl font-semibold p-2 flex justify-center items-center gap-2">
              Presupuesto restante:
              <img src={anillo} alt={anillo.name} className="w-6 h-6 " />
              <span className="text-yellow-400">{presupuesto}</span>
          </div>

          <div className="flex-grow mx-4 overflow-x-auto">
            <SeccionAlineacion roster={alineacion} mostrarAviso={false}/>
          </div>

          <div className="w-full sm:w-auto my-4 sm:mt-0">
            <button
              onClick={confirmarRoster}
              disabled={
                Object.keys(alineacion).length !== 5 || !edicionHabilitada
              }
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors w-full sm:w-auto ${
                Object.keys(alineacion).length === 5 && edicionHabilitada
                  ? "bg-red-800 hover:bg-red-700 cursor-pointer"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              Confirmar Roster
            </button>
          </div>
        </div>

        <div className="flex gap-6 flex-col sm:flex-row">
          <div className="flex flex-col w-full sm:w-[320px] rounded p-4 md:sticky top-[calc(64px+1rem)] self-start mb-4 sm:mb-0">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar jugador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="border-1 w-full pl-10 pr-4 py-2 rounded bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {roles.map((rol) => {
                const Icono = iconosRoles[rol];
                return (
                  <button
                    key={rol}
                    onClick={() => setRolActivo(rolActivo === rol ? null : rol)}
                    className={`cursor-pointer px-3 py-1 rounded-full text-xl flex items-center gap-1 transition-colors ${
                      rolActivo === rol
                        ? "bg-gray-200 text-white"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-700"
                    }`}
                    title={rol}
                  >
                    <Icono />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-grow max-h-[calc(100vh-150px)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-700 bg-gray-800 rounded p-4">
            {filtrarJugadores().map((jugador) => {
              const enRol = alineacion[jugador.rol];
              const esSeleccionado = enRol?.id === jugador.id;
              const rolOcupado = Boolean(enRol);
              const puedeReemplazar =
                rolOcupado &&
                !esSeleccionado &&
                presupuesto + enRol.valor - jugador.valor >= 0;
              const puedeSeleccionar =
                !rolOcupado && jugador.valor <= presupuesto;

              let botonTexto = "Seleccionar";
              let color = "#007bff";
              let habilitado = edicionHabilitada && puedeSeleccionar;
              let icono = <FaPlus />;

              if (esSeleccionado) {
                botonTexto = "Eliminar";
                color = "#dc3545";
                habilitado = edicionHabilitada;
                icono = <FaTrash />;
              } else if (puedeReemplazar) {
                botonTexto = "Reemplazar";
                color = "#fd7e14";
                habilitado = edicionHabilitada;
                icono = <FaExchangeAlt />;
              }

              return (
                <div
                  key={jugador.id}
                  className="flex flex-col md:flex-row items-center justify-between bg-gray-700 p-2 rounded shadow mb-2"
                >
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={jugador.foto}
                      alt={jugador.nombre}
                      className="border-1 w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 text-sm w-full gap-y-1">
                      <div className="truncate min-w-0 font-semibold" title={jugador.nombre}>
                        {jugador.nombre}
                      </div>
                      <div className="text-center uppercase sm:text-left">{jugador.club}</div>
                      <div className="text-center capitalize md:text-center">{jugador.rol}</div>
                      <div className="ttext-center font-mono flex justify-center items-center gap-1">
                        <img src={anillo} alt={anillo.name} className="w-5 h-5" />
                        {jugador.valor}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => seleccionarJugador(jugador)}
                    disabled={!habilitado}
                    className={`px-3 py-1 rounded text-white flex items-center justify-center gap-1 w-[160px] ${
                      habilitado ? "" : "opacity-50 cursor-not-allowed"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {icono} {botonTexto}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Mercado;
