
import React from 'react';

export default function SeccionAlineacion({ roster }) {
  const roles = ['TOP', 'JUNGLE', 'MID', 'BOTTON', 'SUPPORT'];

  return (
    <section className="justify-center items-center mb-4 md:h-[54vh] md:w-[80vw] bg-gray-900 p-4 rounded-xl flex flex-col">
      <h2 className="text-gray-200 text-center text-xl font-semibold mb-2">Alineación</h2>
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-x-4'>
        {roster ? (
          roles.map((rol) => {
            const jugador = roster[rol.toLowerCase()];
            console.log(jugador)
            return (
              <div key={rol} className='flex flex-col justify-center md:w-50 lg:w-70 h-32 bg-gray-400 rounded-sm mt-2 p-4'>
                <p className='text-center text-xl text-gray-900 font-semibold'>{rol}</p>
                {jugador ? (
                  <>
                  <div className='grid grid-cols-2 gap-4 items-center'>
                    <img src={jugador.foto} alt={jugador.nombre} width={100} className='bg-gray-900 rounded-xl border-2 border-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300 object-cover' />
                    <div className='flex text-sm font-semibold text-gray-900'>
                    {jugador.nombre} ({jugador.equipo})
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
