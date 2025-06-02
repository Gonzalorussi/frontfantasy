import React from 'react';
import VistaPreviaEscudo from './VistaPreviaEscudo';

export default function SeccionEquipo({ team }) {
  if (!team) return null;
  
  const { escudoid, rellenoid, colorprimario, colorsecundario, nombreequipo } = team;
  console.log(team)

  return (
    <section className="bg-blue-900 p-20 rounded-xl flex flex-col m-4">
      <h2 className="text-gray-200 text-xl font-semibold mb-2">Mi equipo: {nombreequipo}</h2>
      <VistaPreviaEscudo
        escudoId={escudoid}
        rellenoId={rellenoid}
        colorPrimario={colorprimario}
        colorSecundario={colorsecundario}
      />
    </section>
  );
}
