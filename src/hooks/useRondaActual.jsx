import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { DateTime } from 'luxon';
import { getCache, setCache } from '../utils/cache';

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const CACHE_KEY = 'rondas';
function calcularTTLHasta7AM() {
  const ahora = DateTime.now().setZone('America/Argentina/Buenos_Aires');
  let proximo7AM = ahora.set({ hour: 7, minute: 2, second: 0, millisecond: 0 });
  
  // Si ya pasó la 7AM hoy, el próximo 7AM es mañana
  if (ahora >= proximo7AM) {
    proximo7AM = proximo7AM.plus({ days: 1 });
  }
  
  const diff = proximo7AM.diff(ahora).as('milliseconds');
  console.log(`[TTL] Tiempo hasta 7:02 AM: ${diff} ms`);
  return diff;
}

const useRondaActual = () => {
  const [rondaActual, setRondaActual] = useState(null);
  const [rondaAnterior, setRondaAnterior] = useState(null);
  const [proximaRonda, setProximaRonda] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ahora = DateTime.now().setZone(ZONA_HORARIA);

    const procesarRondas = (rondas) => {
      let actual = null;
      for (let i = 0; i < rondas.length; i++) {
        if (ahora >= rondas[i].Fechainicio && ahora <= rondas[i].Fechafin) {
          actual = rondas[i];
          break;
        }
      }

      if (actual) {
        const idx = rondas.findIndex(r => r.id === actual.id);
        setRondaActual(actual);
        setRondaAnterior(idx > 0 ? rondas[idx - 1] : null);
        setProximaRonda(idx + 1 < rondas.length ? rondas[idx + 1] : null);
      } else {
        const futuras = rondas.filter(r => ahora < r.Fechainicio);
        const pasadas = rondas.filter(r => ahora >= r.Fechafin);

        const proxima = futuras.length > 0 ? futuras[0] : null;
        const anterior = pasadas.length > 0 ? pasadas[pasadas.length - 1] : null;

        setRondaActual(null);
        setRondaAnterior(anterior);
        setProximaRonda(proxima);
      }
    };

    const obtenerRondas = async () => {
      try {
        const cached = getCache(CACHE_KEY);
        if (cached) {
          console.log("[Cache] Datos cargados desde cache");
          const rondasConvertidas = cached.map(r => ({
    ...r,
    Fechainicio: DateTime.fromISO(r.Fechainicio).setZone(ZONA_HORARIA),
    Fechafin: DateTime.fromISO(r.Fechafin).setZone(ZONA_HORARIA),
  }));
  procesarRondas(rondasConvertidas);
  setLoading(false);
  return;
  
        }console.log("[Cache] Cache no existe o expiró, fetch a Firestore");

        const rondasQuery = query(collection(db, 'rondas'), orderBy('fechainicio', 'asc'));
        const querySnapshot = await getDocs(rondasQuery);
        
        const rondas = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            Fechainicio: DateTime.fromJSDate(data.fechainicio.toDate()).setZone(ZONA_HORARIA),
            Fechafin: DateTime.fromJSDate(data.fechafin.toDate()).setZone(ZONA_HORARIA)
          };
        });
        const TTL_HASTA_7AM = calcularTTLHasta7AM();
        console.log("[Cache] TTL calculado para rondas (ms):", TTL_HASTA_7AM);

        setCache(CACHE_KEY, rondas, TTL_HASTA_7AM);
        console.log("[Cache] Guardando rondas con TTL (ms):", TTL_HASTA_7AM);
        procesarRondas(rondas);
      } catch (err) {
          console.error("Error al obtener las rondas:", err);
          setError(err);
        } finally {
        setLoading(false);
      }
    };

    obtenerRondas();
  },[]);
  return { rondaActual, rondaAnterior, proximaRonda, error, loading };
}
export default useRondaActual;