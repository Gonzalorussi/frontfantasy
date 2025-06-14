import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar el menú en móviles
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Función para manejar el toggle del menú
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-900 text-gray-200 p-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Botón de hamburguesa (solo en pantallas pequeñas) */}
          <div className="flex gap-x-4 items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen ? "true" : "false"}
            >
              <span className="sr-only">Abrir menú</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo o enlace principal */}
            <div className="flex-shrink-0 text-white font-bold text-xl">
              <Link to="/">Luminospark</Link>
            </div>
          </div>

          {/* Menú para pantallas grandes */}
          <div className="hidden sm:block sm:ml-6">
            <div className="flex space-x-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-md text-lg font-medium"
              >
                Inicio
              </Link>
              <Link
                to="/equipo"
                className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-md text-lg font-medium"
              >
                Equipo
              </Link>
              <Link
                to="/mercado"
                className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-md text-lg font-medium"
              >
                Mercado
              </Link>
              <Link
                to="/posiciones"
                className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-md text-lg font-medium"
              >
                Posiciones
              </Link>
              <Link
                to="/reglas"
                className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-md text-lg font-medium"
              >
                Reglas
              </Link>
            </div>
          </div>

          {/* Usuario y Logout (solo visible cuando el usuario está logueado) */}
          <div className="ml-3 relative">
            {user && (
              <div className="text-gray-200 flex items-center gap-x-4">
                <button
                  onClick={handleLogout}
                  className="cursor-pointer text-lg text-gray-300 hover:text-red-600 font-semibold"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menú desplegable para pantallas pequeñas */}
      <div
        className={`sm:hidden ${isOpen ? "block" : "hidden"}`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-lg font-medium"
          >
            Inicio
          </Link>
          <Link
            to="/equipo"
            className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-lg font-medium"
          >
            Equipo
          </Link>
          <Link
            to="/mercado"
            className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-lg font-medium"
          >
            Mercado
          </Link>
          <Link
            to="/posiciones"
            className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-lg font-medium"
          >
            Posiciones
          </Link>
          <Link
            to="/reglas"
            className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-lg font-medium"
          >
            Reglas
          </Link>
        </div>
      </div>
    </nav>
  );
}
