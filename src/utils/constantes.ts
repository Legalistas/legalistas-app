// Copia de legalistas-clientes/src/lib/constantes.ts: si cambia allá, cambiar acá.
import type { EstadoCaso, EstadoConsulta } from "../types/portal";

// Etapas del caso (cases.stageId). Colores de STAGE_META de la app de abogados;
// el texto explica la etapa en palabras simples para el cliente.
export interface Etapa {
  id: number;
  nombre: string;
  explicacion: string;
  color: string;
  fondo: string;
}

export const ETAPAS: Etapa[] = [
  {
    id: 1,
    nombre: "Documentación",
    explicacion: "Estamos reuniendo la documentación de tu caso.",
    color: "#177682",
    fondo: "#E8F8FA",
  },
  {
    id: 2,
    nombre: "Administrativo",
    explicacion: "Tu reclamo está en trámite ante la aseguradora o la Superintendencia.",
    color: "#6d28d9",
    fondo: "#EDE9FE",
  },
  {
    id: 3,
    nombre: "Judicial",
    explicacion: "Tu caso está en la Justicia.",
    color: "#1d4ed8",
    fondo: "#DBEAFE",
  },
  {
    id: 4,
    nombre: "Incapacidad",
    explicacion: "Se está determinando tu porcentaje de incapacidad.",
    color: "#b45309",
    fondo: "#FEF3C7",
  },
  {
    id: 5,
    nombre: "Cierre",
    explicacion: "Tu caso está en la etapa de cierre y cobro.",
    color: "#15803d",
    fondo: "#DCFCE7",
  },
  {
    id: 6,
    nombre: "Finalizado",
    explicacion: "Tu caso terminó. ¡Gracias por confiar en Legalistas!",
    color: "#c2410c",
    fondo: "#FFEDD5",
  },
  {
    id: 7,
    nombre: "Archivado",
    explicacion: "Este caso está archivado.",
    color: "#475569",
    fondo: "#F1F5F9",
  },
];

/** Etapas que se muestran en la línea de avance (las dos últimas son finales). */
export const ETAPAS_AVANCE = ETAPAS.filter((e) => e.id <= 5);

export const etapaPorId = (id: number | null | undefined): Etapa | null =>
  ETAPAS.find((e) => e.id === id) ?? null;

// Consulta que todavía no es caso: la columna del tablero de Ventas (CRM,
// backend/src/constants/crmColumns.ts) contada en palabras del cliente.
export const PASOS_TRAMITE = [
  { clave: "consulta", nombre: "Recibimos tu consulta", columnas: [1] },
  { clave: "reunion", nombre: "Reunión con el estudio", columnas: [2, 3] },
  { clave: "analisis", nombre: "Analizamos tu caso", columnas: [4, 12, 5] },
  { clave: "poder", nombre: "Firma del poder", columnas: [6, 8] },
  { clave: "inicio", nombre: "Iniciamos tu caso", columnas: [9] },
] as const;

const ESTADO_TRAMITE: Record<number, { titulo: string; texto: string }> = {
  1: {
    titulo: "Recibimos tu consulta",
    texto: "Un abogado la está revisando. Si nos mandás tu documentación, avanzamos más rápido.",
  },
  2: {
    titulo: "Vamos a coordinar una reunión",
    texto: "Te vamos a contactar para acordar el día.",
  },
  3: {
    titulo: "Tenés una reunión coordinada",
    texto: "Traé o mandanos la documentación que tengas.",
  },
  4: {
    titulo: "Estamos analizando tu caso",
    texto: "Revisamos todo lo que nos contaste y mandaste.",
  },
  12: {
    titulo: "Estamos con los telegramas",
    texto: "Preparamos y enviamos los telegramas de tu reclamo.",
  },
  5: {
    titulo: "Esperamos tu confirmación",
    texto: "Para seguir necesitamos que nos confirmes. Escribinos si tenés dudas.",
  },
  6: {
    titulo: "Vamos a coordinar la firma del poder",
    texto: "El poder nos permite representarte. Te contactamos para firmarlo.",
  },
  8: {
    titulo: "Falta firmar el poder",
    texto: "Es lo último que necesitamos para iniciar tu caso.",
  },
  9: {
    titulo: "Estamos iniciando tu caso",
    texto: "Muy pronto lo vas a ver en «Mis casos» con todas sus novedades.",
  },
};

