
import React from 'react';

export default function SeccionAlineacion({ roster }) {
  const roles = ['TOP', 'JUNGLA', 'MID', 'ADC', 'SUPPORT'];

  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2>Mi Alineación</h2>
      <div>
        {roster ? (
          roles.map((rol) => {
            const jugador = roster[rol.toLowerCase()];
            return (
              <div key={rol} style={{ marginBottom: '0.5rem' }}>
                <strong>{rol}:</strong> {jugador?.nombre || 'No asignado'}
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
