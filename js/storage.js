export const STORAGE_KEYS = {
  app: "billarProDataV1",
  session: "billarProSession"
};

export function leerStorage(clave, defecto) {
  try {
    const value = JSON.parse(localStorage.getItem(clave));
    return value ?? defecto;
  } catch {
    return defecto;
  }
}

export function guardarStorage(clave, value) {
  localStorage.setItem(clave, JSON.stringify(value));
}
