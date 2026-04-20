import { autenticar, obtenerSesion } from "./auth.js";

if (obtenerSesion()) {
  window.location.href = "index.html";
}

const form = document.getElementById("formLogin");
const mensaje = document.getElementById("mensajeLogin");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value.trim();
  const clave = document.getElementById("clave").value.trim();
  const session = autenticar(usuario, clave);

  if (!session) {
    mensaje.textContent = "Usuario o contraseña incorrecta.";
    mensaje.style.color = "#b91c1c";
    return;
  }

  mensaje.textContent = `Bienvenido ${session.nombre}. Redirigiendo...`;
  mensaje.style.color = "#166534";
  setTimeout(() => window.location.href = "index.html", 500);
});
