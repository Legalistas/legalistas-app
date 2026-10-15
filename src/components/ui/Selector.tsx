import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { cx } from "../../utils/cx";
import { clasesCaja, Etiqueta, Pie } from "./Campo";
import { Dialogo } from "./Dialogo";
import { Icono } from "./Icono";

// Lista de opciones con el estilo de los campos: al tocarla se abre una hoja
// con las opciones grandes (React Native no trae un <select>).
export function Selector({
  etiqueta,
  ayuda,
  falta,
  valor,
  opciones,
  alCambiar,
  vacio = "Elegí una opción",
  className,
}: {
  etiqueta: string;
  ayuda?: string;
  /** Marca el campo como pendiente de completar. */
  falta?: boolean;
  valor: string;
  opciones: { valor: string; texto: string }[];
  alCambiar: (valor: string) => void;
  vacio?: string;
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const elegida = opciones.find((o) => o.valor === valor);
  return (
    <View className={className}>
      <Etiqueta texto={etiqueta} falta={falta} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${elegida?.texto ?? vacio}`}
        onPress={() => setAbierto(true)}
        className={cx("min-h-13 flex-row items-center gap-3 py-3", clasesCaja(null, abierto))}
      >
        <Text className={cx("flex-1 text-lg", elegida ? "text-texto" : "text-texto-tenue")}>
          {elegida?.texto ?? vacio}
        </Text>
        <Icono nombre="chevron-down" tono="textoTenue" size={20} />
      </Pressable>
      <Pie ayuda={ayuda} />
      <Dialogo abierto={abierto} alCerrar={() => setAbierto(false)} titulo={etiqueta}>
        <View className="gap-1">
          {opciones.map((o) => {
            const activa = o.valor === valor;
            return (
              <Pressable
                key={o.valor}
                accessibilityRole="radio"
                accessibilityState={{ checked: activa }}
                onPress={() => {
                  alCambiar(o.valor);
                  setAbierto(false);
                }}
                className={cx(
                  "min-h-12 flex-row items-center gap-3 rounded-xl px-3.5 py-2.5 active:bg-superficie-2",
                  activa && "bg-marca-suave",
                )}
              >
                <Text
                  className={cx(
                    "flex-1 text-lg",
                    activa ? "font-semibold text-texto-marca" : "text-texto",
                  )}
                >
                  {o.texto}
                </Text>
                {activa ? <Icono nombre="checkmark" tono="textoMarca" size={20} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Dialogo>
    </View>
  );
}
