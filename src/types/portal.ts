// Tipos que el portal de clientes (/api/portal/*) le devuelve a la app. Copia de
// legalistas-clientes/src/lib/tipos.ts: si cambia allá, cambiar acá.

export type EstadoCaso = "IN_PROGRESS" | "WON" | "LOST";
export type EstadoConsulta = "PENDING" | "OPEN" | "CLOSED";

export interface Abogado {
  nombre: string;
  imagen: string | null;
}

export interface Titular {
  id: number;
  nombre: string;
}

export interface ConsultaResumen {
  id: number;
  titulo: string;
  estado: EstadoConsulta;
  creada: string;
  actualizada: string;
  ultimoMensaje: string | null;
  noLeidos: number;
}

export interface CasoResumen {
  id: number;
  titulo: string;
  numero: string | null;
  servicio: string | null;
  etapaId: number | null;
  estado: EstadoCaso;
  titular: Titular;
  abogado: Abogado | null;
  lesion: string | null;
  porcentajeIncapacidad: number | null;
  fechaAccidente: string | null;
  consultaAbierta: ConsultaResumen | null;
  creado: string;
  actualizado: string;
}

export interface Expediente {
  id: number;
  titulo: string;
  tipo: string | null;
  cuij: string | null;
  juzgado: string | null;
  jurisdiccion: string | null;
  inicio: string | null;
}

export interface CasoDetalle extends CasoResumen {
  expedientes: Expediente[];
  consultas: ConsultaResumen[];
}

export interface Mensaje {
  id: number;
  texto: string;
  deCliente: boolean;
  fecha: string;
}

export interface ConsultaDetalle {
  id: number;
  titulo: string;
  estado: EstadoConsulta;
  caso: { id: number; titulo: string };
  mensajes: Mensaje[];
}

export interface Documento {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  tamanio: number;
  tipo: string;
  extension: string;
  subidoEl: string;
  subidoPorCliente: boolean;
  subidoPor: string | null;
}

export interface EventoCaso {
  id: number;
  casoId: number;
  casoTitulo: string;
  titulo: string;
  fecha: string;
  hora: string | null;
  lugar: string | null;
  confirmado: boolean;
  expediente: string | null;
}

export interface Domicilio {
  calle: string | null;
  numero: string | null;
  /** Piso, departamento o referencia (user_addresses.description). */
  depto: string | null;
  localidad: string | null;
  codigoPostal: string | null;
  provinciaId: number | null;
  provincia: string | null;
}

export interface Perfil {
  id: number;
  nombre: string;
  email: string;
  imagen: string | null;
  telefono: string | null;
  fechaNacimiento: string | null;
  tipoDocumento: number | null;
  numeroDocumento: string | null;
  cuit: string | null;
  genero: number | null;
  estadoCivil: string | null;
  domicilio: Domicilio;
  avisos: { email: boolean; casos: boolean; mensajes: boolean };
  /** Datos que le faltan completar (en palabras para mostrar). */
  faltantes: string[];
}

export interface Provincia {
  id: number;
  nombre: string;
}

export interface Actividad {
  id: number;
  tipo: string;
  descripcion: string;
  casoId: number | null;
  fecha: string;
  dispositivo: string | null;
}

export interface Yo {
  email: string;
  saludo: string;
  personas: Titular[];
}

/** Consulta del CRM que todavía no es caso (el cliente ya puede mandar documentación). */
export interface Tramite {
  id: number;
  titular: Titular;
  /** Columna del CRM (ver PASOS_TRAMITE en constantes). */
  columna: number | null;
  servicio: string | null;
  creado: string;
  actualizado: string;
}

export type TipoAviso = "respuesta" | "etapa" | "documento" | "cita" | "aviso";

/** Novedad para la campanita: se arma con lo que ya pasa en el caso. */
export interface Aviso {
  /** Único entre tipos ("m-123", "e-45"…). */
  id: string;
  tipo: TipoAviso;
  titulo: string;
  texto: string | null;
  fecha: string;
  href: string | null;
}
