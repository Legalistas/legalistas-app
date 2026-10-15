import { useMutation } from "@tanstack/react-query";
import { type Ref, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BotonTema, FondoHero, Logo, MarcaDeAgua } from "../components/Encabezado";
import { Boton } from "../components/ui/Boton";
import { Campo } from "../components/ui/Campo";
import { Icono, type NombreIcono } from "../components/ui/Icono";
import { toast } from "../components/ui/Toast";
import { useAuth } from "../context/AuthContext";
import { api, auth, ErrorApi } from "../services/portal";
import { useColores } from "../styles/tema";
import { CONTACTO } from "../utils/constantes";
import { cx } from "../utils/cx";

// Ingreso SIN contraseña, igual que el portal: se escribe el mail y llega un
// código de 6 números. Si la persona activó la verificación en dos pasos (desde
// el portal web), después se le pide el código de su app autenticadora.

const ESPERA_REENVIO = 60;
const abrirWhatsapp = () => Linking.openURL(CONTACTO.whatsapp);

export default function Login() {
    const { login } = useAuth();
    const insets = useSafeAreaInsets();
    const [paso, setPaso] = useState<"email" | "codigo" | "dosPasos">("email");
    const [email, setEmail] = useState("");
    const [codigo, setCodigo] = useState("");
    const [error, setError] = useState<string | null>(null);
    // Mail que no es de un cliente (`null` si no hay aviso).
    const [noCliente, setNoCliente] = useState<string | null>(null);
    const [espera, setEspera] = useState(0);
    const inputCodigo = useRef<TextInput>(null);

    useEffect(() => {
        if (espera <= 0) return;
        const t = setTimeout(() => setEspera((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [espera]);

    const bienvenida = () => {
        toast.success("¡Bienvenido/a!");
        login();
    };

    const pedirAcceso = useMutation({
        mutationFn: (mail: string) => api("/acceso", { method: "POST", body: { email: mail } }),
        meta: {
            cargando: "Enviando el mail…",
            exito: "Listo. Revisá tu mail.",
            error: "No pudimos mandar el mail",
        },
        onSuccess: () => {
            setPaso("codigo");
            setCodigo("");
            setError(null);
            setEspera(ESPERA_REENVIO);
            setTimeout(() => inputCodigo.current?.focus(), 50);
        },
        onError: (e, mail) => {
            if (e instanceof ErrorApi && e.codigo === "NO_CLIENTE") {
                setNoCliente(mail);
                setError(null);
                return;
            }
            setError(e.message);
        },
    });

    const entrar = useMutation({
        mutationFn: (otp: string) =>
            auth<{ twoFactorRedirect?: boolean }>("/sign-in/email-otp", {
                method: "POST",
                body: { email: email.trim().toLowerCase(), otp },
            }),
        meta: { cargando: "Entrando…", error: "No pudimos entrar" },
        onSuccess: (respuesta) => {
            if (!respuesta?.twoFactorRedirect) return bienvenida();
            setPaso("dosPasos");
            setCodigo("");
            setError(null);
        },
        onError: (e) => {
            setError(e.message);
            setCodigo("");
            inputCodigo.current?.focus();
        },
    });

    const enviarEmail = () => {
        setError(null);
        setNoCliente(null);
        const limpio = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
            setError("Revisá el mail: parece que está mal escrito.");
            return;
        }
        pedirAcceso.mutate(limpio);
    };

    const volverAlMail = () => {
        setPaso("email");
        setCodigo("");
        setError(null);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-ink"
        >
            <View className="absolute inset-x-0 bottom-0 h-1/2 bg-superficie" />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                <View
                    className="overflow-hidden bg-ink px-7 pb-24"
                    style={{ paddingTop: Math.max(40, insets.top + 16) }}
                >
                    <FondoHero />
                    <MarcaDeAgua size={150} className="-right-4 -bottom-6" />
                    <View className="flex-row items-center justify-between">
                        <Logo alto={40} />
                        <BotonTema />
                    </View>
                </View>

                <View
                    className="-mt-12 flex-1 rounded-t-3xl bg-superficie px-6 pt-8"
                    style={{ paddingBottom: Math.max(40, insets.bottom + 16) }}
                >
                    {paso === "email" ? (
                        <>
                            <Text className="font-semibold text-sm text-texto-marca uppercase tracking-widest">
                                Portal de clientes
                            </Text>
                            <Titulo>Entrá a tu cuenta</Titulo>
                            <Text className="mt-3 text-lg text-texto-suave">
                                No necesitás contraseña. Escribí tu mail y te mandamos un código para entrar.
                            </Text>
                            <Campo
                                className="mt-7"
                                etiqueta="Tu mail"
                                keyboardType="email-address"
                                autoComplete="email"
                                textContentType="emailAddress"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="send"
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChangeText={(valor) => {
                                    setEmail(valor);
                                    setNoCliente(null);
                                }}
                                onSubmitEditing={enviarEmail}
                                error={error}
                                icono="mail-outline"
                                ayuda="El mismo mail que le diste al estudio."
                            />
                            {noCliente !== null ? <AvisoNoCliente email={noCliente} /> : null}
                            <Boton
                                tamanio="lg"
                                ancho="completo"
                                className="mt-6"
                                cargando={pedirAcceso.isPending}
                                onPress={enviarEmail}
                            >
                                Enviarme el código
                            </Boton>
                        </>
                    ) : paso === "codigo" ? (
                        <>
                            <Volver texto="Usar otro mail" alTocar={volverAlMail} />
                            <IconoGrande nombre="mail-open-outline" />
                            <Titulo>Revisá tu mail</Titulo>
                            <Text className="mt-3 text-lg text-texto-suave">
                                Te mandamos a <Text className="font-bold text-texto">{email.trim()}</Text> un
                                mail con un <Text className="font-bold text-texto">código de 6 números</Text>.
                                Escribilo acá para entrar.
                            </Text>
                            <CampoCodigo
                                ref={inputCodigo}
                                etiqueta="Código de 6 números"
                                valor={codigo}
                                error={error}
                                deshabilitado={entrar.isPending}
                                alCambiar={(texto) => {
                                    const solo = texto.replace(/\D/g, "").slice(0, 6);
                                    setCodigo(solo);
                                    setError(null);
                                    if (solo.length === 6) entrar.mutate(solo);
                                }}
                            />
                            <Boton
                                tamanio="lg"
                                ancho="completo"
                                className="mt-6"
                                cargando={entrar.isPending}
                                disabled={codigo.length !== 6}
                                onPress={() => entrar.mutate(codigo)}
                            >
                                Entrar
                            </Boton>

                            <View className="mt-6 rounded-2xl bg-superficie-2 p-4">
                                <Text className="text-base text-texto-suave">
                                    ¿No te llegó? Revisá las carpetas de correo no deseado y promociones. Puede
                                    tardar un minuto. El botón «Entrar a mi cuenta» del mail abre el portal web:
                                    para entrar a la app usá el código.
                                </Text>
                                <Boton
                                    variante="secundario"
                                    ancho="completo"
                                    className="mt-3"
                                    disabled={espera > 0}
                                    cargando={pedirAcceso.isPending}
                                    onPress={() => pedirAcceso.mutate(email.trim().toLowerCase())}
                                >
                                    {espera > 0 ? `Pedir otro código en ${espera} s` : "Pedir otro código"}
                                </Boton>
                            </View>
                        </>
                    ) : (
                        <DosPasos alEntrar={bienvenida} alVolver={volverAlMail} />
                    )}

                    <View className="mt-8 items-center gap-2">
                        <Text className="text-base text-texto-suave">¿Necesitás ayuda?</Text>
                        <Boton variante="suave" icono="logo-whatsapp" className="self-center" onPress={abrirWhatsapp}>
                            Escribinos por WhatsApp
                        </Boton>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Segundo paso del ingreso: el código de 6 números de la app autenticadora o
// uno de los códigos de respaldo.
function DosPasos({ alEntrar, alVolver }: { alEntrar: () => void; alVolver: () => void }) {
    const c = useColores();
    const [modo, setModo] = useState<"app" | "respaldo">("app");
    const [codigo, setCodigo] = useState("");
    const [recordar, setRecordar] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const verificar = useMutation({
        mutationFn: (valor: string) =>
            auth(`/two-factor/verify-${modo === "app" ? "totp" : "backup-code"}`, {
                method: "POST",
                body: { code: valor, trustDevice: recordar },
            }),
        meta: { cargando: "Verificando…", error: "No pudimos verificar el código" },
        onSuccess: alEntrar,
        onError: (e) => {
            setError(e.message);
            setCodigo("");
        },
    });

    return (
        <>
            <IconoGrande nombre="shield-checkmark-outline" />
            <Titulo>Un paso más</Titulo>
            <Text className="mt-3 text-lg text-texto-suave">
                {modo === "app"
                    ? "Abrí la app de códigos en tu celular (Google Authenticator, Microsoft Authenticator…) y escribí el código de 6 números de Legalistas."
                    : "Escribí uno de los códigos de respaldo que guardaste al activar la verificación."}
            </Text>
            <CampoCodigo
                etiqueta={modo === "app" ? "Código de la app" : "Código de respaldo"}
                numerico={modo === "app"}
                valor={codigo}
                error={error}
                deshabilitado={verificar.isPending}
                alCambiar={(texto) => {
                    const valor = modo === "app" ? texto.replace(/\D/g, "").slice(0, 6) : texto.trim();
                    setCodigo(valor);
                    setError(null);
                    if (modo === "app" && valor.length === 6) verificar.mutate(valor);
                }}
            />
            <View className="mt-5 min-h-12 flex-row items-center gap-3">
                <Text className="flex-1 text-base text-texto">Recordar este dispositivo por 30 días</Text>
                <Switch
                    accessibilityLabel="Recordar este dispositivo por 30 días"
                    value={recordar}
                    onValueChange={setRecordar}
                    trackColor={{ false: c.bordeFuerte, true: c.brand }}
                    ios_backgroundColor={c.bordeFuerte}
                    thumbColor={c.blanco}
                />
            </View>
            <Boton
                tamanio="lg"
                ancho="completo"
                className="mt-4"
                cargando={verificar.isPending}
                disabled={codigo.length < (modo === "app" ? 6 : 8)}
                onPress={() => verificar.mutate(codigo)}
            >
                Verificar y entrar
            </Boton>
            <Boton
                variante="fantasma"
                ancho="completo"
                className="mt-4"
                onPress={() => {
                    setModo(modo === "app" ? "respaldo" : "app");
                    setCodigo("");
                    setError(null);
                }}
            >
                {modo === "app"
                    ? "No tengo el celular: usar un código de respaldo"
                    : "Usar el código de la app"}
            </Boton>
            <Boton variante="fantasma" ancho="completo" className="mt-1" onPress={alVolver}>
                Volver a empezar
            </Boton>
        </>
    );
}

function Titulo({ children }: { children: string }) {
    return (
        <Text accessibilityRole="header" className="mt-2 font-bold text-3xl text-texto">
            {children}
        </Text>
    );
}

function IconoGrande({ nombre }: { nombre: NombreIcono }) {
    return (
        <View className="mt-4 mb-2 size-16 items-center justify-center rounded-2xl bg-marca-suave">
            <Icono nombre={nombre} tono="textoMarca" size={36} />
        </View>
    );
}

function Volver({ texto, alTocar }: { texto: string; alTocar: () => void }) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={alTocar}
            className="-ml-2 min-h-11 flex-row items-center gap-1 self-start rounded-full pr-4 pl-2 active:bg-superficie-2"
        >
            <Icono nombre="arrow-back" tono="textoMarca" size={20} />
            <Text className="font-semibold text-base text-texto-marca">{texto}</Text>
        </Pressable>
    );
}

/** Campo grande para el código (un solo campo: se puede pegar o autocompletar). */
function CampoCodigo({
    ref,
    etiqueta,
    valor,
    alCambiar,
    error,
    deshabilitado,
    numerico = true,
}: {
    ref?: Ref<TextInput>;
    etiqueta: string;
    valor: string;
    alCambiar: (texto: string) => void;
    error: string | null;
    deshabilitado: boolean;
    numerico?: boolean;
}) {
    const c = useColores();
    return (
        <>
            <Text className="mt-7 mb-1.5 font-semibold text-base text-texto">{etiqueta}</Text>
            <TextInput
                ref={ref}
                accessibilityLabel={etiqueta}
                autoFocus
                keyboardType={numerico ? "number-pad" : "default"}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={numerico ? 6 : 20}
                value={valor}
                onChangeText={alCambiar}
                editable={!deshabilitado}
                placeholder={numerico ? "······" : ""}
                placeholderTextColor={c.textoTenue}
                className={cx(
                    "min-h-16 rounded-2xl border-2 bg-superficie px-4 text-center font-bold text-[32px] text-texto",
                    numerico && "tracking-[8px]",
                    error ? "border-red-500" : "border-borde-fuerte",
                )}
            />
            {error ? (
                <Text
                    accessibilityRole="alert"
                    className="mt-2 font-semibold text-base text-red-700 dark:text-red-300"
                >
                    {error}
                </Text>
            ) : null}
        </>
    );
}

/** "No sos cliente de Legalistas", con qué hacer: otro mail o consultar por WhatsApp. */
function AvisoNoCliente({ email }: { email: string }) {
    return (
        <View
            accessibilityRole="alert"
            className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950"
        >
            <View className="flex-row gap-3">
                <View className="size-11 items-center justify-center rounded-xl bg-amber-500">
                    <Icono nombre="person-remove-outline" tono="blanco" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-amber-950 text-lg dark:text-amber-100">
                        No sos cliente de Legalistas
                    </Text>
                    <Text className="mt-1 text-amber-900 text-base dark:text-amber-200">
                        No encontramos ningún cliente con <Text className="font-bold">{email}</Text>. Si ya
                        sos cliente, probá con el mail que le diste al estudio. Si querés hacernos una
                        consulta, escribinos.
                    </Text>
                </View>
            </View>
            <Boton
                variante="whatsapp"
                ancho="completo"
                className="mt-4"
                icono="logo-whatsapp"
                onPress={abrirWhatsapp}
            >
                Consultanos por WhatsApp
            </Boton>
        </View>
    );
}
