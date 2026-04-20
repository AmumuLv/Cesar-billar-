document.addEventListener("DOMContentLoaded", () => {
    const LIMITE_HISTORIAL = 5;

    const mesasBase = [
        { id: 1, nombre: "Mesa 1", modalidad: "Billar", estado: "Libre", tiempoSegundos: 0, precioHora: 12, horaInicio: null, horaDetenida: null, modoCobro: "Hora", avisoHoraMostrado: false, limiteHoraAlcanzado: false, personas: 1 },
        { id: 2, nombre: "Mesa 2", modalidad: "Billar", estado: "Libre", tiempoSegundos: 0, precioHora: 12, horaInicio: null, horaDetenida: null, modoCobro: "Hora", avisoHoraMostrado: false, limiteHoraAlcanzado: false, personas: 1 },
        { id: 3, nombre: "Mesa 3", modalidad: "Billar", estado: "Libre", tiempoSegundos: 0, precioHora: 12, horaInicio: null, horaDetenida: null, modoCobro: "Hora", avisoHoraMostrado: false, limiteHoraAlcanzado: false, personas: 1 },
        { id: 4, nombre: "Mesa 4", modalidad: "Billar", estado: "Libre", tiempoSegundos: 0, precioHora: 12, horaInicio: null, horaDetenida: null, modoCobro: "Hora", avisoHoraMostrado: false, limiteHoraAlcanzado: false, personas: 1 },
        { id: 5, nombre: "Mesa 5", modalidad: "Billar", estado: "Libre", tiempoSegundos: 0, precioHora: 12, horaInicio: null, horaDetenida: null, modoCobro: "Hora", avisoHoraMostrado: false, limiteHoraAlcanzado: false, personas: 1 },
        { id: 6, nombre: "Mesa 6", modalidad: "Billar", estado: "Libre", tiempoSegundos: 0, precioHora: 12, horaInicio: null, horaDetenida: null, modoCobro: "Hora", avisoHoraMostrado: false, limiteHoraAlcanzado: false, personas: 1 },
        { id: 7, nombre: "Mesa 7", modalidad: "Billar", estado: "Libre", tiempoSegundos: 0, precioHora: 12, horaInicio: null, horaDetenida: null, modoCobro: "Hora", avisoHoraMostrado: false, limiteHoraAlcanzado: false, personas: 1 },
        { id: 8, nombre: "Mesa de Poker", modalidad: "Poker", estado: "Libre", tiempoSegundos: 0, precioHora: 0, horaInicio: null, horaDetenida: null, modoCobro: "Manual", avisoHoraMostrado: false, limiteHoraAlcanzado: false, personas: 1 }
    ];

    function leerStorage(clave, valorPorDefecto) {
        try {
            const dato = JSON.parse(localStorage.getItem(clave));
            return dato ?? valorPorDefecto;
        } catch {
            return valorPorDefecto;
        }
    }

    const mesasGuardadas = leerStorage("mesasBillar", null);
    const historialGuardado = leerStorage("historialBillar", []);
    const ingresosGuardados = leerStorage("ingresosBillar", 0);
    const avisosGuardados = leerStorage("avisosBillar", []);

    const mesas = Array.isArray(mesasGuardadas)
        ? mesasBase.map(baseMesa => {
              const mesaGuardada = mesasGuardadas.find(m => m.id === baseMesa.id) || {};

              return {
                  ...baseMesa,
                  ...mesaGuardada,
                  modoCobro: mesaGuardada.modoCobro || baseMesa.modoCobro,
                  avisoHoraMostrado: false,
                  limiteHoraAlcanzado: mesaGuardada.limiteHoraAlcanzado || false,
                  personas: mesaGuardada.personas || 1,
                  horaDetenida: mesaGuardada.horaDetenida || null
              };
          })
        : mesasBase.map(mesa => ({ ...mesa }));

    const historial = Array.isArray(historialGuardado) ? historialGuardado : [];
    const avisos = Array.isArray(avisosGuardados) ? avisosGuardados : [];

    let mesaSeleccionadaId = 1;
    let ingresosDia = typeof ingresosGuardados === "number" ? ingresosGuardados : 0;
    let historialExpandido = false;

    const mesaSeleccionada = document.getElementById("mesaSeleccionada");
    const infoMesa = document.getElementById("infoMesa");
    const infoModalidad = document.getElementById("infoModalidad");
    const infoEstado = document.getElementById("infoEstado");
    const infoTiempo = document.getElementById("infoTiempo");
    const infoPrecio = document.getElementById("infoPrecio");

    const btnIniciar = document.getElementById("btnIniciar");
    const btnFinalizar = document.getElementById("btnFinalizar");
    const btnPausar = document.getElementById("btnPausar");
    const btnToggleHistorial = document.getElementById("btnToggleHistorial");

    const totalMesas = document.getElementById("totalMesas");
    const mesasLibres = document.getElementById("mesasLibres");
    const mesasOcupadas = document.getElementById("mesasOcupadas");
    const mesasPausadas = document.getElementById("mesasPausadas");
    const ingresosDiaTexto = document.getElementById("ingresosDia");

    const buscarMesa = document.getElementById("buscarMesa");
    const filtroEstado = document.getElementById("filtroEstado");
    const gridMesas = document.getElementById("gridMesas");
    const cuerpoHistorial = document.getElementById("cuerpoHistorial");
    const listaAvisos = document.getElementById("listaAvisos");

    const bloquePrecio = document.getElementById("bloquePrecio");
    const nuevoPrecioHora = document.getElementById("nuevoPrecioHora");
    const btnGuardarPrecio = document.getElementById("btnGuardarPrecio");

    const bloquePoker = document.getElementById("bloquePoker");
    const montoManualPoker = document.getElementById("montoManualPoker");

    const bloqueModoCobro = document.getElementById("bloqueModoCobro");
    const modoCobroMesa = document.getElementById("modoCobroMesa");
    const avisoHora = document.getElementById("avisoHora");

    const cantidadPersonas = document.getElementById("cantidadPersonas");
    const btnDividirCobro = document.getElementById("btnDividirCobro");
    const resultadoDivision = document.getElementById("resultadoDivision");

    function guardarTodo() {
        localStorage.setItem("mesasBillar", JSON.stringify(mesas));
        localStorage.setItem("historialBillar", JSON.stringify(historial));
        localStorage.setItem("ingresosBillar", JSON.stringify(ingresosDia));
        localStorage.setItem("avisosBillar", JSON.stringify(avisos));
    }

    function obtenerMesaActual() {
        return mesas.find(mesa => mesa.id === mesaSeleccionadaId);
    }

    function obtenerHoraActual() {
        return new Date().toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    function formatearTiempo(segundos) {
        const horas = String(Math.floor(segundos / 3600)).padStart(2, "0");
        const minutos = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
        const segundosRestantes = String(segundos % 60).padStart(2, "0");
        return `${horas}:${minutos}:${segundosRestantes}`;
    }

    function calcularTotalBillar(mesa) {
        return Number(((mesa.tiempoSegundos / 3600) * mesa.precioHora).toFixed(2));
    }

    function calcularTotalActualMesa(mesa) {
        if (mesa.modalidad === "Poker") {
            const monto = Number(montoManualPoker.value);
            return !isNaN(monto) && monto >= 0 ? monto : 0;
        }
        return calcularTotalBillar(mesa);
    }

    function actualizarDivisionCobro() {
        if (!cantidadPersonas || !resultadoDivision) return;

        const mesa = obtenerMesaActual();
        const personas = Number(mesa.personas || 1);
        const total = calcularTotalActualMesa(mesa);

        if (mesa.modalidad === "Poker" && total === 0) {
            resultadoDivision.textContent = "Escribe primero el monto manual de Poker para dividir.";
            return;
        }

        const porPersona = total / personas;

        resultadoDivision.textContent =
            `Total: S/ ${total.toFixed(2)} | ${personas} persona(s): S/ ${porPersona.toFixed(2)} cada uno`;
    }

    function llenarSelect() {
        mesaSeleccionada.innerHTML = "";

        mesas.forEach(mesa => {
            const option = document.createElement("option");
            option.value = mesa.id;
            option.textContent = mesa.nombre;
            mesaSeleccionada.appendChild(option);
        });

        mesaSeleccionada.value = mesaSeleccionadaId;
    }

    function mostrarAvisoHora(mensaje) {
        if (!avisoHora) return;

        avisoHora.textContent = mensaje;
        avisoHora.classList.add("mostrar");

        clearTimeout(avisoHora._timeout);

        avisoHora._timeout = setTimeout(() => {
            avisoHora.classList.remove("mostrar");
            avisoHora.textContent = "";
        }, 5000);
    }

    function agregarAvisoHora(mesa) {
        avisos.unshift({
            mesaId: mesa.id,
            mesa: mesa.nombre,
            inicio: mesa.horaInicio || "--:--:--",
            detencion: mesa.horaDetenida || obtenerHoraActual(),
            tiempo: formatearTiempo(mesa.tiempoSegundos),
            mensaje: `${mesa.nombre} llegó a una hora de control.`,
            hora: obtenerHoraActual()
        });

        guardarTodo();
        renderAvisos();
    }

    function eliminarAvisoMesa(mesaId) {
        const avisosFiltrados = avisos.filter(aviso => aviso.mesaId !== mesaId);

        if (avisosFiltrados.length !== avisos.length) {
            avisos.length = 0;
            avisos.push(...avisosFiltrados);
            guardarTodo();
            renderAvisos();
        }
    }

    function renderAvisos() {
        if (!listaAvisos) return;

        if (avisos.length === 0) {
            listaAvisos.innerHTML = `<div class="sin-avisos">Aún no hay avisos.</div>`;
            return;
        }

        listaAvisos.innerHTML = avisos.map(aviso => `
            <div class="item-aviso">
                <div class="aviso-texto">
                    <strong>${aviso.mesa}</strong>
                    <span>${aviso.mensaje}</span>
                    <span>Inicio: ${aviso.inicio}</span>
                    <span>Detenida: ${aviso.detencion}</span>
                    <span>Tiempo acumulado: ${aviso.tiempo}</span>
                </div>
            </div>
        `).join("");
    }

    function mostrarBloquesSegunMesa() {
        const mesa = obtenerMesaActual();

        if (mesa.modalidad === "Poker") {
            bloquePrecio.style.display = "none";
            bloqueModoCobro.style.display = "none";
            bloquePoker.style.display = "block";
        } else {
            bloquePrecio.style.display = "block";
            bloqueModoCobro.style.display = "block";
            bloquePoker.style.display = "none";
        }
    }

    function cargarControlesMesaActual() {
        const mesa = obtenerMesaActual();

        if (mesa.modalidad === "Billar") {
            nuevoPrecioHora.value = mesa.precioHora;
            modoCobroMesa.value = mesa.modoCobro || "Hora";
        }

        cantidadPersonas.value = String(mesa.personas || 1);
        actualizarDivisionCobro();
    }

    function actualizarPanel() {
        const mesa = obtenerMesaActual();

        infoMesa.textContent = mesa.nombre;
        infoModalidad.textContent = mesa.modalidad;
        infoEstado.textContent = mesa.estado;
        infoTiempo.textContent = formatearTiempo(mesa.tiempoSegundos);

        if (mesa.modalidad === "Poker") {
            infoPrecio.textContent = "Manual";
        } else {
            infoPrecio.textContent = `S/ ${Number(mesa.precioHora).toFixed(2)}`;
        }

        mostrarBloquesSegunMesa();
        actualizarDivisionCobro();
    }

    function actualizarResumen() {
        totalMesas.textContent = mesas.length;
        mesasLibres.textContent = mesas.filter(mesa => mesa.estado === "Libre").length;
        mesasOcupadas.textContent = mesas.filter(mesa => mesa.estado === "Ocupada").length;
        mesasPausadas.textContent = mesas.filter(mesa => mesa.estado === "Pausada").length;
        ingresosDiaTexto.textContent = `S/ ${Number(ingresosDia).toFixed(2)}`;
    }

    function obtenerClaseMesa(mesa) {
        if (mesa.modalidad === "Poker") return "poker";
        if (mesa.estado === "Libre") return "libre";
        if (mesa.estado === "Ocupada") return "ocupada";
        return "pausada";
    }

    function renderMesas() {
        const textoBusqueda = buscarMesa.value.toLowerCase().trim();
        const estadoFiltro = filtroEstado.value;

        const mesasFiltradas = mesas.filter(mesa => {
            const coincideTexto = mesa.nombre.toLowerCase().includes(textoBusqueda);
            const coincideEstado = estadoFiltro === "Todos" || mesa.estado === estadoFiltro;
            return coincideTexto && coincideEstado;
        });

        gridMesas.innerHTML = "";

        if (mesasFiltradas.length === 0) {
            gridMesas.innerHTML = `<div class="sin-resultados">No se encontraron mesas.</div>`;
            return;
        }

        mesasFiltradas.forEach(mesa => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("mesa", obtenerClaseMesa(mesa));

            if (mesa.id === mesaSeleccionadaId) {
                tarjeta.classList.add("seleccionada");
            }

            tarjeta.innerHTML = `
                <div class="icono-mesa">${mesa.modalidad === "Poker" ? "🃏" : "🎱"}</div>
                <h3>${mesa.nombre}</h3>
                <span class="estado">${mesa.estado.toUpperCase()}</span>
            `;

            tarjeta.addEventListener("click", () => {
                mesaSeleccionadaId = mesa.id;
                mesaSeleccionada.value = mesa.id;
                actualizarPanel();
                cargarControlesMesaActual();
                renderMesas();
            });

            gridMesas.appendChild(tarjeta);
        });
    }

    function actualizarVistaHistorial() {
        if (!btnToggleHistorial) return;

        const filas = Array.from(document.querySelectorAll("#cuerpoHistorial tr"));

        if (filas.length === 0) {
            btnToggleHistorial.style.display = "none";
            return;
        }

        const soloMensajeVacio =
            filas.length === 1 &&
            filas[0].children.length === 1 &&
            filas[0].innerText.includes("Aún no hay sesiones registradas");

        if (soloMensajeVacio) {
            filas[0].style.display = "";
            btnToggleHistorial.style.display = "none";
            return;
        }

        filas.forEach((fila, index) => {
            fila.style.display = !historialExpandido && index >= LIMITE_HISTORIAL ? "none" : "";
        });

        if (filas.length > LIMITE_HISTORIAL) {
            btnToggleHistorial.style.display = "inline-block";
            btnToggleHistorial.textContent = historialExpandido ? "Ver menos" : "Ver más";
        } else {
            btnToggleHistorial.style.display = "none";
        }
    }

    function eliminarHistorial(index) {
        ingresosDia = Number((ingresosDia - historial[index].total).toFixed(2));

        if (ingresosDia < 0) {
            ingresosDia = 0;
        }

        historial.splice(index, 1);

        if (historial.length <= LIMITE_HISTORIAL) {
            historialExpandido = false;
        }

        guardarTodo();
        actualizarResumen();
        renderHistorial();
    }

    function renderHistorial() {
        if (historial.length === 0) {
            cuerpoHistorial.innerHTML = `
                <tr>
                    <td colspan="7">Aún no hay sesiones registradas.</td>
                </tr>
            `;
            actualizarVistaHistorial();
            return;
        }

        cuerpoHistorial.innerHTML = historial.map((item, index) => {
            const detalleDivision =
                item.personas && item.personas > 1
                    ? `<br><small>${item.personas} pers. | S/ ${Number(item.porPersona).toFixed(2)} c/u</small>`
                    : "";

            return `
                <tr>
                    <td>${item.mesa}</td>
                    <td>${item.modalidad}</td>
                    <td>${item.inicio}</td>
                    <td>${item.fin}</td>
                    <td>${item.tiempo}</td>
                    <td>S/ ${Number(item.total).toFixed(2)}${detalleDivision}</td>
                    <td>
                        <button class="btn-eliminar-historial" data-index="${index}" type="button">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join("");

        document.querySelectorAll(".btn-eliminar-historial").forEach(boton => {
            boton.addEventListener("click", () => {
                const index = Number(boton.dataset.index);
                eliminarHistorial(index);
            });
        });

        actualizarVistaHistorial();
    }

    function actualizarTodo() {
        llenarSelect();
        actualizarPanel();
        actualizarResumen();
        renderMesas();
        renderHistorial();
        renderAvisos();
    }

    mesaSeleccionada.addEventListener("change", () => {
        mesaSeleccionadaId = Number(mesaSeleccionada.value);
        actualizarPanel();
        cargarControlesMesaActual();
        renderMesas();
    });

    buscarMesa.addEventListener("input", renderMesas);
    filtroEstado.addEventListener("change", renderMesas);

    if (btnToggleHistorial) {
        btnToggleHistorial.addEventListener("click", () => {
            historialExpandido = !historialExpandido;
            actualizarVistaHistorial();
        });
    }

    btnGuardarPrecio.addEventListener("click", () => {
        const mesa = obtenerMesaActual();

        if (mesa.modalidad === "Poker") {
            alert("Poker no usa precio por hora.");
            return;
        }

        const nuevoPrecio = Number(nuevoPrecioHora.value);

        if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
            alert("Escribe un precio válido.");
            return;
        }

        mesa.precioHora = nuevoPrecio;
        guardarTodo();
        actualizarPanel();
        cargarControlesMesaActual();

        alert(`Nuevo precio guardado en ${mesa.nombre}: S/ ${nuevoPrecio.toFixed(2)}`);
    });

    nuevoPrecioHora.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            btnGuardarPrecio.click();
        }
    });

    modoCobroMesa.addEventListener("change", () => {
        const mesa = obtenerMesaActual();

        if (mesa.modalidad !== "Billar") return;

        mesa.modoCobro = modoCobroMesa.value;
        guardarTodo();

        mostrarAvisoHora(`${mesa.nombre} ahora cobra: ${mesa.modoCobro}`);
    });

    cantidadPersonas.addEventListener("change", () => {
        const mesa = obtenerMesaActual();
        const personas = Number(cantidadPersonas.value);

        if (!isNaN(personas) && personas >= 1 && personas <= 4) {
            mesa.personas = personas;
            guardarTodo();
            actualizarDivisionCobro();
        }
    });

    btnDividirCobro.addEventListener("click", (event) => {
        event.preventDefault();

        const mesa = obtenerMesaActual();
        const personas = Number(cantidadPersonas.value);

        if (isNaN(personas) || personas < 1 || personas > 4) {
            alert("Solo se permite dividir entre 1 y 4 personas.");
            return;
        }

        mesa.personas = personas;
        guardarTodo();
        actualizarDivisionCobro();

        mostrarAvisoHora(`${mesa.nombre}: cobro dividido entre ${personas} persona(s).`);
    });

    montoManualPoker.addEventListener("input", () => {
        actualizarDivisionCobro();
    });

    btnIniciar.addEventListener("click", () => {
        const mesa = obtenerMesaActual();

        if (mesa.estado === "Ocupada") {
            alert("Esta mesa ya está ocupada.");
            return;
        }

        if (mesa.estado === "Pausada") {
            mesa.estado = "Ocupada";
            mesa.horaDetenida = null;
            mesa.limiteHoraAlcanzado = false;
            mesa.avisoHoraMostrado = false;
            guardarTodo();
            actualizarTodo();
            alert(`${mesa.nombre} reanudada.`);
            return;
        }

        mesa.estado = "Ocupada";
        mesa.tiempoSegundos = 0;
        mesa.horaInicio = obtenerHoraActual();
        mesa.horaDetenida = null;
        mesa.avisoHoraMostrado = false;
        mesa.limiteHoraAlcanzado = false;

        guardarTodo();
        actualizarTodo();
        alert(`${mesa.nombre} iniciada.`);
    });

    btnPausar.addEventListener("click", () => {
        const mesa = obtenerMesaActual();

        if (mesa.estado === "Libre") {
            alert("No puedes pausar una mesa libre.");
            return;
        }

        if (mesa.estado === "Ocupada") {
            mesa.estado = "Pausada";
            mesa.horaDetenida = obtenerHoraActual();
            guardarTodo();
            actualizarTodo();
            alert(`${mesa.nombre} pausada.`);
            return;
        }

        if (mesa.estado === "Pausada") {
            mesa.estado = "Ocupada";
            mesa.horaDetenida = null;
            mesa.limiteHoraAlcanzado = false;
            mesa.avisoHoraMostrado = false;
            guardarTodo();
            actualizarTodo();
            alert(`${mesa.nombre} reanudada.`);
        }
    });

    btnFinalizar.addEventListener("click", () => {
        const mesa = obtenerMesaActual();

        if (mesa.estado === "Libre") {
            alert("Esa mesa ya está libre.");
            return;
        }

        let total = 0;

        if (mesa.modalidad === "Poker") {
            total = Number(montoManualPoker.value);

            if (isNaN(total) || total < 0) {
                alert("Escribe un cobro manual válido para Poker.");
                return;
            }
        } else {
            total = calcularTotalBillar(mesa);
        }

        const personas = Number(mesa.personas || 1);
        const totalPorPersona = Number((total / personas).toFixed(2));

        historial.unshift({
            mesa: mesa.nombre,
            modalidad: mesa.modalidad,
            inicio: mesa.horaInicio || "--:--:--",
            fin: obtenerHoraActual(),
            tiempo: formatearTiempo(mesa.tiempoSegundos),
            total: total,
            personas: personas,
            porPersona: totalPorPersona
        });

        ingresosDia = Number((ingresosDia + total).toFixed(2));

        mesa.estado = "Libre";
        mesa.tiempoSegundos = 0;
        mesa.horaInicio = null;
        mesa.horaDetenida = null;
        mesa.avisoHoraMostrado = false;
        mesa.limiteHoraAlcanzado = false;

        eliminarAvisoMesa(mesa.id);

        if (mesa.modalidad === "Poker") {
            montoManualPoker.value = "";
        }

        guardarTodo();
        actualizarTodo();
        alert(`${mesa.nombre} finalizada. Total: S/ ${total.toFixed(2)} | Por persona: S/ ${totalPorPersona.toFixed(2)}`);
    });

    setInterval(() => {
        let huboCambio = false;

        mesas.forEach(mesa => {
            if (mesa.estado === "Ocupada") {
                mesa.tiempoSegundos++;
                huboCambio = true;

                if (
                    mesa.modalidad === "Billar" &&
                    mesa.modoCobro === "Hora" &&
                    mesa.tiempoSegundos > 0 &&
                    mesa.tiempoSegundos % 3600 === 0
                ) {
                    mesa.estado = "Pausada";
                    mesa.horaDetenida = obtenerHoraActual();
                    mesa.limiteHoraAlcanzado = true;
                    mesa.avisoHoraMostrado = true;

                    agregarAvisoHora(mesa);
                    mostrarAvisoHora(
                        `${mesa.nombre} completó ${formatearTiempo(mesa.tiempoSegundos)}. Inicio: ${mesa.horaInicio} | Detenida: ${mesa.horaDetenida}`
                    );
                }
            }
        });

        if (huboCambio) {
            guardarTodo();
        }

        actualizarPanel();
        actualizarResumen();
        renderMesas();
    }, 1000);

    actualizarTodo();
    cargarControlesMesaActual();
});