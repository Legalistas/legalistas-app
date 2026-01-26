import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import Login from "../screens/Login";
import HomeScreen from "../screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { userToken } = useAuth();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken ? (
                    // ✅ Rutas PROTEGIDAS (solo si está logueado)
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                    </>
                ) : (
                    // 🔓 Rutas públicas (sin login)
                    <Stack.Screen name="Login" component={Login} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
