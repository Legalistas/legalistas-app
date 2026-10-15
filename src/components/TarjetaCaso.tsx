import { useNavigation } from "@react-navigation/native";
import { Pressable, Text, View } from "react-native";
import type { CasoResumen, Tramite } from "../types/portal";
import {
  ESTADOS_CASO,
  estadoTramite,
  etapaPorId,
  PASOS_TRAMITE,
  pasoTramite,
} from "../utils/constantes";
import { formatoFechaCorta, haceCuanto } from "../utils/formato";
import type { Nav } from "./Encabezado";
import { Icono, IconoCaja } from "./ui/Icono";
import { AvanceEtapas, LineaAvance } from "./ui/LineaAvance";
import { Avatar, BORDE_MARCA, Insignia, Novedad } from "./ui/Tarjeta";

const CLASES = `rounded-2xl border bg-superficie p-4 shadow-tarjeta active:opacity-80 ${BORDE_MARCA}`;

/** Tarjeta del caso: etapa, avance, abogado y respuestas nuevas. */
export function TarjetaCaso({
  caso,
  mostrarTitular,
}: {
  caso: CasoResumen;
  mostrarTitular?: boolean;
}) {
  const navigation = useNavigation<Nav>();
  const etapa = etapaPorId(caso.etapaId);
  const estado = caso.estado !== "IN_PROGRESS" ? ESTADOS_CASO[caso.estado] : null;
  const noLeidos = caso.consultaAbierta?.noLeidos ?? 0;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => navigation.navigate("CaseDetail", { caseId: caso.id })}
      className={CLASES}
    >
      <View className="flex-row items-start gap-3">
        <IconoCaja nombre="briefcase-outline" />
        <View className="flex-1">
          <Text className="font-semibold text-sm text-texto-tenue uppercase tracking-wide">
            {caso.servicio ?? "Caso"}
            {caso.numero ? ` · N.º ${caso.numero}` : ""}
          </Text>
          <Text className="mt-0.5 font-bold text-lg text-texto">{caso.titulo}</Text>
          {mostrarTitular ? (
            <Text className="mt-0.5 text-sm text-texto-suave">
              A nombre de {caso.titular.nombre}
            </Text>
          ) : null}
        </View>
        <View className="mt-3">
          <Icono nombre="chevron-forward" tono="textoTenue" />
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap items-center gap-2">
        {etapa ? (
          <Insignia color={etapa.color} fondo={etapa.fondo}>
            {etapa.nombre}
          </Insignia>
        ) : null}
        {estado ? (
          <Insignia color={estado.color} fondo={estado.fondo}>
            {estado.nombre}
          </Insignia>
        ) : null}
        {noLeidos ? (
          <Novedad>{noLeidos === 1 ? "1 respuesta nueva" : `${noLeidos} respuestas nuevas`}</Novedad>
        ) : null}
      </View>

      <View className="mt-4">
        <AvanceEtapas etapaId={caso.etapaId} compacto />
      </View>

      <View className="mt-4 flex-row flex-wrap items-center justify-between gap-2 border-borde border-t pt-3">
        {caso.abogado ? (
          <View className="flex-row items-center gap-2">
            <Avatar nombre={caso.abogado.nombre} imagen={caso.abogado.imagen} px={32} />
            <Text accessibilityLabel={`Tu abogado: ${caso.abogado.nombre}`} className="text-sm text-texto-suave">
              {caso.abogado.nombre}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1.5">
            <Icono nombre="person-outline" tono="textoSuave" size={16} />
            <Text className="text-sm text-texto-suave">Abogado a asignar</Text>
          </View>
        )}
        <Text className="text-sm text-texto-suave">
          Actualizado {haceCuanto(caso.actualizado).toLowerCase()}
        </Text>
      </View>
    </Pressable>
  );
}

// Consulta que todavía no es caso. Lo más importante es que mande la
// documentación: la tarjeta lo dice abajo, con el mismo peso que el título.
export function TarjetaTramite({
  tramite,
  mostrarTitular,
}: {
  tramite: Tramite;
  mostrarTitular?: boolean;
}) {
  const navigation = useNavigation<Nav>();
  const estado = estadoTramite(tramite.columna);
  const indice = pasoTramite(tramite.columna);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => navigation.navigate("Tramite", { tramiteId: tramite.id })}
      className={CLASES}
    >
      <View className="flex-row items-start gap-3">
        <IconoCaja nombre="clipboard-outline" />
        <View className="flex-1">
          <Text className="font-semibold text-sm text-texto-tenue uppercase tracking-wide">
            Tu consulta{tramite.servicio ? ` · ${tramite.servicio}` : ""}
          </Text>
          <Text className="mt-0.5 font-bold text-lg text-texto">{estado.titulo}</Text>
        </View>
        <View className="mt-3">
          <Icono nombre="chevron-forward" tono="textoTenue" />
        </View>
      </View>

      <View className="mt-4">
        <LineaAvance
          compacto
          pasos={PASOS_TRAMITE}
          indiceActual={indice}
          textoAccesible={`Paso ${indice + 1} de ${PASOS_TRAMITE.length}: ${PASOS_TRAMITE[indice].nombre}.`}
        />
      </View>

      <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-marca-suave px-3 py-2.5">
        <Icono nombre="cloud-upload-outline" tono="textoMarca" size={20} />
        <Text className="flex-1 font-semibold text-base text-texto-marca">
          Mandanos tu documentación desde acá
        </Text>
      </View>

      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
        {mostrarTitular ? (
          <View className="flex-row items-center gap-1.5">
            <Icono nombre="person-outline" tono="textoSuave" size={16} />
            <Text className="text-sm text-texto-suave">{tramite.titular.nombre}</Text>
          </View>
        ) : null}
        <Text className="text-sm text-texto-suave">
          Consulta del {formatoFechaCorta(tramite.creado)}
        </Text>
      </View>
    </Pressable>
  );
}
