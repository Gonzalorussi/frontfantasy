
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import MiEquipo from '../src/Components/MiEquipo';
import Mercado from '../src/Components/Mercado';
import Posiciones from '../src/Components/Posiciones';
import Reglas from '../src/Components/Reglas';
import Equipo from './pages/Equipo';
//import limpiarCacheDiaria from './hooks/CacheManager';

function App() {
   useEffect(() => {
    const ahora = new Date();
  const esHoy = ahora.toLocaleDateString("es-AR");
  const ultimaLimpieza = localStorage.getItem("ultimaLimpiezaRanking");

  if (ultimaLimpieza !== esHoy) {
    localStorage.removeItem("rankingacumulado");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("rankingronda")) localStorage.removeItem(key);
    });
    localStorage.setItem("ultimaLimpiezaRanking", esHoy);
  }

  localStorage.removeItem("jugadoresPermitidos");
}, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/mi-equipo" element={<MiEquipo />} />
        <Route path="/mercado" element={<Mercado />} />
        <Route path="/posiciones" element={<Posiciones />} />
        <Route path="/reglas" element={<Reglas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

