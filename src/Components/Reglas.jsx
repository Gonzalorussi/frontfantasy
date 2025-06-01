
function Reglas() {
    return (
        <div style={{ padding: '2rem' }}>
          <h2>MSI Fantasy - Reglas</h2>
    
          <section>
            <h3>CÓMO JUGAR</h3>
            <h4>CREANDO TU EQUIPO</h4>
            <p>
              Paea empezar, inicia sesion con tu cuenta de Google. Luego crea tu equipo con su nombre, escudo y colores. Cada equipo tendrá un presupuesto inicial de 50 akomonedas, puedes usar tu presupuesto para asignar jugadores a tu equipo para esa fecha. Los equipos se bloquean 1 hora antes del inicio de la fecha. Ganas puntos según el desempeño de tus jugadores en partidas oficiales del MSI en cada fecha.
            </p>
            <p>
              Puedes elegir jugadores de cualquier equipo clasificado al MSI, así que cuanto más sepas de las regiones, más chances tienes de ganar puntos!
            </p>
            <p>
              Los resultados finales de cada fecha son calculados dentro de las 24hs terminada la fecha. Puedes chequear como lo hizo tu equipo en cada fecha.
            </p>
            <p>
              Cada fase del torneo, los valores de los jugadores son ajustados en base a su rendimiento en la fase anterior. Tu presupeusto aumentará acorde sumes puntos.
            </p>
          </section>
    
          <section>
            <h3>PUNTAJES</h3>
            <p>
              Los jugadores de tu equipo ganan puntos según su rendimiento en los partidos del MSI. El puntaje es una combinación de eventos básicos en la partida (kills, deaths, assists, etc...) así como algunas específicas de cada rol.  Estp asegurará que todos los roles contribuyen el promedio de puntos por partida.
            </p>
            <p>
              Los puntos de cada jugador son un pormedio de todas las partidas de cada serie.
            </p>
            <p>Tu puntaje final para una fecha es el acumulado de los puntos que obtienen tus jugadores!</p>
    
            <h4>Puntos básicos:</h4>
            <ul>
              <li>Kills: +1.5 puntos</li>
              <li>Assists: +1 punto</li>
              <li>Deaths: -1 punto</li>
              <li>CS (Farm): +0.01 puntos por CS</li>
              <li>Primera Sangre: +1 punto</li>
            </ul>
    
            <h4>Bonus de desempeño:</h4>
            <ul>
              <li>Kill Participation ≥70%: +2 puntos</li>
              <li>Triple Kill: +2 puntos</li>
              <li>Quadra Kill: +3 puntos</li>
              <li>Penta Kill: +5 puntos</li>
              <li>10+ Kills: +3 puntos</li>
              <li>Porcentaje de daño ≥30%: +3 puntos</li>
              <li>Victoria: +1 punto</li>
              <li>Victoria Stomp (10k+ gold lead or &lt; 27min game): +2 puntos</li>
              <li>Score Perfecto(0 deaths and KDA ≥5): +3 puntos</li>
            </ul>
    
            <h4>Puntos específicos por rol</h4>
            <h5>Top:</h5>
            <ul>
              <li>Solo Kill: +1 punto</li>
              <li>Porcentaje de daño ≥25%: +2 puntos</li>
              <li>Tank Bonus (≥25% del daño del equipo recibido): +2 puntos</li>
            </ul>
    
            <h5>Jungla:</h5>
            <ul>
              <li> 4+ Dragones: +1.5 puntos</li>
              <li>Baron: +2 puntos por Baron</li>
              <li>Kill Participation ≥75%: +2 puntos</li>
            </ul>
    
            <h5>Mid:</h5>
            <ul>
              <li>Porcentaje de daño ≥30%: +3 puntos</li>
              <li>CS por Minuto ≥10 al minuto 15: +1.5 puntos</li>
            </ul>
    
            <h5>Bot(ADC):</h5>
            <ul>
              <li>CS por Minuto ≥10 al minuto 15: +1.5 puntos</li>
              <li>Daño por Minuto ≥1000: +1 punto</li>
            </ul>
    
            <h5>Support:</h5>
            <ul>
              <li>10+ Asistencias: +2 puntos</li>
              <li>Kill Participation ≥75%: +2 puntos</li>
              <li>Primer Dragon: +1.5 puntos</li>
              <li>Puntuación de Vision: puntos igual al puntaje de vision por minuto</li>
            </ul>
          </section>
    
          <section>
            <h3>EXTRA RULE</h3>
            <p>
              Por cada <strong>100 puntos acumulados</strong> por tu equipo, recibirás un incremento de <strong>+2 monedas</strong> en tu presupuesto para futuras fases.
            </p>
          </section>
        </div>
    );
};
export default Reglas;