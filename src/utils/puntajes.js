import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// Función que calcula el puntaje de un jugador
export function calcularPuntajeJugador(jugador) {
  const { kills, assists, deaths, cs, primeraSangre, killParticipation, tripleKill, quadraKill, pentaKill, 
          damagePercentage, victoria, stomp, scorePerfecto, rol, dragonKills, baronKills, csPorMinuto, 
          damagePorMinuto, asistenciaTotal, visionPorMinuto } = jugador;

  let puntos = 0;

  // Puntos Básicos
  puntos += kills * 1.5; // Kills
  puntos += assists * 1; // Asistencias
  puntos -= deaths * 1; // Muertes
  puntos += cs * 0.01; // CS (Farm)
  if (primeraSangre) puntos += 1; // Primera Sangre

  // Bonus de Desempeño
  if (killParticipation >= 70) puntos += 2; // Kill Participation ≥70%
  if (tripleKill) puntos += 2; // Triple Kill
  if (quadraKill) puntos += 3; // Quadra Kill
  if (pentaKill) puntos += 5; // Penta Kill
  if (kills >= 10) puntos += 3; // 10+ Kills
  if (damagePercentage >= 30) puntos += 3; // Porcentaje de daño ≥30%
  if (victoria) puntos += 1; // Victoria
  if (stomp) puntos += 2; // Victoria Stomp
  if (scorePerfecto) puntos += 3; // Score Perfecto

  // Puntos específicos por rol
  switch (rol) {
    case 'TOP':
      if (kills === 1) puntos += 1; // Solo Kill
      if (damagePercentage >= 25) puntos += 2; // Daño ≥25%
      if (jugador.damageReceivedPercentage >= 25) puntos += 2; // Tank Bonus
      break;
    case 'JUNGLE':
      if (dragonKills >= 4) puntos += 1.5; // 4+ Dragones
      puntos += baronKills * 2; // Baron
      if (killParticipation >= 75) puntos += 2; // Kill Participation ≥75%
      break;
    case 'MID':
      if (damagePercentage >= 30) puntos += 3; // Daño ≥30%
      if (csPorMinuto >= 10) puntos += 1.5; // CS por Minuto ≥10
      break;
    case 'BOT':
      if (csPorMinuto >= 10) puntos += 1.5; // CS por Minuto ≥10
      if (damagePorMinuto >= 1000) puntos += 1; // Daño por Minuto ≥1000
      break;
    case 'SUPPORT':
      if (asistenciaTotal >= 10) puntos += 2; // 10+ Asistencias
      if (killParticipation >= 75) puntos += 2; // Kill Participation ≥75%
      if (jugador.firstDragon) puntos += 1.5; // Primer Dragon
      puntos += visionPorMinuto; // Puntuación de Vision
      break;
    default:
      break;
  }

  return puntos;
}

// Función que calcula el puntaje total de un equipo
export async function calcularPuntajeEquipo(equipoId) {
  const equipoRef = doc(db, 'equipos', equipoId);
  const equipoSnap = await getDoc(equipoRef);

  if (!equipoSnap.exists()) {
    console.error("El equipo no existe");
    return;
  }

  const equipoData = equipoSnap.data();
  const jugadores = equipoData.jugadores;  // Suponemos que el campo 'jugadores' contiene un array de jugadores con sus estadísticas
  let puntajeEquipo = 0;

  // Sumamos los puntos de todos los jugadores
  jugadores.forEach(jugador => {
    puntajeEquipo += calcularPuntajeJugador(jugador);
  });

  // Bonus por puntaje
  const monedasExtra = Math.floor(puntajeEquipo / 100) * 2; // Por cada 100 puntos, +2 monedas

  // Guardar el puntaje final en el equipo
  const equipoRefUpdate = doc(db, 'equipos', equipoId);
  await setDoc(equipoRefUpdate, { 
    puntaje: puntajeEquipo,
    monedasExtra: monedasExtra,
  }, { merge: true });

  console.log(`Puntaje final del equipo: ${puntajeEquipo} | Monedas Extra: ${monedasExtra}`);
  return puntajeEquipo;
}