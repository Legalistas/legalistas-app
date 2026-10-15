import { View, Text, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FondoHero, Logo, MarcaDeAgua } from "../components/Encabezado";
import { Boton } from "../components/ui/Boton";
import { Icono } from "../components/ui/Icono";

const STORE_URLS = {
    ios: "https://apps.apple.com/app/legalistas/id6762129942",
    android: "https://play.google.com/store/apps/details?id=com.lexiatechs.legalistas",
};

export default function ForceUpdateScreen() {
    const insets = useSafeAreaInsets();

    const handleUpdate = () => {
        const url = Platform.OS === "ios" ? STORE_URLS.ios : STORE_URLS.android;
        Linking.openURL(url);
    };

    return (
        <View
            className="flex-1 overflow-hidden bg-ink"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            <FondoHero />
            <MarcaDeAgua size={220} className="-right-10 -bottom-10" />

            <View className="flex-1 items-center justify-center px-8">
                <Logo alto={42} />

                <View className="mt-10 mb-6 size-20 items-center justify-center rounded-full bg-white/10">
                    <Icono nombre="download-outline" tono="brand" size={40} />
                </View>

                <Text accessibilityRole="header" className="mb-3 text-center font-bold text-3xl text-white">
                    Hay mejoras esperándote
                </Text>

                <Text className="mb-10 text-center text-lg text-slate-300">
                    Tocá Actualizar y vamos a llevarte a la última versión.
                </Text>

                <Boton tamanio="lg" ancho="completo" icono="rocket-outline" onPress={handleUpdate}>
                    Actualizar
                </Boton>
            </View>
        </View>
    );
}
