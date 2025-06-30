/**
 * Guarda datos en localStorage con TTL
 * @param {string} key - Clave de almacenamiento
 * @param {any} data - Datos a guardar
 * @param {number} ttlMinutes - Tiempo de vida en minutos
 */
export function setCache(key, data, ttlMinutes) {
  const now = Date.now();
  const cacheEntry = {
    data,
    timestamp: now,
    ttl: ttlMinutes * 60 * 1000, // convert to ms
  };
  localStorage.setItem(key, JSON.stringify(cacheEntry));
}

/**
 * Obtiene datos desde el cache si no está expirado
 * @param {string} key - Clave de almacenamiento
 * @returns {any|null} - Datos o null si expiró o no existe
 */
export function getCache(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const { data, timestamp, ttl } = JSON.parse(raw);
    const now = Date.now();
    if (now - timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (e) {
    console.error("Error al parsear caché:", e);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Elimina una entrada del cache
 * @param {string} key - Clave de almacenamiento
 */
export function clearCache(key) {
  localStorage.removeItem(key);
}

/**
 * Intenta obtener datos del cache, y si no existen o expiraron, los recupera y los guarda
 * @param {string} key - Clave de almacenamiento
 * @param {Function} fetchFunction - Función que retorna una Promise con los datos
 * @param {number} ttlMs - Tiempo de vida en milisegundos
 * @returns {Promise<any>} - Promise con los datos (del cache o de la fuente)
 */
export async function getCachedOrFetch(key, fetchFunction, ttlMs) {
  const data = getCache(key);
  if (data !== null) return data;

  const result = await fetchFunction();
  setCache(key, result, ttlMs / 60000); // convert ms to minutes
  return result;
}
