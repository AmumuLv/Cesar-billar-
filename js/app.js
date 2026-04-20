import { STORAGE_KEYS, leerStorage, guardarStorage } from "./storage.js";
import { cerrarSesion, obtenerSesion } from "./auth.js";
import { calcularTotalMesa, segundosAcumulados, totalPorPersona } from "./pricing.js";
import { descargarCSV, fechaISO, formatearTiempo, horaLegible } from "./utils.js";
import { gastosHoy, ingresosHoy, ingresosPorMesa, renderBarras, usoPorMesa } from "./reports.js";

const LIMITE_HISTORIAL = 7;

const mesasIniciales = [
  { id: 1, nombre: "Mesa 1", modalidad: "Billar", estado: "Libre", precioHora: 12, fraccionMinutos: 30, precioFraccion: 6, modoCobro: "Hora", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false },
  { id: 2, nombre: "Mesa 2", modalidad: "Billar", estado: "Libre", precioHora: 12, fraccionMinutos: 30, precioFraccion: 6, modoCobro: "Hora", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false },
  { id: 3, nombre: "Mesa 3", modalidad: "Billar", estado: "Libre", precioHora: 12, fraccionMinutos: 30, precioFraccion: 6, modoCobro: "Hora", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false },
  { id: 4, nombre: "Mesa 4", modalidad: "Billar", estado: "Libre", precioHora: 12, fraccionMinutos: 30, precioFraccion: 6, modoCobro: "Hora", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false },
  { id: 5, nombre: "Mesa 5", modalidad: "Billar", estado: "Libre", precioHora: 12, fraccionMinutos: 30, precioFraccion: 6, modoCobro: "Hora", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false },
  { id: 6, nombre: "Mesa 6", modalidad: "Billar", estado: "Libre", precioHora: 12, fraccionMinutos: 30, precioFraccion: 6, modoCobro: "Hora", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false },
  { id: 7, nombre: "Mesa 7", modalidad: "Billar", estado: "Libre", precioHora: 12, fraccionMinutos: 30, precioFraccion: 6, modoCobro: "Hora", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false },
  { id: 8, nombre: "Mesa Poker", modalidad: "Poker", estado: "Libre", precioHora: 0, fraccionMinutos: 30, precioFraccion: 0, modoCobro: "Manual", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false }
];

const estadoInicial = { mesas: mesasIniciales, historial: [], avisos: [], gastos: [] };
const estado = leerStorage(STORAGE_KEYS.app, estadoInicial);
if (!Array.isArray(estado.mesas) || !estado.mesas.length) Object.assign(estado, structuredClone(estadoInicial));

const sesion = obtenerSesion();
if (!sesion) window.location.href = "login.html";

let mesaSeleccionadaId = estado.mesas[0]?.id || 1;
let historialExpandido = false;
let editMesaId = null;

