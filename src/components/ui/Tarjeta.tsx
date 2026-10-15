import { type ReactNode, useState } from "react";
import { Image, Text, View, type ViewProps } from "react-native";
import { cx } from "../../utils/cx";
import { urlImagen } from "../../utils/formato";
import { iniciales } from "../../utils/nombre";

/** `borde` y `fondo` reemplazan a los de siempre (dos clases del mismo tipo se pisan sin orden). */
export function Tarjeta({
  className,
  borde = "border-borde",
  fondo = "bg-superficie",
  ...props
}: ViewProps & { borde?: string; fondo?: string }) {
  return (
    <View
      className={cx("rounded-2xl border p-4 shadow-tarjeta", borde, fondo, className)}
      {...props}
    />
  );
}

/** Borde de las tarjetas destacadas (caso, subir documentos). */
export const BORDE_MARCA = "border-brand-200 dark:border-brand-700";

/** Título de sección con acción opcional a la derecha ("Ver todos"). */
export function TituloSeccion({
  children,
  accion,
  className,
}: {
  children: ReactNode;
  accion?: ReactNode;
  className?: string;
}) {
  return (
    <View className={cx("mb-3 flex-row items-center justify-between gap-3", className)}>
      <Text accessibilityRole="header" className="flex-1 font-bold text-lg text-texto">
        {children}
      </Text>
      {accion}
    </View>
  );
}

/** Dato con etiqueta chica arriba. */
export function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <View>
      <Text className="font-semibold text-sm text-texto-tenue uppercase tracking-wide">
        {etiqueta}
      </Text>
      <Text className="mt-0.5 font-semibold text-base text-texto">{children}</Text>
    </View>
  );
}

// Pastilla de estado (etapa, estado del caso o de la consulta). Colores con
// contraste AA sobre su fondo; en modo oscuro, el borde la separa del fondo.
export function Insignia({
  color,
  fondo,
  children,
}: {
  color: string;
  fondo: string;
  children: ReactNode;
}) {
  return (
    <View
      className="self-start rounded-lg border border-transparent px-2.5 py-1 dark:border-white/20"
      style={{ backgroundColor: fondo }}
    >
      <Text className="font-bold text-xs uppercase tracking-wide" style={{ color }}>
        {children}
      </Text>
    </View>
  );
}

/** Globito rojo de "respuestas nuevas". */
export function Novedad({ children }: { children: ReactNode }) {
  return (
    <View className="self-start rounded-lg bg-red-600 px-2.5 py-1">
      <Text className="font-bold text-white text-xs">{children}</Text>
    </View>
  );
}

// Foto de una persona (el abogado del caso): la de Google o la subida a MinIO.
// Si no tiene, o no carga, un círculo con las iniciales de apellido y nombre.
export function Avatar({
  nombre,
  imagen,
  px,
}: {
  nombre: string;
  imagen: string | null | undefined;
  px: number;
}) {
  const [fallo, setFallo] = useState(false);
  const src = urlImagen(imagen);
  const forma = { width: px, height: px, borderRadius: px / 2 };
  if (src && !fallo) {
    return (
      <Image
        source={{ uri: src }}
        style={forma}
        className="bg-superficie-2"
        onError={() => setFallo(true)}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View style={forma} className="items-center justify-center bg-brand">
      <Text className="font-bold text-ink" style={{ fontSize: px * 0.36 }}>
        {iniciales(nombre)}
      </Text>
    </View>
  );
}
