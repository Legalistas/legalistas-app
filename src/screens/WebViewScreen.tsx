import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootStack";
import { Boton } from "../components/ui/Boton";
import { Icono } from "../components/ui/Icono";
import { useColores } from "../styles/tema";

const WebViewScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const c = useColores();
    const route = useRoute<RouteProp<RootStackParamList, 'WebView'>>();
    const { url, title } = route.params;
    const [error, setError] = useState(false);
    // Cambiar la clave vuelve a cargar la página ("Reintentar").
    const [intento, setIntento] = useState(0);

    return (
        <View className="flex-1 bg-fondo">
            {/* Header */}
            <View
                className="flex-row items-center gap-2 bg-ink px-3 pb-3"
                style={{ paddingTop: insets.top + 8 }}
            >
                <Pressable
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel="Volver"
                    className="size-11 items-center justify-center rounded-full active:bg-white/10"
                >
                    <Icono nombre="chevron-back" tono="blanco" />
                </Pressable>
                <Text
                    accessibilityRole="header"
                    className="flex-1 font-bold text-lg text-white"
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </View>

            {/* WebView */}
            <WebView
                key={intento}
                source={{ uri: url }}
                style={{ flex: 1 }}
                onError={() => setError(true)}
                startInLoadingState={true}
                renderLoading={() => (
                    <View className="absolute inset-0 items-center justify-center gap-4 bg-fondo">
                        <ActivityIndicator size="large" color={c.textoMarca} />
                        <Text className="font-semibold text-base text-texto-suave">Cargando...</Text>
                    </View>
                )}
            />

            {error && (
                <View className="absolute inset-0 items-center justify-center gap-4 bg-fondo px-10">
                    <Icono nombre="alert-circle-outline" tono="rojo" size={48} />
                    <Text className="text-center text-base text-texto">No se pudo cargar la página</Text>
                    <Boton
                        className="self-center"
                        icono="refresh"
                        onPress={() => {
                            setError(false);
                            setIntento((n) => n + 1);
                        }}
                    >
                        Reintentar
                    </Boton>
                </View>
            )}
        </View>
    );
};

export default WebViewScreen;