const $ = (id) => document.getElementById(id);
const el = {
  nombreUsuarioActivo: $("nombreUsuarioActivo"), btnCerrarSesion: $("btnCerrarSesion"),
  mesaSeleccionada: $("mesaSeleccionada"), infoMesa: $("infoMesa"), infoModalidad: $("infoModalidad"), infoEstado: $("infoEstado"), infoTiempo: $("infoTiempo"), infoPrecio: $("infoPrecio"), infoTotal: $("infoTotal"),
  nuevoPrecioHora: $("nuevoPrecioHora"), fraccionMinutos: $("fraccionMinutos"), precioFraccion: $("precioFraccion"),
  modoCobroMesa: $("modoCobroMesa"), cantidadPersonas: $("cantidadPersonas"), resultadoDivision: $("resultadoDivision"), montoManualPoker: $("montoManualPoker"),
  btnGuardarPrecio: $("btnGuardarPrecio"), btnIniciar: $("btnIniciar"), btnPausar: $("btnPausar"), btnReanudar: $("btnReanudar"), btnFinalizar: $("btnFinalizar"), avisoHora: $("avisoHora"),
  totalMesas: $("totalMesas"), mesasLibres: $("mesasLibres"), mesasOcupadas: $("mesasOcupadas"), mesasPausadas: $("mesasPausadas"), ingresosDia: $("ingresosDia"), gananciaReal: $("gananciaReal"),
  buscarMesa: $("buscarMesa"), filtroEstado: $("filtroEstado"), gridMesas: $("gridMesas"), listaAvisos: $("listaAvisos"),
  cuerpoHistorial: $("cuerpoHistorial"), btnToggleHistorial: $("btnToggleHistorial"), btnExportarHistorial: $("btnExportarHistorial"), btnExportarResumen: $("btnExportarResumen"), btnImprimir: $("btnImprimir"),
  gastoConcepto: $("gastoConcepto"), gastoMonto: $("gastoMonto"), btnAgregarGasto: $("btnAgregarGasto"), listaGastos: $("listaGastos"), reporteMesas: $("reporteMesas"), reporteUso: $("reporteUso"),
  modalMesa: $("modalMesa"), mesaNombre: $("mesaNombre"), mesaTipo: $("mesaTipo"), btnGuardarMesa: $("btnGuardarMesa"), btnCancelarMesa: $("btnCancelarMesa")
};

function save() { guardarStorage(STORAGE_KEYS.app, estado); }
function mesaActual() { return estado.mesas.find((m) => m.id === mesaSeleccionadaId) || estado.mesas[0]; }
function notificar(msg) {
  el.avisoHora.textContent = msg;
  el.avisoHora.classList.add("mostrar");
  clearTimeout(el.avisoHora._t);
  el.avisoHora._t = setTimeout(() => el.avisoHora.classList.remove("mostrar"), 4500);
}

function syncElapsed(mesa) {
  if (mesa.estado !== "Ocupada" || !mesa.ultimaMarcaMs) return;
  const ahora = Date.now();
  const delta = (ahora - mesa.ultimaMarcaMs) / 1000;
  if (delta >= 1) {
    mesa.tiempoSegundos += delta;
    mesa.ultimaMarcaMs = ahora;
  }
}

function syncAllElapsed() { estado.mesas.forEach(syncElapsed); }

function drawSelectMesas() {
  el.mesaSeleccionada.innerHTML = estado.mesas.map((m) => `<option value="${m.id}">${m.nombre}</option>`).join("");
  el.mesaSeleccionada.value = String(mesaSeleccionadaId);
}

function drawPanel() {
  const m = mesaActual();
  if (!m) return;
  const total = calcularTotalMesa(m, Number(el.montoManualPoker.value || 0));

  el.infoMesa.textContent = m.nombre;
  el.infoModalidad.textContent = m.modalidad;
  el.infoEstado.textContent = m.estado;
  el.infoTiempo.textContent = formatearTiempo(segundosAcumulados(m));
  el.infoPrecio.textContent = m.modalidad === "Billar" ? `S/ ${Number(m.precioHora).toFixed(2)}` : "Manual";
  el.infoTotal.textContent = `S/ ${total.toFixed(2)}`;

  el.nuevoPrecioHora.value = m.precioHora;
  el.fraccionMinutos.value = String(m.fraccionMinutos || 30);
  el.precioFraccion.value = Number(m.precioFraccion || 0).toFixed(2);
  el.modoCobroMesa.value = m.modoCobro || "Hora";
  el.cantidadPersonas.value = String(m.personas || 1);
  const porPersona = totalPorPersona(total, m.personas);
  el.resultadoDivision.textContent = `Total S/ ${total.toFixed(2)} | ${m.personas} pers. = S/ ${porPersona.toFixed(2)} c/u`;

  const poker = m.modalidad !== "Billar";
  $("bloquePrecio").style.display = poker ? "none" : "block";
  $("bloqueModoCobro").style.display = poker ? "none" : "block";
  $("bloquePoker").style.display = poker ? "block" : "none";

  el.btnReanudar.style.display = m.estado === "Pausada" ? "inline-block" : "none";
}

