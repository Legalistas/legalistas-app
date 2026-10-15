import { Text, View } from "react-native";
import { ETAPAS_AVANCE, etapaPorId } from "../../utils/constantes";
import { cx } from "../../utils/cx";
import { Icono } from "./Icono";

// Línea de avance: pasos hechos (tilde), el actual (resaltado, con explicación
// en palabras simples) y los que faltan. La usan las etapas del caso y los
// pasos de una consulta que todavía no es caso.

export interface PasoAvance {
  clave: string | number;
  nombre: string;
}

export function LineaAvance({
  pasos,
  indiceActual,
  destacado,
  textoAccesible,
  compacto = false,
}: {
  pasos: readonly PasoAvance[];
  /** -1 si no se sabe; `pasos.length` si ya terminó todos. */
  indiceActual: number;
  /** Recuadro de arriba: dónde está y qué significa. */
  destacado?: { titulo: string; texto: string } | null;
  /** Resumen para lectores de pantalla. */
  textoAccesible: string;
  compacto?: boolean;
}) {
  if (compacto) {
    const hechos = Math.max(0, indiceActual) + (indiceActual >= pasos.length ? 0 : 1);
    return (
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={textoAccesible}
        className="flex-row gap-1.5"
      >
        {pasos.map((p, i) => (
          <View
            key={p.clave}
            className={cx("h-2 flex-1 rounded-full", i < hechos ? "bg-brand" : "bg-superficie-2")}
          />
        ))}
      </View>
    );
  }

  return (
    <View>
      {destacado ? (
        <View className="mb-4 rounded-2xl border border-brand-200 bg-marca-suave p-4 dark:border-ink-50">
          <Text className="font-bold text-lg text-texto">{destacado.titulo}</Text>
          <Text className="text-base text-texto">{destacado.texto}</Text>
        </View>
      ) : null}
      {pasos.map((paso, i) => {
        const hecho = i < indiceActual;
        const esActual = i === indiceActual;
        return (
          <View
            key={paso.clave}
            accessible
            accessibilityLabel={`${paso.nombre} (${hecho ? "terminado" : esActual ? "paso actual" : "pendiente"})`}
            className="flex-row gap-4"
          >
            <View className="items-center">
              <View
                className={cx(
                  "size-10 items-center justify-center rounded-full border-2",
                  hecho
                    ? "border-brand bg-brand"
                    : esActual
                      ? "border-brand-600 bg-marca-suave"
                      : "border-borde-fuerte bg-superficie",
                )}
              >
                {hecho ? (
                  <Icono nombre="checkmark" tono="ink" size={20} />
                ) : (
                  <Text
                    className={cx(
                      "font-bold text-base",
                      esActual ? "text-texto-marca" : "text-texto-tenue",
                    )}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < pasos.length - 1 ? (
                <View className={cx("w-0.5 flex-1", hecho ? "bg-brand" : "bg-borde")} />
              ) : null}
            </View>
            <Text
              className={cx(
                "flex-1 pt-2 text-base",
                i < pasos.length - 1 && "pb-5",
                esActual ? "font-bold text-texto" : "font-semibold text-texto-suave",
              )}
            >
              {paso.nombre}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const PASOS_ETAPAS = ETAPAS_AVANCE.map((e) => ({ clave: e.id, nombre: e.nombre }));

/** Etapas del caso (cases.stageId) en la línea de avance. */
export function AvanceEtapas({
  etapaId,
  compacto = false,
}: {
  etapaId: number | null;
  compacto?: boolean;
}) {
  const actual = etapaPorId(etapaId);
  const terminado = (etapaId ?? 0) > 5;
  const indiceActual = terminado
    ? ETAPAS_AVANCE.length
    : ETAPAS_AVANCE.findIndex((e) => e.id === etapaId);

  return (
    <LineaAvance
      pasos={PASOS_ETAPAS}
      indiceActual={indiceActual}
      compacto={compacto}
      destacado={
        actual
          ? {
              titulo: terminado ? actual.nombre : `Etapa actual: ${actual.nombre}`,
              texto: actual.explicacion,
            }
          : null
      }
      textoAccesible={
        terminado
          ? "El caso terminó todas las etapas."
          : `Etapa ${Math.max(0, indiceActual) + 1} de ${ETAPAS_AVANCE.length}: ${actual?.nombre ?? "sin etapa"}.`
      }
    />
  );
}
