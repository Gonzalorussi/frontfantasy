import React from "react";
import {
  FaInstagram,
  FaEnvelope,
  FaTwitch,
  FaYoutube,
  FaTwitter,
  FaGlobe,
  FaDiscord,
  FaPatreon,
} from "react-icons/fa";
import LogoLumino from "../assets/img/logolumino.png";

export default function Footer() {
  return (
    <footer className="font-semibold bg-gray-900 text-gray-200 py-8 mt-auto border-t border-gray-700">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between items-center gap-8 md:gap-10 px-4 md:px-6">

    {/* Branding */}
    <div className="flex flex-col items-center md:flex-row md:items-center gap-4">
      <a
        href="https://linktr.ee/luminospark"
        target="_blank"
        rel="noopener noreferrer"
        title="LuminoSpark"
        className="transform hover:scale-110 transition duration-300"
      >
        <img className="w-20 h-20 md:w-16 md:h-16 rounded-full border-2 border-yellow-500 shadow-lg" src={LogoLumino} />
      </a>
      <div className="tracking-wider text-center md:text-left">
        <p className="text-xs uppercase text-gray-400">Creado por</p>
        <p className="text-xl font-extrabold text-yellow-400">LuminoSpark</p>
      </div>
    </div>

    {/* Central title */}
    <div className="text-center">
      <p className="text-sm uppercase tracking-widest text-gray-400">Fantasy League</p>
      <p className="text-3xl md:text-4xl font-extrabold text-red-400 drop-shadow-lg tracking-tight">Akofena</p>
      <p className="text-xs text-gray-500 mt-1">eSports Experience</p>
    </div>

    {/* Redes */}
    <div className="flex flex-wrap justify-center md:justify-end gap-5">
      <a href="https://www.twitch.tv/akofena_" target="_blank" rel="noopener noreferrer" title="Twitch" className="hover:text-purple-400 transition">
        <FaTwitch className="w-7 h-7" />
      </a>
      <a href="https://youtube.com/akofena" target="_blank" rel="noopener noreferrer" title="YouTube" className="hover:text-red-400 transition">
        <FaYoutube className="w-7 h-7" />
      </a>
      <a href="https://x.com/AkofenaG" target="_blank" rel="noopener noreferrer" title="Twitter" className="hover:text-blue-400 transition">
        <FaTwitter className="w-7 h-7" />
      </a>
      <a href="https://discord.com/invite/KpsSWax" target="_blank" rel="noopener noreferrer" title="Discord" className="hover:text-indigo-400 transition">
        <FaDiscord className="w-7 h-7" />
      </a>
      <a href="https://www.patreon.com/Akofena" target="_blank" rel="noopener noreferrer" title="Patreon" className="hover:text-orange-400 transition">
        <FaPatreon className="w-7 h-7" />
      </a>
    </div>

  </div>

  <div className="mt-6 text-center text-xs text-gray-500">
    © 2025 LuminoSpark. Todos los derechos reservados.
  </div>
</footer>

    );
}
