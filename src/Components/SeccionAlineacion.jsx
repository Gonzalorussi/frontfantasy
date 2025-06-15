import React from "react";
import silueta from '../assets/img/silueta.webp'
import top from "../assets/iconos/top.svg?react";
import jungle from "../assets/iconos/jungle.svg?react";
import mid from "../assets/iconos/mid.svg?react";
import bottom from "../assets/iconos/bottom.svg?react";
import support from "../assets/iconos/support.svg?react";

const roles = ["top", "jungle", "mid", "bottom", "support"];
const iconosRol = {
  top: top,
  jungle: jungle,
  mid: mid,
  bottom: bottom,
  support: support,
};

export default function SeccionAlineacion({ roster, size = "normal", mostrarAviso = true  }) {
  const isLarge = size === "large";

  const noRoster =
    !roster ||
    Object.keys(roster).length === 0 ||
    roles.every((rol) => !roster[rol]);

  return (
    <section
      className={`flex border-1 flex-col justify-center items-center min-h-[300px] bg-gray-900 p-6 rounded-2xl w-full ${
        isLarge ? "max-w-[900px]" : "max-w-[700px]"
      } shadow-lg`}
    >
      <div
        className={`mt-4 grid grid-cols-5 ${
          isLarge ? "gap-x-6 gap-y-8" : "gap-x-4 gap-y-6"
        }`}
      >
        {roles.map((rol) => {
          const jugador = roster?.[rol] ?? null;
          const Icono = iconosRol[rol];
          return (
            <div
              key={rol}
              className={`flex flex-col justify-center items-center ${
                isLarge ? "p-4 w-[150px] h-[240px]" : "p-2 w-[120px] h-[200px]"
              } bg-gray-800 rounded-xl shadow-lg`}
            >
              <div className="flex justify-center mb-3">
                <Icono width={isLarge ? 50 : 40} height={isLarge ? 50 : 40} />
              </div>
              <p className="text-center text-lg text-gray-200 font-semibold mb-2 capitalize">
                {rol}
              </p>
              <div className="flex flex-col gap-2 items-center">
                <img
                  src={jugador?.foto || silueta}
                  alt={jugador?.nombre || "No asignado"}
                  style={{
                    width: isLarge ? "80px" : "70px",
                    height: isLarge ? "80px" : "70px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "2px solid #ccc",
                  }}
                />
                <div
                  className={`text-sm font-semibold text-gray-200 text-center w-[100px] truncate mt-2`}
                >
                  {jugador
                    ? `${jugador.nombre} (${jugador.club})`
                    : "No asignado"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {noRoster && mostrarAviso &&(
        <div className="mt-6 text-center text-yellow-400 font-semibold text-lg max-w-[500px]">
          ⚠️ Para seleccionar tu alineación dirigite al{" "}
          <strong>Mercado</strong>.
        </div>
      )}
    </section>
  );
}
