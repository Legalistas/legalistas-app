// Compartido entre el servidor (historial) y el navegador (sesiones abiertas).

/** Descripción corta del dispositivo a partir del user agent ("Android · Chrome"). */
export function dispositivoDe(userAgent: string | null): string | null {
  if (!userAgent) return null;
  // App móvil (legalistas-app): "Legalistas-App/1.0.5 (Android)".
  const movil = /^Legalistas-App\/\S+ \((\w+)\)/.exec(userAgent);
  if (movil) return `${movil[1]} · App de Legalistas`;
  const ua = userAgent;
  const so = /iPhone|iPad|iPod/.test(ua)
    ? "iPhone/iPad"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "Mac"
          : /Linux/.test(ua)
            ? "Linux"
            : "Otro";
  const navegador = /Edg\//.test(ua)
    ? "Edge"
    : /SamsungBrowser/.test(ua)
      ? "Samsung Internet"
      : /OPR\//.test(ua)
        ? "Opera"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Navegador";
  const app = /display-mode=standalone/.test(ua) ? " (app)" : "";
  return `${so} · ${navegador}${app}`;
}
