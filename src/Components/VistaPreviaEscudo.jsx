// src/components/VistaPreviaEscudo.jsx
import React from 'react';
import escudos from '../utils/escudos';
import rellenos from '../utils/rellenos';

export default function VistaPreviaEscudo({ escudoId, rellenoId, colorPrimario, colorSecundario }) {
  if (!escudoId || !rellenoId) return null;

  const EscudoComponent = escudos[escudoId];
  const RellenoComponent = rellenos[rellenoId];

  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
      <RellenoComponent
        className="w-20 h-20 md:w-40 md:h-40 absolute z-20"
        style={{ color: colorSecundario }}
      />
      <EscudoComponent
        className="w-20 h-20 md:w-40 md:h-40 absolute"
        style={{ color: colorPrimario, stroke: colorSecundario }}
      />
    </div>
  );
}
