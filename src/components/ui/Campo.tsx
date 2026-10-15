import { type ReactNode, useState } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";
import { useColores } from "../../styles/tema";
import { cx } from "../../utils/cx";
import { Icono, type NombreIcono } from "./Icono";

// Campo con etiqueta visible siempre (nada de placeholders como única guía),
// ayuda y error debajo.

interface Base {
  etiqueta: string;
  ayuda?: ReactNode;
  error?: string | null;
  icono?: NombreIcono;
  /** Marca el dato como pendiente de completar. */
  falta?: boolean;
  className?: string;
}

/** Pastillita "Falta" al lado de la etiqueta de un dato sin completar. */
export function EtiquetaFalta() {
  return (
    <View className="rounded-md bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900">
      <Text className="font-bold text-amber-800 text-xs uppercase tracking-wide dark:text-amber-300">
        Falta
      </Text>
    </View>
  );
}

export function Etiqueta({ texto, falta }: { texto: string; falta?: boolean }) {
  return (
    <View className="mb-1.5 flex-row items-center gap-2">
      <Text className="font-semibold text-base text-texto">{texto}</Text>
      {falta ? <EtiquetaFalta /> : null}
    </View>
  );
}

export function Pie({ ayuda, error }: Pick<Base, "ayuda" | "error">) {
  return (
    <>
      {ayuda ? <Text className="mt-1.5 text-sm text-texto-suave">{ayuda}</Text> : null}
      {error ? (
        <Text
          accessibilityRole="alert"
          className="mt-1.5 font-semibold text-red-700 text-sm dark:text-red-300"
        >
          {error}
        </Text>
      ) : null}
    </>
  );
}

export const clasesCaja = (error: unknown, foco: boolean) =>
  cx(
    "rounded-2xl border bg-superficie px-4",
    error ? "border-red-500" : foco ? "border-foco" : "border-borde-fuerte",
  );

export function Campo({
  etiqueta,
  ayuda,
  error,
  icono,
  falta,
  className,
  multiline,
  ...props
}: Base & TextInputProps) {
  const c = useColores();
  const [foco, setFoco] = useState(false);
  return (
    <View className={className}>
      <Etiqueta texto={etiqueta} falta={falta} />
      <View className={cx("flex-row items-center gap-3", clasesCaja(error, foco))}>
        {icono ? <Icono nombre={icono} tono="textoTenue" /> : null}
        <TextInput
          accessibilityLabel={etiqueta}
          placeholderTextColor={c.textoTenue}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          {...props}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          // Sin `text-lg`: su interlineado descentra el texto del campo en iPhone.
          className={cx("flex-1 py-3 text-[18px] text-texto", multiline ? "min-h-32" : "min-h-13")}
        />
      </View>
      <Pie ayuda={ayuda} error={error} />
    </View>
  );
}
