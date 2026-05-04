// ============================================================
// models/Mesa.js  — v4 (Auto-Pausas Absolutas y Fix de Cartas)
// ============================================================

class Mesa {
    constructor(numero, tipo, precioHora = 8) {
        this.numero         = numero;
        this.tipo           = tipo;      
        this.nombreCustom   = `Mesa ${numero}`; 
        this.estado         = 'libre';   
        this.precioHora     = precioHora;

        this.inicioTimestamp        = null;
        this.finTimestamp           = null;
        this.ultimoInicio           = null;
        this.milisegundosAcumulados = 0;
        this.totalManualPoker       = 0;
        this.jugadoresCartas        = [];

        this.intervaloMinutos = 0; 
        this.siguientePausaMs = 0; 
    }

    // ── Jugadores de cartas ────────────────────────────────

    agregarJugadorCarta(nombre) {
        if (this.tipo !== 'cartas') return;
        if (this.estado === 'libre') this.iniciar();

        this.jugadoresCartas.push({
            id:                  Date.now(),
            nombre:              nombre,
            tiempoMesaAlEntrar:  this.obtenerTiempoActualMs(),
            entradaTimestamp:    Date.now(), 
            cobrado:             false,      
        });
    }

    calcularDeudaJugador(jugador) {
        if (!this.inicioTimestamp) return 0; // Si la mesa no ha iniciado, no hay deuda
        
        let tiempoJugadoMs;
        
        // 👇 INICIO DEL FIX: Solución para que el tiempo de los jugadores respete las pausas
        if (jugador.tiempoMesaAlEntrar !== undefined) {
            // JUGADORES NUEVOS: Usan el cronómetro interno de la mesa
            tiempoJugadoMs = this.obtenerTiempoActualMs() - jugador.tiempoMesaAlEntrar;
        } else {
            // JUGADORES VIEJOS (CACHÉ): Ignoramos el reloj de la PC y forzamos el cronómetro de la mesa
            tiempoJugadoMs = this.obtenerTiempoActualMs();
        }
        // 👆 FIN DEL FIX
        
        const horasJugadas = tiempoJugadoMs / 3600000;
        let horasCompletas = Math.floor(horasJugadas);
        
        if (horasCompletas < 1) {
            horasCompletas = 1;
        }
        
        return horasCompletas * 1.00;
    }

    eliminarJugador(id) {
        this.jugadoresCartas = this.jugadoresCartas.filter(j => j.id !== id);
        if (this.jugadoresCartas.length === 0) {
            this.limpiarMesa();
        }
    }

    // ── Control de tiempo ──────────────────────────────────

    iniciar() {
        if (this.estado !== 'libre') return;
        this.estado          = 'jugando';
        this.inicioTimestamp = Date.now();
        this.ultimoInicio    = Date.now();
        
        if (this.intervaloMinutos > 0) {
            this.siguientePausaMs = this.intervaloMinutos * 60000;
        }
    }

    pausar() {
        if (this.estado !== 'jugando') return;
        this.estado = 'pausada';
        this.milisegundosAcumulados += (Date.now() - this.ultimoInicio);
        this.ultimoInicio = null;
    }

    reanudar() {
        if (this.estado !== 'pausada') return;
        this.estado       = 'jugando';
        this.ultimoInicio = Date.now();
        
        // LÓGICA INTELIGENTE: Si reanuda, busca el SIGUIENTE bloque absoluto.
        if (this.intervaloMinutos > 0) {
            let actualMs = this.obtenerTiempoActualMs();
            let pasoMs = this.intervaloMinutos * 60000;
            
            if (actualMs >= this.siguientePausaMs) {
                let multiploSiguiente = Math.floor(actualMs / pasoMs) + 1;
                this.siguientePausaMs = multiploSiguiente * pasoMs;
            }
        }
    }

    // ── Pausa Automática Recurrente (Tiempo Absoluto) ──────
    
