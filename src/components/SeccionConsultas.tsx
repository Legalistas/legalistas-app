import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useNuevaConsulta } from "../services/consultas";
import type { CasoDetalle } from "../types/portal";
import { ESTADOS_CONSULTA } from "../utils/constantes";
import { haceCuanto } from "../utils/formato";
import type { Nav } from "./Encabezado";
import { Boton } from "./ui/Boton";
import { Campo } from "./ui/Campo";
import { Dialogo } from "./ui/Dialogo";
import { EstadoVacio } from "./ui/Estados";
import { Icono } from "./ui/Icono";
import { Insignia, Novedad, TituloSeccion } from "./ui/Tarjeta";

// Consultas del caso con el abogado. Se puede tener una abierta por vez (así
// lo maneja el estudio): mientras haya una, se sigue escribiendo ahí.
export function SeccionConsultas({ caso }: { caso: CasoDetalle }) {
  const navigation = useNavigation<Nav>();
  const [abierto, setAbierto] = useState(false);
  const abierta = caso.consultas.find((c) => c.estado !== "CLOSED");
  const irA = (id: number) => navigation.navigate("ConsultationDetail", { consultationId: id });

  return (
    <View>
      <TituloSeccion>Consultas con tu abogado</TituloSeccion>

      {abierta ? (
        <View className="mb-4 rounded-2xl border border-brand-200 bg-marca-suave p-4 dark:border-ink-50">
          <Text className="text-base text-texto">
            Tenés una consulta abierta. Para preguntar algo más, escribí en esa conversación.
          </Text>
          <Boton
            ancho="completo"
            className="mt-3"
            icono="chatbubbles-outline"
            onPress={() => irA(abierta.id)}
          >
            Ir a la conversación
          </Boton>
        </View>
      ) : (
        <Boton
          tamanio="lg"
          ancho="completo"
          className="mb-4"
          onPress={() => setAbierto(true)}
          icono="chatbubble-ellipses-outline"
        >
          Hacer una consulta
        </Boton>
      )}

      {caso.consultas.length === 0 ? (
        <EstadoVacio icono="chatbubbles-outline" titulo="Todavía no hiciste consultas">
          Si tenés una duda sobre tu caso, escribile a tu abogado desde acá.
        </EstadoVacio>
      ) : (
        <View className="overflow-hidden rounded-2xl border border-borde bg-superficie">
          {caso.consultas.map((c, i) => {
            const estado = ESTADOS_CONSULTA[c.estado];
            return (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                onPress={() => irA(c.id)}
                className={`flex-row items-center gap-3 p-4 active:bg-superficie-2 ${i ? "border-borde border-t" : ""}`}
              >
                <View className="flex-1">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Insignia color={estado.color} fondo={estado.fondo}>
                      {estado.nombre}
                    </Insignia>
                    {c.noLeidos > 0 ? (
                      <Novedad>
                        {c.noLeidos === 1 ? "1 respuesta nueva" : `${c.noLeidos} respuestas nuevas`}
                      </Novedad>
                    ) : null}
                  </View>
                  <Text className="mt-1.5 font-bold text-base text-texto">{c.titulo}</Text>
                  {c.ultimoMensaje ? (
                    <Text numberOfLines={2} className="mt-0.5 text-base text-texto-suave">
                      {c.ultimoMensaje}
                    </Text>
                  ) : null}
                  <Text className="mt-1 text-sm text-texto-tenue">{haceCuanto(c.actualizada)}</Text>
                </View>
                <Icono nombre="chevron-forward" tono="textoTenue" />
              </Pressable>
            );
          })}
        </View>
      )}

      <NuevaConsulta
        casoId={caso.id}
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        alCrear={irA}
      />
    </View>
  );
}

function NuevaConsulta({
  casoId,
  abierto,
  alCerrar,
  alCrear,
}: {
  casoId: number;
  abierto: boolean;
  alCerrar: () => void;
  alCrear: (id: number) => void;
}) {
  const crear = useNuevaConsulta();
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enviar = () => {
    if (titulo.trim().length < 3) return setError("Escribí de qué se trata (al menos 3 letras).");
    if (!mensaje.trim()) return setError("Escribí tu consulta.");
    setError(null);
    crear.mutate(
      { casoId, titulo: titulo.trim(), mensaje: mensaje.trim() },
      {
        onSuccess: ({ id }) => {
          alCerrar();
          setTitulo("");
          setMensaje("");
          if (id) alCrear(id);
        },
      },
    );
  };

  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Nueva consulta"
      descripcion="Tu abogado la recibe al instante y te responde por acá."
    >
      <View className="gap-4">
        <Campo
          etiqueta="¿Sobre qué es?"
          placeholder="Por ejemplo: turno con el médico de la ART"
          value={titulo}
          onChangeText={setTitulo}
          maxLength={100}
        />
        <Campo
          multiline
          etiqueta="Tu consulta"
          placeholder="Contanos con tus palabras"
          value={mensaje}
          onChangeText={setMensaje}
          maxLength={2000}
          ayuda={`${mensaje.length} de 2000 caracteres`}
          error={error}
        />
        <Boton tamanio="lg" ancho="completo" cargando={crear.isPending} onPress={enviar}>
          Enviar consulta
        </Boton>
      </View>
    </Dialogo>
  );
}
