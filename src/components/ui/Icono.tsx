import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { type Tono, useColores } from "../../styles/tema";
import { cx } from "../../utils/cx";

export type NombreIcono = keyof typeof Ionicons.glyphMap;

/** Ícono decorativo (el texto de al lado dice lo mismo): los lectores de pantalla lo saltean. */
export function Icono({
  nombre,
  tono = "texto",
  size = 24,
}: {
  nombre: NombreIcono;
  tono?: Tono;
  size?: number;
}) {
  const c = useColores();
  return (
    <Ionicons
      name={nombre}
      size={size}
      color={c[tono]}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}

/** Ícono dentro de un cuadrado redondeado de color suave. */
export function IconoCaja({
  nombre,
  chico,
  fondo = "bg-marca-suave",
  tono = "textoMarca",
}: {
  nombre: NombreIcono;
  chico?: boolean;
  fondo?: string;
  tono?: Tono;
}) {
  return (
    <View
      className={cx(
        "shrink-0 items-center justify-center rounded-xl",
        chico ? "size-11" : "size-12",
        fondo,
      )}
    >
      <Icono nombre={nombre} tono={tono} size={chico ? 20 : 24} />
    </View>
  );
}
