export function formatearTiempo(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const r = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${r}`;
}

export function horaLegible(date = new Date()) {
  return new Date(date).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function fechaISO(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

export function descargarCSV(nombre, filas) {
  const csv = filas.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
