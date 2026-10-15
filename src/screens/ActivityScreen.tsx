import { useNavigation } from "@react-navigation/native";
import { Text, View } from "react-native";
import { type Nav, Pantalla } from "../components/Encabezado";
import { Boton } from "../components/ui/Boton";
import { CargandoLista, ErrorCarga, EstadoVacio } from "../components/ui/Estados";
import { IconoCaja, type NombreIcono } from "../components/ui/Icono";
import { useActividad } from "../services/consultas";
import type { Actividad } from "../types/portal";
import { formatoFecha } from "../utils/formato";

const ICONOS: Record<string, NombreIcono> = {
    INGRESO: "log-in-outline",
    SALIDA: "log-out-outline",
    CASO_VISTO: "briefcase-outline",
    DOCUMENTO_VISTO: "eye-outline",
    DOCUMENTO_DESCARGADO: "download-outline",
    DOCUMENTO_SUBIDO: "cloud-upload-outline",
    CONSULTA_CREADA: "chatbubble-ellipses-outline",
    MENSAJE_ENVIADO: "chatbubble-outline",
    PERFIL_ACTUALIZADO: "create-outline",
    EVENTO_CONFIRMADO: "checkmark-circle-outline",
};

const hora = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Argentina/Buenos_Aires",
});
/** Día en Argentina (UTC-3 fijo, sin horario de verano): "2026-09-28". */
const clave = (fecha: string | number) =>
    new Date(new Date(fecha).getTime() - 3 * 3_600_000).toISOString().slice(0, 10);

function agruparPorDia(items: Actividad[]) {
    const grupos = new Map<string, Actividad[]>();
    for (const item of items) {
        const dia = clave(item.fecha);
        grupos.set(dia, [...(grupos.get(dia) ?? []), item]);
    }
    return [...grupos.entries()];
}

function tituloDia(dia: string) {
    const hoy = clave(Date.now());
    const ayer = clave(Date.now() - 86_400_000);
    if (dia === hoy) return "Hoy";
    if (dia === ayer) return "Ayer";
    const fecha = formatoFecha(`${dia}T12:00:00-03:00`);
    return fecha.charAt(0).toUpperCase() + fecha.slice(1);
}

// Historial de lo que hizo la persona en el portal y en la app (lo mismo que ve el estudio).
export default function ActivityScreen() {
    const navigation = useNavigation<Nav>();
    const actividad = useActividad();
    const items = actividad.data?.pages.flatMap((p) => p.items) ?? [];

    return (
        <Pantalla
            volver="Mi cuenta"
            antetitulo="Mi actividad"
            titulo="Tu historial"
            subtitulo="Todo lo que hiciste: ingresos, documentos, consultas y cambios en tus datos."
        >
            {actividad.isPending ? (
                <CargandoLista etiqueta="Cargando tu actividad…" />
            ) : actividad.isError ? (
                <ErrorCarga alReintentar={() => actividad.refetch()} />
            ) : items.length === 0 ? (
                <EstadoVacio icono="time-outline" titulo="Todavía no hay actividad">
                    Acá vas a ver cada vez que entres, subas un documento o le escribas a tu abogado.
                </EstadoVacio>
            ) : (
                <View className="gap-6">
                    {agruparPorDia(items).map(([dia, lista]) => (
                        <View key={dia}>
                            <Text
                                accessibilityRole="header"
                                className="mb-2 px-1 font-bold text-base text-texto-suave"
                            >
                                {tituloDia(dia)}
                            </Text>
                            <View className="overflow-hidden rounded-2xl border border-borde bg-superficie">
                                {lista.map((a, i) => (
                                    <View
                                        key={a.id}
                                        className={`flex-row items-start gap-3 p-4 ${i ? "border-borde border-t" : ""}`}
                                    >
                                        <IconoCaja chico nombre={ICONOS[a.tipo] ?? "time-outline"} />
                                        <View className="flex-1">
                                            <Text className="font-semibold text-base text-texto">{a.descripcion}</Text>
                                            <Text className="mt-0.5 text-sm text-texto-tenue">
                                                {hora.format(new Date(a.fecha))} h
                                                {a.dispositivo ? ` · ${a.dispositivo}` : ""}
                                            </Text>
                                            {a.casoId ? (
                                                <Text
                                                    accessibilityRole="link"
                                                    onPress={() =>
                                                        navigation.navigate("CaseDetail", { caseId: a.casoId as number })
                                                    }
                                                    className="mt-1 py-1 font-semibold text-sm text-texto-marca"
                                                >
                                                    Ver el caso
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                    {actividad.hasNextPage ? (
                        <Boton
                            variante="secundario"
                            ancho="completo"
                            cargando={actividad.isFetchingNextPage}
                            onPress={() => actividad.fetchNextPage()}
                        >
                            Ver más
                        </Boton>
                    ) : null}
                </View>
            )}
        </Pantalla>
    );
}
