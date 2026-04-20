import { STORAGE_KEYS, leerStorage, guardarStorage } from "./storage.js";

const USERS = [
  { usuario: "admin", clave: "1234", nombre: "Administrador" },
  { usuario: "cesar", clave: "billar2026", nombre: "Cesar" }
];

export function autenticar(usuario, clave) {
  const user = USERS.find((u) => u.usuario === usuario && u.clave === clave);
  if (!user) return null;
  const session = { usuario: user.usuario, nombre: user.nombre, loginAt: Date.now() };
  guardarStorage(STORAGE_KEYS.session, session);
  return session;
}

export function obtenerSesion() {
  return leerStorage(STORAGE_KEYS.session, null);
}

export function cerrarSesion() {
  localStorage.removeItem(STORAGE_KEYS.session);
}
