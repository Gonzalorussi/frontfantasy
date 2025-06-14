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
  const [rondaActual, setRondaActual] = useState(null);
  const [rondaProxima, setRondaProxima] = useState(null);
  const [edicionHabilitada, setEdicionHabilitada] = useState(false);
  const [user, setUser] = useState(null); // Estado para el usuario
  const [cargando, setCargando] = useState(true); // Estado de carga

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
          "hle",
          "kt",
          "g2",
          "koi",
          "blg",
          "ig",
          "al",
          "ie",
          "furia",
          "png",
          "fly",
          "c9",
          "sr",
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
    async function obtenerRondasYRoster() {
      if (!usuarioId) return;
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, "rondas"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fechainicio: doc.data().fechainicio.toDate(),
        fechafin: doc.data().fechafin.toDate(),
        numero: doc.data().numero,
      }));

      const ahora = new Date();
      const actual = data.find(
        (r) => ahora >= r.fechainicio && ahora <= r.fechafin
      );
      const proxima = data
        .filter((r) => ahora < r.fechainicio)
        .sort((a, b) => a.fechainicio - b.fechainicio)[0];

      setRondaActual(actual || null);
      setRondaProxima(proxima || null);

      let campoRonda = null;

      if (actual) campoRonda = `ronda${actual.numero}`;
      else if (proxima) {
        campoRonda = `ronda${proxima.numero}`;
        const rosterRef = doc(db, "rosters", usuarioId);
        const snapshotRoster = await getDoc(rosterRef);
        if (snapshotRoster.exists()) {
          const data = snapshotRoster.data();
          if (!data[campoRonda]) {
            const rondasPrevias =
              data &&
              Object.keys(data)
                .filter((k) => k.startsWith("ronda"))
                .sort()
                .reverse();
            campoRonda = rondasPrevias.length > 0 ? rondasPrevias[0] : null;
          }
        }
      }

      if (!campoRonda) return;

      const rosterRef = doc(db, "rosters", usuarioId);
      const snapshotRoster = await getDoc(rosterRef);
      if (!snapshotRoster.exists()) return;

      const rosterData = snapshotRoster.data()[campoRonda];
      setAlineacion(rosterData || {});

      const presupuestoUsado = Object.values(rosterData || {}).reduce(
        (sum, j) => sum + (j?.valor || 0),
        0
      );
      setPresupuesto(50 - presupuestoUsado);

      const puedeEditar =
        !actual && proxima && proxima.fechainicio - ahora >= 60 * 60 * 1000;
      setEdicionHabilitada(puedeEditar);
    }

    obtenerRondasYRoster();
  }, [usuarioId]);

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
      !rondaProxima
    )
      return;

    const db = getFirestore();
    const rosterRef = doc(db, "rosters", usuarioId);
    const snapshot = await getDoc(rosterRef);
    const campoRonda = `ronda${rondaProxima.numero}`;

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

    alert("Roster confirmado.");
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

  if (cargando) {
    return (
      <div>
        <Navbar user={user} /> {/* Pasamos el estado de user al Navbar */}
        <main className="flex justify-center items-center h-[70vh] bg-gray-900">
          <p className="text-gray-200 font-semibold text-4xl">Cargando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      <Navbar user={user} /> {/* Pasamos el usuario al Navbar */}
      {/* Contenedor central de 1200px */}
      <div className="max-w-[1400px] mx-auto p-4 flex flex-col gap-4">
        {/* Bloque presupuesto + alineación + confirmar */}
        <div className="md:sticky top-0 z-10 bg-gray-800 rounded p-4 flex flex-col items-center gap-6">
          {/* Presupuesto */}
          <div className="text-center w-containter bg-gray-700 rounded text-xl font-semibold p-2">
            Presupuesto restante:💰{" "}
            <span className="text-yellow-400">{presupuesto}</span>
          </div>

          {/* Alineación */}
          <div className="flex-grow mx-4 overflow-x-auto">
            <SeccionAlineacion roster={alineacion} />
          </div>

          {/* Confirmar */}
          <div className="w-full sm:w-auto mt-4 sm:mt-0">
            <button
              onClick={confirmarRoster}
              disabled={
                Object.keys(alineacion).length !== 5 || !edicionHabilitada
              }
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors w-full sm:w-auto ${
                Object.keys(alineacion).length === 5 && edicionHabilitada
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              Confirmar Roster
            </button>
          </div>
        </div>

        {/* Nuevo contenedor flex para búsqueda + lista */}
        <div className="flex gap-6 flex-col sm:flex-row">
          {/* Barra búsqueda izquierda */}
          <div className="flex flex-col w-full sm:w-[320px] rounded p-4 md:sticky top-[calc(64px+1rem)] self-start mb-4 sm:mb-0">
            {/* input búsqueda */}
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

            {/* Botones filtro roles */}
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

          {/* Lista de jugadores derecha */}
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
                    <div className="flex gap-x-4 text-sm">
                      <h3
                        className="font-semibold truncate"
                        title={jugador.nombre}
                      >
                        {jugador.nombre}
                      </h3>
                      <p className="uppercase text-center">{jugador.club}</p>
                      <p className="capitalize text-center">{jugador.rol}</p>
                      <p className="text-center font-mono">💰{jugador.valor}</p>
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
