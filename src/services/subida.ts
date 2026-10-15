import type { Documento } from "../types/portal";
import { api, ErrorApi } from "./portal";

// Subida de documentos del cliente en 3 pasos (ver backend
// modules/app/client-documents.service.ts):
//   1. /subida → URL firmado de MinIO
//   2. PUT del archivo directo a MinIO (con progreso)
//   3. confirmación → queda registrado en el caso (o en la consulta del CRM)
//      y se avisa al abogado (o a Ventas)

export const MAX_MB = 25;

/** Archivo elegido con la cámara, la galería o el selector de archivos. */
export interface Archivo {
  uri: string;
  nombre: string;
  tipo: string;
}

/** Las fotos del teléfono no traen un nombre útil: "Foto 28-09-2026 14.05.jpg". */
export function nombreParaFoto(nombre: string | null | undefined, tipo: string): string {
  if (nombre && !/^(image|IMG_\d+|photo|[\w-]{20,}|\d+)\.(jpe?g|png|heic)$/i.test(nombre)) {
    return nombre;
  }
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const ext = /png/.test(tipo) ? "png" : /hei[cf]/.test(tipo) ? "heic" : "jpg";
  return `Foto ${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}.${ext}`;
}

function subirAMinio(
  url: string,
  contenido: Blob,
  tipo: string,
  alProgresar: (pct: number) => void,
): Promise<void> {
  return new Promise((resolver, rechazar) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", tipo || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) alProgresar(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolver()
        : rechazar(new ErrorApi(xhr.status, "No se pudo subir el archivo. Probá de nuevo."));
    xhr.onerror = () =>
      rechazar(new ErrorApi(0, "Se cortó la conexión mientras subía. Probá de nuevo."));
    xhr.send(contenido);
  });
}

/** `base`: "/casos/{id}" o "/tramites/{id}" (consulta que todavía no es caso). */
export async function subirDocumento(
  base: string,
  archivo: Archivo,
  opciones: { descripcion?: string; alProgresar?: (pct: number) => void } = {},
): Promise<Documento> {
  let contenido: Blob;
  try {
    contenido = await (await fetch(archivo.uri)).blob();
  } catch {
    throw new ErrorApi(0, `No pudimos leer "${archivo.nombre}". Elegilo de nuevo.`);
  }
  if (contenido.size > MAX_MB * 1024 * 1024) {
    throw new ErrorApi(400, `"${archivo.nombre}" pesa más de ${MAX_MB} MB.`);
  }
  const { key, url } = await api<{ key: string; url: string }>(`${base}/documentos/subida`, {
    method: "POST",
    body: { nombre: archivo.nombre, tamanio: contenido.size },
  });
  await subirAMinio(url, contenido, archivo.tipo, (pct) =>
    opciones.alProgresar?.(Math.min(pct, 99)),
  );
  const doc = await api<Documento>(`${base}/documentos`, {
    method: "POST",
    body: { key, nombre: archivo.nombre, descripcion: opciones.descripcion || undefined },
  });
  opciones.alProgresar?.(100);
  return doc;
}
