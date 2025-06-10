import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function useRondaActual() {
  const [rondaActual, setRondaActual] = useState(null);

  useEffect(() => {
    async function fetchRondas() {
      const rondaRef = collection(db, 'rondas');
      const rondaSnap = await getDocs(rondaRef);
      const now = new Date();

      let rondas = [];

      rondaSnap.forEach(doc => {
        const data = doc.data();
        const inicio = data.fechainicio.toDate ? data.fechainicio.toDate() : new Date(data.fechainicio);
        const fin = data.fechafin.toDate ? data.fechafin.toDate() : new Date(data.fechafin);

        rondas.push({
          id: doc.id,
          numero: data.numero,
          inicio,
          fin
        });
      });

      rondas.sort((a,b) => a.numero - b.numero);

      const rondaActiva = rondas.find(r => now >= r.inicio && now <= r.fin);
      if (rondaActiva) {
        setRondaActual(rondaActiva.numero);
      } else {
        const rondaSiguiente = rondas.find(r => r.inicio > now);
        if (rondaSiguiente) {
          setRondaActual(rondaSiguiente.numero);
        } else if (rondas.length > 0) {
          setRondaActual(rondas[rondas.length - 1].numero);
        } else {
          setRondaActual(null);
        }
      }
    }

    fetchRondas();
  }, []);

  return rondaActual;
}