    configurarTimer(minutos) {
        this.intervaloMinutos = minutos;
        if (minutos > 0) {
            let actualMs = this.obtenerTiempoActualMs();
            let pasoMs = minutos * 60000;
            let multiploPrevio = Math.floor(actualMs / pasoMs);
            
            if (multiploPrevio === 0) {
                this.siguientePausaMs = pasoMs;
            } else {
                this.siguientePausaMs = multiploPrevio * pasoMs;
            }
        } else {
            this.siguientePausaMs = 0; // Tiempo corrido
        }
    }

    verificarAutoPausa() {
        if (this.estado === 'jugando' && this.intervaloMinutos > 0) {
            if (this.obtenerTiempoActualMs() >= this.siguientePausaMs) {
                this.pausar();
                return true; 
            }
        }
        return false;
    }

    // ── Snapshots y Finalización ────────────────────────────

    finalizar() {
        if (this.estado === 'libre') return null;

        if (this.estado === 'jugando') this.pausar();

        this.finTimestamp   = Date.now();
        const tiempoTotalMs = this.milisegundosAcumulados;

        let totalPagar;
        if (this.tipo === 'poker') {
            totalPagar = this.totalManualPoker || 0;
        } else if (this.tipo === 'cartas') {
            totalPagar = this.jugadoresCartas.reduce(
                (suma, j) => suma + this.calcularDeudaJugador(j), 0
            );
        } else {
            totalPagar = this.calcularTotalConMs(tiempoTotalMs);
        }

        return {
            numero:             this.numero,
            tipo:               this.tipo,
            precioHora:         this.precioHora,
            nombreCustom:       this.nombreCustom, 
            tiempoTotalMinutos: tiempoTotalMs / 60000,
            horaInicioFormato:  this.formatearHora(this.inicioTimestamp),
            horaFinFormato:     this.formatearHora(this.finTimestamp),
            totalPagar:         totalPagar,
            jugadores:          this.tipo === 'cartas'
                ? this.jugadoresCartas.map(j => ({
                    nombre: j.nombre,
                    deuda:  this.calcularDeudaJugador(j),
                  }))
                : [],
        };
    }

    confirmarFin() {
        this.limpiarMesa();
    }

    // ── Cálculos ───────────────────────────────────────────

    obtenerTiempoActualMs() {
        let total = this.milisegundosAcumulados;
        if (this.estado === 'jugando' && this.ultimoInicio) {
            total += (Date.now() - this.ultimoInicio);
        }
        return total;
    }

    calcularTotal() {
        if (this.tipo === 'cartas') {
            return this.jugadoresCartas.reduce(
                (suma, j) => suma + this.calcularDeudaJugador(j), 0
            );
        }
        if (this.tipo === 'poker') return this.totalManualPoker || 0;
        return (this.obtenerTiempoActualMs() / 3600000) * this.precioHora;
    }

    calcularTotalConMs(ms) {
        return (ms / 3600000) * this.precioHora;
    }

    actualizarPrecio(nuevoPrecio) {
        const parsed = parseFloat(nuevoPrecio);
        if (!isNaN(parsed) && parsed >= 0) this.precioHora = parsed;
    }

    // ── Utilidades ─────────────────────────────────────────

    formatearHora(timestamp) {
        if (!timestamp) return '--:--';
        return new Date(timestamp).toLocaleTimeString('es-PE', {
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    }

    limpiarMesa() {
        this.estado                 = 'libre';
        this.inicioTimestamp        = null;
        this.finTimestamp           = null;
        this.ultimoInicio           = null;
        this.milisegundosAcumulados = 0;
        this.totalManualPoker       = 0;
        this.jugadoresCartas        = [];
        
        this.intervaloMinutos       = 0;
        this.siguientePausaMs       = 0;
        
        this.nombreCustom = `Mesa ${this.numero}`; 
    }
}

export default Mesa;