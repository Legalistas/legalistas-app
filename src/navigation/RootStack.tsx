import React from "react";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import MainApp from "../screens/MainAppScreen";
import CaseDetailScreen from "../screens/CaseDetailScreen";
import ConsultationDetailScreen from "../screens/ConsultationDetailScreen";
import TramiteScreen from "../screens/TramiteScreen";
import CalculatorScreen from "../screens/CalculatorScreen";
import ActivityScreen from "../screens/ActivityScreen";
import WebViewScreen from "../screens/WebViewScreen";
import { useAuth } from "../context/AuthContext";

export type TabParamList = {
    Home: undefined;
    Cases: undefined;
    Resources: undefined;
    Account: undefined;
};

export type RootStackParamList = {
    Login: undefined;
    MainApp: NavigatorScreenParams<TabParamList> | undefined;
    CaseDetail: { caseId: string | number; pestana?: "resumen" | "documentos" | "consultas" };
    ConsultationDetail: { consultationId: string | number };
    /** Consulta del CRM que todavía no es caso. */
    Tramite: { tramiteId: number };
    Calculator: undefined;
    Activity: undefined;
    WebView: { url: string; title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
    const { isAuthenticated } = useAuth();

    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            animation: 'slide_from_right',
            gestureDirection: 'horizontal',
        }}>
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="MainApp" component={MainApp} options={{ gestureEnabled: false }} />
                    <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
                    <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
                    <Stack.Screen name="Tramite" component={TramiteScreen} />
                    <Stack.Screen name="Calculator" component={CalculatorScreen} />
                    <Stack.Screen name="Activity" component={ActivityScreen} />
                    <Stack.Screen name="WebView" component={WebViewScreen} />
                </>
            ) : (
                <Stack.Screen name="Login" component={Login} />
            )}
        </Stack.Navigator>
    );
}
