import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { DateTime } from 'luxon';

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

const useRondaActual = () => {
  const [rondaActual, setRondaActual] = useState(null);
  const [rondaAnterior, setRondaAnterior] = useState(null);
  const [proximaRonda, setProximaRonda] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ahora = DateTime.now().setZone(ZONA_HORARIA);

    const obtenerRondas = async () => {
      try {
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

        if (rondas.length === 0) {
          setLoading(false);
          return;
        }
      

        let encontrada = false;
        for (let i = 0; i < rondas.length; i++) {
          const ronda = rondas[i];
          if (ahora >= ronda.Fechainicio && ahora < ronda.Fechafin) {
            setRondaActual(ronda);
            setRondaAnterior(i > 0 ? rondas[i - 1] : null);
            setProximaRonda(i + 1 < rondas.length ? rondas[i + 1] : null);
            encontrada = true;
            break;
          }
        }

        if (!encontrada) {
          if (ahora < rondas[0].Fechainicio) {
            setRondaActual(null);
            setRondaAnterior(null);
            setProximaRonda(rondas[0]);
          } else {
            setRondaActual(null);
            setRondaAnterior(rondas[rondas.length - 1]);
            setProximaRonda(null);
          }
        }

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