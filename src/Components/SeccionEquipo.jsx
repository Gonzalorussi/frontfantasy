import React from "react";
import VistaPreviaEscudo from "./VistaPreviaEscudo";

export default function SeccionEquipo({ team }) {
  if (!team) return null;

  const { escudoid, rellenoid, colorprimario, colorsecundario, nombreequipo } =
    team;

  return (
    <section className="h-[24vh] w-[340px] md:h-[54vh] md:w-[220px] bg-gray-900 justify-center rounded-xl flex flex-col items-center p-4 shadow-lg">
      <h2 className="text-center text-gray-200 text-lg font-semibold mb-4">
        {nombreequipo}
      </h2>
      <div style={{ width: "100px", height: "100px" }}>
        <VistaPreviaEscudo
          escudoId={escudoid}
          rellenoId={rellenoid}
          colorPrimario={colorprimario}
          colorSecundario={colorsecundario}
        />
      </div>
    </section>
  );
}
