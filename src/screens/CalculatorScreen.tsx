import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Linking, Text, View } from "react-native";
import { type Nav, Pantalla } from "../components/Encabezado";
import { Boton } from "../components/ui/Boton";
import { Campo } from "../components/ui/Campo";
import { Opciones } from "../components/ui/Controles";
import { BORDE_MARCA, Tarjeta } from "../components/ui/Tarjeta";
import { calcularIndemnizacion } from "../utils/calculo";
import { CONTACTO } from "../utils/constantes";
import { formatoPesos } from "../utils/formato";

type Resultado = ReturnType<typeof calcularIndemnizacion>;

// Acepta "900.000", "900000", "10,5" y "10.5".
const numero = (valor: string) => {
    const s = valor.trim().replace(/[\s$]/g, "");
    if (s.includes(",")) return Number(s.replace(/\./g, "").replace(",", "."));
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ""));
    return Number(s);
};

export default function CalculatorScreen() {
    const navigation = useNavigation<Nav>();
    const [edad, setEdad] = useState("");
    const [incapacidad, setIncapacidad] = useState("");
    const [ingreso, setIngreso] = useState("");
    const [variacion, setVariacion] = useState("0");
    const [lugar, setLugar] = useState<"trabajo" | "itinere">("trabajo");
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [resultado, setResultado] = useState<Resultado | null>(null);

    const calcular = () => {
        const nuevos: Record<string, string> = {};
        const vEdad = numero(edad);
        const vIncapacidad = numero(incapacidad);
        const vIngreso = numero(ingreso);
        const vVariacion = numero(variacion || "0");
        if (!(vEdad >= 16 && vEdad <= 100)) nuevos.edad = "Poné una edad entre 16 y 100 años.";
        if (!(vIncapacidad > 0 && vIncapacidad <= 100))
            nuevos.incapacidad = "Poné un porcentaje entre 1 y 100.";
        if (!(vIngreso > 0)) nuevos.ingreso = "Poné tu sueldo mensual (solo números).";
        if (!Number.isFinite(vVariacion) || vVariacion < 0)
            nuevos.variacion = "Poné 0 si no sabés este dato.";
        setErrores(nuevos);
        setResultado(
            Object.keys(nuevos).length
                ? null
                : calcularIndemnizacion({
                      edad: vEdad,
                      incapacidad: vIncapacidad,
                      ingresoMensual: vIngreso,
                      variacionRipte: vVariacion,
                      enElTrabajo: lugar === "trabajo",
                  }),
        );
    };

    return (
        <Pantalla
            volver="Volver"
            antetitulo="Calculadora"
            titulo="¿Cuánto me corresponde?"
            subtitulo="Estimá la indemnización por un accidente o enfermedad de trabajo. Es orientativa: tu abogado te da el número exacto."
        >
            <View className="gap-6">
                <Tarjeta className="gap-5">
                    <Campo
                        etiqueta="Tu edad el día del accidente"
                        keyboardType="number-pad"
                        value={edad}
                        onChangeText={setEdad}
                        error={errores.edad}
                        placeholder="Por ejemplo: 45"
                    />
                    <Campo
                        etiqueta="Porcentaje de incapacidad"
                        keyboardType="decimal-pad"
                        value={incapacidad}
                        onChangeText={setIncapacidad}
                        error={errores.incapacidad}
                        ayuda="Lo dice el dictamen de la Comisión Médica. Si no lo tenés, probá con un número aproximado."
                        placeholder="Por ejemplo: 10"
                    />
                    <Campo
                        etiqueta="Sueldo mensual (en pesos)"
                        keyboardType="decimal-pad"
                        value={ingreso}
                        onChangeText={setIngreso}
                        error={errores.ingreso}
                        ayuda="El sueldo bruto que figura en tu recibo."
                        placeholder="Por ejemplo: 900000"
                    />
                    <Campo
                        etiqueta="Actualización RIPTE (%)"
                        keyboardType="decimal-pad"
                        value={variacion}
                        onChangeText={setVariacion}
                        error={errores.variacion}
                        ayuda="Cuánto subieron los salarios desde el accidente. Si no lo sabés, dejá 0."
                    />
                    <Opciones
                        etiqueta="¿Dónde fue el accidente?"
                        valor={lugar}
                        alCambiar={setLugar}
                        opciones={[
                            { valor: "trabajo", texto: "En el trabajo" },
                            { valor: "itinere", texto: "Yendo o volviendo" },
                        ]}
                    />
                    <Boton tamanio="lg" ancho="completo" icono="calculator-outline" onPress={calcular}>
                        Calcular
                    </Boton>
                </Tarjeta>

                {resultado ? (
                    <Tarjeta borde={BORDE_MARCA} accessibilityLiveRegion="polite">
                        <Text className="font-semibold text-base text-texto-suave">
                            Te correspondería alrededor de
                        </Text>
                        <Text className="mt-1 font-bold text-4xl text-texto">
                            {formatoPesos(resultado.total)}
                        </Text>
                        <View className="mt-5 gap-2 border-borde border-t pt-4">
                            <Fila etiqueta="Indemnización (art. 14)" monto={resultado.base} />
                            {resultado.adicional > 0 ? (
                                <Fila etiqueta="Adicional del 20 %" monto={resultado.adicional} />
                            ) : null}
                        </View>
                        <Text className="mt-4 rounded-xl bg-superficie-2 p-3 text-sm text-texto-suave">
                            Es una estimación. El monto final depende del dictamen médico, de tus recibos y de
                            cómo avance el caso.
                        </Text>
                        <View className="mt-4 gap-2">
                            <Boton
                                variante="secundario"
                                ancho="completo"
                                onPress={() => navigation.navigate("MainApp", { screen: "Cases" })}
                            >
                                Consultar a mi abogado
                            </Boton>
                            <Boton
                                variante="whatsapp"
                                ancho="completo"
                                icono="logo-whatsapp"
                                onPress={() => Linking.openURL(CONTACTO.whatsapp)}
                            >
                                WhatsApp
                            </Boton>
                        </View>
                    </Tarjeta>
                ) : (
                    <Tarjeta fondo="bg-superficie-2">
                        <Text className="font-bold text-lg text-texto">¿Cómo se calcula?</Text>
                        <Text className="mt-2 text-base text-texto-suave">
                            La ley de riesgos del trabajo usa tu sueldo, tu edad y el porcentaje de
                            incapacidad: 53 sueldos, multiplicados por 65 dividido tu edad, y por el porcentaje
                            de incapacidad. Si el accidente fue en el trabajo, se suma un 20 %.
                        </Text>
                    </Tarjeta>
                )}
            </View>
        </Pantalla>
    );
}

function Fila({ etiqueta, monto }: { etiqueta: string; monto: number }) {
    return (
        <View className="flex-row justify-between gap-4">
            <Text className="flex-1 text-base text-texto-suave">{etiqueta}</Text>
            <Text className="font-semibold text-base text-texto">{formatoPesos(monto)}</Text>
        </View>
    );
}
