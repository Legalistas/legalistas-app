import React, { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import SimplePagerView, { SimplePagerViewRef } from "../components/SimplePagerView";
import { typography } from "../styles/typography";

const { width } = Dimensions.get("window");

type Props = {
    onFinish: () => void;
};

export default function Onboarding({ onFinish }: Props) {
    const pagerRef = useRef<SimplePagerViewRef>(null);
    const [page, setPage] = useState(0);

    const nextPage = () => {
        if (page < 3) {
            pagerRef.current?.setPage(page + 1);
        } else {
            onFinish();
        }
    };

    return (
        <View style={styles.container}>
            <SimplePagerView
                style={{ flex: 1 }}
                initialPage={0}
                ref={pagerRef}
                onPageSelected={(e) => setPage(e.nativeEvent.position)}
            >
                {/* Primera página - Bienvenida */}
                <View key="0" style={[styles.page, styles.welcomePage]}>
                    <View style={styles.welcomeContent}>
                        <View style={styles.iconContainer}>
                            <View style={styles.icon}>
                                <View style={styles.documentIcon}>
                                    <View style={styles.documentLines} />
                                    <View style={styles.documentLines} />
                                    <View style={styles.documentLines} />
                                </View>
                                <View style={styles.phoneIcon}>
                                    <View style={styles.phoneScreen} />
                                    <View style={styles.phoneButton} />
                                </View>
                                <View style={styles.handIcon} />
                            </View>
                        </View>
                        <Text style={styles.welcomeTitle}>Bienvenido a Legalistas!</Text>
                        <Text style={styles.welcomeText}>
                            Tu portal integral para aprender las últimas tecnologías jurídicas desde CERO
                        </Text>
                    </View>
                </View>

                <View key="1" style={styles.page}>
                    <Text style={styles.title}>Gestioná tus Expedientes</Text>
                    <Text style={styles.text}>Accedé a causas, clientes y movimientos en tiempo real</Text>
                </View>

                <View key="2" style={styles.page}>
                    <Text style={styles.title}>Documentos y Seguimiento</Text>
                    <Text style={styles.text}>Subí, descargá y compartí archivos y escritos en segundos</Text>
                </View>

                <View key="3" style={styles.page}>
                    <Text style={styles.title}>Notificaciones y Agenda</Text>
                    <Text style={styles.text}>Recibí recordatorios de audiencias y tareas importantes</Text>
                </View>
            </SimplePagerView>

            {/* Indicadores */}
            <View style={styles.dots}>
                {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={[styles.dot, page === i && styles.dotActive]} />
                ))}
            </View>

            {/* Botón */}
            <Pressable style={styles.button} onPress={nextPage}>
                <Text style={styles.buttonText}>
                    {page === 0 ? "Comenzar" : page === 3 ? "Ingresar" : "Siguiente"}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1e3a8a", // Azul marino como en la imagen
    },
    page: {
        width,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        paddingTop: 60, // Más espacio arriba
        paddingBottom: 60, // Más espacio abajo
    },
    welcomePage: {
        justifyContent: "center", // Centrado vertical perfecto
    },
    welcomeContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: "rgba(255, 0, 0, 0.1)", // Fondo rojo temporal para debug
    },
    // Estilos para la página de bienvenida
    iconContainer: {
        marginBottom: 60, // Más espacio debajo del icono
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        width: 120,
        height: 120,
        backgroundColor: "#334155",
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    documentIcon: {
        width: 30,
        height: 40,
        backgroundColor: "#f8fafc",
        borderRadius: 4,
        position: "absolute",
        left: 25,
        top: 25,
        paddingTop: 8,
        alignItems: "center",
    },
    documentLines: {
        width: 18,
        height: 2,
        backgroundColor: "#cbd5e1",
        marginBottom: 3,
    },
    phoneIcon: {
        width: 20,
        height: 35,
        backgroundColor: "#0ea5e9",
        borderRadius: 4,
        position: "absolute",
        right: 20,
        top: 30,
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    phoneScreen: {
        width: 14,
        height: 20,
        backgroundColor: "#f1f5f9",
        borderRadius: 2,
    },
    phoneButton: {
        width: 6,
        height: 6,
        backgroundColor: "#f1f5f9",
        borderRadius: 3,
    },
    handIcon: {
        width: 25,
        height: 25,
        backgroundColor: "#fbbf24",
        borderRadius: 12.5,
        position: "absolute",
        bottom: 15,
        right: 15,
    },
    welcomeTitle: {
        ...typography.h1,
        color: "#fff",
        textAlign: "center",
        marginBottom: 20,
        backgroundColor: "rgba(0, 255, 0, 0.3)",
    },
    welcomeText: {
        ...typography.h5,
        color: "#fff",
        textAlign: "center",
        paddingHorizontal: 30,
        lineHeight: 24,
        backgroundColor: "rgba(0, 0, 255, 0.3)",
    },
    // Estilos para las páginas existentes
    title: {
        ...typography.h2,
        color: "#fff",
        textAlign: "center",
    },
    text: {
        ...typography.h6,
        color: "#cbd5e1",
        textAlign: "center",
        marginTop: 10,
        paddingHorizontal: 20,
    },
    dots: {
        flexDirection: "row",
        alignSelf: "center",
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#334155",
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: "#0ea5e9",
        width: 14,
    },
    button: {
        backgroundColor: "#0ea5e9",
        padding: 15,
        marginHorizontal: 30,
        borderRadius: 10,
        marginBottom: 40,
    },
    buttonText: {
        ...typography.button,
        textAlign: "center",
        color: "#fff",
    },
});
