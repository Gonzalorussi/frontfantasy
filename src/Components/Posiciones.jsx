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
      const teamsList = teamsSnapshot.docs.map(doc => {
        const teamData = doc.data();

       // Acceder al campo 'nombreequipo' y 'usuarioid'
        const teamName = teamData.nombreequipo || 'Nombre no disponible';  // Usamos un valor por defecto si no tiene nombre
        const ownerName = teamData.usuarioid || '—';  // Asignamos un valor por defecto si no tiene propietario

        // Verifica la estructura con un console.log
        console.log(teamData); // Esto te permitirá ver todos los campos del equipo

        return { ...teamData, id: doc.id, name: teamName, ownerName };
      });
      // Obtener puntaje para cada equipo
      const teamsWithScores = [];
      for (const team of teamsList) {
        // Verificar si el equipo tiene un puntaje guardado en Firestore
        let puntaje = 0;  // Valor por defecto en caso de no tener puntaje
        try {
          puntaje = await calcularPuntajeEquipo(team.id);  // Llamamos la función que calcula el puntaje
        } catch (error) {
          console.log(`No se pudo calcular el puntaje para el equipo ${team.id}`);
        }

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
    <div>
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