
import React from 'react';

export default function SeccionAlineacion({ roster }) {
  const roles = ['top', 'jungle', 'mid', 'bottom', 'support'];
  

  return (
    <section className="justify-center items-center mb-4 md:h-[54vh] md:w-[80vw] bg-gray-900 p-4 rounded-xl flex flex-col">
      <h2 className="text-gray-200 text-center text-xl font-semibold mb-2">Alineación</h2>
      <div className='mt-4 grid grid-cols-5 gap-x-4'>
        {roster ? (
          roles.map((rol) => {
            const jugador = roster[rol];
            console.log(jugador)
            return (
              <div key={rol} className='flex flex-col justify-center md:w-50 lg:w-70 h-32 mt-2 p-4'>
                <p className='text-center text-xl text-gray-200 font-semibold'>{rol}</p>
                {jugador ? (
                  <>
                  <div className='mt-4 flex flex-col gap-4 items-center'>
                    <img src={jugador.foto} alt={jugador.nombre} width={100}
                    style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "2px solid #ccc",
                    marginBottom: "0.5rem",
                  }} />
                    <div className='flex text-sm font-semibold text-gray-200'>
                    {jugador.nombre} ({jugador.club})
                    </div>
                  </div>
                  </>
                ) : (
                  'No asignado'
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
