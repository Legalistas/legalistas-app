// Los nombres se guardan "Apellido Nombre(s)" ("Bravo Gisela Marisel"). Misma
// regla que el backend (modules/escritos/utils/nombre.ts): las partículas del
// principio ("De La Fuente") son parte del apellido.

const PARTICULAS = new Set([
  "de",
  "del",
  "la",
  "las",
  "los",
  "di",
  "da",
  "dos",
  "do",
  "van",
  "von",
  "der",
  "den",
  "san",
  "santa",
  "mac",
  "mc",
  "le",
]);

const capitalizar = (palabra: string) =>
  palabra.charAt(0).toLocaleUpperCase("es-AR") + palabra.slice(1).toLocaleLowerCase("es-AR");

export function separarNombre(completo: string | null | undefined) {
  const palabras = (completo ?? "").trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return { apellido: null, nombres: null };
  if (palabras.length === 1) return { apellido: palabras[0], nombres: null };
  let fin = 0;
  while (fin < palabras.length - 1 && PARTICULAS.has(palabras[fin].toLowerCase())) fin++;
  const nombres = palabras.slice(fin + 1);
  return {
    apellido: palabras.slice(0, fin + 1).join(" "),
    nombres: nombres.length ? nombres.join(" ") : null,
  };
}

/** "Bravo Gisela Marisel" → "Gisela". Sin nombres, el apellido. */
export function nombreDePila(completo: string | null | undefined): string {
  const { apellido, nombres } = separarNombre(completo);
  const primero = (nombres ?? apellido ?? "").split(" ")[0];
  return primero ? capitalizar(primero) : "";
}

/** "BRAVO GISELA" → "Bravo Gisela" (los nombres a veces vienen en mayúsculas). */
export function nombreLindo(completo: string | null | undefined): string {
  return (completo ?? "").trim().split(/\s+/).filter(Boolean).map(capitalizar).join(" ");
}

/** Inicial del apellido y del nombre: "Andereggen Agustín" → "AA", "De La Fuente Juan" → "DJ". */
export function iniciales(completo: string | null | undefined): string {
  const { apellido, nombres } = separarNombre(completo);
  return ((apellido?.[0] ?? "") + (nombres?.[0] ?? "")).toLocaleUpperCase("es-AR") || "?";
}