function drawResumen() {
  const hoy = fechaISO();
  const ingresos = ingresosHoy(estado.historial, hoy);
  const gastos = gastosHoy(estado.gastos, hoy);
  el.totalMesas.textContent = estado.mesas.length;
  el.mesasLibres.textContent = estado.mesas.filter((m) => m.estado === "Libre").length;
  el.mesasOcupadas.textContent = estado.mesas.filter((m) => m.estado === "Ocupada").length;
  el.mesasPausadas.textContent = estado.mesas.filter((m) => m.estado === "Pausada").length;
  el.ingresosDia.textContent = `S/ ${ingresos.toFixed(2)}`;
  el.gananciaReal.textContent = `S/ ${(ingresos - gastos).toFixed(2)}`;
}

function drawMesas() {
  const text = el.buscarMesa.value.toLowerCase().trim();
  const filtro = el.filtroEstado.value;
  const tarjetas = estado.mesas
    .filter((m) => m.nombre.toLowerCase().includes(text) && (filtro === "Todos" || m.estado === filtro))
    .map((m) => `<div class="mesa ${m.modalidad === "Poker" ? "poker" : m.estado.toLowerCase()} ${m.id === mesaSeleccionadaId ? "seleccionada" : ""}" data-id="${m.id}">
      <div class="icono-mesa">${m.modalidad === "Billar" ? "🎱" : "🃏"}</div>
      <h3>${m.nombre}</h3>
      <small>${m.modalidad}</small>
      <span class="estado">${m.estado.toUpperCase()}</span>
    </div>`).join("");

  el.gridMesas.innerHTML = tarjetas + `<button class="mesa add-card" id="btnAddMesa" type="button">＋</button>`;

  el.gridMesas.querySelectorAll(".mesa[data-id]").forEach((card) => {
    card.addEventListener("click", () => {
      mesaSeleccionadaId = Number(card.dataset.id);
      drawPanel();
      drawMesas();
      el.mesaSeleccionada.value = String(mesaSeleccionadaId);
    });
  });
  $("btnAddMesa")?.addEventListener("click", abrirModalMesa);
}

function drawAvisos() {
  if (!estado.avisos.length) {
    el.listaAvisos.innerHTML = `<div class="sin-avisos">Aún no hay avisos.</div>`;
    return;
  }
  el.listaAvisos.innerHTML = estado.avisos.map((a) => `<div class="item-aviso"><strong>${a.mesa}</strong> • ${a.mensaje}<br><small>${a.hora}</small></div>`).join("");
}

function drawHistorial() {
  if (!estado.historial.length) {
    el.cuerpoHistorial.innerHTML = `<tr><td colspan="7">Aún no hay sesiones registradas.</td></tr>`;
    el.btnToggleHistorial.style.display = "none";
    return;
  }
  const rows = estado.historial.map((h, index) => ({...h, index}));
  const rowsToShow = historialExpandido ? rows : rows.slice(0, LIMITE_HISTORIAL);
  el.cuerpoHistorial.innerHTML = rowsToShow.map((h) => `<tr>
      <td>${h.mesa}</td><td>${h.modalidad}</td><td>${h.inicio}</td><td>${h.fin}</td><td>${h.tiempo}</td>
      <td>S/ ${Number(h.total).toFixed(2)}<br><small>${h.personas} pers | S/ ${Number(h.porPersona).toFixed(2)}</small></td>
      <td><button class="btn-eliminar-historial" data-index="${h.index}" type="button">Eliminar</button></td>
  </tr>`).join("");

  el.cuerpoHistorial.querySelectorAll(".btn-eliminar-historial").forEach((b) => b.addEventListener("click", () => {
    const idx = Number(b.dataset.index);
    if (confirm("¿Seguro que quieres eliminar esta sesión del historial?")) {
      estado.historial.splice(idx, 1);
      save(); refresh();
    }
  }));

  el.btnToggleHistorial.style.display = estado.historial.length > LIMITE_HISTORIAL ? "inline-block" : "none";
  el.btnToggleHistorial.textContent = historialExpandido ? "Ver menos" : "Ver más";
}

