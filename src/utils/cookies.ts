/**
 * Lee los Set-Cookie de una respuesta del portal y devuelve las cookies que
 * quedan. React Native junta todos los Set-Cookie en un solo texto separado
 * por comas (y la fecha de `Expires` también trae una coma).
 */
export function leerCookies(cabecera: string | null, actuales: Record<string, string>) {
  const nuevas = { ...actuales };
  for (const parte of (cabecera ?? "").split(/,(?=\s*[^;,=\s]+=)/)) {
    const [par, ...atributos] = parte.split(";");
    const igual = par.indexOf("=");
    if (igual < 1) continue;
    const nombre = par.slice(0, igual).trim();
    const valor = par.slice(igual + 1).trim();
    // session_data es la copia de 5 minutos de la sesión: sin ella, cerrar la
    // sesión desde otro dispositivo corta esta al instante.
    if (nombre.endsWith("session_data")) continue;
    if (!valor || atributos.some((a) => /^\s*max-age=0\s*$/i.test(a))) delete nuevas[nombre];
    else nuevas[nombre] = valor;
  }
  return nuevas;
}
