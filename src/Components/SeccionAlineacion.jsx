
import React from 'react';

export default function SeccionAlineacion({ roster }) {
  const roles = ['TOP', 'JUNGLE', 'MID', 'BOTTON', 'SUPPORT'];

  return (
    <section className="bg-red-900 p-20 rounded-xl fflex flex-col m-4">
      <h2 className="text-gray-200 text-xl font-semibold mb-2">Mi alineación:</h2>
      <div>
        {roster ? (
          roles.map((rol) => {
            const jugador = roster[rol.toLowerCase()];
            console.log(jugador)
            return (
              <div key={rol} style={{ marginBottom: '0.5rem' }}>
                <strong>{rol}:</strong> {''}
                {jugador ? (
                  <>
                  <img src={jugador.foto} alt={jugador.nombre} width={30} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  {jugador.nombre} ({jugador.equipo})
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
