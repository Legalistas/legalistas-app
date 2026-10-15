import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Actividad,
  Aviso,
  CasoDetalle,
  CasoResumen,
  ConsultaDetalle,
  Documento,
  EventoCaso,
  Perfil,
  Provincia,
  Tramite,
  Yo,
} from "../types/portal";
import { api, auth } from "./portal";

export interface CambiosPerfil {
  personaId: number;
  telefono?: string;
  fechaNacimiento?: string | null;
  tipoDocumento?: number | null;
  numeroDocumento?: string;
  cuit?: string;
  genero?: number | null;
  estadoCivil?: string | null;
  domicilio?: {
    calle?: string;
    numero?: string;
    depto?: string;
    localidad?: string;
    codigoPostal?: string;
    provinciaId: number;
  };
  avisos?: Partial<Perfil["avisos"]>;
}

// Claves y hooks de TanStack Query de toda la app. Los mismos del portal
// (legalistas-clientes/src/lib/cliente/consultas.ts) más sesiones y cuenta.
export const claves = {
  yo: ["yo"] as const,
  casos: ["casos"] as const,
  caso: (id: number) => ["casos", id] as const,
  /** `base`: "/casos/{id}" o "/tramites/{id}". */
  documentos: (base: string) => ["documentos", base] as const,
  tramites: ["tramites"] as const,
  avisos: ["avisos"] as const,
  consulta: (id: number) => ["consultas", id] as const,
  eventos: ["eventos"] as const,
  perfiles: ["perfiles"] as const,
  actividad: ["actividad"] as const,
  ingresos: ["actividad", "ingresos"] as const,
  provincias: ["provincias"] as const,
};

export const useYo = () =>
  useQuery({ queryKey: claves.yo, queryFn: () => api<Yo>("/yo"), staleTime: 5 * 60_000 });

export const useCasos = () =>
  useQuery({
    queryKey: claves.casos,
    queryFn: () => api<CasoResumen[]>("/casos"),
    meta: { error: "No pudimos cargar tus casos" },
  });

/** Con `id` 0 no consulta (la conversación todavía no sabe de qué caso es). */
export const useCaso = (id: number) =>
  useQuery({
    queryKey: claves.caso(id),
    queryFn: () => api<CasoDetalle>(`/casos/${id}`),
    enabled: id > 0,
    meta: { error: "No pudimos cargar el caso" },
  });

export const useDocumentos = (base: string) =>
  useQuery({
    queryKey: claves.documentos(base),
    queryFn: () => api<Documento[]>(`${base}/documentos`),
    meta: { error: "No pudimos cargar los documentos" },
  });

export const useConsulta = (id: number) =>
  useQuery({
    queryKey: claves.consulta(id),
    queryFn: () => api<ConsultaDetalle>(`/consultas/${id}`),
    // Mientras la conversación está abierta en pantalla, busca respuestas nuevas.
    refetchInterval: (q) => (q.state.data?.estado === "CLOSED" ? false : 20_000),
    refetchIntervalInBackground: false,
    meta: { error: "No pudimos cargar la conversación" },
  });

export const useEventos = () =>
  useQuery({
    queryKey: claves.eventos,
    queryFn: () => api<EventoCaso[]>("/eventos"),
    meta: { error: "No pudimos cargar tus próximos eventos" },
  });

export const usePerfiles = () =>
  useQuery({
    queryKey: claves.perfiles,
    queryFn: () => api<Perfil[]>("/perfil"),
    meta: { error: "No pudimos cargar tus datos" },
  });

export const useActividad = () =>
  useInfiniteQuery({
    queryKey: claves.actividad,
    queryFn: ({ pageParam }) =>
      api<{ items: Actividad[]; siguiente: number | null }>(
        pageParam ? `/actividad?antes=${pageParam}` : "/actividad",
      ),
    initialPageParam: 0,
    getNextPageParam: (ultima) => ultima.siguiente ?? undefined,
    meta: { error: "No pudimos cargar tu actividad" },
  });

// ── Acciones ─────────────────────────────────────────────────────────────

export function useNuevaConsulta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: { casoId: number; titulo: string; mensaje: string }) =>
      api<{ id: number }>("/consultas", { method: "POST", body: datos }),
    meta: {
      cargando: "Enviando tu consulta…",
      exito: "Consulta enviada. Tu abogado te va a responder por acá.",
      error: "No pudimos enviar la consulta",
    },
    onSuccess: (_r, { casoId }) => {
      qc.invalidateQueries({ queryKey: claves.caso(casoId) });
      qc.invalidateQueries({ queryKey: claves.casos });
      qc.invalidateQueries({ queryKey: claves.actividad });
    },
  });
}

export function useEnviarMensaje(consultaId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (texto: string) =>
      api(`/consultas/${consultaId}/mensajes`, { method: "POST", body: { texto } }),
    meta: { exito: "Mensaje enviado", error: "No pudimos enviar el mensaje" },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: claves.consulta(consultaId) });
      qc.invalidateQueries({ queryKey: claves.actividad });
    },
  });
}

