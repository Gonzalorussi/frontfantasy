import React, { useState, useEffect, } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Escudos from "../utils/escudos";
import Rellenos from "../utils/rellenos";
import VistaPreviaEscudo from "../Components/VistaPreviaEscudo";
import { Routes, Route, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const shields = Object.entries(Escudos).map(([id, Componente]) => ({
  id,
  Componente,
}));

const fills = Object.entries(Rellenos).map(([id, Componente]) => ({
  id,
  Componente,
}));

function MiEquipo({ user, onTeamCreated }) {
  const [teamName, setTeamName] = useState("");
  const [selectedShield, setSelectedShield] = useState(null);
  const [selectedFill, setSelectedFill] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const navigate = useNavigate();

  const escudoKey = selectedShield || 'escudo1';
  const rellenoKey = selectedFill || 'relleno1';

  const colores = [
    "#000000",
    "#FFFFFF",
    "#e74c3c",
    "#F39C12",
    "#1ABC9C",
    "#16A085",
    "#2980B9",
    "#34495E",
    "#8E44AD",
    "#E91E63",
    "#8D6E63",
    "#3498db",
    "#2ecc71",
    "#f1c40f",
    "#9b59b6",
  ];

  const VISIBLE_ITEMS = 6;  // cantidad de escudos visibles
  const ITEMS_TO_SCROLL = 3;  // cuántos avanza por click
  const ITEM_WIDTH = 128 + 16; // ancho estimado de cada item (incluyendo gap + padding)
  const GAP = 16; 
  const CONTAINER_WIDTH = ITEM_WIDTH * VISIBLE_ITEMS;

  const repeatedShields = Array(10).fill(shields).flat();
  const repeatedFills = Array(10).fill(fills).flat();
  const totalItems = repeatedShields.length;
  const middleIndex = Math.floor(totalItems / 2);

  
  const [shieldScrollIndex, setShieldScrollIndex] = useState(middleIndex);
  const [fillScrollIndex, setFillScrollIndex] = useState(middleIndex);

  const handleNextShields = () => {
    setShieldScrollIndex(prev => prev + ITEMS_TO_SCROLL);
  };

  const handlePrevShields = () => {
    setShieldScrollIndex(prev => prev - ITEMS_TO_SCROLL);
  };

  const handleNextFills = () => {
  setFillScrollIndex(prev => prev + ITEMS_TO_SCROLL);
};
const handlePrevFills = () => {
  setFillScrollIndex(prev => prev - ITEMS_TO_SCROLL);
};

  useEffect(() => {
  if (shieldScrollIndex >= totalItems - VISIBLE_ITEMS) {
    setTimeout(() => {
      setShieldScrollIndex(middleIndex);
    }, 500);
  }
}, [shieldScrollIndex, totalItems, middleIndex]);

useEffect(() => {
  if (fillScrollIndex >= totalItems - VISIBLE_ITEMS) {
    setTimeout(() => {
      setFillScrollIndex(middleIndex);
    }, 500);
  }
}, [fillScrollIndex, totalItems, middleIndex]);

  const handleConfirmarEquipo = async () => {
    // Validación básica
    if (
      !teamName ||
      !selectedShield ||
      !selectedFill ||
      !primaryColor ||
      !secondaryColor
    ) {
      alert("Completa todos los campos antes de confirmar tu equipo");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      alert("Usuario no autenticado");
      return;
    }

    try {
      // Referencia al documento de equipo
      const equipoRef = doc(db, "equipos", uid);

      await setDoc(equipoRef, {
        nombreequipo: teamName,
        escudoid: selectedShield,
        rellenoid: selectedFill,
        colorprimario: primaryColor,
        colorsecundario: secondaryColor,
        usuarioid: uid,
        creadoen: new Date(),
      });

      // ✅ Solo redirigimos si se guardó bien
      navigate("/mercado");
    } catch (error) {
      console.error("Error al guardar el equipo:", error.code, error.message);
      alert("Ocurrió un error al guardar el equipo. Intentalo nuevamente.");
    }
  };

  return (
  <main className="bg-gray-900 min-h-screen">
    <Navbar />
    <h2 className="text-center text-gray-200 font-semibold text-2xl my-4">
      Dale identidad a tu equipo
    </h2>

    <div className="p-4 flex flex-col max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row justify-center items-center mb-10 gap-10">

  <div className="flex items-center gap-4">
    <label className="text-gray-200 text-xl font-semibold">Nombre de tu equipo:</label>
    <input
      type="text"
      placeholder="Nombre del equipo"
      value={teamName}
      onChange={(e) => setTeamName(e.target.value)}
      className="text-xl font-semibold border-2 p-2 rounded-lg w-64 bg-gray-200 text-black"
    />
  </div>

  <div 
    className="flex justify-center items-center w-40 h-40"
  >
    <VistaPreviaEscudo
      escudoId={escudoKey}
      rellenoId={rellenoKey}
      colorPrimario={selectedShield ? primaryColor : '#FFFFFF'}
      colorSecundario={selectedFill ? secondaryColor : '#000000'}
      escudoSize={80}
      rellenoSize={70}
    />
  </div>

</div>

      <h3 className="text-gray-200 text-2xl font-semibold mb-4 text-center">Elegí un escudo:</h3>
      <div className="relative flex items-center justify-center mb-4">
        <button onClick={handlePrevShields} className="absolute left-0 z-10 text-3xl text-white p-2">
          <FiChevronLeft />
        </button>

        <div className="overflow-hidden" style={{ width: `${CONTAINER_WIDTH}px` }}>
          <div className="flex gap-4 transition-transform duration-500 ease-in-out snap-x"
            style={{ transform: `translateX(-${shieldScrollIndex * (ITEM_WIDTH + GAP)}px)` }}>
            {repeatedShields.map(({ id, Componente }, index) => (
              <button key={`${id}-${index}`} onClick={() => setSelectedShield(id)}
                className={`p-2 border-2 rounded snap-start ${selectedShield === id ? "border-blue-500" : ""}`}
                style={{ width: `${ITEM_WIDTH}px` }}>
                <Componente className="w-32 h-32"
                  style={{ color: selectedShield === id ? primaryColor : "#333" }} />
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleNextShields} className="absolute right-0 z-10 text-3xl text-white p-2">
          <FiChevronRight />
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-10">
        {colores.map((color) => (
          <button key={color} onClick={() => setPrimaryColor(color)}
            className="w-10 h-10 rounded-full"
            style={{
              backgroundColor: color,
              border: primaryColor === color
                ? (color === '#FFFFFF' ? '3px solid black' : '3px solid white')
                : 'none'
            }}
          />
        ))}
      </div>

      <h3 className="text-gray-200 text-2xl font-semibold mb-4 text-center">Elegí un ícono:</h3>
      <div className="relative flex items-center justify-center mb-4">
        <button onClick={handlePrevFills} className="absolute left-0 z-10 text-3xl text-white p-2">
          <FiChevronLeft />
        </button>

        <div className="overflow-hidden" style={{ width: `${CONTAINER_WIDTH}px` }}>
          <div className="flex gap-4 transition-transform duration-500 ease-in-out snap-x"
            style={{ transform: `translateX(-${fillScrollIndex * (ITEM_WIDTH + GAP)}px)` }}>
            {repeatedFills.map(({ id, Componente }, index) => (
              <button key={`${id}-${index}`} onClick={() => setSelectedFill(id)}
                className={`p-2 border-2 rounded snap-start ${selectedFill === id ? "border-blue-500" : ""}`}
                style={{ width: `${ITEM_WIDTH}px` }}>
                <Componente className="w-32 h-32"
                  style={{ color: selectedFill === id ? secondaryColor : "#333" }} />
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleNextFills} className="absolute right-0 z-10 text-3xl text-white p-2">
          <FiChevronRight />
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-10">
        {colores.map((color) => (
          <button key={color} onClick={() => setSecondaryColor(color)}
            className="w-10 h-10 rounded-full"
            style={{
              backgroundColor: color,
              border: secondaryColor === color
                ? (color === '#FFFFFF' ? '3px solid black' : '3px solid white')
                : 'none'
            }}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <button
          className="my-4 cursor-pointer bg-red-800 hover:bg-red-900 transition p-2 rounded-lg font-semibold text-md text-gray-200"
          onClick={handleConfirmarEquipo}>
          Confirmar equipo
        </button>
      </div>

    </div>
    <Footer />
  </main>
);
}
export default MiEquipo;
