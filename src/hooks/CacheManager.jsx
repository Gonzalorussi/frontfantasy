const limpiarCacheDiaria = () => {
  const ahora = new Date().toLocaleString("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const fechaHoy = new Date(ahora).toDateString();

  const ultimaFecha = localStorage.getItem("ultimaLimpieza");

  if (ultimaFecha !== fechaHoy) {
    console.log("🧹 Limpiando cache por fecha nueva");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("ranking") || key.startsWith("top") || key === "jugadoresPermitidos") {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem("ultimaLimpieza", fechaHoy);
  }
};

export default limpiarCacheDiaria;