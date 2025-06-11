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
import { FaPlus, FaTrash, FaExchangeAlt } from "react-icons/fa";

const roles = ["top", "jungle", "mid", "bottom", "support"];

function Mercado() {
  const [busqueda, setBusqueda] = useState("");
  const [rolActivo, setRolActivo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [alineacion, setAlineacion] = useState({});
  const [presupuesto, setPresupuesto] = useState(50000); // Presupuesto inicial
  const [usuarioId, setUsuarioId] = useState(null);
  const [rosterConfirmado, setRosterConfirmado] = useState(false); // Para saber si el roster está confirmado
  const [rondas, setRondas] = useState([]);
  const [rondaActual, setRondaActual] = useState(null);
  const [rondaProxima, setRondaProxima] = useState(null);
  const [edicionHabilitada, setEdicionHabilitada] = useState(false);


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
      } else {
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
      }
    }

    obtenerJugadores();
  }, []);

  useEffect(() => {
  async function obtenerRondasYRoster() {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, "rondas"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fechainicio: doc.data().fechainicio.toDate(),
      fechafin: doc.data().fechafin.toDate(),
      numero: doc.data().numero
    }));

    const ahora = new Date();
    const actual = data.find(r => ahora >= r.fechainicio && ahora <= r.fechafin);
    const proxima = data.filter(r => ahora < r.fechainicio).sort((a, b) => a.fechainicio - b.fechainicio)[0];

    setRondas(data);
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
            const rondasPrevias = data && Object.keys(data).filter(k => k.startsWith("ronda")).sort().reverse();
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

    const presupuestoUsado = Object.values(rosterData || {}).reduce((sum, j) => sum + (j?.valor || 0), 0);
    setPresupuesto(50 - presupuestoUsado);

    const puedeEditar = !actual && proxima && (proxima.fechainicio - ahora >= 60 * 60 * 1000);
    setEdicionHabilitada(puedeEditar);
    }

    if (usuarioId) obtenerRondasYRoster();
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
    if (!usuarioId || Object.keys(alineacion).length !== 5 || !edicionHabilitada || !rondaProxima) return;

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
    setEdicionHabilitada(false);
  };

  const filtrarJugadores = () => {
    return jugadores.filter(j => {
      const coincideRol = rolActivo ? j.rol === rolActivo : true;
      const coincideBusqueda = j.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return coincideRol && coincideBusqueda;
    });
  };


  return (
    <div className="bg-gray-200">
      <Navbar />
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-center mt-4">
          Mercado de Jugadores
        </h2>
        <div className="rounded-sm w-100 bg-gray-900 p-4 text-gray-200 text-xl font-semibold text-center mt-4">
          <p>Presupuesto restante: {presupuesto} 💰</p>
        </div>
      </div>

     <SeccionAlineacion roster={alineacion} />

     <div className="flex justify-center">
        <button onClick={confirmarRoster}
          disabled={Object.keys(alineacion).length !== 5 || !edicionHabilitada}
          className={`p-4 rounded-lg text-white ${Object.keys(alineacion).length === 5 && edicionHabilitada ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}>
          Confirmar Roster
        </button>
      </div>

      <div className="flex mx-4 mt-4">
        <input type="text" placeholder="Buscar jugador..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="w-screen ring-1 ring-gray-900 rounded-sm text-xl" />
      </div>

      <div className="mx-4">
        {filtrarJugadores().map(jugador => {
          const enRol = alineacion[jugador.rol];
          const esSeleccionado = enRol?.id === jugador.id;
          const rolOcupado = Boolean(enRol);
          const puedeReemplazar = rolOcupado && !esSeleccionado && presupuesto + enRol.valor - jugador.valor >= 0;
          const puedeSeleccionar = !rolOcupado && jugador.valor <= presupuesto;

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
            <div key={jugador.id} className="flex items-center justify-between bg-white p-2 my-2 rounded shadow">
              <div className="flex items-center">
                <img src={jugador.foto} alt={jugador.nombre} className="w-16 h-16 rounded-full" />
                <div className="ml-4">
                  <h3 className="text-lg font-bold">{jugador.nombre}</h3>
                  <p>{jugador.club.toUpperCase()}</p>
                  <p>Rol: {jugador.rol}</p>
                  <p>Valor: {jugador.valor}</p>
                </div>
              </div>
              <button
                onClick={() => seleccionarJugador(jugador)}
                disabled={!habilitado}
                className={`px-4 py-2 rounded text-white ${habilitado ? '' : 'opacity-50'}`}
                style={{ backgroundColor: color }}
              >
                {icono} {botonTexto}
              </button>
              </div>
              );
          })}
            </div>
      <Footer />
    </div>
  );
}

export default Mercado;
