import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { type ReactNode, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { claves, useAbrirDocumento, useDocumentos } from "../services/consultas";
import { type Archivo, MAX_MB, nombreParaFoto, subirDocumento } from "../services/subida";
import type { Documento } from "../types/portal";
import { showSimpleAlert } from "../utils/alert";
import { formatoFechaCorta, formatoTamanio } from "../utils/formato";
import { Boton } from "./ui/Boton";
import { Campo } from "./ui/Campo";
import { CargandoLista, ErrorCarga, EstadoVacio } from "./ui/Estados";
import { Icono, IconoCaja, type NombreIcono } from "./ui/Icono";
import { BORDE_MARCA, Tarjeta, TituloSeccion } from "./ui/Tarjeta";

const iconoDe = (doc: Documento): NombreIcono =>
  doc.tipo.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(doc.nombre)
    ? "image-outline"
    : /pdf/.test(doc.tipo) || doc.extension === ".pdf"
      ? "document-text-outline"
      : "document-outline";

export function SeccionDocumentos({
  base,
  titulo = "Documentos del caso",
  vacio = "Acá vas a ver lo que subas y los informes que te mande el estudio.",
  subida,
}: {
  /** "/casos/{id}" o "/tramites/{id}". */
  base: string;
  titulo?: string;
  vacio?: string;
  /** Tarjeta de subida propia (si no, la de siempre para el abogado). */
  subida?: ReactNode;
}) {
  const documentos = useDocumentos(base);
  const abrir = useAbrirDocumento(base);
  // El navegador del teléfono muestra el PDF o la foto, o lo descarga.
  const abrirDoc = (doc: Documento, descargar: boolean) =>
    abrir.mutate({ docId: doc.id, descargar }, { onSuccess: ({ url }) => Linking.openURL(url) });

  return (
    <View className="gap-6">
      {subida ?? <SubirDocumentos base={base} />}

      <View>
        <TituloSeccion>{titulo}</TituloSeccion>
        {documentos.isPending ? (
          <CargandoLista filas={3} etiqueta="Cargando documentos…" />
        ) : documentos.isError ? (
          <ErrorCarga alReintentar={() => documentos.refetch()} />
        ) : documentos.data.length === 0 ? (
          <EstadoVacio icono="folder-open-outline" titulo="Todavía no hay documentos">
            {vacio}
          </EstadoVacio>
        ) : (
          <View className="overflow-hidden rounded-2xl border border-borde bg-superficie">
            {documentos.data.map((doc, i) => {
              const ocupado = abrir.isPending && abrir.variables?.docId === doc.id;
              return (
                <View key={doc.id} className={i ? "border-borde border-t p-4" : "p-4"}>
                  <View className="flex-row items-center gap-3">
                    <IconoCaja nombre={iconoDe(doc)} />
                    <View className="flex-1">
                      <Text className="font-semibold text-base text-texto">{doc.nombre}</Text>
                      {doc.descripcion && doc.descripcion !== doc.nombre ? (
                        <Text className="text-base text-texto-suave">{doc.descripcion}</Text>
                      ) : null}
                      <Text className="mt-0.5 text-sm text-texto-tenue">
                        {formatoTamanio(doc.tamanio)} · {formatoFechaCorta(doc.subidoEl)} ·{" "}
                        {doc.subidoPorCliente ? "Lo subiste vos" : "Te lo envió Legalistas"}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 flex-row gap-2">
                    <Boton
                      variante="secundario"
                      tamanio="sm"
                      className="flex-1"
                      onPress={() => abrirDoc(doc, false)}
                      disabled={ocupado}
                      icono="eye-outline"
                      accessibilityLabel={`Ver ${doc.nombre}`}
                    >
                      Ver
                    </Boton>
                    <Boton
                      variante="suave"
                      tamanio="sm"
                      className="flex-1"
                      onPress={() => abrirDoc(doc, true)}
                      disabled={ocupado}
                      icono="download-outline"
                      accessibilityLabel={`Descargar ${doc.nombre}`}
                    >
                      Descargar
                    </Boton>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

// ── Subida ──────────────────────────────────────────────────────────────────

interface Pendiente {
  id: string;
  archivo: Archivo;
  progreso: number;
  listo: boolean;
  error?: string;
  /** Tamaño con el que quedó subido. */
  tamanioSubido?: number;
}

// shortcut: la foto se comprime (calidad 80 %) pero no se achica a 2400 px como
// en la web; sumar expo-image-manipulator si las subidas con datos resultan lentas.
const FOTOS: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.8 };

const deFotos = (r: ImagePicker.ImagePickerResult): Archivo[] =>
  r.canceled
    ? []
    : r.assets.map((a, i) => {
        const tipo = a.mimeType ?? "image/jpeg";
        // Varias fotos elegidas juntas no pueden llamarse igual.
        const nombre = nombreParaFoto(a.fileName, tipo).replace(/(\.\w+)$/, i ? ` (${i + 1})$1` : "$1");
        return { uri: a.uri, tipo, nombre };
      });

async function sacarFoto(): Promise<Archivo[]> {
  const permiso = await ImagePicker.requestCameraPermissionsAsync();
  if (!permiso.granted) {
    showSimpleAlert(
      "Falta el permiso de la cámara",
      "Habilitá la cámara para Legalistas en los ajustes del teléfono, o elegí la foto de la galería.",
    );
    return [];
  }
  return deFotos(await ImagePicker.launchCameraAsync(FOTOS));
}

const elegirFotos = async () =>
  deFotos(await ImagePicker.launchImageLibraryAsync({ ...FOTOS, allowsMultipleSelection: true }));

async function elegirArchivos(): Promise<Archivo[]> {
  const r = await DocumentPicker.getDocumentAsync({
    type: [
      "application/pdf",
      "image/*",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    multiple: true,
  });
  return r.canceled
    ? []
    : r.assets.map((a) => ({
        uri: a.uri,
        nombre: a.name,
        tipo: a.mimeType ?? "application/octet-stream",
      }));
}

// Carga de documentos: botón grande para sacar la foto con la cámara, o elegir
// de la galería o de los archivos. Se pueden juntar varios y subirlos de una vez.
export function SubirDocumentos({
  base,
  titulo = "Mandale documentos a tu abogado",
  explicacion = `Fotos o PDF de recibos, estudios médicos, DNI, etc. Hasta ${MAX_MB} MB por archivo.`,
  exito = "¡Listo! Tu abogado ya puede ver los documentos.",
  children,
}: {
  /** "/casos/{id}" o "/tramites/{id}". */
  base: string;
  titulo?: string;
  explicacion?: string;
  exito?: string;
  /** Contenido extra entre el texto y los botones (p. ej. qué documentos mandar). */
  children?: ReactNode;
}) {
  const qc = useQueryClient();
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [descripcion, setDescripcion] = useState("");

  const agregar = async (elegir: () => Promise<Archivo[]>) => {
    const archivos = await elegir().catch(() => {
      showSimpleAlert("No pudimos abrir los archivos", "Probá de nuevo.");
      return [] as Archivo[];
    });
    if (!archivos.length) return;
    const nuevos = archivos.map((archivo) => ({
      id: `${archivo.uri}-${Math.random()}`,
      archivo,
      progreso: 0,
      listo: false,
    }));
    setPendientes((previos) => [...previos.filter((p) => !p.listo), ...nuevos]);
  };

  const actualizar = (id: string, cambios: Partial<Pendiente>) =>
    setPendientes((previos) => previos.map((p) => (p.id === id ? { ...p, ...cambios } : p)));

  const subir = useMutation({
    mutationFn: async () => {
      const cola = pendientes.filter((p) => !p.listo);
      let fallidos = 0;
      for (const p of cola) {
        try {
          const doc = await subirDocumento(base, p.archivo, {
            descripcion: descripcion.trim() || undefined,
            alProgresar: (pct) => actualizar(p.id, { progreso: pct }),
          });
          actualizar(p.id, {
            listo: true,
            progreso: 100,
            error: undefined,
            tamanioSubido: doc.tamanio,
          });
        } catch (error) {
          fallidos++;
          actualizar(p.id, { error: (error as Error).message, progreso: 0 });
        }
      }
      if (fallidos === cola.length)
        throw new Error("No se pudo subir ningún archivo. Probá de nuevo.");
      if (fallidos > 0)
        throw new Error(
          `${fallidos} archivo(s) no se pudieron subir. Tocá «Subir» para reintentar.`,
        );
      return cola.length;
    },
    meta: {
      cargando: "Subiendo tus documentos…",
      exito,
      error: "Hubo un problema al subir",
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: claves.documentos(base) });
      qc.invalidateQueries({ queryKey: claves.actividad });
    },
    onSuccess: () => {
      setDescripcion("");
      setTimeout(() => setPendientes((previos) => previos.filter((p) => !p.listo)), 2500);
    },
  });

  const porSubir = pendientes.filter((p) => !p.listo);

  return (
    <Tarjeta borde={BORDE_MARCA}>
      <Text accessibilityRole="header" className="font-bold text-lg text-texto">
        {titulo}
      </Text>
      <Text className="mt-1 text-base text-texto-suave">{explicacion}</Text>
      {children}

      <View className="mt-4 gap-3">
        <Boton
          tamanio="lg"
          ancho="completo"
          onPress={() => agregar(sacarFoto)}
          icono="camera-outline"
          disabled={subir.isPending}
        >
          Sacar una foto
        </Boton>
        <View className="flex-row gap-3">
          <Boton
            variante="secundario"
            className="flex-1"
            onPress={() => agregar(elegirFotos)}
            icono="images-outline"
            disabled={subir.isPending}
          >
            Galería
          </Boton>
          <Boton
            variante="secundario"
            className="flex-1"
            onPress={() => agregar(elegirArchivos)}
            icono="attach-outline"
            disabled={subir.isPending}
          >
            Archivos
          </Boton>
        </View>
      </View>

      {pendientes.length > 0 ? (
        <View className="mt-5">
          <Text className="font-semibold text-base text-texto">
            {porSubir.length > 0
              ? `${porSubir.length === 1 ? "1 archivo listo" : `${porSubir.length} archivos listos`} para subir`
              : "Archivos subidos"}
          </Text>
          <View className="mt-2 gap-2">
            {pendientes.map((p) => (
              <View key={p.id} className="rounded-xl border border-borde bg-superficie-2 p-3">
                <View className="flex-row items-center gap-3">
                  <Icono
                    nombre={p.listo ? "checkmark-circle" : "cloud-upload-outline"}
                    tono={p.listo ? "verde" : "textoTenue"}
                  />
                  <View className="flex-1">
                    <Text numberOfLines={1} className="font-semibold text-base text-texto">
                      {p.archivo.nombre}
                    </Text>
                    {p.tamanioSubido ? (
                      <Text className="text-sm text-texto-tenue">
                        {formatoTamanio(p.tamanioSubido)}
                      </Text>
                    ) : null}
                  </View>
                  {!p.listo && !subir.isPending ? (
                    <Pressable
                      onPress={() => setPendientes((previos) => previos.filter((x) => x.id !== p.id))}
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar ${p.archivo.nombre}`}
                      className="size-11 items-center justify-center rounded-full active:bg-superficie"
                    >
                      <Icono nombre="trash-outline" tono="textoSuave" size={20} />
                    </Pressable>
                  ) : null}
                </View>
                {subir.isPending && !p.listo ? (
                  <View
                    accessibilityRole="progressbar"
                    accessibilityLabel={`Subiendo ${p.archivo.nombre}`}
                    accessibilityValue={{ min: 0, max: 100, now: p.progreso }}
                    className="mt-2 h-2 overflow-hidden rounded-full bg-borde"
                  >
                    <View className="h-full rounded-full bg-brand-600" style={{ width: `${p.progreso}%` }} />
                  </View>
                ) : null}
                {p.error ? (
                  <Text
                    accessibilityRole="alert"
                    className="mt-1 font-semibold text-red-700 text-sm dark:text-red-300"
                  >
                    {p.error}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

          {porSubir.length > 0 ? (
            <>
              <Campo
                className="mt-4"
                etiqueta="¿Qué es? (opcional)"
                placeholder="Por ejemplo: recibo de sueldo de agosto"
                value={descripcion}
                onChangeText={setDescripcion}
                maxLength={500}
              />
              <Boton
                tamanio="lg"
                ancho="completo"
                className="mt-4"
                cargando={subir.isPending}
                onPress={() => subir.mutate()}
                icono="cloud-upload-outline"
              >
                {subir.isPending
                  ? "Subiendo…"
                  : porSubir.length === 1
                    ? "Subir el archivo"
                    : `Subir ${porSubir.length} archivos`}
              </Boton>
            </>
          ) : null}
        </View>
      ) : null}
    </Tarjeta>
  );
}
