import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { Keyboard, Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CONTACTO } from "../utils/constantes";
import { cx } from "../utils/cx";
import { Icono, type NombreIcono } from "./ui/Icono";

// Barra de pestañas flotante del portal (pocas opciones y grandes), con el
// botón de WhatsApp arriba a la derecha.
const PESTANAS: Record<string, { texto: string; icono: NombreIcono; activo: NombreIcono }> = {
    Home: { texto: "Inicio", icono: "home-outline", activo: "home" },
    Cases: { texto: "Mis casos", icono: "briefcase-outline", activo: "briefcase" },
    Resources: { texto: "Recursos", icono: "book-outline", activo: "book" },
    Account: { texto: "Mi cuenta", icono: "person-circle-outline", activo: "person-circle" },
};

const BottomNavigation = ({ state, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    // Con el teclado abierto se esconde: en Android quedaría flotando arriba del teclado.
    const [teclado, setTeclado] = useState(false);
    useEffect(() => {
        const abre = Keyboard.addListener("keyboardDidShow", () => setTeclado(true));
        const cierra = Keyboard.addListener("keyboardDidHide", () => setTeclado(false));
        return () => {
            abre.remove();
            cierra.remove();
        };
    }, []);
    if (teclado) return null;

    return (
        <View
            pointerEvents="box-none"
            className="absolute inset-x-3"
            style={{ bottom: Math.max(10, insets.bottom) }}
        >
            <Pressable
                onPress={() => Linking.openURL(CONTACTO.whatsapp)}
                accessibilityRole="link"
                accessibilityLabel="Escribinos por WhatsApp"
                className="mb-3 size-14 items-center justify-center self-end rounded-full bg-[#16a34a] shadow-barra active:opacity-80"
            >
                <Icono nombre="logo-whatsapp" tono="blanco" size={28} />
            </Pressable>
            <View
                accessibilityRole="tablist"
                className="h-19 flex-row rounded-[22px] border border-borde bg-superficie px-1.5 shadow-barra"
            >
                {state.routes.map((route, i) => {
                    const activo = state.index === i;
                    const pestana = PESTANAS[route.name];
                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: activo }}
                            accessibilityLabel={pestana.texto}
                            onPress={() => {
                                const evento = navigation.emit({
                                    type: "tabPress",
                                    target: route.key,
                                    canPreventDefault: true,
                                });
                                if (!activo && !evento.defaultPrevented) navigation.navigate(route.name);
                            }}
                            className="flex-1 items-center justify-center"
                        >
                            <View
                                className={cx(
                                    "items-center gap-0.5 rounded-2xl px-2 py-1.5",
                                    activo && "bg-marca-suave",
                                )}
                            >
                                <Icono
                                    nombre={activo ? pestana.activo : pestana.icono}
                                    tono={activo ? "textoMarca" : "textoTenue"}
                                    size={26}
                                />
                                <Text
                                    numberOfLines={1}
                                    className={cx(
                                        "text-xs",
                                        activo ? "font-bold text-texto-marca" : "font-medium text-texto-tenue",
                                    )}
                                >
                                    {pestana.texto}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

export default BottomNavigation;