export function useConfirmarEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventoId: number) => api(`/eventos/${eventoId}/confirmar`, { method: "POST" }),
    meta: {
      cargando: "Confirmando…",
      exito: "¡Listo! Le avisamos a tu abogado que vas a ir.",
      error: "No pudimos confirmar",
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: claves.eventos });
      qc.invalidateQueries({ queryKey: claves.actividad });
    },
  });
}

export function useGuardarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: CambiosPerfil) => api<Perfil>("/perfil", { method: "PUT", body: datos }),
    meta: {
      cargando: "Guardando…",
      exito: "Datos guardados",
      error: "No pudimos guardar tus datos",
    },
    onSuccess: (perfil) => {
      qc.setQueryData<Perfil[]>(claves.perfiles, (lista) =>
        lista?.map((p) => (p.id === perfil.id ? perfil : p)),
      );
      qc.invalidateQueries({ queryKey: claves.actividad });
    },
  });
}

/** URL firmado para ver o bajar un documento (se pide al momento: vence en 1 h). */
export function useAbrirDocumento(base: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, descargar }: { docId: number; descargar: boolean }) =>
      api<{ url: string; nombre: string }>(
        `${base}/documentos/${docId}${descargar ? "?descargar=1" : ""}`,
      ),
    meta: { error: "No pudimos abrir el documento" },
    onSuccess: () => qc.invalidateQueries({ queryKey: claves.actividad }),
  });
}

export const useProvincias = () =>
  useQuery({
    queryKey: claves.provincias,
    queryFn: () => api<Provincia[]>("/provincias"),
    staleTime: 60 * 60_000,
    meta: { error: "No pudimos cargar las provincias" },
  });

/** Últimos ingresos al portal (Ajustes → sesiones). */
export const useUltimosIngresos = () =>
  useQuery({
    queryKey: claves.ingresos,
    queryFn: () =>
      api<{ items: Actividad[]; siguiente: number | null }>("/actividad?tipo=INGRESO").then((r) =>
        r.items.slice(0, 10),
      ),
    meta: { error: "No pudimos cargar tus últimos ingresos" },
  });

/** Consultas del CRM que todavía no son caso (se les puede mandar documentación). */
export const useTramites = () =>
  useQuery({
    queryKey: claves.tramites,
    queryFn: () => api<Tramite[]>("/tramites"),
    meta: { error: "No pudimos cargar tu consulta" },
  });

/** Novedades de la campanita. Se refrescan solas cada 2 minutos con la pestaña visible. */
export const useAvisos = () =>
  useQuery({
    queryKey: claves.avisos,
    queryFn: () => api<Aviso[]>("/avisos"),
    refetchInterval: 2 * 60_000,
    refetchIntervalInBackground: false,
    // Se consulta sola en segundo plano: si falla, lo muestra el panel (sin toast cada 2 min).
    meta: { silencioso: true },
  });

/** Al abrir la campanita: marca leídas las notificaciones del cliente. Sin avisos de Sonner. */
export const useMarcarAvisos = () =>
  useMutation({ mutationFn: () => api("/avisos", { method: "POST" }), meta: { silencioso: true } });

// ── Sesiones (Better Auth) ───────────────────────────────────────────────

export interface Sesion {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const clavesSeguridad = {
  sesion: ["seguridad", "sesion"] as const,
  sesiones: ["seguridad", "sesiones"] as const,
};

/** Sesión actual sin caché (para saber si tiene dos pasos y cuál es este dispositivo). */
export const useSesionActual = () =>
  useQuery({
    queryKey: clavesSeguridad.sesion,
    queryFn: () =>
      auth<{ session: Sesion; user: { twoFactorEnabled?: boolean } } | null>(
        "/get-session?disableCookieCache=true",
      ).then((s) => ({
        token: s?.session.token ?? null,
        dosPasos: Boolean(s?.user.twoFactorEnabled),
      })),
    meta: { error: "No pudimos cargar tu sesión" },
  });

export const useSesiones = () =>
  useQuery({
    queryKey: clavesSeguridad.sesiones,
    queryFn: () => auth<Sesion[]>("/list-sessions"),
    meta: { error: "No pudimos cargar tus sesiones" },
  });

export function useCerrarSesionRemota() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => auth("/revoke-session", { method: "POST", body: { token } }),
    meta: {
      cargando: "Cerrando la sesión…",
      exito: "Cerraste esa sesión",
      error: "No pudimos cerrar la sesión",
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clavesSeguridad.sesiones }),
  });
}

export function useCerrarOtrasSesiones() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => auth("/revoke-other-sessions", { method: "POST", body: {} }),
    meta: {
      cargando: "Cerrando las demás sesiones…",
      exito: "Cerraste la sesión en los demás dispositivos",
      error: "No pudimos cerrar las demás sesiones",
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clavesSeguridad.sesiones }),
  });
}

/** Elimina para siempre la cuenta de una persona (App Store, 5.1.1(v)). */
export const useEliminarCuenta = () =>
  useMutation({
    mutationFn: (personaId: number) =>
      api(`/cuenta?personaId=${personaId}`, { method: "DELETE" }),
    meta: { cargando: "Eliminando tu cuenta…", error: "No pudimos eliminar la cuenta" },
  });
