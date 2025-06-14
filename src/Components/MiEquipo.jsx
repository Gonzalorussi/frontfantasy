import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Escudo1 from "../assets/escudos/escudo1.svg?react";
import Escudo2 from "../assets/escudos/escudo2.svg?react";
import Escudo3 from "../assets/escudos/escudo3.svg?react";
import Escudo4 from "../assets/escudos/escudo4.svg?react";
import Escudo5 from "../assets/escudos/escudo5.svg?react";
import Escudo6 from "../assets/escudos/escudo6.svg?react";
import Escudo7 from "../assets/escudos/escudo7.svg?react";
import Escudo8 from "../assets/escudos/escudo8.svg?react";
import Escudo9 from "../assets/escudos/escudo9.svg?react";
import Escudo10 from "../assets/escudos/escudo10.svg?react";
import Escudo11 from "../assets/escudos/escudo11.svg?react";
import Relleno1 from "../assets/rellenos/relleno1.svg?react";
import Relleno2 from "../assets/rellenos/relleno2.svg?react";
import Relleno3 from "../assets/rellenos/relleno3.svg?react";
import Relleno4 from "../assets/rellenos/relleno4.svg?react";
import Relleno5 from "../assets/rellenos/relleno5.svg?react";
import Relleno6 from "../assets/rellenos/relleno6.svg?react";
import Relleno7 from "../assets/rellenos/relleno7.svg?react";
import Relleno8 from "../assets/rellenos/relleno8.svg?react";
import Relleno9 from "../assets/rellenos/relleno9.svg?react";
import Relleno10 from "../assets/rellenos/relleno10.svg?react";
import Relleno11 from "../assets/rellenos/relleno11.svg?react";
import Relleno12 from "../assets/rellenos/relleno12.svg?react";
import VistaPreviaEscudo from "../Components/VistaPreviaEscudo";
import { Routes, Route, useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MiEquipo({ user, onTeamCreated }) {
  const [teamName, setTeamName] = useState("");
  const [selectedShield, setSelectedShield] = useState(null);
  const [selectedFill, setSelectedFill] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const navigate = useNavigate();

  const shields = [
    { id: "escudo1", Componente: Escudo1 },
    { id: "escudo2", Componente: Escudo2 },
    { id: "escudo3", Componente: Escudo3 },
    { id: "escudo4", Componente: Escudo4 },
    { id: "escudo5", Componente: Escudo5 },
    { id: "escudo6", Componente: Escudo6 },
    { id: "escudo7", Componente: Escudo7 },
    { id: "escudo8", Componente: Escudo8 },
    { id: "escudo9", Componente: Escudo9 },
    { id: "escudo10", Componente: Escudo10 },
    { id: "escudo11", Componente: Escudo11 },
  ];

  const rellenos = [
    { id: "relleno1", Componente: Relleno1 },
    { id: "relleno2", Componente: Relleno2 },
    { id: "relleno3", Componente: Relleno3 },
    { id: "relleno4", Componente: Relleno4 },
    { id: "relleno5", Componente: Relleno5 },
    { id: "relleno6", Componente: Relleno6 },
    { id: "relleno7", Componente: Relleno7 },
    { id: "relleno8", Componente: Relleno8 },
    { id: "relleno9", Componente: Relleno9 },
    { id: "relleno10", Componente: Relleno10 },
    { id: "relleno11", Componente: Relleno11 },
    { id: "relleno12", Componente: Relleno12 },
  ];

  const colores = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#f1c40f",
    "#9b59b6",
    "#1abc9c",
  ];

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
    <main className="bg-gray-200">
      <Navbar />
      <h2 className="text-center text-blue-900 font-semibold text-2xl my-4">
        Crear tu equipo
      </h2>

      <div className="p-4 flex flex-col">
        <h3 className="text-gray-900 text-2xl font-semibold mb-4">
          Elegí un escudo:
        </h3>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {shields.map(({ id, Componente }) => (
            <button
              key={id}
              onClick={() => setSelectedShield(id)}
              className={`p-2 border-2 rounded ${
                selectedShield === id ? "border-blue-500" : ""
              }`}
            >
              <Componente
                className="w-32 h-32"
                style={{ color: selectedShield === id ? primaryColor : "#333" }}
              />
            </button>
          ))}
        </div>

        <h3 className="text-gray-900 text-2xl font-semibold mb-4">
          Elegí un ícono:
        </h3>
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {rellenos.map(({ id, Componente }) => (
            <button
              key={id}
              onClick={() => setSelectedFill(id)}
              className={`p-2 border-2 rounded ${
                selectedFill === id ? "border-blue-500" : ""
              }`}
            >
              <Componente
                className="w-32 h-32"
                style={{ color: selectedFill === id ? secondaryColor : "#333" }}
              />
            </button>
          ))}
        </div>
        <h3 className="text-2xl font-semibold mb-4">
          Elegí colores del escudo:
        </h3>
        <div className="flex justify-center gap-20 mb-4">
          <div>
            <p className="text-gray-900 text-xl font-semibold mb-4">
              Color principal:
            </p>
            <div className="flex gap-2">
              {colores.map((color) => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  className={`w-8 h-8 rounded-full`}
                  style={{
                    backgroundColor: color,
                    border: primaryColor === color ? "3px solid black" : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-900 text-xl font-semibold mb-4">
              Color secundario:
            </p>
            <div className="flex gap-2">
              {colores.map((color) => (
                <button
                  key={color}
                  onClick={() => setSecondaryColor(color)}
                  className={`w-8 h-8 rounded-full`}
                  style={{
                    backgroundColor: color,
                    border:
                      secondaryColor === color ? "3px solid black" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      {selectedShield && selectedFill && (
        <div className="mt-6">
          <h3 className="text-gray-900 text-2xl font-semibold mb-4">
            Vista previa del escudo:
          </h3>
          <div className="flex justify-center w-40 h-40 md:w-24 md:h-24 scale-75">
          <VistaPreviaEscudo
            escudoId={selectedShield}
            rellenoId={selectedFill}
            colorPrimario={primaryColor}
            colorSecundario={secondaryColor}
            escudoSize={80}
            rellenoSize={70}
          />
          </div>
          <div className="flex flex-col justify-center items-center">
            <input
              type="text"
              placeholder="Nombre del equipo"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="text-xl font-semibold border-2 p-2 mb-4"
            />
            <button
              className="my-4 cursor-pointer bg-red-800 hover:bg-red-900 transition p-2 rounded-lg font-semibold text-md text-gray-200"
              onClick={handleConfirmarEquipo}
            >
              Confirmar equipo
            </button>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </main>
  );
}
export default MiEquipo;
