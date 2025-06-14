import React from "react";
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

export default function SeccionAlineacion({ roster, size = "normal" }) {
  const isLarge = size === "large";
  return (
    <section
      className={`flex border-1 flex-col justify-center items-center min-h-[300px] bg-gray-900 p-6 rounded-2xl w-full ${
        isLarge ? "max-w-[900px]" : "max-w-[700px]"
      } shadow-lg`}
    >
      <div
        className={`mt-4 grid ${
          Object.keys(roster || {}).length > 0 ? "grid-cols-5" : "grid-cols-1"
        } ${isLarge ? "gap-x-6 gap-y-8" : "gap-x-4 gap-y-6"}`}
      >
        {Object.keys(roster || {}).length > 0 ? (
          roles.map((rol) => {
            const jugador = roster?.[rol] ?? null;
            const Icono = iconosRol[rol];
            return (
              <div
                key={rol}
                className={`flex flex-col justify-center items-center ${
                  isLarge
                    ? "p-4 w-[150px] h-[240px]"
                    : "p-2 w-[120px] h-[200px]"
                } bg-gray-800 rounded-xl shadow-lg`}
              >
                <div className="flex justify-center mb-3">
                  <Icono width={isLarge ? 50 : 40} height={isLarge ? 50 : 40} />
                </div>
                <p className="text-center text-lg text-gray-200 font-semibold mb-2 capitalize">
                  {rol}
                </p>
                {jugador ? (
                  <div className="flex flex-col gap-2 items-center">
                    <img
                      src={jugador.foto}
                      alt={jugador.nombre}
                      style={{
                        width: isLarge ? "80px" : "70px",
                        height: isLarge ? "80px" : "70px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "2px solid #ccc",
                      }}
                    />
                    <div className="text-sm font-semibold text-gray-200 text-center w-[100px] truncate">
                      {jugador.nombre} ({jugador.club})
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm mt-6">No asignado</div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex text-center">
            <p>
              ⚠️ Aún no seleccionaste tu alineación. Ve al{" "}
              <strong>Mercado</strong> para armar tu equipo.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
