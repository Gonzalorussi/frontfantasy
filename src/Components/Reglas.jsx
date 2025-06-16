import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";

function Reglas() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar user={user} />
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <hr className="border-1" />

        <h2 className="mt-4 text-2xl text-white text-center font-semibold">
          MSI Fantasy - Reglas
        </h2>

        <hr className="mt-4 border-1" />

        <h3 className="text-white mt-6 text-2xl font-semibold">CÓMO JUGAR</h3>

        <section className="bg-gray-800 p-6 rounded-xl mt-6">
          <h4 className="font-semibold text-gray-200 text-lg">
            CREANDO TU EQUIPO
          </h4>
          <ul className="list-disc pl-6 flex flex-col gap-y-4 mt-4">
            <li>
              <p>Paea empezar, inicia sesión con tu cuenta de Google.</p>
            </li>
            <li>
              <p>Luego crea tu equipo con su nombre, escudo y colores.</p>
            </li>
            <li>
              <p>
                Cada equipo tendrá un presupuesto inicial de 50 akomonedas,
                puedes usar tu presupuesto para asignar jugadores a tu equipo
                para esa fecha.
              </p>
            </li>
            <li>
              <p>
                Los equipos se bloquean 1 hora antes del inicio de la fecha.
              </p>
            </li>
            <li>
              <p>
                Ganas puntos según el desempeño de tus jugadores en partidas
                oficiales del MSI en cada fecha.
              </p>
            </li>
            <li>
              <p>
                Puedes elegir jugadores de cualquier equipo clasificado al MSI,
                ¡así que cuanto más sepas de las regiones, más chances tienes de
                ganar puntos!
              </p>
            </li>
            <li>
              <p>
                Los resultados finales de cada fecha son calculados dentro de
                las 24 horas de terminada la fecha. Puedes chequear cómo lo hizo
                tu equipo en cada fecha.
              </p>
            </li>
            <li>
              <p>
                Cada fase del torneo, los valores de los jugadores son ajustados
                en base a su rendimiento en la fase anterior. Tu presupuesto
                aumentará acorde a los puntos que sumes.
              </p>
            </li>
          </ul>
        </section>

        <h3 className="text-white mt-6 text-2xl font-semibold">PUNTAJES</h3>

        <section className="bg-gray-800 p-6 rounded-xl mt-6">
          <p>
            Los jugadores de tu equipo ganan puntos según su rendimiento en los
            partidos del MSI. El puntaje es una combinación de eventos básicos
            en la partida (kills, deaths, assists, etc...), así como algunas
            específicas de cada rol. Esto asegurará que todos los roles
            contribuyan al promedio de puntos por partida.
          </p>
          <p className="mt-4">
            Los puntos de cada jugador son un promedio de todas las partidas de
            cada serie.
          </p>
          <p className="mt-4">
            Tu puntaje final para una fecha es el acumulado de los puntos que
            obtienen tus jugadores.
          </p>

          <h4 className="text-lg font-semibold mt-6">PUNTOS BÁSICOS:</h4>
          <ul className="list-disc pl-6 flex flex-col gap-y-2 mt-4">
            <li>Kills: +1.5 puntos</li>
            <li>Assists: +1 punto</li>
            <li>Deaths: -1 punto</li>
            <li>CS (Farm): +0.01 puntos por CS</li>
          </ul>

          <h4 className="text-lg font-semibold mt-6">BONUS DE DESEMPEÑO:</h4>
          <ul className="list-disc pl-6 flex flex-col gap-y-2 mt-4">
            <li>Kill Participation ≥70%: +2 puntos</li>
            <li>10+ Kills: +3 puntos</li>
            <li>Porcentaje de daño ≥30%: +3 puntos</li>
            <li>Victoria: +1 punto</li>
            <li>
              Victoria Stomp (10k+ gold lead or &lt; 27min game): +2 puntos
            </li>
            <li>Score Perfecto(0 deaths and KDA ≥5): +3 puntos</li>
          </ul>

          <h4 className="text-lg font-semibold mt-6">
            PUNTOS ESPECIFICOS POR ROL
          </h4>
          <h5 className="mt-4 font-semibold">TOP:</h5>
          <ul className="list-disc pl-6 flex flex-col gap-y-2 mt-4">
            <li>Gold diff (≥2.5k): +2 puntos</li>
            <li>Porcentaje de daño ≥25%: +2 puntos</li>
          </ul>

          <h5 className="mt-4 font-semibold">JUNGLA:</h5>
          <ul className="list-disc pl-6 flex flex-col gap-y-2 mt-4">
            <li>4+ Dragones: +1.5 puntos</li>
            <li>Baron: +2 puntos por Baron</li>
            <li>Kill Participation ≥75%: +2 puntos</li>
          </ul>

          <h5 className="mt-4 font-semibold">MID:</h5>
          <ul className="list-disc pl-6 flex flex-col gap-y-2 mt-4">
            <li>Porcentaje de daño ≥30%: +3 puntos</li>
            <li>CS por Minuto ≥10 al minuto 15: +1.5 puntos</li>
          </ul>

          <h5 className="mt-4 font-semibold">BOT(ADC):</h5>
          <ul className="list-disc pl-6 flex flex-col gap-y-2 mt-4">
            <li>CS por Minuto ≥10 al minuto 15: +1.5 puntos</li>
            <li>CS diff ≥75: +2 puntos</li>
          </ul>

          <h5 className="mt-4 font-semibold">SUPPORT:</h5>
          <ul className="list-disc pl-6 flex flex-col gap-y-2 mt-4">
            <li>10+ Asistencias: +2 puntos</li>
            <li>Kill Participation ≥75%: +2 puntos</li>
            <li>
              Puntuación de Visión: puntos igual al puntaje de visión por minuto
            </li>
          </ul>
        </section>

        <section className="bg-red-800 p-6 rounded-xl my-6">
          <h3 className="text-xl font-semibold">EXTRA RULE</h3>
          <p className="mt-4">
            Por cada <strong>150 puntos acumulados</strong> por tu equipo,
            recibirás un incremento de <strong>+2 monedas</strong> en tu
            presupuesto para futuras fases.
          </p>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default Reglas;
