import { focusManager, MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";
import { toast } from "../components/ui/Toast";
import { ErrorApi, mensajeDeError } from "./portal";

// TanStack Query + avisos: todas las acciones avisan (igual que el portal).
//  - Lecturas (GET): si fallan, aviso de error (una vez por consulta).
//  - Acciones (POST/PUT): aviso "cargando" → éxito o error, con los textos de
//    `meta` de cada mutación.

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { error?: string; silencioso?: boolean };
    mutationMeta: { cargando?: string; exito?: string; error?: string; silencioso?: boolean };
  }
}

// Al volver a la app se refrescan los datos (lo que en la web es volver a la pestaña).
focusManager.setEventListener((avisar) => {
  const suscripcion = AppState.addEventListener("change", (estado) => avisar(estado === "active"));
  return () => suscripcion.remove();
});

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      if (query.meta?.silencioso || (error instanceof ErrorApi && error.status === 401)) return;
      toast.error(query.meta?.error ?? "No pudimos cargar la información", {
        id: `consulta-${query.queryHash}`,
        description: mensajeDeError(error),
      });
    },
  }),
  mutationCache: new MutationCache({
    onMutate(_variables, mutation) {
      if (mutation.meta?.silencioso || !mutation.meta?.cargando) return;
      toast.loading(mutation.meta.cargando, { id: `accion-${mutation.mutationId}` });
    },
    onSuccess(_data, _variables, _contexto, mutation) {
      if (mutation.meta?.silencioso) return;
      const id = `accion-${mutation.mutationId}`;
      if (mutation.meta?.exito) toast.success(mutation.meta.exito, { id });
      else toast.dismiss(id);
    },
    onError(error, _variables, _contexto, mutation) {
      if (mutation.meta?.silencioso || (error instanceof ErrorApi && error.status === 401)) return;
      const titulo = error instanceof ErrorApi ? error.titulo : undefined;
      toast.error(titulo ?? mutation.meta?.error ?? "No se pudo completar", {
        id: `accion-${mutation.mutationId}`,
        description: mensajeDeError(error),
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      retry: (intentos, error) =>
        intentos < 2 && !(error instanceof ErrorApi && error.status >= 400 && error.status < 500),
    },
    mutations: { retry: false },
  },
});
