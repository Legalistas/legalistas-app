import React, { useRef, useState } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import SimplePagerView, { SimplePagerViewRef } from "../components/SimplePagerView";
import { Boton } from "../components/ui/Boton";
import Illustration1 from "../../assets/onboarding/onboarding-1.svg";
import Illustration2 from "../../assets/onboarding/onboarding-2.svg";
import Illustration3 from "../../assets/onboarding/onboarding-3.svg";
import Illustration4 from "../../assets/onboarding/onboarding-4.svg";

const { width } = Dimensions.get("window");

// Lo mismo que cuenta el ingreso del portal web: qué puede hacer el cliente.
const slides = [
    {
        Illustration: Illustration1,
        tag: "Bienvenida",
        title: "Seguí tu caso\ndesde donde estés",
        description: "Entrás con tu mail y un código, sin contraseña.",
    },
    {
        Illustration: Illustration2,
        tag: "Tu caso",
        title: "En qué etapa\nestá tu caso",
        description: "Explicado en palabras simples, con cada novedad.",
    },
    {
        Illustration: Illustration3,
        tag: "Documentos",
        title: "Tus documentos",
        description: "Miralos y mandá fotos de tus papeles desde el celular.",
    },
    {
        Illustration: Illustration4,
        tag: "Tu abogado",
        title: "Consultas y\naudiencias",
        description: "Hacé consultas, recibí respuestas y confirmá tus citas.",
    },
];

type Props = {
    onFinish: () => void;
};

export default function Onboarding({ onFinish }: Props) {
    const pagerRef = useRef<SimplePagerViewRef>(null);
    const [page, setPage] = useState(0);
    const insets = useSafeAreaInsets();

    const isLast = page === slides.length - 1;

    const goNext = () => {
        if (isLast) {
            onFinish();
        } else {
            pagerRef.current?.setPage(page + 1);
        }
    };

    return (
        <View className="flex-1 bg-superficie">
            {/* La parte de arriba es clara: la hora y la batería van en oscuro. */}
            <StatusBar style="dark" />

            {/* Skip button */}
            {!isLast && (
                <Pressable
                    accessibilityRole="button"
                    className="absolute right-4 z-10 min-h-11 justify-center rounded-full px-3 active:opacity-70"
                    style={{ top: insets.top + 8 }}
                    onPress={onFinish}
                >
                    <Text className="font-semibold text-base text-ink">Omitir</Text>
                </Pressable>
            )}

            {/* Slides */}
            <SimplePagerView
                className="flex-1"
                initialPage={0}
                ref={pagerRef}
                onPageSelected={(e) => setPage(e.nativeEvent.position)}
            >
                {slides.map(({ Illustration, tag, title, description }) => (
                    <View key={tag} className="flex-1 items-center" style={{ width }}>
                        {/* Illustration area: siempre clara (las ilustraciones son para fondo claro). */}
                        <View
                            className="w-full items-center justify-end rounded-b-[56px] bg-brand-50 pb-7"
                            style={{ paddingTop: insets.top + 48 }}
                        >
                            <Illustration
                                width={width * 0.8}
                                height={width * 0.78}
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </View>

                        {/* Text content */}
                        <View className="w-full px-7 pt-5">
                            <Text className="mb-2 font-semibold text-sm text-texto-marca uppercase tracking-widest">
                                {tag}
                            </Text>
                            <Text accessibilityRole="header" className="mb-3 font-bold text-3xl text-texto">
                                {title}
                            </Text>
                            <Text className="text-lg text-texto-suave">{description}</Text>
                        </View>
                    </View>
                ))}
            </SimplePagerView>

            {/* Bottom controls */}
            <View className="px-7 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) + 16 }}>
                {/* Dots */}
                <View className="mb-6 flex-row items-center justify-center gap-1.5">
                    {slides.map((slide, i) => (
                        <View
                            key={slide.tag}
                            className={`h-2 rounded ${page === i ? "w-7 bg-brand" : "w-2 bg-borde-fuerte"}`}
                        />
                    ))}
                </View>

                <Boton tamanio="lg" ancho="completo" onPress={goNext}>
                    {isLast ? "Comenzar" : "Siguiente"}
                </Boton>
            </View>
        </View>
    );
}
