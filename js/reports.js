import { formatearTiempo } from "./utils.js";

export function ingresosHoy(historial, todayISO) {
  return historial.filter((h) => h.fecha === todayISO).reduce((acc, h) => acc + Number(h.total || 0), 0);
}

export function gastosHoy(gastos, todayISO) {
  return gastos.filter((g) => g.fecha === todayISO).reduce((acc, g) => acc + Number(g.monto || 0), 0);
}

export function ingresosPorMesa(historial, todayISO) {
  const map = new Map();
  historial.filter((h) => h.fecha === todayISO).forEach((h) => {
    map.set(h.mesa, (map.get(h.mesa) || 0) + Number(h.total || 0));
  });
  return Array.from(map.entries()).map(([mesa, total]) => ({ mesa, total }));
}

export function usoPorMesa(historial, todayISO) {
  const map = new Map();
  historial.filter((h) => h.fecha === todayISO).forEach((h) => {
    map.set(h.mesa, (map.get(h.mesa) || 0) + Number(h.segundos || 0));
  });
  return Array.from(map.entries()).map(([mesa, segundos]) => ({ mesa, segundos, tiempo: formatearTiempo(segundos) }));
}

export function renderBarras(elemento, data, valorKey, textoTitulo) {
  if (!elemento) return;
  if (!data.length) {
    elemento.innerHTML = `<p style="color:#95a3b3;">Sin datos para ${textoTitulo}.</p>`;
    return;
  }

  const max = Math.max(...data.map((d) => d[valorKey]), 1);
  elemento.innerHTML = data.map((d) => {
    const width = Math.max(5, (d[valorKey] / max) * 100);
    return `<div class="barra"><span style="width:${width}%"></span><small>${d.mesa}: ${typeof d[valorKey] === "number" ? d[valorKey].toFixed(2) : d[valorKey]}</small></div>`;
  }).join("");
}
