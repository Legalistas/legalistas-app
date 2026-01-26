import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { showSimpleAlert } from "../utils/alert";
import ApiService from "../services/ApiService";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../styles/typography";

// Función para traducir mensajes del servidor
const translateServerMessage = (message: string): string => {
    const translations: { [key: string]: string } = {
        "Invalid credentials": "Credenciales incorrectas",
        "User not found": "Usuario no encontrado",
        "Password is required": "La contraseña es requerida",
        "Email is required": "El email es requerido",
        "Invalid email format": "Formato de email inválido",
        "Account locked": "Cuenta bloqueada",
        "Too many attempts": "Demasiados intentos",
    };

    return translations[message] || message;
};

export default function Login({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            showSimpleAlert("Error", "Completá todos los campos");
            return;
        }

        setLoading(true);
        try {
            const response = await ApiService.login({ email, password });

            if (!response.success) {
                const errorMessage = translateServerMessage(
                    response.error || "Error de autenticación"
                );
                showSimpleAlert("Error", errorMessage);
                return;
            }

            if (response.data) {
                if (rememberMe) {
                    await AsyncStorage.setItem("rememberMe", "true");
                } else {
                    await AsyncStorage.removeItem("rememberMe");
                }

                await login(response.data.token, response.data.user);
            }
        } catch (err) {
            console.log("Login error:", err);
            showSimpleAlert("Error", "No se pudo conectar al servidor");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        showSimpleAlert(
            "Próximamente",
            "El inicio de sesión con Google estará disponible pronto"
        );
    };

    const handleForgotPassword = () => {
        showSimpleAlert(
            "Próximamente",
            "La recuperación de contraseña estará disponible pronto"
        );
    };

    const handleSignUp = () => {
        showSimpleAlert("Próximamente", "La función de registro estará disponible pronto");
        // navigation.navigate("SignUp");
    };

    return (
        <View style={styles.screen}>
            {/* TOP (dark) */}
            <View style={styles.topBackground}>
                <Image
                    source={require("../../assets/grid-bg.png")}
                    style={styles.backgroundPattern}
                />

                <View style={styles.headerContent}>
                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.logoImage}
                    />

                    <Text style={styles.title}>Iniciar sesión</Text>

                    <Text style={styles.subtitle}>
                        ¡Introduce tu email y contraseña para iniciar sesión!
                    </Text>
                </View>
            </View>

            {/* BOTTOM (white) + CARD */}
            <View style={styles.bottomBackground}>
                <View style={styles.formCard}>
                    <View style={styles.formCardContent}>
                        {/* GOOGLE BUTTON */}
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleLogin}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <Image
                                source={require("../../assets/google.png")}
                                style={styles.googleIcon}
                            />
                            <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
                        </TouchableOpacity>

                        {/* DIVIDER */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>o</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* EMAIL */}
                        <TextInput
                            style={styles.input}
                            placeholder="example@gmail.com"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                        />

                        {/* PASSWORD */}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="••••••••"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* OPTIONS */}

                        <View style={styles.optionsColumn}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                    {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
                                </View>
                                <Text style={styles.checkboxLabel}>Mantenerme conectado</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleForgotPassword} disabled={loading} style={styles.forgotWrap} >
                                <Text style={styles.forgotPassword}>¿Has olvidado tu contraseña?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* LOGIN */}
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.loginButtonText}>
                                {loading ? "Ingresando..." : "Iniciar sesión"}
                            </Text>
                        </TouchableOpacity>

                        {/* SIGN UP */}
                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>¿No tienes una cuenta? </Text>
                            <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                                <Text style={styles.signUpLink}>Regístrate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#fff",
    },

    topBackground: {
        flex: 0.45,
        backgroundColor: "#1C2434",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },

    backgroundPattern: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        opacity: 0.05,
    },

    headerContent: {
        alignItems: "center",
        paddingHorizontal: 20,
    },

    logoImage: {
        width: 220,
        height: 46,
        resizeMode: "contain",
        marginBottom: 26,
    },

    title: {
        ...typography.h2,
        color: "#FFFFFF",
        marginBottom: 10,
    },

    subtitle: {
        ...typography.bodySmall,
        color: "#B8C0D9",
        textAlign: "center",
        lineHeight: 20,
    },

    bottomBackground: {
        flex: 0.55,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "flex-start",
    },

    formCard: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 24,

        // sombra
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,

        // Subir el card sin margin negativo (se mantiene flexbox)
        transform: [{ translateY: -80 }],
    },

    formCardContent: {
        gap: 18,
    },

    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },

    googleButtonText: {
        fontSize: 15,
        color: "#111827",
        fontWeight: "500",
    },

    divider: {
        flexDirection: "row",
        alignItems: "center",
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EB",
    },

    dividerText: {
        marginHorizontal: 12,
        color: "#9CA3AF",
        fontSize: 14,
    },

    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        fontSize: 15,
    },

    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },

    eyeButton: {
        padding: 12,
    },

    optionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",     // ✅ permite que baje a la línea de abajo
        gap: 10,
    },

    optionsColumn: {
        gap: 10,
    },

    forgotWrap: {
        alignSelf: "flex-end", // ✅ queda alineado a la derecha
    },

    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1,
    },


    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },

    checkboxChecked: {
        backgroundColor: "#09A4B5",
        borderColor: "#09A4B5",
    },

    checkboxLabel: {
        ...typography.caption,
        color: "#6B7280",
    },

    forgotPassword: {
        ...typography.caption,
        color: "#09A4B5",
        textDecorationLine: "underline",
        flexShrink: 1,
        textAlign: "right",
    },


    loginButton: {
        backgroundColor: "#09A4B5",
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: "center",
    },

    loginButtonDisabled: {
        opacity: 0.7,
    },

    loginButtonText: {
        ...typography.button,
        color: "#fff",
    },

    signUpContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },

    signUpText: {
        ...typography.bodySmall,
        color: "#6B7280",
    },

    signUpLink: {
        ...typography.bodySmall,
        color: "#09A4B5",
    },
});
