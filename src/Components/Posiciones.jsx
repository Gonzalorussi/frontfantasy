import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import { calcularPuntajeEquipo } from '../utils/puntajes';
import VistaPreviaEscudo from './VistaPreviaEscudo'; 

function Posiciones() {
  const [teams, setTeams] = useState([]);
  
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, 'equipos'));
        const teamsList = [];

        for (const teamDoc of teamsSnapshot.docs) {
          const teamData = teamDoc.data();

          const teamName = teamData.nombreequipo || 'Nombre no disponible';

          const userId = teamData.usuarioid;
          let ownerName = '—';

          if (userId) {
            const userRef = doc(db, 'usuarios', teamData.usuarioid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              ownerName = userSnap.data().nombre || 'Nombre no disponible';
            }
          }

          teamsList.push({
            id: teamDoc.id,
            name: teamName,
            ownerName,
            totalpuntos: teamData.totalpuntos || 0,
            escudoid: teamData.escudoid,
            rellenoid: teamData.rellenoid,
            colorprimario: teamData.colorprimario,
            colorsecundario: teamData.colorsecundario,       
          });
        }

         teamsList.sort((a, b) => b.totalpuntos - a.totalpuntos);

         setTeams(teamsList);
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
              <tr key={team.id} style={{ textAlign: 'center' }}>
                <td style={thTdStyle}>{index + 1}</td>

                <td style={thTdStyle} >
                  <VistaPreviaEscudo
                    escudoId={team.escudoid}
                    rellenoId={team.rellenoid}
                    colorPrimario={team.colorprimario}
                    colorSecundario={team.colorsecundario}
                    className={'flex justify-center items-center'}
                  />
                </td>

                <td style={thTdStyle} className='p-1'>{team.name}</td>
                <td style={thTdStyle} className='p-1'>{team.ownerName}</td>
                <td style={thTdStyle} className='p-1'>{team.totalpuntos.toFixed(2)}</td>
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