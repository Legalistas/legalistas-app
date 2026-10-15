import { BACKEND_URL as BACKEND } from "../config/api";

// Formatos para Argentina (es-AR). Las fechas "solo día" del backend (fecha de
// accidente, eventos) vienen a medianoche UTC: se muestran en UTC para que no
// salgan un día antes.

const fechaLarga = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});
const fechaCorta = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});
const diaUtc = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const soloFechaUtc = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const hora = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Argentina/Buenos_Aires",
});

const valida = (valor: string | Date | null | undefined): Date | null => {
  if (!valor) return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatoFecha = (v: string | Date | null | undefined) => {
  const d = valida(v);
  return d ? fechaLarga.format(d) : "—";
};

export const formatoFechaCorta = (v: string | Date | null | undefined) => {
  const d = valida(v);
  return d ? fechaCorta.format(d) : "—";
};

/** Fecha sin hora guardada como medianoche UTC (accidente, eventos). */
export const formatoDia = (v: string | Date | null | undefined, conDiaSemana = false) => {
  const d = valida(v);
  if (!d) return "—";
  return conDiaSemana ? diaUtc.format(d) : soloFechaUtc.format(d);
};

export const formatoFechaHora = (v: string | Date | null | undefined) => {
  const d = valida(v);
  return d ? `${fechaCorta.format(d)}, ${hora.format(d)} h` : "—";
};

/** "Hace un momento", "Hace 5 min", "Ayer", "Hace 3 días" o la fecha. */
export function haceCuanto(v: string | Date | null | undefined): string {
  const d = valida(v);
  if (!d) return "—";
  const seg = Math.round((Date.now() - d.getTime()) / 1000);
  if (seg < 60) return "Hace un momento";
  if (seg < 3600) return `Hace ${Math.floor(seg / 60)} min`;
  if (seg < 86_400) return `Hace ${Math.floor(seg / 3600)} h`;
  const dias = Math.floor(seg / 86_400);
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  return formatoFechaCorta(d);
}

export function formatoTamanio(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;
}

export const formatoPesos = (monto: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(monto);


/**
 * Fotos: las nuevas son URL completas de MinIO o de Google; las viejas, rutas
 * del backend. `legalistas-avatar.jpg` es el avatar genérico que se les pone a
 * todos al crearlos: no es una foto (se muestran las iniciales).
 */
export function urlImagen(ruta: string | null | undefined): string | null {
  if (!ruta?.trim() || /\/legalistas-avatar\.\w+$/i.test(ruta)) return null;
  // Google la guarda a 96 px (=s96-c): se pide más grande para que se vea nítida.
  if (/googleusercontent\.com\//.test(ruta)) return ruta.replace(/=s\d+(-c)?$/, "=s256-c");
  if (/^https?:\/\//.test(ruta)) return ruta;
  return `${BACKEND}${ruta.startsWith("/") ? "" : "/"}${ruta}`;
}
