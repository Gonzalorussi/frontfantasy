import React from 'react';
import top from "../assets/iconos/top.svg?react";
import jungle from "../assets/iconos/jungle.svg?react";
import mid from "../assets/iconos/mid.svg?react";
import bottom from "../assets/iconos/bottom.svg?react";
import support from "../assets/iconos/support.svg?react";

const roles = ['top', 'jungle', 'mid', 'bottom', 'support'];
 const iconosRol = {
    top: top,
    jungle: jungle,
    mid: mid,
    bottom: bottom,
    support: support,
  };

export default function SeccionAlineacion({ roster }) {
  return (
    <section className="justify-center items-center mb-4 md:h-[54vh] md:w-[80vw] bg-gray-900 p-4 rounded-xl flex flex-col">
      
      <div className="mt-4 grid grid-cols-5 gap-x-4">
        {Object.keys(roster || {}).length > 0 ? (
          roles.map((rol) => {
            const jugador = roster?.[rol] ?? null;
            const Icono = iconosRol[rol];
            return (
              <div key={rol} className="flex flex-col justify-center items-center md:w-50 lg:w-70 h-32 mt-2 p-4">
                <div className="flex justify-center mb-2">
                  <Icono width={40} height={40} />
                </div>

                <p className="text-center text-xl text-gray-200 font-semibold">{rol}</p>
                
                {jugador ? (
                    <div className="mt-4 flex flex-col gap-4 items-center">
                      <img
                        src={jugador.foto}
                        alt={jugador.nombre}
                        width={100}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "2px solid #ccc",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <div className="flex text-sm font-semibold text-gray-200">
                        {jugador.nombre} ({jugador.club})
                      </div>
                    </div>
                ) : (
                  "No asignado"
                )}
              </div>
            );
          })
        ) : (
          <p>⚠️ Aún no seleccionaste tu alineación. Ve al <strong>Mercado</strong> para armar tu equipo.</p>
        )}
      </div>
    </section>
  );
}