function drawGastos() {
  if (!estado.gastos.length) {
    el.listaGastos.innerHTML = "<li>Sin gastos registrados.</li>";
    return;
  }
  el.listaGastos.innerHTML = estado.gastos.map((g, idx) => `<li><span>${g.fecha} • ${g.concepto}</span><span>S/ ${g.monto.toFixed(2)}</span><button class="btn-mini" data-idx="${idx}" type="button">X</button></li>`).join("");
  el.listaGastos.querySelectorAll("button[data-idx]").forEach((btn) => btn.addEventListener("click", () => {
    if (!confirm("¿Eliminar este gasto?")) return;
    estado.gastos.splice(Number(btn.dataset.idx), 1); save(); refresh();
  }));
}

function drawReports() {
  const hoy = fechaISO();
  renderBarras(el.reporteMesas, ingresosPorMesa(estado.historial, hoy), "total", "ingresos por mesa");
  renderBarras(el.reporteUso, usoPorMesa(estado.historial, hoy), "segundos", "uso por mesa");
}

function refresh() {
  syncAllElapsed();
  save();
  drawSelectMesas(); drawPanel(); drawResumen(); drawMesas(); drawAvisos(); drawHistorial(); drawGastos(); drawReports();
}

function arrancarMesa(mesa) {
  if (mesa.estado === "Ocupada") return alert("Esta mesa ya está ocupada.");
  if (mesa.estado === "Pausada") return reanudarMesa(mesa);

  mesa.estado = "Ocupada";
  mesa.tiempoSegundos = 0;
  mesa.ultimaMarcaMs = Date.now();
  mesa.horaInicio = horaLegible();
  mesa.horaDetenida = null;
  mesa.limiteHoraAlcanzado = false;
  save(); refresh();
  notificar(`${mesa.nombre} iniciada correctamente.`);
}

function pausarMesa(mesa, manual = true) {
  if (mesa.estado !== "Ocupada") return alert("Solo puedes pausar una mesa ocupada.");
  if (manual && !confirm("¿Seguro que quieres pausar/concluir el tiempo?")) return;

  syncElapsed(mesa);
  mesa.estado = "Pausada";
  mesa.horaDetenida = horaLegible();
  mesa.ultimaMarcaMs = null;
  save(); refresh();
  if (manual) notificar(`${mesa.nombre} pausada.`);
}

function reanudarMesa(mesa) {
  if (mesa.estado !== "Pausada") return;
  if (mesa.limiteHoraAlcanzado && !confirm("Esta mesa se detuvo por llegar a una hora. ¿Seguro que deseas continuar?")) return;

  mesa.estado = "Ocupada";
  mesa.ultimaMarcaMs = Date.now();
  mesa.horaDetenida = null;
  mesa.limiteHoraAlcanzado = false;
  save(); refresh();
  notificar(`${mesa.nombre} reanudada.`);
}

