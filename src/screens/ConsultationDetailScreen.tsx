import { type RouteProp, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Pantalla } from "../components/Encabezado";
import { CargandoLista, ErrorCarga } from "../components/ui/Estados";
import { Icono } from "../components/ui/Icono";
import { Avatar, Insignia } from "../components/ui/Tarjeta";
import type { RootStackParamList } from "../navigation/RootStack";
import { useCaso, useConsulta, useEnviarMensaje } from "../services/consultas";
import { useColores } from "../styles/tema";
import { ESTADOS_CONSULTA } from "../utils/constantes";
import { cx } from "../utils/cx";
import { formatoFechaHora } from "../utils/formato";

// Conversación con el abogado. Busca respuestas nuevas cada 20 s mientras está
// en pantalla.
export default function ConsultationDetailScreen() {
    const { params } = useRoute<RouteProp<RootStackParamList, "ConsultationDetail">>();
    const consultaId = Number(params.consultationId);
    const c = useColores();
    const consulta = useConsulta(consultaId);
    const enviar = useEnviarMensaje(consultaId);
    const [texto, setTexto] = useState("");

    const mandar = () => {
        const limpio = texto.trim();
        if (!limpio || enviar.isPending) return;
        enviar.mutate(limpio, { onSuccess: () => setTexto("") });
    };

    const datos = consulta.data;
    // El abogado sale del caso (si se viene del caso, ya está en caché).
    const abogado = useCaso(datos?.caso.id ?? 0).data?.abogado;
    const estado = datos ? ESTADOS_CONSULTA[datos.estado] : null;

    return (
        <Pantalla
            irAlFinal
            volver="Volver al caso"
            antetitulo={datos?.caso.titulo}
            titulo={datos?.titulo ?? "Consulta"}
            encabezado={
                estado ? (
                    <View className="mt-3 flex-row flex-wrap items-center gap-2">
                        <Insignia color={estado.color} fondo={estado.fondo}>
                            {estado.nombre}
                        </Insignia>
                        <Text className="text-base text-slate-300">{estado.explicacion}</Text>
                    </View>
                ) : null
            }
            pie={
                datos?.estado === "CLOSED" ? (
                    <Text className="rounded-2xl border border-borde bg-superficie p-4 text-center text-base text-texto-suave">
                        Esta consulta terminó. Si tenés otra duda, hacé una consulta nueva desde tu caso.
                    </Text>
                ) : (
                    <View className="flex-row items-end gap-2 rounded-3xl border border-borde bg-superficie p-2 shadow-barra">
                        <TextInput
                            accessibilityLabel="Escribí tu mensaje"
                            multiline
                            value={texto}
                            onChangeText={setTexto}
                            maxLength={2000}
                            placeholder="Escribí tu mensaje…"
                            placeholderTextColor={c.textoTenue}
                            editable={Boolean(datos)}
                            className="max-h-40 min-h-12 flex-1 rounded-2xl bg-superficie-2 px-4 py-3 text-[16px] text-texto"
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Enviar mensaje"
                            disabled={!texto.trim() || enviar.isPending}
                            onPress={mandar}
                            className={cx(
                                "size-12 items-center justify-center rounded-full bg-brand active:opacity-80",
                                (!texto.trim() || enviar.isPending) && "opacity-60",
                            )}
                        >
                            {enviar.isPending ? (
                                <ActivityIndicator color={c.ink} />
                            ) : (
                                <Icono nombre="send" tono="ink" size={20} />
                            )}
                        </Pressable>
                    </View>
                )
            }
        >
            {consulta.isPending ? (
                <CargandoLista filas={3} etiqueta="Cargando la conversación…" />
            ) : consulta.isError ? (
                <ErrorCarga mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />
            ) : (
                <View accessibilityLiveRegion="polite" className="gap-4">
                    {consulta.data.mensajes.map((m) => (
                        <View
                            key={m.id}
                            className={cx("flex-row items-end gap-2", m.deCliente ? "justify-end" : "justify-start")}
                        >
                            {!m.deCliente && abogado ? (
                                <Avatar nombre={abogado.nombre} imagen={abogado.imagen} px={36} />
                            ) : null}
                            <View
                                className={cx(
                                    "max-w-[85%] rounded-2xl px-4 py-3",
                                    m.deCliente
                                        ? "rounded-br-md bg-brand"
                                        : "rounded-bl-md border border-borde bg-superficie",
                                )}
                            >
                                <Text
                                    className={cx(
                                        "font-semibold text-sm",
                                        m.deCliente ? "text-ink-50" : "text-texto-marca",
                                    )}
                                >
                                    {m.deCliente ? "Vos" : (abogado?.nombre ?? "Tu abogado")}
                                </Text>
                                <Text className={cx("mt-1 text-base", m.deCliente ? "text-ink" : "text-texto")}>
                                    {m.texto}
                                </Text>
                                <Text
                                    className={cx(
                                        "mt-1.5 text-xs",
                                        m.deCliente ? "text-ink-50" : "text-texto-tenue",
                                    )}
                                >
                                    {formatoFechaHora(m.fecha)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </Pantalla>
    );
}