export const estadoTramite = (columna: number | null) =>
  ESTADO_TRAMITE[columna ?? 1] ?? ESTADO_TRAMITE[1];

export const pasoTramite = (columna: number | null): number =>
  Math.max(
    0,
    PASOS_TRAMITE.findIndex((p) => (p.columnas as readonly number[]).includes(columna ?? 1)),
  );

// Lo primero que pide el estudio para armar el caso.
export const DOCUMENTACION_INICIAL = [
  "DNI de frente y de dorso",
  "Tus últimos recibos de sueldo",
  "Estudios médicos, certificados o denuncias que tengas",
  "Telegramas, cartas documento o mails del reclamo",
];

export const ESTADOS_CASO: Record<EstadoCaso, { nombre: string; color: string; fondo: string }> = {
  IN_PROGRESS: { nombre: "En curso", color: "#1d4ed8", fondo: "#DBEAFE" },
  WON: { nombre: "Ganado", color: "#15803d", fondo: "#DCFCE7" },
  LOST: { nombre: "Finalizado", color: "#475569", fondo: "#F1F5F9" },
};

export const ESTADOS_CONSULTA: Record<
  EstadoConsulta,
  { nombre: string; explicacion: string; color: string; fondo: string }
> = {
  PENDING: {
    nombre: "Pendiente",
    explicacion: "Tu abogado todavía no la leyó.",
    color: "#b45309",
    fondo: "#FEF3C7",
  },
  OPEN: {
    nombre: "Abierta",
    explicacion: "Tu abogado está respondiendo.",
    color: "#15803d",
    fondo: "#DCFCE7",
  },
  CLOSED: {
    nombre: "Cerrada",
    explicacion: "Esta consulta terminó.",
    color: "#475569",
    fondo: "#F1F5F9",
  },
};

// Servicios (cases.servicesId), mismos nombres que el backend (constants/services.ts).
export const SERVICIOS: Record<number, string> = {
  1: "Accidente de trabajo",
  2: "Accidente de tránsito",
  3: "Jubilaciones",
  4: "Sucesiones",
  5: "Daños y materiales",
  6: "Despidos",
  7: "Civil",
  8: "Ejecutivos",
  9: "Accidente in itinere",
  10: "Enfermedad profesional",
};

// WhatsApp y teléfono: los mismos de la landing (legalistas.ar).
export const CONTACTO = {
  email: "soporte@legalistas.ar",
  telefono: "+54 9 11 2705-9000",
  whatsapp: `https://wa.me/5491127059000?text=${encodeURIComponent(
    "Hola, soy cliente de Legalistas y tengo una consulta",
  )}`,
};

// Datos personales: mismos códigos que el backoffice
// (components/customers/CustomerRegistrationModal.tsx y constant/estado-civil.ts).
export const TIPOS_DOCUMENTO = [
  { valor: 1, texto: "DNI" },
  { valor: 2, texto: "Pasaporte" },
  { valor: 3, texto: "CUIT/CUIL" },
];

export const GENEROS = [
  { valor: 1, texto: "Masculino" },
  { valor: 2, texto: "Femenino" },
  { valor: 3, texto: "X" },
];

// El texto se guarda tal cual (lo usan escritos como el RPU).
export const ESTADOS_CIVILES = [
  "Soltero/a",
  "Casado/a",
  "Divorciado/a",
  "Viudo/a",
  "Separado/a",
  "En unión convivencial",
];
