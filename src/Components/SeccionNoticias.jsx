// src/Components/SeccionNoticias.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SeccionNoticias() {
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    axios.get('https://esports-api.lolesports.com/persisted/gw/getLeagues', {
      headers: {
        'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z',
        'hl': 'en-US'
      }
    }).then(res => {
      const data = res.data.data.articles;
      setNoticias(data.slice(0, 4)); // 4 noticias más recientes
    }).catch(err => {
      console.error('Error al obtener noticias:', err);
    });
  }, []);

  return (
    <section>
      <h2>Noticias</h2>
      {noticias.length > 0 ? (
        noticias.map((noticia, i) => (
          <article key={i} style={{ marginBottom: '1rem' }}>
            <a href={noticia.url} target="_blank" rel="noopener noreferrer">
              <h3>{noticia.title}</h3>
            </a>
            <p>{noticia.description}</p>
          </article>
        ))
      ) : (
        <p>Cargando noticias...</p>
      )}
    </section>
  );
}
