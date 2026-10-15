import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { type ReactNode, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import type { RootStackParamList } from "../navigation/RootStack";
import { queryClient } from "../services/query";
import { cambiarTema } from "../styles/tema";
import { cx } from "../utils/cx";
import { Campanita } from "./Campanita";
import { Icono } from "./ui/Icono";

export type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Logo de Legalistas en blanco, para el encabezado navy. */
export function Logo({ alto = 28 }: { alto?: number }) {
  return (
    <Image
      source={require("../../assets/logo.png")}
      accessibilityLabel="Legalistas"
      resizeMode="contain"
      style={{ height: alto, width: alto * (908 / 205), tintColor: "#fff" }}
    />
  );
}

/**
 * Fondo navy del encabezado y del ingreso: degradé con dos brillos suaves (teal
 * arriba a la derecha, azul abajo a la izquierda), como `fondo-hero` del portal.
 */
export function FondoHero() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id="base" x1="0" y1="0" x2="0.35" y2="1">
          <Stop offset="0" stopColor="#0f1a26" />
          <Stop offset="0.55" stopColor="#091018" />
          <Stop offset="1" stopColor="#05080d" />
        </LinearGradient>
        <RadialGradient id="teal" cx="1" cy="0" fx="1" fy="0" rx="0.7" ry="0.6">
          <Stop offset="0" stopColor="#21adbc" stopOpacity="0.22" />
          <Stop offset="0.7" stopColor="#21adbc" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="azul" cx="0" cy="1" fx="0" fy="1" rx="0.6" ry="0.55">
          <Stop offset="0" stopColor="#2563eb" stopOpacity="0.14" />
          <Stop offset="0.7" stopColor="#2563eb" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#base)" />
      <Rect width="100%" height="100%" fill="url(#teal)" />
      <Rect width="100%" height="100%" fill="url(#azul)" />
    </Svg>
  );
}

/** Isotipo de Legalistas grande y muy tenue, de decoración sobre el fondo navy. */
export function MarcaDeAgua({ size = 112, className }: { size?: number; className?: string }) {
  return (
    <View pointerEvents="none" className={cx("absolute opacity-20", className)}>
      <Svg width={size} height={size} viewBox="9 0 94 95" fill="#fff">
        <G opacity={0.45}>
          <Path d="m19 0l-9.7 9.7 22.3 22.4 9.7-9.7-22.3-22.4z" />
          <Path d="m102.1 9.7l-9.7-9.7-22.3 22.4 9.7 9.7 22.3-22.4z" />
          <Path d="m9.3 84.4l9.7 9.7 22.3-22.4-9.7-9.7-22.3 22.4z" />
          <Path d="m70.1 71.8l22.3 22.3 9.7-9.7-22.3-22.4-9.7 9.8z" />
        </G>
        <Path d="m43.5 34.9h24.4v24.4h-24.4z" />
      </Svg>
    </View>
  );
}

/** Sol / luna: cambia entre modo claro y oscuro. */
export function BotonTema() {
  const oscuro = useColorScheme() === "dark";
  return (
    <Pressable
      onPress={() => cambiarTema(oscuro ? "claro" : "oscuro")}
      accessibilityRole="switch"
      accessibilityState={{ checked: oscuro }}
      accessibilityLabel="Modo oscuro"
      className="size-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
    >
      <Icono nombre={oscuro ? "sunny-outline" : "moon-outline"} tono="blanco" size={20} />
    </Pressable>
  );
}

interface PropsEncabezado {
  antetitulo?: string;
  titulo: string;
  subtitulo?: string | null;
  /** Texto del botón de volver (sin él, va el logo). */
  volver?: string;
  /** Contenido extra debajo del título (insignias). */
  encabezado?: ReactNode;
}

// "Hero oscuro + hoja redondeada" del portal: encabezado navy con el isotipo
// tenue de fondo y el contenido en una hoja clara que se le superpone.
function Encabezado({ antetitulo, titulo, subtitulo, volver, encabezado }: PropsEncabezado) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  return (
    <View className="overflow-hidden bg-ink px-5 pb-12" style={{ paddingTop: insets.top + 16 }}>
      <FondoHero />
      <MarcaDeAgua className="right-5 bottom-9" />
      <View className="min-h-11 flex-row items-center justify-between gap-3">
        {volver ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate("MainApp")
            }
            className="-ml-2 min-h-11 flex-row items-center gap-1 rounded-full pr-4 pl-2 active:bg-white/10"
          >
            <Icono nombre="chevron-back" tono="blanco" />
            <Text className="font-semibold text-base text-white">{volver}</Text>
          </Pressable>
        ) : (
          <Logo />
        )}
        <View className="flex-row items-center gap-2">
          <Campanita />
          <BotonTema />
        </View>
      </View>
      {antetitulo ? (
        <Text className="mt-5 font-semibold text-brand-300 text-sm uppercase tracking-widest">
          {antetitulo}
        </Text>
      ) : null}
      <Text
        accessibilityRole="header"
        className={cx("font-bold text-3xl text-white", antetitulo ? "mt-1.5" : "mt-5")}
      >
        {titulo}
      </Text>
      {subtitulo ? <Text className="mt-2 text-base text-slate-300">{subtitulo}</Text> : null}
      {encabezado}
    </View>
  );
}

/** Pantalla entera: encabezado navy + hoja de contenido. Deslizar hacia abajo actualiza los datos. */
export function Pantalla({
  children,
  conBarra,
  pie,
  irAlFinal,
  ...encabezado
}: PropsEncabezado & {
  children: ReactNode;
  /** Pantallas con la barra de pestañas flotante: deja lugar abajo. */
  conBarra?: boolean;
  /** Fijo abajo, fuera del scroll (la caja para escribir de la conversación). */
  pie?: ReactNode;
  /** Mantiene el scroll en el final cuando crece el contenido (mensajes nuevos). */
  irAlFinal?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [refrescando, setRefrescando] = useState(false);
  const refrescar = async () => {
    setRefrescando(true);
    await queryClient.refetchQueries({ type: "active" }).catch(() => {});
    setRefrescando(false);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-ink"
    >
      {/* Al estirar de más hacia abajo (iPhone) se ve el fondo claro, no el navy. */}
      <View className="absolute inset-x-0 bottom-0 h-1/2 bg-fondo" />
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={
          irAlFinal ? () => scroll.current?.scrollToEnd({ animated: false }) : undefined
        }
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor="#fff" />
        }
      >
        <Encabezado {...encabezado} />
        <View
          className="-mt-6 flex-1 rounded-t-3xl bg-fondo px-4 pt-6"
          style={{ paddingBottom: pie ? 16 : insets.bottom + (conBarra ? 176 : 32) }}
        >
          {children}
        </View>
      </ScrollView>
      {pie ? (
        <View className="bg-fondo px-3 pt-1" style={{ paddingBottom: Math.max(12, insets.bottom) }}>
          {pie}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
