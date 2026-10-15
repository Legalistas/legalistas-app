import { useNavigation } from "@react-navigation/native";
import { Linking, Pressable, Text, View } from "react-native";
import { type Nav, Pantalla } from "../components/Encabezado";
import { ProximosEventos } from "../components/ProximosEventos";
import { TarjetaCaso, TarjetaTramite } from "../components/TarjetaCaso";
import { Boton } from "../components/ui/Boton";
import { CargandoLista, ErrorCarga, EstadoVacio } from "../components/ui/Estados";
import { Icono, type NombreIcono } from "../components/ui/Icono";
import { TituloSeccion } from "../components/ui/Tarjeta";
import { useCasos, useEventos, usePerfiles, useTramites, useYo } from "../services/consultas";
import { CONTACTO } from "../utils/constantes";
import { cx } from "../utils/cx";

export default function HomeScreen() {
    const navigation = useNavigation<Nav>();
    const { data: yo } = useYo();
    const casos = useCasos();
    const activos = casos.data?.filter((c) => (c.etapaId ?? 0) <= 5) ?? [];
    const principal = activos[0] ?? casos.data?.[0];
    const variasPersonas = (yo?.personas.length ?? 0) > 1;
    // Sin caso todavía: la documentación va a la consulta del CRM.
    const tramites = useTramites();
    const tramite = tramites.data?.[0];
    const irAMisCasos = () => navigation.navigate("MainApp", { screen: "Cases" });
    // Con citas por confirmar van arriba de los casos; si no, abajo (el
    // aviso "no tenés citas" no tiene que empujar lo importante).
    const { data: eventos } = useEventos();
    const citasArriba = (eventos?.length ?? 0) > 0;
    const soloTramites = casos.data?.length === 0 && (tramites.data?.length ?? 0) > 0;

    return (
        <Pantalla
            conBarra
            antetitulo="Portal de clientes"
            titulo={yo?.saludo ? `Hola, ${yo.saludo}` : "Hola"}
            subtitulo="Acá ves cómo va tu caso, tus documentos y las respuestas de tu abogado."
        >
            <View className="gap-3">
                <View className="flex-row gap-3">
                    <Acceso
                        icono="cloud-upload-outline"
                        texto="Subir un documento"
                        alTocar={() =>
                            principal
                                ? navigation.navigate("CaseDetail", { caseId: principal.id, pestana: "documentos" })
                                : tramite
                                  ? navigation.navigate("Tramite", { tramiteId: tramite.id })
                                  : irAMisCasos()
                        }
                    />
                    <Acceso
                        icono="chatbubbles-outline"
                        texto="Consultar a mi abogado"
                        alTocar={() =>
                            principal
                                ? navigation.navigate("CaseDetail", { caseId: principal.id, pestana: "consultas" })
                                : irAMisCasos()
                        }
                    />
                </View>
                <View className="flex-row gap-3">
                    <Acceso
                        icono="calculator-outline"
                        texto="Calcular indemnización"
                        alTocar={() => navigation.navigate("Calculator")}
                    />
                    <Acceso
                        whatsapp
                        icono="logo-whatsapp"
                        texto="Ayuda por WhatsApp"
                        alTocar={() => Linking.openURL(CONTACTO.whatsapp)}
                    />
                </View>
            </View>

            <AvisoDatos />

            {citasArriba ? (
                <View className="mt-8">
                    <ProximosEventos />
                </View>
            ) : null}

            {tramites.data?.length ? (
                <View className="mt-8">
                    <TituloSeccion>
                        {tramites.data.length === 1 ? "Tu consulta" : "Tus consultas"}
                    </TituloSeccion>
                    <View className="gap-3">
                        {tramites.data.map((t) => (
                            <TarjetaTramite key={t.id} tramite={t} mostrarTitular={variasPersonas} />
                        ))}
                    </View>
                </View>
            ) : null}

            {soloTramites ? null : (
                <View className="mt-8">
                    <TituloSeccion>{activos.length === 1 ? "Tu caso" : "Tus casos"}</TituloSeccion>
                    {casos.isPending ? (
                        <CargandoLista filas={2} etiqueta="Cargando tus casos…" />
                    ) : casos.isError ? (
                        <ErrorCarga alReintentar={() => casos.refetch()} />
                    ) : casos.data.length === 0 ? (
                        <EstadoVacio icono="briefcase-outline" titulo="Todavía no hay casos cargados">
                            Cuando el estudio inicie tu caso, lo vas a ver acá con todas sus novedades.
                        </EstadoVacio>
                    ) : (
                        <View className="gap-3">
                            {(activos.length ? activos : casos.data).slice(0, 3).map((caso) => (
                                <TarjetaCaso key={caso.id} caso={caso} mostrarTitular={variasPersonas} />
                            ))}
                        </View>
                    )}
                    {casos.data && casos.data.length > 3 ? (
                        <Boton variante="secundario" ancho="completo" className="mt-3" onPress={irAMisCasos}>
                            Ver todos mis casos ({casos.data.length})
                        </Boton>
                    ) : null}
                </View>
            )}

            {citasArriba ? null : (
                <View className="mt-8">
                    <ProximosEventos />
                </View>
            )}
        </Pantalla>
    );
}

function Acceso({
    icono,
    texto,
    alTocar,
    whatsapp,
}: {
    icono: NombreIcono;
    texto: string;
    alTocar: () => void;
    whatsapp?: boolean;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={alTocar}
            className="min-h-28 flex-1 justify-between gap-3 rounded-2xl border border-borde bg-superficie p-4 shadow-tarjeta active:opacity-80"
        >
            <View
                className={cx(
                    "size-12 items-center justify-center rounded-xl",
                    whatsapp ? "bg-green-50 dark:bg-green-950" : "bg-marca-suave",
                )}
            >
                <Icono nombre={icono} tono={whatsapp ? "verde" : "textoMarca"} size={28} />
            </View>
            <Text className="font-bold text-base text-texto">{texto}</Text>
        </Pressable>
    );
}

/** Si faltan datos personales o el domicilio, un aviso con acceso a Mi cuenta. */
function AvisoDatos() {
    const navigation = useNavigation<Nav>();
    const { data: perfiles } = usePerfiles();
    const faltan = perfiles?.[0]?.faltantes.length ?? 0;
    if (!faltan) return null;
    return (
        <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("MainApp", { screen: "Account" })}
            className="mt-6 flex-row items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 active:opacity-80 dark:border-amber-800 dark:bg-amber-950"
        >
            <View className="size-12 items-center justify-center rounded-xl bg-amber-500">
                <Icono nombre="create-outline" tono="blanco" />
            </View>
            <View className="flex-1">
                <Text className="font-bold text-amber-950 text-lg dark:text-amber-100">
                    Completá tus datos
                </Text>
                <Text className="text-amber-900 text-base dark:text-amber-200">
                    {faltan === 1 ? "Te falta 1 dato" : `Te faltan ${faltan} datos`} que necesita tu
                    abogado.
                </Text>
            </View>
            <Icono nombre="chevron-forward" tono="ambar" />
        </Pressable>
    );
}
