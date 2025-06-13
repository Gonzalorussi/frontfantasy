import React from 'react';
import VistaPreviaEscudo from './VistaPreviaEscudo';

export default function SeccionEquipo({ team }) {
  if (!team) return null;
  
  const { escudoid, rellenoid, colorprimario, colorsecundario, nombreequipo } = team;
  console.log(team)

  return (
    <section className="h-60 w-60 md:h-[54vh] md:w-[30vw] bg-gray-900 justify-center rounded-xl flex flex-col items-center p-4">
      <h2 className="text-center text-gray-200 text-xl font-semibold mb-4">{nombreequipo}</h2>
      <VistaPreviaEscudo
        escudoId={escudoid}
        rellenoId={rellenoid}
        colorPrimario={colorprimario}
        colorSecundario={colorsecundario}
      />
    </section>
  );
}
