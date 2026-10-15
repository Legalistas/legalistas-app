import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useAvisos, useMarcarAvisos } from "../services/consultas";
import type { Tono } from "../styles/tema";
import type { Aviso, TipoAviso } from "../types/portal";
import { cx } from "../utils/cx";
import { haceCuanto } from "../utils/formato";
import type { Nav } from "./Encabezado";
import { Dialogo } from "./ui/Dialogo";
import { CargandoLista, ErrorCarga, EstadoVacio } from "./ui/Estados";
import { Icono, IconoCaja, type NombreIcono } from "./ui/Icono";

// Campanita de avisos: respuestas del abogado, cambios de etapa, documentos del
// estudio y citas por confirmar (ver /api/portal/avisos del portal). Va en el
// encabezado. Lo que ya vio se guarda en este dispositivo.

const CLAVE = "legalistas.avisos-vistos";
const VISTOS = ["avisos-vistos"] as const;
/** La primera vez, cuenta como nuevo lo de la última semana. */
const PRIMERA_VEZ_MS = 7 * 24 * 60 * 60 * 1000;

const ESTILO: Record<TipoAviso, { icono: NombreIcono; fondo: string; tono: Tono }> = {
  respuesta: { icono: "chatbubble-outline", fondo: "bg-marca-suave", tono: "textoMarca" },
  etapa: { icono: "trending-up-outline", fondo: "bg-marca-suave", tono: "textoMarca" },
  documento: { icono: "document-text-outline", fondo: "bg-marca-suave", tono: "textoMarca" },
  cita: { icono: "calendar-outline", fondo: "bg-amber-50 dark:bg-amber-950", tono: "ambar" },
  aviso: { icono: "notifications-outline", fondo: "bg-superficie-2", tono: "textoSuave" },
};

/** Los avisos traen el link del portal web ("/casos/12?pestana=documentos"): lo lleva a la pantalla de la app. */
export function irAHref(navigation: Nav, href: string) {
  const [ruta, consulta = ""] = href.split("?");
  const id = Number(ruta.split("/")[2]);
  const pestana = /pestana=(documentos|consultas)/.exec(consulta)?.[1] as
    | "documentos"
    | "consultas"
    | undefined;
  if (ruta.startsWith("/consultas/") && id) {
    navigation.navigate("ConsultationDetail", { consultationId: id });
  } else if (ruta.startsWith("/casos/") && id) {
    navigation.navigate("CaseDetail", { caseId: id, pestana });
  } else if (ruta.startsWith("/tramites/") && id) {
    navigation.navigate("Tramite", { tramiteId: id });
  } else {
    navigation.navigate("MainApp", { screen: ruta.startsWith("/casos") ? "Cases" : "Home" });
  }
}

export function Campanita() {
  const qc = useQueryClient();
  const navigation = useNavigation<Nav>();
  const avisos = useAvisos();
  const marcar = useMarcarAvisos();
  const { data: vistos = "" } = useQuery({
    queryKey: VISTOS,
    queryFn: async () => (await AsyncStorage.getItem(CLAVE)) ?? "",
    staleTime: Number.POSITIVE_INFINITY,
    meta: { silencioso: true },
  });
  const [abierto, setAbierto] = useState(false);
  // Lo que era nuevo al abrir sigue marcado como nuevo mientras el panel está abierto.
  const [desdeAlAbrir, setDesdeAlAbrir] = useState<string | null>(null);

  const desde = vistos || new Date(Date.now() - PRIMERA_VEZ_MS).toISOString();
  const nuevos = avisos.data?.filter((a) => a.fecha > desde).length ?? 0;

  const abrir = () => {
    setDesdeAlAbrir(desde);
    setAbierto(true);
    const ahora = new Date().toISOString();
    AsyncStorage.setItem(CLAVE, ahora).catch(() => {});
    qc.setQueryData(VISTOS, ahora);
    marcar.mutate();
  };

  return (
    <>
      <Pressable
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={
          nuevos > 0 ? `Avisos: ${nuevos === 1 ? "1 nuevo" : `${nuevos} nuevos`}` : "Avisos"
        }
        className="size-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
      >
        <Icono nombre="notifications-outline" tono="blanco" size={20} />
        {nuevos > 0 ? (
          <View className="-top-1 -right-1 absolute h-5.5 min-w-5.5 items-center justify-center rounded-full border-2 border-ink-950 bg-red-600 px-1">
            <Text className="font-bold text-white text-xs">{nuevos > 9 ? "9+" : nuevos}</Text>
          </View>
        ) : null}
      </Pressable>
      <Dialogo
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        titulo="Avisos"
        descripcion="Lo nuevo de tus casos en los últimos 60 días."
      >
        {avisos.isPending ? (
          <CargandoLista filas={3} etiqueta="Cargando tus avisos…" />
        ) : avisos.isError ? (
          <ErrorCarga
            mensaje="No pudimos cargar tus avisos."
            alReintentar={() => avisos.refetch()}
          />
        ) : avisos.data.length === 0 ? (
          <EstadoVacio icono="notifications-off-outline" titulo="No tenés avisos" sinBorde>
            Te vamos a avisar acá cuando tu abogado te responda, tu caso avance o te citen a una
            audiencia o pericia.
          </EstadoVacio>
        ) : (
          <View className="-mx-2 gap-1">
            {avisos.data.map((aviso) => (
              <FilaAviso
                key={aviso.id}
                aviso={aviso}
                nuevo={aviso.fecha > (desdeAlAbrir ?? desde)}
                alElegir={(href) => {
                  setAbierto(false);
                  irAHref(navigation, href);
                }}
              />
            ))}
          </View>
        )}
      </Dialogo>
    </>
  );
}

function FilaAviso({
  aviso,
  nuevo,
  alElegir,
}: {
  aviso: Aviso;
  nuevo: boolean;
  alElegir: (href: string) => void;
}) {
  const { icono, fondo, tono } = ESTILO[aviso.tipo];
  const href = aviso.href;
  return (
    <Pressable
      disabled={!href}
      accessibilityRole={href ? "button" : "text"}
      onPress={() => href && alElegir(href)}
      className={cx(
        "flex-row items-start gap-3 rounded-2xl p-2.5 active:bg-superficie-2",
        nuevo && "bg-marca-suave",
      )}
    >
      <IconoCaja nombre={icono} fondo={fondo} tono={tono} chico />
      <View className="flex-1">
        <Text className="font-bold text-base text-texto">{aviso.titulo}</Text>
        {aviso.texto ? (
          <Text numberOfLines={2} className="mt-0.5 text-base text-texto-suave">
            {aviso.texto.charAt(0).toUpperCase() + aviso.texto.slice(1)}
          </Text>
        ) : null}
        <View className="mt-1 flex-row items-center gap-2">
          {nuevo ? (
            <View className="rounded-full bg-red-600 px-2 py-0.5">
              <Text className="font-bold text-white text-xs">Nuevo</Text>
            </View>
          ) : null}
          <Text className="text-sm text-texto-tenue">{haceCuanto(aviso.fecha)}</Text>
        </View>
      </View>
      {href ? (
        <View className="mt-3">
          <Icono nombre="chevron-forward" tono="textoTenue" size={20} />
        </View>
      ) : null}
    </Pressable>
  );
}
