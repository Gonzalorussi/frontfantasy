/**
 * Guarda datos en localStorage con TTL
 * @param {string} key - Clave de almacenamiento
 * @param {any} data - Datos a guardar
 * @param {number} ttlMinutes - Tiempo de vida en minutos
 */
export function setCache(key, data, ttlMs) {
  const now = Date.now();
  const cacheEntry = {
    data,
    timestamp: now,
    ttl: ttlMs,
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
    console.log(`[Cache] getCache key=${key} now=${now} timestamp=${timestamp} ttl=${ttl} diff=${now - timestamp}`);
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
  setCache(key, result, ttlMs);
  return result;
}

/**
 * Limpia del localStorage todas las entradas relacionadas al fantasy si ya cambió el día
 */
export function limpiarCacheDiaria() {
  const ahora = new Date().toLocaleString("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const fechaHoy = new Date(ahora).toDateString();

  const ultimaFecha = localStorage.getItem("ultimaLimpieza");

  if (ultimaFecha !== fechaHoy) {
    console.log("🧹 Limpieza de cache: nuevo día →", fechaHoy);

    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("ranking") ||
        key.startsWith("top") ||
        key === "jugadoresPermitidos"
      ) {
        console.log("🗑️ Borrando clave cacheada:", key);
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem("ultimaLimpieza", fechaHoy);
  }
}

