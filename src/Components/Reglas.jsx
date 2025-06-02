import Navbar from './Navbar';
import Footer from './Footer';
function Reglas() {
    return (
        <div className='flex flex-col text-gray-200 font-semibold'>
          <Navbar/>
          <h2 className='mt-4 text-2xl text-blue-800 text-center'>MSI Fantasy - Reglas</h2>
    
          <h3 className='text-blue-800 mt-4 mx-4 text-xl'>CÓMO JUGAR</h3>

          <section className='bg-gray-900 p-4 rounded-xl mt-4 flex flex-col mx-4 gap-y-4'>
            <h4 className='text-gray-200'>CREANDO TU EQUIPO</h4>
            <ul className='list-disc pl-5 flex flex-col gap-y-4'>
              <li><p>Paea empezar, inicia sesion con tu cuenta de Google.</p></li>
              <li><p>Luego crea tu equipo con su nombre, escudo y colores.</p></li>
              <li><p>Cada equipo tendrá un presupuesto inicial de 50 akomonedas, puedes usar tu presupuesto para asignar jugadores a tu equipo para esa fecha.</p></li>
              <li><p>Los equipos se bloquean 1 hora antes del inicio de la fecha.</p></li>
              <li><p>Ganas puntos según el desempeño de tus jugadores en partidas oficiales del MSI en cada fecha.</p></li>
              <li><p>Podes elegir jugadores de cualquier equipo clasificado al MSI, así que cuanto más sepas de las regiones, más chances tenes de ganar puntos!</p></li>
              <li><p>Los resultados finales de cada fecha son calculados dentro de las 24hs terminada la fecha. Podes chequear como lo hizo tu equipo en cada fecha.</p></li>
              <li><p>Cada fase del torneo, los valores de los jugadores son ajustados en base a su rendimiento en la fase anterior. Tu presupeusto aumentará acorde sumes puntos.</p></li>
            </ul>
          </section>
    
          <h3 className='text-blue-800 mt-4 mx-4 text-xl'>PUNTAJES</h3>

          <section className='bg-gray-900 p-4 rounded-xl mt-4 flex flex-col mx-4 gap-y-4'>
            <p>
              Los jugadores de tu equipo ganan puntos según su rendimiento en los partidos del MSI. El puntaje es una combinación de eventos básicos en la partida (kills, deaths, assists, etc...) así como algunas específicas de cada rol.  Estp asegurará que todos los roles contribuyen el promedio de puntos por partida.
            </p>
            <p>
              Los puntos de cada jugador son un pormedio de todas las partidas de cada serie.
            </p>
            <p>Tu puntaje final para una fecha es el acumulado de los puntos que obtienen tus jugadores!</p>
    
            <h4>PUNTOS BÁSICOS:</h4>
            <ul className='list-disc pl-5 flex flex-col gap-y-1'>
              <li>Kills: +1.5 puntos</li>
              <li>Assists: +1 punto</li>
              <li>Deaths: -1 punto</li>
              <li>CS (Farm): +0.01 puntos por CS</li>
              <li>Primera Sangre: +1 punto</li>
            </ul>
    
            <h4>BONUS DE DESEMPEÑO</h4>
            <ul className='list-disc pl-5 flex flex-col gap-y-1'>
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
    
            <h4>PUNTOS ESPECIFICOS POR ROL</h4>
            <h5>TOP:</h5>
            <ul className='list-disc pl-5 flex flex-col gap-y-1'>
              <li>Solo Kill: +1 punto</li>
              <li>Porcentaje de daño ≥25%: +2 puntos</li>
              <li>Tank Bonus (≥25% del daño del equipo recibido): +2 puntos</li>
            </ul>
    
            <h5>JUNGLA:</h5>
            <ul className='list-disc pl-5 flex flex-col gap-y-1'>
              <li> 4+ Dragones: +1.5 puntos</li>
              <li>Baron: +2 puntos por Baron</li>
              <li>Kill Participation ≥75%: +2 puntos</li>
            </ul>
    
            <h5>MID:</h5>
            <ul>
              <li>Porcentaje de daño ≥30%: +3 puntos</li>
              <li>CS por Minuto ≥10 al minuto 15: +1.5 puntos</li>
            </ul>
    
            <h5>BOT(ADC):</h5>
            <ul className='list-disc pl-5 flex flex-col gap-y-1'>
              <li>CS por Minuto ≥10 al minuto 15: +1.5 puntos</li>
              <li>Daño por Minuto ≥1000: +1 punto</li>
            </ul>
    
            <h5>SUPPORT:</h5>
            <ul className='list-disc pl-5 flex flex-col gap-y-1'>
              <li>10+ Asistencias: +2 puntos</li>
              <li>Kill Participation ≥75%: +2 puntos</li>
              <li>Primer Dragon: +1.5 puntos</li>
              <li>Puntuación de Vision: puntos igual al puntaje de vision por minuto</li>
            </ul>
          </section>
    
          <section className='bg-red-900 p-4 rounded-xl my-4 flex flex-col mx-4 gap-y-4'>
            <h3 className='text-xl'>EXTRA RULE</h3>
            <p>
              Por cada <strong>100 puntos acumulados</strong> por tu equipo, recibirás un incremento de <strong>+2 monedas</strong> en tu presupuesto para futuras fases.
            </p>
          </section>
          <Footer/>
        </div>
    );
};
export default Reglas;