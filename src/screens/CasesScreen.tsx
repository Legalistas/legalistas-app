import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Pantalla } from "../components/Encabezado";
import { TarjetaCaso, TarjetaTramite } from "../components/TarjetaCaso";
import { Campo } from "../components/ui/Campo";
import { Pestanas } from "../components/ui/Controles";
import { CargandoLista, ErrorCarga, EstadoVacio } from "../components/ui/Estados";
import { TituloSeccion } from "../components/ui/Tarjeta";
import { useCasos, useTramites, useYo } from "../services/consultas";

type Filtro = "en-curso" | "terminados";

export default function CasesScreen() {
    const casos = useCasos();
    const tramites = useTramites();
    const { data: yo } = useYo();
    const variasPersonas = (yo?.personas.length ?? 0) > 1;
    const [filtro, setFiltro] = useState<Filtro>("en-curso");
    const [busqueda, setBusqueda] = useState("");

    const enCurso = casos.data?.filter((c) => (c.etapaId ?? 0) <= 5) ?? [];
    const terminados = casos.data?.filter((c) => (c.etapaId ?? 0) > 5) ?? [];
    const visibles = useMemo(() => {
        const base = filtro === "en-curso" ? enCurso : terminados;
        const q = busqueda.trim().toLowerCase();
        if (!q) return base;
        return base.filter((c) =>
            [c.titulo, c.numero, c.servicio, c.titular.nombre].some((t) => t?.toLowerCase().includes(q)),
        );
    }, [filtro, enCurso, terminados, busqueda]);

    return (
        <Pantalla
            conBarra
            antetitulo="Mis casos"
            titulo={
                casos.data
                    ? casos.data.length === 1
                        ? "1 caso"
                        : `${casos.data.length} casos`
                    : "Mis casos"
            }
            subtitulo="Tocá un caso para ver en qué etapa está, tus documentos y las consultas."
        >
            {(casos.data?.length ?? 0) > 3 ? (
                <Campo
                    etiqueta="Buscar un caso"
                    value={busqueda}
                    onChangeText={setBusqueda}
                    placeholder="Nombre, número o tipo de caso"
                    icono="search-outline"
                    returnKeyType="search"
                    className="mb-4"
                />
            ) : null}
            {terminados.length > 0 ? (
                <View className="mb-4">
                    <Pestanas
                        etiqueta="Filtrar casos"
                        valor={filtro}
                        alCambiar={setFiltro}
                        pestanas={[
                            { valor: "en-curso", texto: "En curso", contador: enCurso.length },
                            { valor: "terminados", texto: "Terminados", contador: terminados.length },
                        ]}
                    />
                </View>
            ) : null}

            {casos.isPending ? (
                <CargandoLista etiqueta="Cargando tus casos…" />
            ) : casos.isError ? (
                <ErrorCarga alReintentar={() => casos.refetch()} />
            ) : casos.data.length === 0 && tramites.data?.length ? (
                // Todavía no hay caso, pero sí una consulta en curso: que mande la documentación.
                <View>
                    <Text className="mb-4 text-base text-texto-suave">
                        Todavía no iniciamos tu caso. Mientras tanto, podés mandarnos tu documentación
                        desde tu consulta.
                    </Text>
                    <TituloSeccion>
                        {tramites.data.length === 1 ? "Tu consulta" : "Tus consultas"}
                    </TituloSeccion>
                    <View className="gap-3">
                        {tramites.data.map((t) => (
                            <TarjetaTramite key={t.id} tramite={t} mostrarTitular={variasPersonas} />
                        ))}
                    </View>
                </View>
            ) : visibles.length === 0 ? (
                <EstadoVacio
                    icono="briefcase-outline"
                    titulo={busqueda ? "No encontramos casos con esa búsqueda" : "No hay casos acá"}
                >
                    {busqueda
                        ? "Probá con otra palabra."
                        : "Cuando el estudio inicie un caso tuyo, lo vas a ver en esta pantalla."}
                </EstadoVacio>
            ) : (
                <View className="gap-3">
                    {visibles.map((caso) => (
                        <TarjetaCaso key={caso.id} caso={caso} mostrarTitular={variasPersonas} />
                    ))}
                </View>
            )}
        </Pantalla>
    );
}
