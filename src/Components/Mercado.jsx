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
import top from "../assets/iconos/top.svg?react";
import jungle from "../assets/iconos/jungle.svg?react";
import mid from "../assets/iconos/mid.svg?react";
import bottom from "../assets/iconos/bottom.svg?react";
import support from "../assets/iconos/support.svg?react";
import { FaPlus, FaTrash, FaExchangeAlt } from "react-icons/fa";

const iconosRol = {
  top: top,
  jungle: jungle,
  mid: mid,
  bottom: bottom,
  support: support,
};

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
  const [puedeConfirmar, setPuedeConfirmar] = useState(false);


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
    async function obtenerJugadoresMSI() {
      try {
        const db = getFirestore();
        const jugadoresSnapshot = await getDocs(collection(db, "jugadores"));

        const equiposPermitidos = [
          "t1",
          "geng",
          "hle",
          "ns",
          "kt",
          "g2",
          "koi",
          "kc",
          "blg",
          "tes",
          "ig",
          "wbg",
          "al",
          "we",
          "ie",
          "furia",
          "png",
          "vks",
          "tl",
          "fly",
          "c9",
          "sr",
          "psg",
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

    obtenerJugadoresMSI();
  }, []);

  useEffect(() => {
  async function evaluarRondas() {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, "rondas"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fechainicio: doc.data().fechainicio.toDate(),
      fechafin: doc.data().fechafin.toDate(),
    }));

    const ahora = new Date();

    const actual = data.find(
      (r) => ahora >= r.fechainicio && ahora <= r.fechafin
    );
    const proxima = data
      .filter((r) => ahora < r.fechainicio)
      .sort((a, b) => a.fechainicio - b.fechainicio)[0];

    setRondas(data);
    setRondaActual(actual || null);
    setRondaProxima(proxima || null);

    const horaLimite =
      proxima && (proxima.fechainicio.getTime() - ahora.getTime()) >= 60 * 60 * 1000;
    setPuedeConfirmar(!actual && horaLimite); // ✅ Solo se puede confirmar si no hay ronda activa y falta más de 1h para la próxima
  }

  evaluarRondas();
}, []);


  useEffect(() => {
    async function obtenerRosterConfirmado() {
      if (!usuarioId || (!rondaProxima && !rondaActual)) return;

      const db = getFirestore();
      const rosterRef = doc(db, "rosters", usuarioId);
      const rosterSnapshot = await getDoc(rosterRef);

      if (!rosterSnapshot.exists()) return

      const rosterData = rosterSnapshot.data();

      let campoRonda = null;

      if (rondaProxima) {
      campoRonda = `ronda${rondaProxima.numero}`;
      if (!rosterData[campoRonda]) {
        const rondasOrdenadas = rondas
          .filter(r => r.numero < rondaProxima.numero)
          .sort((a, b) => b.numero - a.numero);
        if (rondasOrdenadas.length > 0) {
          campoRonda = `ronda${rondasOrdenadas[0].numero}`;
        } else {
          campoRonda = null;
        }
      }
    } else if (rondaActual) {
      campoRonda = `ronda${rondaActual.numero}`;
    }

     if (!campoRonda || !rosterData[campoRonda]) return;

    const rosterprevio = rosterData[campoRonda];

    setAlineacion({
      top: rosterprevio.top,
      jungle: rosterprevio.jungle,
      mid: rosterprevio.mid,
      bottom: rosterprevio.bottom,
      support: rosterprevio.support,
    });
      setPresupuesto(50); // Restauramos el presupuesto

    const ahora = new Date();
    const rondaEnCurso = rondaActual && ahora >= rondaActual.fechainicio && ahora <= rondaActual.fechafin;

    setRosterConfirmado(!puedeConfirmar || rondaEnCurso);
  }

  obtenerRosterConfirmado();
}, [usuarioId, rondaProxima, rondaActual, rondas, puedeConfirmar]);

  const seleccionarJugador = (jugador) => {
    if (rosterConfirmado && !alineacion[jugador.rol]) return; // Solo se puede reemplazar o eliminar, no seleccionar nuevos jugadores

    const jugadorActual = alineacion[jugador.rol];

    if (jugadorActual && jugadorActual.id === jugador.id) {
      const nuevoRoster = { ...alineacion };
      delete nuevoRoster[jugador.rol];
      setAlineacion(nuevoRoster);
      setPresupuesto(presupuesto + jugador.valor);
      return;
    }

    if (jugadorActual) {
      const nuevoPresupuesto =
        presupuesto + jugadorActual.valor - jugador.valor;
      if (nuevoPresupuesto < 0) return;
      setAlineacion({ ...alineacion, [jugador.rol]: jugador });
      setPresupuesto(nuevoPresupuesto);
      return;
    }

    if (jugador.valor <= presupuesto) {
      setAlineacion({ ...alineacion, [jugador.rol]: jugador });
      setPresupuesto(presupuesto - jugador.valor);
    }
  };

  const confirmarRoster = async () => {
  if (!usuarioId || Object.keys(alineacion).length !== 5 || !puedeConfirmar || !rondaProxima) return;

  const db = getFirestore();
  const rosterRef = doc(db, "rosters", usuarioId);
  const snapshot = await getDoc(rosterRef);

  const campoRonda = `ronda${rondaProxima.numero}`;

  const nuevoRoster = {
    [campoRonda]: {
      top: alineacion["top"],
      jungle: alineacion["jungle"],
      mid: alineacion["mid"],
      bottom: alineacion["bottom"],
      support: alineacion["support"],
    },
    lastupdate: serverTimestamp(),
    userid: usuarioId,
  };

  if (!snapshot.exists()) {
    nuevoRoster.createdat = serverTimestamp();
    await setDoc(rosterRef, nuevoRoster);
  } else {
    await setDoc(rosterRef, nuevoRoster, { merge: true });
  }

  alert("Roster confirmado para " + campoRonda);
  setRosterConfirmado(true);
};


  const filtrarJugadores = () => {
    return jugadores.filter((jugador) => {
      const coincideRol = rolActivo ? jugador.rol === rolActivo : true;
      const coincideBusqueda = jugador.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      return coincideRol && coincideBusqueda;
    });
  };

  return (
    <div className="bg-gray-200">
      <Navbar />
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-center mt-4">
          Mercado de Jugadores (MSI)
        </h2>
        <div className="rounded-sm w-100 bg-gray-900 p-4 text-gray-200 text-xl font-semibold text-center mt-4">
          <p>Presupuesto restante: {presupuesto} 💰</p>
        </div>
      </div>

      <div className="bg-gray-900 mt-4 pt-4">
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "space-around",
            marginBottom: "1rem",
          }}
        >
          {roles.map((rol) => {
            const Icono = iconosRol[rol];
            return (
              <button
                key={rol}
                onClick={() => setRolActivo(rolActivo === rol ? null : rol)}
                style={{
                  backgroundColor:
                    rolActivo === rol ? "#333" : "transparent",
                  color: rolActivo === rol ? "white" : "black",
                  padding: "0.5rem",
                  border:
                    rolActivo === rol
                      ? "2px solid #007bff"
                      : "2px solid transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Icono width={40} height={40} />
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "2rem",
          }}
        >
          {roles.map((rol) => {
            const jugador = alineacion[rol];
            return (
              <div key={rol} style={{ textAlign: "center" }}>
                <img
                  src={jugador?.foto || silueta}
                  alt={jugador?.nombre || "Sin seleccionar"}
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "2px solid #ccc",
                    marginBottom: "0.5rem",
                  }}
                />
                <div style={{ fontSize: "0.85rem", color: "white" }}>
                  {jugador ? jugador.nombre : "Sin seleccionar"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "white" }}>
                  ({rol})
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
    onClick={confirmarRoster}
    disabled={
      Object.keys(alineacion).length !== 5 ||
      !usuarioId ||
      rosterConfirmado ||
      !puedeConfirmar
    }
    style={{
      backgroundColor:
        Object.keys(alineacion).length === 5 &&
        usuarioId &&
        !rosterConfirmado &&
        puedeConfirmar
          ? "#fff"
          : "#ccc",
      color: "#333",
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      border: "none",
      cursor:
        Object.keys(alineacion).length === 5 &&
        usuarioId &&
        !rosterConfirmado &&
        puedeConfirmar
          ? "pointer"
          : "not-allowed",
      marginBottom: "2rem",
    }}
  >
    Confirmar Roster
  </button>
        </div>
      </div>

      <div className="flex mx-4">
      <input
        type="text"
        placeholder="Buscar jugador..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-screen my-4 ring-1 ring-gray-900 rounded-sm text-xl"
      />
      </div>

      <div className="mx-4">
        {filtrarJugadores().map((jugador, index) => {
          const jugadorEnRol = alineacion[jugador.rol];
          const esSeleccionado = jugadorEnRol?.id === jugador.id;
          const rolOcupado = Boolean(jugadorEnRol);
          const puedeReemplazar =
            rolOcupado &&
            !esSeleccionado &&
            presupuesto + jugadorEnRol.valor - jugador.valor >= 0;
          const puedeSeleccionar = !rolOcupado && jugador.valor <= presupuesto;

          let botonTexto = "Seleccionar";
          let botonColor = "#007bff";
          let habilitado = puedeSeleccionar;
          let botonIcono = <FaPlus style={{ marginRight: "5px" }} />;

          if (esSeleccionado) {
            botonTexto = "Eliminar";
            botonColor = "#dc3545";
            habilitado = true;
            botonIcono = <FaTrash style={{ marginRight: "5px" }} />;
          } else if (puedeReemplazar) {
            botonTexto = "Reemplazar";
            botonColor = "#fd7e14";
            habilitado = true;
            botonIcono = <FaExchangeAlt style={{ marginRight: "5px" }} />;
          }

          const sombreado =
            !esSeleccionado && jugador.valor > presupuesto
              ? "#f0f0f0"
              : "white";

          return (
            <div
              key={`${jugador.id}-${jugador.nombre}-${jugador.club}-${index}`}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                borderRadius: "8px",
                backgroundColor: sombreado,
              }}
            >
              <img
                src={jugador.foto}
                alt={jugador.nombre}
                width={50}
                height={50}
              />
              <div style={{ flex: 1 }}>
                <strong>{jugador.nombre}</strong> ({jugador.rol})<br />
                <small>{jugador.club}</small>
              </div>
              <span style={{ fontWeight: "bold" }}>{jugador.valor} 💰</span>
              <button
                onClick={() => seleccionarJugador(jugador)}
                disabled={jugador.valor > presupuesto || !puedeSeleccionar || rosterConfirmado}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: habilitado ? botonColor : "#aaa",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: habilitado ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {botonIcono}
                {botonTexto}
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
