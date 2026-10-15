import { Text, View } from "react-native";
import { useConfirmarEvento, useEventos } from "../services/consultas";
import { formatoDia } from "../utils/formato";
import { Boton } from "./ui/Boton";
import { CargandoLista, ErrorCarga } from "./ui/Estados";
import { Icono, IconoCaja } from "./ui/Icono";
import { Tarjeta, TituloSeccion } from "./ui/Tarjeta";

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

// Audiencias, pericias y reuniones a las que el cliente tiene que ir, con el
// botón para confirmar asistencia (le avisa al abogado). Se ve siempre: si no
// hay ninguna, lo dice (así sabe dónde van a aparecer).
// Con `casoId`, solo las de ese caso (pestaña Resumen del caso).
export function ProximosEventos({ casoId }: { casoId?: number }) {
  const eventos = useEventos();
  const confirmar = useConfirmarEvento();
  const lista = casoId ? eventos.data?.filter((e) => e.casoId === casoId) : eventos.data;

  return (
    <View>
      <TituloSeccion>{casoId ? "Audiencias y pericias" : "Tus audiencias y pericias"}</TituloSeccion>
      {eventos.isPending ? (
        <CargandoLista filas={1} etiqueta="Cargando tus citas…" />
      ) : eventos.isError ? (
        <ErrorCarga alReintentar={() => eventos.refetch()} />
      ) : !lista?.length ? (
        <Tarjeta className="flex-row items-start gap-3">
          <IconoCaja nombre="calendar-outline" />
          <View className="flex-1">
            <Text className="font-bold text-base text-texto">No tenés citas por ahora</Text>
            <Text className="mt-0.5 text-base text-texto-suave">
              Cuando el estudio te cite a una audiencia, pericia o reunión, te avisamos acá y en la
              campanita para que confirmes que vas.
            </Text>
          </View>
        </Tarjeta>
      ) : (
        <View className="gap-3">
          {lista.map((evento) => (
            <Tarjeta key={evento.id} borde="border-amber-200 dark:border-amber-800">
              <View className="flex-row gap-3">
                <IconoCaja nombre="calendar-outline" fondo="bg-amber-50 dark:bg-amber-950" tono="ambar" />
                <View className="flex-1">
                  <Text className="font-bold text-lg text-texto">{evento.titulo}</Text>
                  <Text className="mt-0.5 font-semibold text-base text-texto">
                    {mayuscula(formatoDia(evento.fecha, true))}
                    {evento.hora ? ` · ${evento.hora} h` : ""}
                  </Text>
                  {evento.lugar ? (
                    <View className="mt-1 flex-row items-start gap-1.5">
                      <Icono nombre="location-outline" tono="textoSuave" size={20} />
                      <Text className="flex-1 text-base text-texto-suave">{evento.lugar}</Text>
                    </View>
                  ) : null}
                  {casoId ? null : (
                    <Text className="mt-1 text-sm text-texto-tenue">Caso: {evento.casoTitulo}</Text>
                  )}
                </View>
              </View>
              {evento.confirmado ? (
                <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 dark:bg-green-950">
                  <Icono nombre="checkmark-circle" tono="verde" size={20} />
                  <Text className="flex-1 font-semibold text-base text-green-800 dark:text-green-300">
                    Confirmaste que vas a ir
                  </Text>
                </View>
              ) : (
                <Boton
                  ancho="completo"
                  className="mt-4"
                  cargando={confirmar.isPending && confirmar.variables === evento.id}
                  onPress={() => confirmar.mutate(evento.id)}
                  icono="checkmark-circle-outline"
                >
                  Confirmar que voy a ir
                </Boton>
              )}
            </Tarjeta>
          ))}
        </View>
      )}
    </View>
  );
}
