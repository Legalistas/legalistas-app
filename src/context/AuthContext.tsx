import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { alTerminarSesion, api, auth, borrarSesion, cargarSesion } from "../services/portal";
import { queryClient } from "../services/query";
import type { Yo } from "../types/portal";
import {
    getOneSignalPlayerId,
    loginOneSignal,
    logoutOneSignal,
    requestPushPermission,
} from "../utils/onesignal";

// Sesión de la app: la del portal de clientes (se entra con el código que
// llega por mail; ver src/services/portal.ts). No hay contraseña ni token del
// backend en el teléfono.

interface AuthContextType {
    loading: boolean;
    isAuthenticated: boolean;
    /** Después de entrar (el código ya se verificó y la sesión quedó guardada). */
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Vincula el teléfono con OneSignal y lo registra para las notificaciones push.
async function registrarPush() {
    const yo = await queryClient.fetchQuery({ queryKey: ["yo"], queryFn: () => api<Yo>("/yo") });
    const persona = yo.personas[0];
    if (!persona) return;
    loginOneSignal(persona.id);
    // Pedir permiso de push recién tras login autenticado
    // (Apple Guideline 4.5.4: no pedir permisos sin contexto al abrir la app)
    requestPushPermission();
    const oneSignalPlayerId = await getOneSignalPlayerId();
    if (oneSignalPlayerId) {
        await api("/push", { method: "POST", body: { oneSignalPlayerId, platform: Platform.OS } });
    }
}

export const AuthProvider = ({ children }: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // La sesión se terminó (se cerró o venció): vuelve al ingreso sin datos en memoria.
        alTerminarSesion(() => {
            logoutOneSignal();
            queryClient.clear();
            setIsAuthenticated(false);
        });
        cargarSesion()
            .then(setIsAuthenticated)
            .finally(() => setLoading(false));
    }, []);

    const login = async () => {
        setIsAuthenticated(true);
        registrarPush().catch(() => {});
    };

    const logout = async () => {
        await api("/actividad", { method: "POST" }).catch(() => {});
        await auth("/sign-out", { method: "POST", body: {} }).catch(() => {});
        borrarSesion();
    };

    return (
        <AuthContext.Provider value={{ loading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
