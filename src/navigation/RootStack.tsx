import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import MainApp from "../screens/MainAppScreen";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

const Stack = createNativeStackNavigator();

export default function RootStack() {
    const { isAuthenticated } = useAuth();
   
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                // ✅ Rutas protegidas - MainApp con navegación por tabs
                <Stack.Screen name="MainApp">
                    {() => (
                        <ProtectedRoute>
                            <MainApp />
                        </ProtectedRoute>
                    )}
                </Stack.Screen>
            ) : (
                // 🔐 Rutas públicas
                <Stack.Screen name="Login" component={Login} />
            )}
        </Stack.Navigator>
    );
}