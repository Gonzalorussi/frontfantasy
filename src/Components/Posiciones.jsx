import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import { calcularPuntajeEquipo } from '../utils/puntajes';  // Importamos la función
import VistaPreviaEscudo from './VistaPreviaEscudo';  // Asegúrate de importar el componente

function Posiciones() {
  const [teams, setTeams] = useState([]);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, 'equipos'));
        const teamsList = [];

        // Iteramos sobre cada equipo
        for (const teamDoc of teamsSnapshot.docs) {
          const teamData = teamDoc.data();

          // Obtener nombre del equipo desde la colección 'equipos'
          const teamName = teamData.nombreequipo || 'Nombre no disponible';

          // Obtener 'usuarioid' para buscar el nombre del propietario en la colección 'usuarios'
          const userId = teamData.usuarioid;
          let ownerName = '—'; // Valor por defecto para el propietario

          // Si existe 'usuarioid', buscar el nombre del propietario en la colección 'usuarios'
          if (userId) {
            const userRef = doc(db, 'usuarios', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              // Extraemos el nombre del propietario (usuario)
              ownerName = userSnap.data().nombre || 'Nombre no disponible';
            }
          }

          // Agregar el equipo con el nombre del equipo y del propietario al arreglo
          teamsList.push({
            ...teamData,
            id: teamDoc.id, // ID del equipo
            name: teamName,  // Nombre del equipo
            ownerName,       // Nombre del propietario (usuario)
          });
        }

        // Obtener puntaje para cada equipo
        const teamsWithScores = [];
        for (const team of teamsList) {
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
      <h2 className='my-4 text-center font-semibold text-2xl'>🏆 RANKING</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle} className='p-1 font-semibold text-sm md:text-xl'>#</th>
              <th style={thTdStyle} className='p-1 font-semibold text-sm md:text-xl'>Escudo</th>
              <th style={thTdStyle} className='p-1 font-semibold text-sm md:text-xl'>Equipo</th>
              <th style={thTdStyle} className='p-1 font-semibold text-sm md:text-xl'>Usuario</th>
              <th style={thTdStyle} className='p-1 font-semibold text-sm md:text-xl'>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={index} style={{ textAlign: 'center' }}>
                <td style={thTdStyle}>{index + 1}</td>

                {/* Aquí renderizamos el componente VistaPreviaEscudo y le pasamos las props correspondientes */}
                <td style={thTdStyle} >
                  <VistaPreviaEscudo
                    escudoId={team.escudoid}
                    rellenoId={team.rellenoid}
                    colorPrimario={team.colorprimario}
                    colorSecundario={team.colorsecundario}
                    className={'flex justify-center items-center'}
                  />
                </td>

                <td style={thTdStyle} className='p-1'>{team.name}</td> {/* Nombre del equipo */}
                <td style={thTdStyle} className='p-1'>{team.ownerName}</td> {/* Nombre del propietario */}
                <td style={thTdStyle} className='p-1'>{team.puntaje}</td> {/* Mostrar puntaje */}
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
  borderCollapse: 'collapse',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
};

const thTdStyle = {
  border: '1px solid #ddd',
  backgroundColor: '#fff',
};

export default Posiciones;
