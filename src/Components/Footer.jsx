  import React from 'react';
  import {
    FaInstagram,
    FaEnvelope,
    FaTwitch,
    FaYoutube,
    FaTwitter,
    FaGlobe,
    FaDiscord, 
    FaPatreon
  } from 'react-icons/fa';
  import LogoLumino from '../assets/img/logolumino.png'

  export default function Footer() {
    return (
      <footer className="font-semibold flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-sm mt-auto">
        <p className="mb-2">Creado por</p>

        <div className="flex gap-4 mb-4">
          <a href="https://linktr.ee/luminospark" target="_blank" rel="noopener noreferrer" title="LuminoSpark">
            <img className='w-40' src={LogoLumino}/>
          </a>
        </div>

        <p className="mb-2">Para Akofena</p>

        <div className="flex gap-4">
          <a href="https://twitch.tv/akofena" target="_blank" rel="noopener noreferrer" title="Twitch">
            <FaTwitch className="w-6 h-6 hover:text-red-900 transition" />
          </a>
          <a href="https://youtube.com/akofena" target="_blank" rel="noopener noreferrer" title="YouTube">
            <FaYoutube className="w-6 h-6 hover:text-red-900 transition" />
          </a>
          <a href="https://twitter.com/akofena" target="_blank" rel="noopener noreferrer" title="Twitter">
            <FaTwitter className="w-6 h-6 hover:text-red-900 transition" />
          </a>
          <a href="https://discord.com/akofena" target="_blank" rel="noopener noreferrer" title="Discord">
            <FaDiscord className="w-6 h-6 hover:text-red-900 transition" />
          </a>
          <a href="https://patreon.com/akofena" target="_blank" rel="noopener noreferrer" title="Patreon">
            <FaPatreon className="w-6 h-6 hover:text-red-900 transition" />
          </a>
        </div>
      </footer>
    );
  }
