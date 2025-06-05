import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import { calcularPuntajeEquipo } from '../utils/puntajes';  // Importamos la función

function Posiciones() {
  const [teams, setTeams] = useState([]);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, 'equipos'));
        const teamsList = teamsSnapshot.docs.map(doc => doc.data());
        
        // Obtener puntaje para cada equipo
        const teamsWithScores = [];
        for (const team of teamsList) {
          const puntaje = await calcularPuntajeEquipo(team.id);  // Llamamos la función que calcula el puntaje
          teamsWithScores.push({ ...team, puntaje });
        }

        // Ordenamos por puntos descendente
        teamsWithScores.sort((a, b) => b.puntaje - a.puntaje);

        setTeams(teamsWithScores);
      } catch (error) {
        console.error('Error al obtener los equipos:', error);
      }
    };

    fetchTeams();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <Navbar />
      <h2 style={{ marginBottom: '1rem' }}>🏆 RANKING</h2>
    
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>#</th>
              <th style={thTdStyle}>Escudo</th>
              <th style={thTdStyle}>Equipo</th>
              <th style={thTdStyle}>Usuario</th>
              <th style={thTdStyle}>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={index} style={{ textAlign: 'center' }}>
                <td style={thTdStyle}>{index + 1}</td>
                <td style={thTdStyle}>
                  <img src={team.shield} alt="escudo" width={40} height={40} />
                </td>
                <td style={thTdStyle}>{team.name}</td>
                <td style={thTdStyle}>{team.ownerName || '—'}</td>
                <td style={thTdStyle}>{team.puntaje}</td> {/* Mostrar puntaje */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
}

const tableStyle = {
  width: '100%',
  minWidth: '600px',
  borderCollapse: 'collapse',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
};

const thTdStyle = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  backgroundColor: '#fff',
};

export default Posiciones;