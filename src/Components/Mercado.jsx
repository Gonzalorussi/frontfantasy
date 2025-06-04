import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getFirestore, getDocs, collection } from 'firebase/firestore';
import silueta from '../assets/img/silueta.webp';
import Navbar from './Navbar';
import Footer from './Footer';

const roles = ['TOP', 'JUNGLE', 'MID', 'BOTTOM', 'SUPPORT'];
function Mercado() {
  const [busqueda, setBusqueda] = useState('');
  const [rolActivo, setRolActivo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [alineacion, setAlineacion] = useState({});
  const [presupuesto, setPresupuesto] = useState(50000); // Presupuesto inicial
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
      } else {
        console.warn('Usuario no autenticado');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function obtenerJugadoresMSI() {
      try {
       const db = getFirestore();
      const jugadoresSnapshot = await getDocs(collection(db, 'jugadores'));

      const equiposPermitidos = [
        't1',
        'geng',
        'hle',
        'dk',
        'ns',
        'kt',
        'g2',
        'fnc',
        'blg',
        'tes',
        'ie',
        'psg',
        'koi',
        'furia',
        'ig',
        'jdg',
        'wbg',
        'al',
        'png',
        'vks',
        'c9',
        'gam',
        'tl',
        'fly',
        'kc',
        'tsw',
        'sr',
        'ctbc',
        'we'
      ];
      const jugadoresData = jugadoresSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre || data.Nombre || '', 
            club: (data.clubid || data.Clubid || '').toLowerCase(),
            rol: data.rol || data.Rol || '',
            valor: data.costo || data.Costo || 0,
            foto: data.foto || data.Foto || silueta,
          };
        })
        .filter(jugador => equiposPermitidos.includes(jugador.club));

      setJugadores(jugadoresData);
      console.log(jugadoresData);
      } catch (error) {
        console.error('Error al obtener jugadores del MSI:', error);
      }
    }

    obtenerJugadoresMSI();
  }, []);

  const seleccionarJugador = (jugador) => {
    if (alineacion[jugador.rol] || jugador.valor > presupuesto) return;
    setAlineacion({ ...alineacion, [jugador.rol]: jugador });
    setPresupuesto(presupuesto - jugador.valor);
  };

  const deseleccionarJugador = (rol) => {
    const jugador = alineacion[rol];
    if (!jugador) return;
    const nuevoRoster = { ...alineacion };
    delete nuevoRoster[rol];
    setAlineacion(nuevoRoster);
    setPresupuesto(presupuesto + jugador.valor);
  };

  const confirmarRoster = async () => {
    if (Object.keys(alineacion).length !== 5 || !usuarioId) return;

    const db = getFirestore();
    try {
      await setDoc(doc(db, 'rosters', usuarioId), {
  top: alineacion['TOP'] || null,
  mid: alineacion['MID'] || null,
  jungle: alineacion['JUNGLE'] || null,
  botton: alineacion['BOTTOM'] || null,
  support: alineacion['SUPPORT'] || null,
  createdat: serverTimestamp(),
  lastupdate: serverTimestamp(),
  userid: usuarioId,
      });
      alert('Roster confirmado');
    } catch (error) {
      console.error('Error al guardar roster:', error);
    }
  };

  const filtrarJugadores = () => {
    return jugadores.filter(jugador => {
      const coincideRol = rolActivo ? jugador.rol === rolActivo : true;
      const coincideBusqueda = jugador.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return coincideRol && coincideBusqueda;
    });
  };

  return (
    
    <div style={{ padding: '2rem' }}>
      <Navbar/>
      <h2>Mercado de Jugadores (MSI)</h2>

      <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Presupuesto restante: {presupuesto} 💰</div>

      <input
        type="text"
        placeholder="Buscar jugador..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {roles.map((rol) => (
          <button
            key={rol}
            onClick={() => setRolActivo(rolActivo === rol ? null : rol)}
            style={{
              backgroundColor: rolActivo === rol ? '#007bff' : '#e0e0e0',
              color: rolActivo === rol ? 'white' : 'black',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {rol}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {roles.map((rol) => (
          <div key={rol} style={{ textAlign: 'center' }}>
            <div>{rol}</div>
            {alineacion[rol] ? (
              <div onClick={() => deseleccionarJugador(rol)} style={{ cursor: 'pointer' }}>
                <img src={alineacion[rol].foto} alt={alineacion[rol].nombre} width={60} height={60} /><br />
                <strong>{alineacion[rol].nombre}</strong>
              </div>
            ) : (
              <img src={silueta} alt="Vacío" width={60} height={60} />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={confirmarRoster}
        disabled={Object.keys(alineacion).length !== 5 || !usuarioId}
        style={{
          backgroundColor: Object.keys(alineacion).length === 5 && usuarioId ? '#28a745' : '#ccc',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          border: 'none',
          cursor: Object.keys(alineacion).length === 5 && usuarioId ? 'pointer' : 'not-allowed',
          marginBottom: '2rem'
        }}
      >
        Confirmar Roster
      </button>

      <div>
        {filtrarJugadores().map((jugador, index) => {
          const puedeSeleccionar = jugador.valor <= presupuesto && !alineacion[jugador.rol];
          return (
            <div
              key={`${jugador.id}-${jugador.nombre}-${jugador.equipo}-${index}`}
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderRadius: '8px'
              }}
            >
              <img src={jugador.foto} alt={jugador.nombre} width={50} height={50} />
              <div style={{ flex: 1 }}>
                <strong>{jugador.nombre}</strong> ({jugador.rol})<br />
                <small>{jugador.equipo}</small>
              </div>
              <span style={{ fontWeight: 'bold' }}>{jugador.valor} 💰</span>
              <button
                onClick={() => seleccionarJugador(jugador)}
                disabled={!puedeSeleccionar}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: puedeSeleccionar ? '#007bff' : '#aaa',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: puedeSeleccionar ? 'pointer' : 'not-allowed'
                }}
              >
                Seleccionar
              </button>
            </div>
          );
        })}
        
      </div>
      <div style={{ marginTop: '2rem', fontWeight: 'bold' }}>Presupuesto restante: {presupuesto} 💰</div>
      <Footer/>
    </div>
  );
}
export default Mercado;