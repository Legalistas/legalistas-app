// Recursos gratuitos: PDF publicados en el portal ({PORTAL_URL}/recursos/...).
// Copia de legalistas-clientes/src/features/recursos/datos.ts.

export type Categoria = "Guías y legislación" | "Modelos y formularios" | "Folletos";

export interface Recurso {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: Categoria;
  archivo: string;
  destacado?: boolean;
}

export const CATEGORIAS: Categoria[] = ["Guías y legislación", "Modelos y formularios", "Folletos"];

export const RECURSOS: Recurso[] = [
  {
    id: "documentacion-obligatoria-accidentes-trabajo",
    titulo: "Documentación obligatoria — Accidentes de trabajo",
    descripcion:
      "Qué documentación tenés que presentar después de un accidente de trabajo, según la normativa de las ART.",
    categoria: "Guías y legislación",
    archivo: "/recursos/pdfs/documentacion-obligatoria-accidentes-trabajo.pdf",
    destacado: true,
  },
  {
    id: "documentacion-obligatoria-accidentes-transito",
    titulo: "Documentación obligatoria — Accidentes de tránsito",
    descripcion: "Qué documentación tenés que juntar después de un accidente de tránsito.",
    categoria: "Guías y legislación",
    archivo: "/recursos/pdfs/documentacion-obligatoria-accidentes-transito.pdf",
    destacado: true,
  },
  {
    id: "lista-de-verificacion",
    titulo: "Lista de verificación — Accidentes de trabajo",
    descripcion: "Paso a paso para no olvidarte de nada después de un accidente laboral.",
    categoria: "Guías y legislación",
    archivo: "/recursos/pdfs/lista-de-verificacion.pdf",
    destacado: true,
  },
  {
    id: "recomendaciones-tratamiento-art",
    titulo: "Tratamiento y prestaciones médicas de la ART",
    descripcion: "Qué tratamientos y prestaciones médicas te tiene que dar la ART.",
    categoria: "Guías y legislación",
    archivo: "/recursos/pdfs/recomendaciones-tratamiento-prestaciones-art.pdf",
    destacado: true,
  },
  {
    id: "accidentes-o-enfermedades-laborales",
    titulo: "Accidentes o enfermedades laborales: todo lo que tenés que saber",
    descripcion: "Folleto con lo más importante sobre accidentes y enfermedades del trabajo.",
    categoria: "Folletos",
    archivo: "/recursos/folletos/accidentes-o-enfermedades-laborales.pdf",
  },
  {
    id: "infografia-accidentes-transito",
    titulo: "Accidentes de tránsito: todo lo que tenés que saber",
    descripcion: "Infografía con los pasos a seguir después de un accidente de tránsito.",
    categoria: "Folletos",
    archivo: "/recursos/folletos/infografia-accidentes-transito.pdf",
  },
  {
    id: "modelo-carta-reclamo-art",
    titulo: "Carta para reclamar a la ART",
    descripcion: "Modelo de carta para hacer un reclamo a la ART por un accidente laboral.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/modelo-carta-reclamo-art.pdf",
  },
  {
    id: "certificado-de-trabajo",
    titulo: "Certificado de trabajo",
    descripcion: "Modelo de certificado para acreditar la relación laboral.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/certificado-de-trabajo.pdf",
  },
  {
    id: "renuncia-motivos-personales",
    titulo: "Renuncia por motivos personales",
    descripcion: "Modelo de renuncia al trabajo por motivos personales.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/renuncia-motivos-personales.pdf",
  },
  {
    id: "nota-reclamo-consumidor",
    titulo: "Nota de reclamo como consumidor",
    descripcion: "Modelo de carta para reclamar a una empresa como consumidor.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/nota-reclamo-consumidor.pdf",
  },
  {
    id: "nota-dar-de-baja-servicio",
    titulo: "Nota para dar de baja un servicio",
    descripcion: "Modelo de carta para dar de baja un servicio.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/nota-dar-de-baja-servicio.pdf",
  },
  {
    id: "autorizacion-menores-viajan-solos",
    titulo: "Autorización de viaje para menores de 18 años",
    descripcion: "Modelo de autorización para menores que viajan solos dentro de Argentina.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/autorizacion-menores-viajan-solos.pdf",
  },
  {
    id: "boleto-compraventa-automotor",
    titulo: "Boleto de compraventa de auto",
    descripcion: "Modelo de boleto para comprar o vender un vehículo.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/boleto-compraventa-automotor.pdf",
  },
  {
    id: "boleto-compraventa-inmueble",
    titulo: "Boleto de compraventa de inmueble",
    descripcion: "Modelo de boleto para comprar o vender una casa o terreno.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/boleto-compraventa-inmueble.pdf",
  },
  {
    id: "contrato-locacion-inmueble",
    titulo: "Contrato de alquiler de inmueble",
    descripcion: "Modelo de contrato de locación de una vivienda o local.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/contrato-locacion-inmueble.pdf",
  },
  {
    id: "pagare-sin-protesto",
    titulo: "Pagaré en pesos sin protesto",
    descripcion: "Modelo de pagaré en pesos con cláusula sin protesto.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/pagare-sin-protesto.pdf",
  },
  {
    id: "recibo-de-sena",
    titulo: "Recibo de seña",
    descripcion: "Modelo de recibo de seña en pesos.",
    categoria: "Modelos y formularios",
    archivo: "/recursos/modelos/recibo-de-sena.pdf",
  },
];
