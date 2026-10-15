import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Linking, Text, View } from "react-native";
import { type Nav, Pantalla } from "../components/Encabezado";
import { SeccionDocumentos, SubirDocumentos } from "../components/SeccionDocumentos";
import { Boton } from "../components/ui/Boton";
import { CargandoLista, ErrorCarga, Esqueleto, EstadoVacio } from "../components/ui/Estados";
import { Icono } from "../components/ui/Icono";
import { LineaAvance } from "../components/ui/LineaAvance";
import { Tarjeta, TituloSeccion } from "../components/ui/Tarjeta";
import type { RootStackParamList } from "../navigation/RootStack";
import { useTramites, useYo } from "../services/consultas";
import { MAX_MB } from "../services/subida";
import {
    CONTACTO,
    DOCUMENTACION_INICIAL,
    estadoTramite,
    PASOS_TRAMITE,
    pasoTramite,
} from "../utils/constantes";

// Consulta del CRM que todavía no es caso. Lo primero que pide el estudio es
// la documentación: se sube acá y va a la carpeta del cliente en el CRM (cuando
// se convierte en caso, esa carpeta pasa a ser la del caso).
export default function TramiteScreen() {
    const navigation = useNavigation<Nav>();
    const { tramiteId } = useRoute<RouteProp<RootStackParamList, "Tramite">>().params;
    const tramites = useTramites();
    const { data: yo } = useYo();
    const tramite = tramites.data?.find((t) => t.id === tramiteId);
    const base = `/tramites/${tramiteId}`;
    const estado = tramite ? estadoTramite(tramite.columna) : null;
    const indice = tramite ? pasoTramite(tramite.columna) : 0;

    return (
        <Pantalla
            volver="Inicio"
            antetitulo={
                tramite ? `Tu consulta${tramite.servicio ? ` · ${tramite.servicio}` : ""}` : undefined
            }
            titulo={estado?.titulo ?? (tramites.isPending ? "Cargando tu consulta…" : "Tu consulta")}
            subtitulo={estado?.texto}
        >
            {tramites.isPending ? (
                <View className="gap-3">
                    <Esqueleto className="h-48" />
                    <CargandoLista filas={2} etiqueta="Cargando tu consulta…" />
                </View>
            ) : tramites.isError ? (
                <ErrorCarga alReintentar={() => tramites.refetch()} />
            ) : !tramite ? (
                <EstadoVacio
                    icono="clipboard-outline"
                    titulo="Esta consulta ya no está en curso"
                    accion={
                        <Boton
                            variante="secundario"
                            onPress={() => navigation.navigate("MainApp", { screen: "Cases" })}
                        >
                            Ver mis casos
                        </Boton>
                    }
                >
                    Si ya iniciamos tu caso, lo vas a encontrar en «Mis casos».
                </EstadoVacio>
            ) : (
                <View className="gap-6">
                    <SeccionDocumentos
                        base={base}
                        titulo="Lo que nos mandaste"
                        vacio="Todavía no nos mandaste documentos. Con fotos del celular alcanza."
                        subida={
                            <SubirDocumentos
                                base={base}
                                titulo="Mandanos tu documentación"
                                explicacion={`Es lo primero que necesitamos para armar tu caso. Sacale una foto a cada papel o subí los PDF (hasta ${MAX_MB} MB cada uno).`}
                                exito="¡Listo! Ya recibimos tu documentación."
                            >
                                <View className="mt-3 gap-1.5">
                                    {DOCUMENTACION_INICIAL.map((doc) => (
                                        <View key={doc} className="flex-row items-start gap-2">
                                            <Icono nombre="checkmark-circle-outline" tono="textoMarca" size={20} />
                                            <Text className="flex-1 text-base text-texto">{doc}</Text>
                                        </View>
                                    ))}
                                </View>
                            </SubirDocumentos>
                        }
                    />

                    <Tarjeta>
                        <TituloSeccion>¿Cómo sigue?</TituloSeccion>
                        <LineaAvance
                            pasos={PASOS_TRAMITE}
                            indiceActual={indice}
                            textoAccesible={`Paso ${indice + 1} de ${PASOS_TRAMITE.length}.`}
                        />
                        {(yo?.personas.length ?? 0) > 1 ? (
                            <Text className="mt-4 border-borde border-t pt-3 text-base text-texto-suave">
                                A nombre de <Text className="font-bold text-texto">{tramite.titular.nombre}</Text>
                            </Text>
                        ) : null}
                    </Tarjeta>

                    <Tarjeta>
                        <Text className="font-bold text-lg text-texto">¿Tenés dudas?</Text>
                        <Text className="mt-1 text-base text-texto-suave">
                            Escribinos y te ayudamos a mandar lo que falta.
                        </Text>
                        <Boton
                            variante="whatsapp"
                            ancho="completo"
                            className="mt-4"
                            icono="logo-whatsapp"
                            onPress={() => Linking.openURL(CONTACTO.whatsapp)}
                        >
                            Escribinos por WhatsApp
                        </Boton>
                    </Tarjeta>
                </View>
            )}
        </Pantalla>
    );
}
