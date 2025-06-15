import React from "react";
import iconosRol from "../utils/iconosRol";

const TopRosterCard = ({ jugador }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
      <img
        src={iconosRol[jugador.rol]}
        alt={jugador.rol}
        className="w-12 h-12 mb-2"
      />
      <img
        src={jugador.foto}
        alt={jugador.nombre}
        className="w-24 h-24 rounded-full mb-2 object-cover border-2 border-yellow-400"
      />
      <h3 className="text-lg font-semibold">{jugador.nombre}</h3>
      <p className="text-sm text-gray-400">{jugador.club}</p>
      <p className="text-yellow-400 font-bold text-xl mt-2">{jugador.puntaje.toFixed(2)} pts</p>
    </div>
  );
};

export default TopRosterCard;