import { type RouteProp, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Pantalla } from "../components/Encabezado";
import { ProximosEventos } from "../components/ProximosEventos";
import { SeccionConsultas } from "../components/SeccionConsultas";
import { SeccionDocumentos } from "../components/SeccionDocumentos";
import { Pestanas } from "../components/ui/Controles";
import { CargandoLista, ErrorCarga, Esqueleto } from "../components/ui/Estados";
import { IconoCaja } from "../components/ui/Icono";
import { AvanceEtapas } from "../components/ui/LineaAvance";
import { Avatar, Dato, Insignia, Tarjeta, TituloSeccion } from "../components/ui/Tarjeta";
import type { RootStackParamList } from "../navigation/RootStack";
import { useCaso, useYo } from "../services/consultas";
import type { CasoDetalle } from "../types/portal";
import { ESTADOS_CASO, etapaPorId } from "../utils/constantes";
import { formatoDia, formatoFecha } from "../utils/formato";

type Pestana = "resumen" | "documentos" | "consultas";

export default function CaseDetailScreen() {
    const { params } = useRoute<RouteProp<RootStackParamList, "CaseDetail">>();
    const casoId = Number(params.caseId);
    const caso = useCaso(casoId);
    const { data: yo } = useYo();
    const [pestana, setPestana] = useState<Pestana>(params.pestana ?? "resumen");

    const datos = caso.data;
    const etapa = etapaPorId(datos?.etapaId);
    const noLeidos = datos?.consultas.reduce((n, c) => n + c.noLeidos, 0) ?? 0;

    return (
        <Pantalla
            volver="Mis casos"
            antetitulo={
                datos
                    ? [datos.servicio ?? "Caso", datos.numero ? `N.º ${datos.numero}` : null]
                          .filter(Boolean)
                          .join(" · ")
                    : undefined
            }
            titulo={datos?.titulo ?? (caso.isPending ? "Cargando tu caso…" : "Tu caso")}
            encabezado={
                datos ? (
                    <View className="mt-4 flex-row flex-wrap gap-2">
                        {etapa ? (
                            <Insignia color={etapa.color} fondo={etapa.fondo}>
                                {etapa.nombre}
                            </Insignia>
                        ) : null}
                        <Insignia
                            color={ESTADOS_CASO[datos.estado].color}
                            fondo={ESTADOS_CASO[datos.estado].fondo}
                        >
                            {ESTADOS_CASO[datos.estado].nombre}
                        </Insignia>
                    </View>
                ) : null
            }
        >
            <Pestanas
                etiqueta="Secciones del caso"
                valor={pestana}
                alCambiar={setPestana}
                pestanas={[
                    { valor: "resumen", texto: "Resumen", icono: "information-circle-outline" },
                    { valor: "documentos", texto: "Documentos", icono: "folder-open-outline" },
                    {
                        valor: "consultas",
                        texto: "Consultas",
                        icono: "chatbubbles-outline",
                        contador: noLeidos || undefined,
                    },
                ]}
            />

            <View className="mt-5">
                {caso.isPending ? (
                    <View className="gap-3">
                        <Esqueleto className="h-48" />
                        <CargandoLista filas={2} etiqueta="Cargando tu caso…" />
                    </View>
                ) : caso.isError ? (
                    <ErrorCarga mensaje={caso.error.message} alReintentar={() => caso.refetch()} />
                ) : pestana === "resumen" ? (
                    <Resumen caso={caso.data} mostrarTitular={(yo?.personas.length ?? 0) > 1} />
                ) : pestana === "documentos" ? (
                    <SeccionDocumentos base={`/casos/${casoId}`} />
                ) : (
                    <SeccionConsultas caso={caso.data} />
                )}
            </View>
        </Pantalla>
    );
}

function Resumen({ caso, mostrarTitular }: { caso: CasoDetalle; mostrarTitular: boolean }) {
    return (
        <View className="gap-5">
            <Tarjeta>
                <TituloSeccion>¿En qué etapa está?</TituloSeccion>
                <AvanceEtapas etapaId={caso.etapaId} />
            </Tarjeta>

            <ProximosEventos casoId={caso.id} />

            <Tarjeta>
                <TituloSeccion>Tu abogado</TituloSeccion>
                {caso.abogado ? (
                    <View className="flex-row items-center gap-3">
                        <Avatar nombre={caso.abogado.nombre} imagen={caso.abogado.imagen} px={56} />
                        <View className="flex-1">
                            <Text className="font-bold text-lg text-texto">{caso.abogado.nombre}</Text>
                            <Text className="text-base text-texto-suave">Te responde en «Consultas»</Text>
                        </View>
                    </View>
                ) : (
                    <Text className="text-base text-texto-suave">
                        Estamos asignando el abogado de tu caso.
                    </Text>
                )}
            </Tarjeta>

            <Tarjeta>
                <TituloSeccion>Datos del caso</TituloSeccion>
                <View className="gap-4">
                    {mostrarTitular ? <Dato etiqueta="A nombre de">{caso.titular.nombre}</Dato> : null}
                    {caso.servicio ? <Dato etiqueta="Tipo de caso">{caso.servicio}</Dato> : null}
                    {caso.fechaAccidente ? (
                        <Dato etiqueta="Fecha del accidente">{formatoDia(caso.fechaAccidente)}</Dato>
                    ) : null}
                    {caso.lesion ? <Dato etiqueta="Lesión">{caso.lesion}</Dato> : null}
                    {caso.porcentajeIncapacidad ? (
                        <Dato etiqueta="Incapacidad">
                            {caso.porcentajeIncapacidad.toLocaleString("es-AR", { maximumFractionDigits: 2 })} %
                        </Dato>
                    ) : null}
                    <Dato etiqueta="Inicio">{formatoFecha(caso.creado)}</Dato>
                </View>
            </Tarjeta>

            {caso.expedientes.length > 0 ? (
                <View>
                    <TituloSeccion>
                        {caso.expedientes.length === 1
                            ? "Expediente"
                            : `Expedientes (${caso.expedientes.length})`}
                    </TituloSeccion>
                    <View className="gap-3">
                        {caso.expedientes.map((exp) => (
                            <Tarjeta key={exp.id} className="flex-row gap-3">
                                <IconoCaja
                                    chico
                                    nombre={exp.tipo === "Judicial" ? "business-outline" : "document-text-outline"}
                                />
                                <View className="flex-1">
                                    <Text className="font-semibold text-sm text-texto-tenue uppercase tracking-wide">
                                        {exp.tipo ?? "Expediente"}
                                    </Text>
                                    <Text className="mt-0.5 font-bold text-base text-texto">{exp.titulo}</Text>
                                    {exp.juzgado ? (
                                        <Text className="mt-1 text-base text-texto-suave">
                                            {exp.juzgado}
                                            {exp.jurisdiccion ? ` · ${exp.jurisdiccion}` : ""}
                                        </Text>
                                    ) : null}
                                    {exp.cuij ? (
                                        <Text className="mt-1 text-sm text-texto-tenue">CUIJ {exp.cuij}</Text>
                                    ) : null}
                                </View>
                            </Tarjeta>
                        ))}
                    </View>
                </View>
            ) : null}
        </View>
    );
}
