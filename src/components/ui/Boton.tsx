import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, type PressableProps, Text } from "react-native";
import { type Tono, useColores } from "../../styles/tema";
import { cx } from "../../utils/cx";
import { Icono, type NombreIcono } from "./Icono";

// Botones del portal: rounded-2xl y altos (mín. 48 px para tocar fácil).
// Sobre brand va texto ink: blanco sobre #21ADBC no llega a AA.
const VARIANTES: Record<string, { caja: string; texto: string; tono: Tono }> = {
  primario: { caja: "bg-brand shadow-marca", texto: "text-ink", tono: "ink" },
  secundario: {
    caja: "border border-borde-fuerte bg-superficie",
    texto: "text-texto",
    tono: "texto",
  },
  suave: { caja: "bg-marca-suave", texto: "text-texto-marca", tono: "textoMarca" },
  fantasma: { caja: "", texto: "text-texto-marca", tono: "textoMarca" },
  peligro: {
    caja: "border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
    texto: "text-red-700 dark:text-red-300",
    tono: "rojo",
  },
  // Verde de WhatsApp con contraste suficiente para el texto blanco.
  whatsapp: { caja: "bg-[#16a34a]", texto: "text-white", tono: "blanco" },
};

const TAMANIOS = {
  sm: { caja: "min-h-10 px-3.5", texto: "text-sm" },
  md: { caja: "min-h-12 px-5", texto: "text-base" },
  lg: { caja: "min-h-14 px-6", texto: "text-lg" },
};

interface PropsBoton extends Omit<PressableProps, "children"> {
  children?: ReactNode;
  variante?: "primario" | "secundario" | "suave" | "fantasma" | "peligro" | "whatsapp";
  tamanio?: keyof typeof TAMANIOS;
  ancho?: "completo" | "auto";
  cargando?: boolean;
  icono?: NombreIcono;
  className?: string;
}

export function Boton({
  children,
  variante = "primario",
  tamanio = "md",
  ancho = "auto",
  cargando,
  icono,
  disabled,
  className,
  ...props
}: PropsBoton) {
  const c = useColores();
  const v = VARIANTES[variante];
  const t = TAMANIOS[tamanio];
  const apagado = Boolean(disabled || cargando);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: apagado, busy: Boolean(cargando) }}
      disabled={apagado}
      className={cx(
        "flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80",
        apagado && "opacity-60",
        v.caja,
        t.caja,
        ancho === "completo" && "w-full",
        className,
      )}
      {...props}
    >
      {cargando ? (
        <ActivityIndicator color={c[v.tono]} />
      ) : icono ? (
        <Icono nombre={icono} tono={v.tono} size={tamanio === "lg" ? 24 : 20} />
      ) : null}
      {children != null ? (
        <Text className={cx("shrink text-center font-bold", v.texto, t.texto)}>{children}</Text>
      ) : null}
    </Pressable>
  );
}
