import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Linking, Text, View } from "react-native";
import { type Nav, Pantalla } from "../components/Encabezado";
import { Boton } from "../components/ui/Boton";
import { Campo } from "../components/ui/Campo";
import { Pestanas } from "../components/ui/Controles";
import { EstadoVacio } from "../components/ui/Estados";
import { IconoCaja } from "../components/ui/Icono";
import { BORDE_MARCA, Tarjeta } from "../components/ui/Tarjeta";
import { PORTAL_URL } from "../config/api";
import { CATEGORIAS, type Categoria, RECURSOS } from "../utils/recursos";

type Filtro = "Todos" | Categoria;

export default function ResourcesScreen() {
    const navigation = useNavigation<Nav>();
    const [filtro, setFiltro] = useState<Filtro>("Todos");
    const [busqueda, setBusqueda] = useState("");

    const visibles = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        return RECURSOS.filter(
            (r) =>
                (filtro === "Todos" || r.categoria === filtro) &&
                (!q || r.titulo.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q)),
        );
    }, [filtro, busqueda]);

    return (
        <Pantalla
            conBarra
            antetitulo="Recursos gratuitos"
            titulo="Guías y modelos"
            subtitulo="Información útil y modelos de documentos para descargar e imprimir."
        >
            <Tarjeta borde={BORDE_MARCA} className="mb-6 gap-4">
                <View className="flex-row items-center gap-3">
                    <IconoCaja nombre="calculator-outline" fondo="bg-brand" tono="ink" />
                    <View className="flex-1">
                        <Text className="font-bold text-lg text-texto">Calculadora de indemnización</Text>
                        <Text className="text-base text-texto-suave">
                            Estimá cuánto te corresponde por un accidente de trabajo.
                        </Text>
                    </View>
                </View>
                <Boton ancho="completo" onPress={() => navigation.navigate("Calculator")}>
                    Calcular
                </Boton>
            </Tarjeta>

            <Campo
                etiqueta="Buscar"
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Por ejemplo: ART, alquiler, renuncia"
                icono="search-outline"
                returnKeyType="search"
                className="mb-4"
            />
            <Pestanas
                etiqueta="Categorías"
                valor={filtro}
                alCambiar={setFiltro}
                pestanas={[
                    { valor: "Todos", texto: "Todos" },
                    ...CATEGORIAS.map((c) => ({ valor: c, texto: c })),
                ]}
            />

            <View className="mt-5 gap-3">
                {visibles.length === 0 ? (
                    <EstadoVacio icono="book-outline" titulo="No encontramos recursos con esa búsqueda">
                        Probá con otra palabra.
                    </EstadoVacio>
                ) : (
                    visibles.map((r) => (
                        <Tarjeta key={r.id}>
                            <View className="flex-row gap-3">
                                <IconoCaja nombre="document-text-outline" />
                                <View className="flex-1">
                                    <Text className="font-semibold text-sm text-texto-tenue uppercase tracking-wide">
                                        {r.categoria}
                                    </Text>
                                    <Text className="mt-0.5 font-bold text-lg text-texto">{r.titulo}</Text>
                                </View>
                            </View>
                            <Text className="mt-2 text-base text-texto-suave">{r.descripcion}</Text>
                            {/* El navegador del teléfono muestra el PDF y deja guardarlo o imprimirlo. */}
                            <Boton
                                variante="suave"
                                ancho="completo"
                                className="mt-4"
                                icono="open-outline"
                                accessibilityLabel={`Abrir ${r.titulo}`}
                                onPress={() => Linking.openURL(`${PORTAL_URL}${r.archivo}`)}
                            >
                                Abrir el PDF
                            </Boton>
                        </Tarjeta>
                    ))
                )}
            </View>
        </Pantalla>
    );
}