function finalizarMesa(mesa) {
  if (mesa.estado === "Libre") return alert("Esa mesa ya está libre.");
  if (!confirm("¿Seguro que quieres concluir el tiempo y cerrar la mesa?")) return;

  syncElapsed(mesa);
  const montoManual = Number(el.montoManualPoker.value || 0);
  if (mesa.modalidad !== "Billar" && (Number.isNaN(montoManual) || montoManual < 0)) {
    return alert("Ingresa un monto válido para mesa de cartas/poker.");
  }

  const total = calcularTotalMesa(mesa, montoManual);
  const porPersona = totalPorPersona(total, mesa.personas);
  estado.historial.unshift({
    fecha: fechaISO(), mesa: mesa.nombre, modalidad: mesa.modalidad,
    inicio: mesa.horaInicio || "--:--:--", fin: horaLegible(), tiempo: formatearTiempo(mesa.tiempoSegundos), segundos: Math.floor(mesa.tiempoSegundos),
    total, personas: mesa.personas || 1, porPersona
  });

  mesa.estado = "Libre";
  mesa.tiempoSegundos = 0;
  mesa.ultimaMarcaMs = null;
  mesa.horaInicio = null;
  mesa.horaDetenida = null;
  mesa.limiteHoraAlcanzado = false;
  if (mesa.modalidad !== "Billar") el.montoManualPoker.value = "";

  save(); refresh();
  alert(`${mesa.nombre} finalizada. Total: S/ ${total.toFixed(2)} | Por persona: S/ ${porPersona.toFixed(2)}`);
}

function abrirModalMesa(id = null) {
  editMesaId = id;
  if (id) {
    const m = estado.mesas.find((x) => x.id === id);
    el.mesaNombre.value = m?.nombre || "";
    el.mesaTipo.value = m?.modalidad || "Billar";
  } else {
    el.mesaNombre.value = "";
    el.mesaTipo.value = "Billar";
  }
  el.modalMesa.classList.add("activo");
  el.modalMesa.setAttribute("aria-hidden", "false");
}

function guardarMesa() {
  const nombre = el.mesaNombre.value.trim();
  const modalidad = el.mesaTipo.value;
  if (!nombre) return alert("Escribe un nombre para la mesa.");

  if (editMesaId) {
    const m = estado.mesas.find((x) => x.id === editMesaId);
    if (m) { m.nombre = nombre; m.modalidad = modalidad; if (modalidad !== "Billar") m.modoCobro = "Manual"; }
  } else {
    const nextId = Math.max(0, ...estado.mesas.map((m) => m.id)) + 1;
    estado.mesas.push({
      id: nextId, nombre, modalidad, estado: "Libre", precioHora: modalidad === "Billar" ? 12 : 0, fraccionMinutos: 30, precioFraccion: modalidad === "Billar" ? 6 : 0,
      modoCobro: modalidad === "Billar" ? "Hora" : "Manual", personas: 1, tiempoSegundos: 0, ultimaMarcaMs: null, horaInicio: null, horaDetenida: null, limiteHoraAlcanzado: false
    });
  }
  el.modalMesa.classList.remove("activo");
  save(); refresh();
}

function exportarHistorial() {
  const rows = [["Fecha", "Mesa", "Modalidad", "Inicio", "Fin", "Tiempo", "Total", "Personas", "Por persona"]];
  estado.historial.forEach((h) => rows.push([h.fecha, h.mesa, h.modalidad, h.inicio, h.fin, h.tiempo, h.total, h.personas, h.porPersona]));
  descargarCSV(`historial_${fechaISO()}.csv`, rows);
}

function exportarResumen() {
  const hoy = fechaISO();
  const ingresos = ingresosHoy(estado.historial, hoy);
  const gastos = gastosHoy(estado.gastos, hoy);
  const rows = [
    ["Fecha", hoy], ["Ingresos del día", ingresos], ["Gastos del día", gastos], ["Ganancia real", ingresos - gastos], [""], ["Mesa", "Ingresos"]
  ];
  ingresosPorMesa(estado.historial, hoy).forEach((m) => rows.push([m.mesa, m.total]));
  descargarCSV(`resumen_${hoy}.csv`, rows);
}

