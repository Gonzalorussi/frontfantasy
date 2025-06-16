  // src/components/VistaPreviaEscudo.jsx
  import React from 'react';
  import escudos from '../utils/escudos';
  import rellenos from '../utils/rellenos';

  export default function VistaPreviaEscudo({ escudoId, rellenoId, colorPrimario, colorSecundario}) {
    if (!escudoId || !rellenoId) return null;

    const EscudoComponent = escudos[escudoId];
    const RellenoComponent = rellenos[rellenoId];

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <RellenoComponent
          className="absolute z-20 w-full h-full"
          style={{ color: colorSecundario,
            transform: 'scale(0.75)',
            transformOrigin: 'center center'
          }}
        />
        <EscudoComponent
          className="absolute  w-full h-full"
          style={{ color: colorPrimario, stroke: colorSecundario,
            transform: 'scale(1.75)',
            transformOrigin: 'center center'
          }}
        />
      </div>
    );
  }