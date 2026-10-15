import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useColores } from "../../styles/tema";
import { cx } from "../../utils/cx";
import { Icono, type NombreIcono } from "./Icono";

/** Interruptor del sistema, con la etiqueta del lado izquierdo. */
export function Interruptor({
  etiqueta,
  descripcion,
  activo,
  alCambiar,
  deshabilitado,
}: {
  etiqueta: string;
  descripcion?: string;
  activo: boolean;
  alCambiar: (valor: boolean) => void;
  deshabilitado?: boolean;
}) {
  const c = useColores();
  return (
    <View className="flex-row items-center gap-4 py-3">
      <View className="flex-1">
        <Text className="font-semibold text-base text-texto">{etiqueta}</Text>
        {descripcion ? <Text className="text-sm text-texto-suave">{descripcion}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={etiqueta}
        value={activo}
        onValueChange={alCambiar}
        disabled={deshabilitado}
        trackColor={{ false: c.bordeFuerte, true: c.brand }}
        ios_backgroundColor={c.bordeFuerte}
        thumbColor={c.blanco}
      />
    </View>
  );
}

/** Grupo de opciones con aspecto de botones (se elige una). */
export function Opciones<T extends string>({
  etiqueta,
  valor,
  opciones,
  alCambiar,
}: {
  etiqueta: string;
  valor: T;
  opciones: { valor: T; texto: string; icono?: NombreIcono }[];
  alCambiar: (valor: T) => void;
}) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={etiqueta}>
      <Text className="mb-2 font-semibold text-base text-texto">{etiqueta}</Text>
      <View className="flex-row gap-2">
        {opciones.map((o) => {
          const elegida = o.valor === valor;
          return (
            <Pressable
              key={o.valor}
              accessibilityRole="radio"
              accessibilityState={{ checked: elegida }}
              onPress={() => alCambiar(o.valor)}
              className={cx(
                "min-h-12 flex-1 items-center justify-center gap-1 rounded-2xl border-2 p-2 active:opacity-80",
                elegida ? "border-brand-600 bg-marca-suave" : "border-borde bg-superficie",
              )}
            >
              {o.icono ? (
                <Icono nombre={o.icono} tono={elegida ? "textoMarca" : "textoSuave"} size={20} />
              ) : null}
              <Text
                className={cx(
                  "text-center font-semibold text-sm",
                  elegida ? "text-texto-marca" : "text-texto-suave",
                )}
              >
                {o.texto}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Pestañas en pastillas que se deslizan de costado; el panel lo dibuja quien la usa. */
export function Pestanas<T extends string>({
  etiqueta,
  valor,
  pestanas,
  alCambiar,
}: {
  etiqueta: string;
  valor: T;
  pestanas: { valor: T; texto: string; icono?: NombreIcono; contador?: number }[];
  alCambiar: (valor: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel={etiqueta}
      // Llega hasta los bordes de la pantalla (la hoja tiene px-4).
      className="-mx-4 grow-0"
      contentContainerClassName="gap-2 px-4 py-1"
    >
      {pestanas.map((p) => {
        const activa = p.valor === valor;
        return (
          <Pressable
            key={p.valor}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            onPress={() => alCambiar(p.valor)}
            className={cx(
              "min-h-12 flex-row items-center gap-2 rounded-full border-2 px-4 active:opacity-80",
              activa ? "border-brand-600 bg-brand" : "border-borde bg-superficie",
            )}
          >
            {p.icono ? (
              <Icono nombre={p.icono} tono={activa ? "ink" : "textoSuave"} size={20} />
            ) : null}
            <Text className={cx("font-bold text-base", activa ? "text-ink" : "text-texto-suave")}>
              {p.texto}
            </Text>
            {p.contador ? (
              <View
                className={cx("rounded-full px-2 py-0.5", activa ? "bg-ink/15" : "bg-superficie-2")}
              >
                <Text className={cx("font-bold text-xs", activa ? "text-ink" : "text-texto-suave")}>
                  {p.contador}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