function bindEvents() {
  el.nombreUsuarioActivo.textContent = sesion?.nombre || "Administrador";
  el.btnCerrarSesion.addEventListener("click", () => { cerrarSesion(); window.location.href = "login.html"; });
  el.mesaSeleccionada.addEventListener("change", () => { mesaSeleccionadaId = Number(el.mesaSeleccionada.value); drawPanel(); drawMesas(); });
  el.buscarMesa.addEventListener("input", drawMesas);
  el.filtroEstado.addEventListener("change", drawMesas);

  el.modoCobroMesa.addEventListener("change", () => { const m = mesaActual(); if (m.modalidad === "Billar") { m.modoCobro = el.modoCobroMesa.value; save(); drawPanel(); }});
  el.cantidadPersonas.addEventListener("change", () => { const m = mesaActual(); m.personas = Number(el.cantidadPersonas.value); save(); drawPanel(); });
  el.montoManualPoker.addEventListener("input", drawPanel);

  el.btnGuardarPrecio.addEventListener("click", () => {
    const m = mesaActual();
    if (m.modalidad !== "Billar") return alert("Solo aplica para mesas de billar.");
    const precioHora = Number(el.nuevoPrecioHora.value);
    const fraccion = Number(el.fraccionMinutos.value);
    const precioFraccion = Number(el.precioFraccion.value);
    if ([precioHora, fraccion, precioFraccion].some((n) => Number.isNaN(n) || n < 0)) return alert("Tarifas inválidas.");
    m.precioHora = precioHora; m.fraccionMinutos = fraccion; m.precioFraccion = precioFraccion;
    save(); refresh(); notificar(`Tarifas guardadas en ${m.nombre}.`);
  });

  el.btnIniciar.addEventListener("click", () => arrancarMesa(mesaActual()));
  el.btnPausar.addEventListener("click", () => pausarMesa(mesaActual(), true));
  el.btnReanudar.addEventListener("click", () => reanudarMesa(mesaActual()));
  el.btnFinalizar.addEventListener("click", () => finalizarMesa(mesaActual()));

  el.btnToggleHistorial.addEventListener("click", () => { historialExpandido = !historialExpandido; drawHistorial(); });

  el.btnAgregarGasto.addEventListener("click", () => {
    const concepto = el.gastoConcepto.value.trim();
    const monto = Number(el.gastoMonto.value);
    if (!concepto || Number.isNaN(monto) || monto <= 0) return alert("Ingresa concepto y monto válidos.");
    estado.gastos.unshift({ fecha: fechaISO(), concepto, monto });
    el.gastoConcepto.value = ""; el.gastoMonto.value = "";
    save(); refresh();
  });

  el.btnExportarHistorial.addEventListener("click", exportarHistorial);
  el.btnExportarResumen.addEventListener("click", exportarResumen);
  el.btnImprimir.addEventListener("click", () => window.print());

  el.btnCancelarMesa.addEventListener("click", () => el.modalMesa.classList.remove("activo"));
  el.btnGuardarMesa.addEventListener("click", guardarMesa);
  el.modalMesa.addEventListener("click", (e) => { if (e.target === el.modalMesa) el.modalMesa.classList.remove("activo"); });
  el.gridMesas.addEventListener("dblclick", (e) => {
    const card = e.target.closest(".mesa[data-id]");
    if (!card) return;
    abrirModalMesa(Number(card.dataset.id));
  });
}

function autoControlHora() {
  estado.mesas.forEach((m) => {
    if (m.estado !== "Ocupada" || m.modalidad !== "Billar" || m.modoCobro !== "Hora") return;
    const segundos = segundosAcumulados(m);
    if (segundos >= 3600 && Math.floor(segundos) % 3600 === 0) {
      pausarMesa(m, false);
      m.limiteHoraAlcanzado = true;
      estado.avisos.unshift({ mesa: m.nombre, mensaje: "Se pausó automáticamente al completar 1 hora.", hora: horaLegible() });
      notificar(`${m.nombre} se pausó por llegar a una hora.`);
      save();
    }
  });
}

bindEvents();
refresh();
setInterval(() => { syncAllElapsed(); autoControlHora(); drawPanel(); drawResumen(); drawMesas(); save(); }, 1000);
