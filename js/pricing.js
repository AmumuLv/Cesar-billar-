export function segundosAcumulados(mesa) {
  if (mesa.estado !== "Ocupada" || !mesa.ultimaMarcaMs) return mesa.tiempoSegundos || 0;
  return (mesa.tiempoSegundos || 0) + (Date.now() - mesa.ultimaMarcaMs) / 1000;
}

export function calcularTotalMesa(mesa, montoManual = 0) {
  if (mesa.modalidad !== "Billar") return Number(montoManual || 0);

  const segundos = segundosAcumulados(mesa);
  const precioHora = Number(mesa.precioHora || 0);

  if (mesa.modoCobro === "Corrido") {
    return Number(((segundos / 3600) * precioHora).toFixed(2));
  }

  const fraccionMinutos = Number(mesa.fraccionMinutos || 30);
  const precioFraccion = Number(mesa.precioFraccion || (precioHora / (60 / fraccionMinutos)) || 0);
  const bloques = Math.ceil(segundos / (fraccionMinutos * 60));
  return Number((bloques * precioFraccion).toFixed(2));
}

export function totalPorPersona(total, personas = 1) {
  const p = Math.max(1, Number(personas || 1));
  return Number((total / p).toFixed(2));
}
