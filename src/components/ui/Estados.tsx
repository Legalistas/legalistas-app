import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { cx } from "../../utils/cx";
import { Boton } from "./Boton";
import { Icono, type NombreIcono } from "./Icono";

export function EstadoVacio({
  icono,
  titulo,
  children,
  accion,
  sinBorde,
}: {
  icono: NombreIcono;
  titulo: string;
  children?: ReactNode;
  accion?: ReactNode;
  sinBorde?: boolean;
}) {
  return (
    <View
      className={cx(
        "items-center rounded-2xl px-6",
        sinBorde ? "py-6" : "border border-borde bg-superficie py-10",
      )}
    >
      <View className="size-16 items-center justify-center rounded-2xl bg-marca-suave">
        <Icono nombre={icono} tono="textoMarca" size={32} />
      </View>
      <Text className="mt-4 text-center font-bold text-lg text-texto">{titulo}</Text>
      {children ? (
        <Text className="mt-1 text-center text-base text-texto-suave">{children}</Text>
      ) : null}
      {accion ? <View className="mt-5">{accion}</View> : null}
    </View>
  );
}

export function ErrorCarga({
  mensaje = "No pudimos cargar esta información.",
  alReintentar,
}: {
  mensaje?: string;
  alReintentar?: () => void;
}) {
  return (
    <View
      accessibilityRole="alert"
      className="items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-8 dark:border-red-900 dark:bg-red-950"
    >
      <Icono nombre="alert-circle-outline" tono="rojo" size={36} />
      <Text className="mt-3 text-center font-semibold text-base text-red-800 dark:text-red-200">
        {mensaje}
      </Text>
      {alReintentar ? (
        <Boton variante="secundario" className="mt-4" onPress={alReintentar} icono="refresh">
          Reintentar
        </Boton>
      ) : null}
    </View>
  );
}

/** Bloque gris que ocupa el lugar mientras carga (no hay spinners sueltos). */
export function Esqueleto({ className }: { className?: string }) {
  return <View className={cx("animate-pulse rounded-2xl bg-superficie-2", className)} />;
}

export function CargandoLista({
  filas = 3,
  etiqueta = "Cargando…",
}: {
  filas?: number;
  etiqueta?: string;
}) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={etiqueta} className="gap-3">
      {Array.from({ length: filas }, (_, i) => (
        <Esqueleto key={i} className="h-28" />
      ))}
    </View>
  );
}
