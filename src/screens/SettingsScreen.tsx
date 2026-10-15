import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { type Nav, Pantalla } from "../components/Encabezado";
import { Boton } from "../components/ui/Boton";
import { Campo } from "../components/ui/Campo";
import { Interruptor, Opciones, Pestanas } from "../components/ui/Controles";
import { CargandoLista, ErrorCarga, Esqueleto } from "../components/ui/Estados";
import { Icono, IconoCaja, type NombreIcono } from "../components/ui/Icono";
import { Selector } from "../components/ui/Selector";
import { Dato, Tarjeta, TituloSeccion } from "../components/ui/Tarjeta";
import { PORTAL_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import {
    useCerrarOtrasSesiones,
    useCerrarSesionRemota,
    useEliminarCuenta,
    useGuardarPerfil,
    usePerfiles,
    useProvincias,
    useSesionActual,
    useSesiones,
    useUltimosIngresos,
} from "../services/consultas";
import { queryClient } from "../services/query";
import { cambiarTema, useTema } from "../styles/tema";
import type { Perfil } from "../types/portal";
import { showAlert } from "../utils/alert";
import { CONTACTO, ESTADOS_CIVILES, GENEROS, TIPOS_DOCUMENTO } from "../utils/constantes";
import { dispositivoDe } from "../utils/dispositivo";
import { formatoFechaHora, haceCuanto } from "../utils/formato";

type Seccion = "datos" | "domicilio" | "avisos" | "apariencia" | "ajustes";

const TOTAL_DATOS = 10;
const DE_DOMICILIO = new Set(["Calle y número", "Localidad", "Provincia", "Código postal"]);

// Mi cuenta: datos personales, domicilio, avisos, apariencia y ajustes.
export default function SettingsScreen() {
    const perfiles = usePerfiles();
    const { logout } = useAuth();
    const [personaId, setPersonaId] = useState<number | null>(null);
    const [seccion, setSeccion] = useState<Seccion>("datos");
    const [cerrando, setCerrando] = useState(false);
    const perfil = perfiles.data?.find((p) => p.id === personaId) ?? perfiles.data?.[0];

    const faltanDatos = perfil?.faltantes.filter((f) => !DE_DOMICILIO.has(f)).length ?? 0;
    const faltanDomicilio = perfil?.faltantes.filter((f) => DE_DOMICILIO.has(f)).length ?? 0;

    return (
        <Pantalla
            conBarra
            antetitulo="Mi cuenta"
            titulo={perfil?.nombre ?? "Mi cuenta"}
            subtitulo={perfil?.email}
        >
            <View className="gap-6">
                {perfiles.data && perfiles.data.length > 1 ? (
                    <View className="flex-row flex-wrap items-center gap-2">
                        <Text className="text-base text-texto-suave">Datos de:</Text>
                        {perfiles.data.map((p) => (
                            <Boton
                                key={p.id}
                                tamanio="sm"
                                variante={p.id === perfil?.id ? "primario" : "secundario"}
                                accessibilityState={{ selected: p.id === perfil?.id }}
                                onPress={() => setPersonaId(p.id)}
                            >
                                {p.nombre}
                            </Boton>
                        ))}
                    </View>
                ) : null}

                {perfil ? <Completitud perfil={perfil} alIr={setSeccion} /> : null}

                <Pestanas
                    etiqueta="Secciones de mi cuenta"
                    valor={seccion}
                    alCambiar={setSeccion}
                    pestanas={[
                        {
                            valor: "datos",
                            texto: "Mis datos",
                            icono: "person-circle-outline",
                            contador: faltanDatos || undefined,
                        },
                        {
                            valor: "domicilio",
                            texto: "Domicilio",
                            icono: "home-outline",
                            contador: faltanDomicilio || undefined,
                        },
                        { valor: "avisos", texto: "Avisos", icono: "notifications-outline" },
                        { valor: "apariencia", texto: "Apariencia", icono: "color-palette-outline" },
                        { valor: "ajustes", texto: "Ajustes", icono: "settings-outline" },
                    ]}
                />

                {/* La clave reinicia los formularios al cambiar de persona. */}
                <View key={`${seccion}-${perfil?.id ?? 0}`}>
                    {seccion === "apariencia" ? (
                        <SeccionApariencia />
                    ) : seccion === "ajustes" ? (
                        <SeccionAjustes perfil={perfil} />
                    ) : perfiles.isPending ? (
                        <Esqueleto className="h-96" />
                    ) : perfiles.isError ? (
                        <ErrorCarga alReintentar={() => perfiles.refetch()} />
                    ) : perfil ? (
                        seccion === "datos" ? (
                            <SeccionDatos perfil={perfil} />
                        ) : seccion === "domicilio" ? (
                            <SeccionDomicilio perfil={perfil} />
                        ) : (
                            <SeccionAvisos perfil={perfil} />
                        )
                    ) : null}
                </View>

                <Boton
                    variante="peligro"
                    tamanio="lg"
                    ancho="completo"
                    cargando={cerrando}
                    icono="log-out-outline"
                    onPress={() => {
                        setCerrando(true);
                        logout().finally(() => setCerrando(false));
                    }}
                >
                    Cerrar sesión
                </Boton>
            </View>
        </Pantalla>
    );
}

/** Cuántos datos tiene completos y cuáles faltan (con acceso directo). */
function Completitud({ perfil, alIr }: { perfil: Perfil; alIr: (s: Seccion) => void }) {
    const completos = TOTAL_DATOS - perfil.faltantes.length;
    if (perfil.faltantes.length === 0) {
        return (
            <Text className="rounded-2xl bg-green-50 px-4 py-3 font-semibold text-base text-green-800 dark:bg-green-950 dark:text-green-300">
                ¡Tus datos están completos! Gracias.
            </Text>
        );
    }
    return (
        <Tarjeta borde="border-amber-200 dark:border-amber-800">
            <View className="flex-row items-baseline justify-between gap-3">
                <Text className="font-bold text-lg text-texto">Completá tus datos</Text>
                <Text className="font-semibold text-base text-texto-suave">
                    {completos} de {TOTAL_DATOS}
                </Text>
            </View>
            <View
                accessibilityRole="progressbar"
                accessibilityLabel="Datos completados"
                accessibilityValue={{ min: 0, max: TOTAL_DATOS, now: completos }}
                className="mt-3 h-3 overflow-hidden rounded-full bg-superficie-2"
            >
                <View
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${(completos / TOTAL_DATOS) * 100}%` }}
                />
            </View>
            <Text className="mt-3 text-base text-texto-suave">
                Los necesita tu abogado para los escritos y los trámites. Te faltan:
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
                {perfil.faltantes.map((f) => (
                    <Pressable
                        key={f}
                        accessibilityRole="button"
                        onPress={() => alIr(DE_DOMICILIO.has(f) ? "domicilio" : "datos")}
                        className="min-h-10 justify-center rounded-full border border-amber-300 bg-amber-50 px-3 active:opacity-70 dark:border-amber-700 dark:bg-amber-950"
                    >
                        <Text className="font-semibold text-amber-900 text-sm dark:text-amber-200">{f}</Text>
                    </Pressable>
                ))}
            </View>
        </Tarjeta>
    );
}

// ── Mis datos ───────────────────────────────────────────────────────────────

/** "15031980" → "15/03/1980" mientras se escribe. */
const conBarras = (texto: string) => {
    const d = texto.replace(/\D/g, "").slice(0, 8);
    return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
};

/** "15/03/1980" → "1980-03-15"; `null` si no es una fecha real. */
function aIso(fecha: string): string | null {
    const [dd, mm, aaaa] = fecha.split("/").map(Number);
    const f = new Date(Date.UTC(aaaa, mm - 1, dd));
    const real = f.getUTCFullYear() === aaaa && f.getUTCMonth() === mm - 1 && f.getUTCDate() === dd;
    if (!real || aaaa < 1900 || f.getTime() > Date.now()) return null;
    return f.toISOString().slice(0, 10);
}

// Datos personales que usa el estudio (escritos, formularios de la SRT). Nombre
// y mail no se editan acá: el mail es con lo que se entra y el nombre lo
// corrige el estudio si está mal.
function SeccionDatos({ perfil }: { perfil: Perfil }) {
    const guardar = useGuardarPerfil();
    const [telefono, setTelefono] = useState(perfil.telefono ?? "");
    const [nacimiento, setNacimiento] = useState(
        perfil.fechaNacimiento?.slice(0, 10).split("-").reverse().join("/") ?? "",
    );
    const [genero, setGenero] = useState(perfil.genero ? String(perfil.genero) : "");
    const [estadoCivil, setEstadoCivil] = useState(perfil.estadoCivil ?? "");
    const [tipoDocumento, setTipoDocumento] = useState(String(perfil.tipoDocumento ?? 1));
    const [documento, setDocumento] = useState(perfil.numeroDocumento ?? "");
    const [cuit, setCuit] = useState(perfil.cuit ?? "");
    const [errores, setErrores] = useState<Record<string, string>>({});

    const enviar = () => {
        const nuevos: Record<string, string> = {};
        if (telefono && !/^[\d\s()+-]{6,30}$/.test(telefono)) {
            nuevos.telefono = "El teléfono solo puede tener números, espacios y guiones.";
        }
        const fecha = nacimiento ? aIso(nacimiento) : null;
        if (nacimiento && !fecha) nuevos.nacimiento = "Escribí la fecha así: 15/03/1980.";
        const soloDigitosCuit = cuit.replace(/\D/g, "");
        if (cuit && soloDigitosCuit.length !== 11) nuevos.cuit = "El CUIT/CUIL tiene 11 números.";
        setErrores(nuevos);
        if (Object.keys(nuevos).length) return;
        guardar.mutate({
            personaId: perfil.id,
            telefono: telefono.trim(),
            fechaNacimiento: fecha,
            genero: genero ? Number(genero) : null,
            estadoCivil: estadoCivil || null,
            tipoDocumento: tipoDocumento ? Number(tipoDocumento) : null,
            numeroDocumento: documento.trim(),
            cuit: soloDigitosCuit
                ? `${soloDigitosCuit.slice(0, 2)}-${soloDigitosCuit.slice(2, 10)}-${soloDigitosCuit.slice(10)}`
                : "",
        });
    };

    return (
        <Tarjeta>
            <TituloSeccion>Tus datos personales</TituloSeccion>
            <View className="gap-4">
                <Dato etiqueta="Nombre">{perfil.nombre}</Dato>
                <Dato etiqueta="Mail">{perfil.email}</Dato>
            </View>
            <Text className="mt-3 text-sm text-texto-suave">
                ¿Tu nombre o tu mail están mal? Avisanos por WhatsApp y lo corregimos.
            </Text>

            <View className="mt-6 gap-5 border-borde border-t pt-6">
                <Campo
                    etiqueta="Teléfono"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    value={telefono}
                    onChangeText={setTelefono}
                    placeholder="Por ejemplo: 342 555-1234"
                    icono="call-outline"
                    falta={!perfil.telefono}
                    error={errores.telefono}
                />
                <Campo
                    etiqueta="Fecha de nacimiento"
                    keyboardType="number-pad"
                    value={nacimiento}
                    onChangeText={(texto) => setNacimiento(conBarras(texto))}
                    placeholder="Día/mes/año: 15/03/1980"
                    maxLength={10}
                    icono="calendar-outline"
                    falta={!perfil.fechaNacimiento}
                    error={errores.nacimiento}
                />
                <Selector
                    etiqueta="Género"
                    valor={genero}
                    alCambiar={setGenero}
                    opciones={GENEROS.map((g) => ({ valor: String(g.valor), texto: g.texto }))}
                    falta={!perfil.genero}
                />
                <Selector
                    etiqueta="Estado civil"
                    valor={estadoCivil}
                    alCambiar={setEstadoCivil}
                    opciones={ESTADOS_CIVILES.map((e) => ({ valor: e, texto: e }))}
                    falta={!perfil.estadoCivil}
                />
                <Selector
                    etiqueta="Tipo de documento"
                    valor={tipoDocumento}
                    alCambiar={setTipoDocumento}
                    opciones={TIPOS_DOCUMENTO.map((t) => ({ valor: String(t.valor), texto: t.texto }))}
                />
                <Campo
                    etiqueta="Número de documento"
                    keyboardType="number-pad"
                    value={documento}
                    onChangeText={setDocumento}
                    placeholder="Sin puntos"
                    icono="card-outline"
                    falta={!perfil.numeroDocumento}
                />
                <Campo
                    etiqueta="CUIT/CUIL"
                    keyboardType="number-pad"
                    value={cuit}
                    onChangeText={setCuit}
                    placeholder="20-12345678-9"
                    ayuda="Son 11 números. Está en tu recibo de sueldo o en la página de ANSES."
                    falta={!perfil.cuit}
                    error={errores.cuit}
                />
                <Boton tamanio="lg" ancho="completo" cargando={guardar.isPending} onPress={enviar}>
                    Guardar mis datos
                </Boton>
            </View>
        </Tarjeta>
    );
}

// Domicilio real (lo piden los escritos y la SRT). Se guarda como domicilio
// principal de la persona; el país es siempre Argentina.
function SeccionDomicilio({ perfil }: { perfil: Perfil }) {
    const guardar = useGuardarPerfil();
    const provincias = useProvincias();
    const d = perfil.domicilio;
    const [calle, setCalle] = useState(d.calle ?? "");
    const [numero, setNumero] = useState(d.numero ?? "");
    const [depto, setDepto] = useState(d.depto ?? "");
    const [localidad, setLocalidad] = useState(d.localidad ?? "");
    const [cp, setCp] = useState(d.codigoPostal ?? "");
    const [provinciaId, setProvinciaId] = useState(d.provinciaId ? String(d.provinciaId) : "");
    const [error, setError] = useState<string | null>(null);

    const enviar = () => {
        if (!provinciaId) {
            setError("Elegí la provincia.");
            return;
        }
        setError(null);
        guardar.mutate({
            personaId: perfil.id,
            domicilio: {
                calle: calle.trim(),
                numero: numero.trim(),
                depto: depto.trim(),
                localidad: localidad.trim(),
                codigoPostal: cp.trim(),
                provinciaId: Number(provinciaId),
            },
        });
    };

    return (
        <Tarjeta>
            <TituloSeccion>Tu domicilio</TituloSeccion>
            <Text className="-mt-1 text-base text-texto-suave">
                Donde vivís hoy. Lo necesitamos para los escritos y los trámites de tu caso.
            </Text>
            <View className="mt-5 gap-5">
                <Campo
                    etiqueta="Calle"
                    autoComplete="address-line1"
                    value={calle}
                    onChangeText={setCalle}
                    icono="location-outline"
                    falta={!d.calle}
                />
                <View className="flex-row gap-3">
                    <Campo
                        className="flex-1"
                        etiqueta="Número"
                        keyboardType="number-pad"
                        value={numero}
                        onChangeText={setNumero}
                        falta={!d.numero}
                    />
                    <Campo
                        className="flex-1"
                        etiqueta="Piso / Depto"
                        autoComplete="address-line2"
                        value={depto}
                        onChangeText={setDepto}
                        placeholder="3° B"
                    />
                </View>
                <Campo
                    etiqueta="Localidad"
                    value={localidad}
                    onChangeText={setLocalidad}
                    placeholder="Por ejemplo: Santa Fe"
                    falta={!d.localidad}
                />
                <Selector
                    etiqueta="Provincia"
                    valor={provinciaId}
                    alCambiar={setProvinciaId}
                    opciones={(provincias.data ?? []).map((p) => ({ valor: String(p.id), texto: p.nombre }))}
                    vacio={provincias.isPending ? "Cargando provincias…" : "Elegí la provincia"}
                    falta={!d.provinciaId}
                />
                <Campo
                    etiqueta="Código postal"
                    keyboardType="number-pad"
                    autoComplete="postal-code"
                    value={cp}
                    onChangeText={setCp}
                    falta={!d.codigoPostal}
                    error={error}
                />
                <Boton tamanio="lg" ancho="completo" cargando={guardar.isPending} onPress={enviar}>
                    Guardar domicilio
                </Boton>
            </View>
        </Tarjeta>
    );
}

function SeccionAvisos({ perfil }: { perfil: Perfil }) {
    const guardar = useGuardarPerfil();
    const cambiar = (clave: keyof Perfil["avisos"], valor: boolean) =>
        guardar.mutate({ personaId: perfil.id, avisos: { [clave]: valor } });
    return (
        <Tarjeta>
            <TituloSeccion>Avisos</TituloSeccion>
            <Text className="-mt-1 text-base text-texto-suave">Elegí de qué querés que te avisemos.</Text>
            <View className="mt-2">
                <Interruptor
                    etiqueta="Avisos por mail"
                    descripcion="Te mandamos un mail con cada novedad."
                    activo={perfil.avisos.email}
                    alCambiar={(v) => cambiar("email", v)}
                    deshabilitado={guardar.isPending}
                />
                <View className="h-px bg-borde" />
                <Interruptor
                    etiqueta="Novedades del caso"
                    descripcion="Cambios de etapa, audiencias e informes."
                    activo={perfil.avisos.casos}
                    alCambiar={(v) => cambiar("casos", v)}
                    deshabilitado={guardar.isPending}
                />
                <View className="h-px bg-borde" />
                <Interruptor
                    etiqueta="Respuestas de tu abogado"
                    descripcion="Cuando te contestan una consulta."
                    activo={perfil.avisos.mensajes}
                    alCambiar={(v) => cambiar("mensajes", v)}
                    deshabilitado={guardar.isPending}
                />
            </View>
        </Tarjeta>
    );
}

/** Modo oscuro (se guarda en este dispositivo). */
function SeccionApariencia() {
    const tema = useTema();
    return (
        <Tarjeta>
            <Opciones
                etiqueta="Colores"
                valor={tema}
                alCambiar={cambiarTema}
                opciones={[
                    { valor: "claro", texto: "Claro", icono: "sunny-outline" },
                    { valor: "oscuro", texto: "Oscuro", icono: "moon-outline" },
                    { valor: "sistema", texto: "Automático", icono: "contrast-outline" },
                ]}
            />
            <Text className="mt-4 text-sm text-texto-suave">
                El modo oscuro cansa menos la vista de noche. El tamaño de la letra se toma de los
                ajustes de accesibilidad de tu teléfono.
            </Text>
        </Tarjeta>
    );
}

// ── Ajustes ─────────────────────────────────────────────────────────────────

function SeccionAjustes({ perfil }: { perfil: Perfil | undefined }) {
    const navigation = useNavigation<Nav>();
    const web = (url: string, title: string) => navigation.navigate("WebView", { url, title });
    return (
        <View className="gap-6">
            <DosPasos />
            <Sesiones />
            <UltimosIngresos />

            <View>
                <TituloSeccion>Más opciones</TituloSeccion>
                <View className="overflow-hidden rounded-2xl border border-borde bg-superficie">
                    <Fila
                        primera
                        icono="time-outline"
                        texto="Mi actividad"
                        detalle="Todo lo que hiciste en el portal y en la app"
                        alTocar={() => navigation.navigate("Activity")}
                    />
                    <Fila
                        icono="calculator-outline"
                        texto="Calculadora de indemnización"
                        alTocar={() => navigation.navigate("Calculator")}
                    />
                    <Fila
                        icono="logo-whatsapp"
                        texto="Ayuda por WhatsApp"
                        detalle={CONTACTO.telefono}
                        alTocar={() => Linking.openURL(CONTACTO.whatsapp)}
                    />
                    <Fila
                        icono="mail-outline"
                        texto="Escribinos un mail"
                        detalle={CONTACTO.email}
                        alTocar={() => Linking.openURL(`mailto:${CONTACTO.email}`)}
                    />
                    <Fila
                        icono="call-outline"
                        texto="Llamanos"
                        detalle={CONTACTO.telefono}
                        alTocar={() => Linking.openURL(`tel:${CONTACTO.telefono.replace(/[\s-]/g, "")}`)}
                    />
                    <Fila
                        icono="document-text-outline"
                        texto="Términos y condiciones"
                        alTocar={() => web("https://legalistas.ar/terminos-condiciones", "Términos y Condiciones")}
                    />
                    <Fila
                        icono="shield-checkmark-outline"
                        texto="Política de privacidad"
                        alTocar={() => web("https://legalistas.ar/politica-privacidad", "Política de Privacidad")}
                    />
                </View>
            </View>

            {perfil ? <EliminarCuenta perfil={perfil} /> : null}

            <Text className="text-center text-sm text-texto-tenue">
                Versión {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
        </View>
    );
}

/** Fila de una lista de opciones (ícono, texto, detalle y flecha). */
function Fila({
    icono,
    texto,
    detalle,
    alTocar,
    primera,
}: {
    icono: NombreIcono;
    texto: string;
    detalle?: string;
    alTocar: () => void;
    primera?: boolean;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={alTocar}
            className={`min-h-16 flex-row items-center gap-3 px-4 py-3 active:bg-superficie-2 ${primera ? "" : "border-borde border-t"}`}
        >
            <IconoCaja chico nombre={icono} />
            <View className="flex-1">
                <Text className="font-semibold text-base text-texto">{texto}</Text>
                {detalle ? <Text className="text-sm text-texto-suave">{detalle}</Text> : null}
            </View>
            <Icono nombre="chevron-forward" tono="textoTenue" size={20} />
        </Pressable>
    );
}

// La verificación en dos pasos se pide al entrar, pero se activa desde el
// portal web (hay que escanear un código QR con otra app del mismo teléfono).
function DosPasos() {
    const sesion = useSesionActual();
    return (
        <Tarjeta>
            <View className="flex-row items-start gap-3">
                <IconoCaja nombre="shield-checkmark-outline" />
                <View className="flex-1">
                    <Text className="font-bold text-lg text-texto">Verificación en dos pasos</Text>
                    <Text className="text-base text-texto-suave">
                        {sesion.data?.dosPasos
                            ? "Está activada: al entrar te pedimos también el código de tu app autenticadora."
                            : "Sumá un código de tu celular al entrar, para que nadie más pueda abrir tu cuenta. Se activa desde el portal web."}
                    </Text>
                </View>
            </View>
            <Boton
                variante="secundario"
                ancho="completo"
                className="mt-4"
                icono="open-outline"
                onPress={() => Linking.openURL(`${PORTAL_URL}/cuenta?seccion=ajustes`)}
            >
                {sesion.data?.dosPasos ? "Administrarla en el portal web" : "Activarla en el portal web"}
            </Boton>
        </Tarjeta>
    );
}

const esCelular = (ua: string | null | undefined) =>
    /Mobile|Android|iPhone|iPad|Legalistas-App/.test(ua ?? "");

function Sesiones() {
    const sesiones = useSesiones();
    const actual = useSesionActual();
    const cerrar = useCerrarSesionRemota();
    const cerrarOtras = useCerrarOtrasSesiones();
    const lista = [...(sesiones.data ?? [])].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return (
        <View>
            <TituloSeccion>Sesiones abiertas</TituloSeccion>
            <Text className="-mt-1 mb-3 text-base text-texto-suave">
                Dispositivos donde tu cuenta está abierta ahora. Si no reconocés alguno, cerralo.
            </Text>
            {sesiones.isPending ? (
                <CargandoLista filas={2} etiqueta="Cargando tus sesiones…" />
            ) : sesiones.isError ? (
                <ErrorCarga alReintentar={() => sesiones.refetch()} />
            ) : (
                <>
                    <View className="overflow-hidden rounded-2xl border border-borde bg-superficie">
                        {lista.map((s, i) => {
                            const esEsta = s.token === actual.data?.token;
                            return (
                                <View
                                    key={s.id}
                                    className={`flex-row items-center gap-3 p-4 ${i ? "border-borde border-t" : ""}`}
                                >
                                    <IconoCaja
                                        chico
                                        nombre={esCelular(s.userAgent) ? "phone-portrait-outline" : "desktop-outline"}
                                    />
                                    <View className="flex-1">
                                        <Text className="font-semibold text-base text-texto">
                                            {dispositivoDe(s.userAgent ?? null) ?? "Dispositivo"}
                                        </Text>
                                        {esEsta ? (
                                            <Text className="font-bold text-green-800 text-xs dark:text-green-300">
                                                ESTE DISPOSITIVO
                                            </Text>
                                        ) : null}
                                        <Text className="text-sm text-texto-tenue">
                                            Entró el {formatoFechaHora(s.createdAt)} · activa{" "}
                                            {haceCuanto(s.updatedAt).toLowerCase()}
                                        </Text>
                                    </View>
                                    {!esEsta ? (
                                        <Boton
                                            variante="secundario"
                                            tamanio="sm"
                                            className="self-center"
                                            cargando={cerrar.isPending && cerrar.variables === s.token}
                                            onPress={() => cerrar.mutate(s.token)}
                                        >
                                            Cerrar
                                        </Boton>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>
                    {lista.length > 1 ? (
                        <Boton
                            variante="secundario"
                            ancho="completo"
                            className="mt-3"
                            cargando={cerrarOtras.isPending}
                            onPress={() => cerrarOtras.mutate()}
                        >
                            Cerrar la sesión en los demás dispositivos
                        </Boton>
                    ) : null}
                </>
            )}
        </View>
    );
}

function UltimosIngresos() {
    const ingresos = useUltimosIngresos();
    return (
        <View>
            <TituloSeccion>Últimos ingresos</TituloSeccion>
            {ingresos.isPending ? (
                <CargandoLista filas={2} etiqueta="Cargando tus ingresos…" />
            ) : ingresos.isError ? (
                <ErrorCarga alReintentar={() => ingresos.refetch()} />
            ) : ingresos.data.length === 0 ? (
                <Text className="text-base text-texto-suave">Todavía no hay ingresos registrados.</Text>
            ) : (
                <View className="overflow-hidden rounded-2xl border border-borde bg-superficie">
                    {ingresos.data.map((ing, i) => (
                        <View
                            key={ing.id}
                            className={`flex-row items-center gap-3 px-4 py-3 ${i ? "border-borde border-t" : ""}`}
                        >
                            <Icono nombre="log-in-outline" tono="textoTenue" size={20} />
                            <View className="flex-1">
                                <Text className="font-semibold text-base text-texto">{ing.descripcion}</Text>
                                <Text className="text-sm text-texto-tenue">
                                    {formatoFechaHora(ing.fecha)}
                                    {ing.dispositivo ? ` · ${ing.dispositivo}` : ""}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

/** Eliminar la cuenta desde la app (App Store Guideline 5.1.1(v)). Pide confirmar dos veces. */
function EliminarCuenta({ perfil }: { perfil: Perfil }) {
    const eliminar = useEliminarCuenta();
    const confirmar = () =>
        showAlert({
            title: "Eliminar cuenta",
            message: `Esta acción eliminará permanentemente la cuenta de ${perfil.nombre} y todos sus datos asociados (perfil, casos, consultas y mensajes). Esta acción no se puede deshacer.\n\n¿Deseás continuar?`,
            buttons: [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Continuar",
                    style: "destructive",
                    onPress: () =>
                        showAlert({
                            title: "Confirmar eliminación",
                            message:
                                "Por última vez: al confirmar, tu cuenta será eliminada de forma permanente. No podrás recuperar tu información.",
                            buttons: [
                                { text: "Cancelar", style: "cancel" },
                                {
                                    text: "Eliminar cuenta",
                                    style: "destructive",
                                    onPress: () =>
                                        eliminar.mutate(perfil.id, {
                                            onSuccess: () =>
                                                showAlert({
                                                    title: "Cuenta eliminada",
                                                    message: "Tu cuenta fue eliminada correctamente.",
                                                    // Se vuelve a pedir todo: si el mail no tiene más personas, el
                                                    // portal responde 401 y la app vuelve sola al ingreso.
                                                    buttons: [
                                                        { text: "OK", onPress: () => queryClient.invalidateQueries() },
                                                    ],
                                                }),
                                        }),
                                },
                            ],
                        }),
                },
            ],
        });
    return (
        <Boton
            variante="fantasma"
            ancho="completo"
            icono="trash-outline"
            cargando={eliminar.isPending}
            onPress={confirmar}
        >
            Eliminar mi cuenta
        </Boton>
    );
}
