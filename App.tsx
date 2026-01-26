import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Onboarding from "./src/screens/Onboarding";
import RootStack from "./src/navigation/RootStack";

SplashScreen.preventAutoHideAsync();

// Componente interno que tiene acceso al AuthContext
function AppContent() {
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);
  const { loading } = useAuth();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    console.log('🔍 AppContent: Checking first launch...');
    const checkFirstLaunch = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        console.log('📱 hasSeenOnboarding:', hasSeenOnboarding);
        setFirstLaunch(hasSeenOnboarding === null);
        console.log('🎯 firstLaunch set to:', hasSeenOnboarding === null);
      } catch (error) {
        console.log('❌ Error checking onboarding status:', error);
        setFirstLaunch(true);
      }
    };

    checkFirstLaunch();
  }, []);

  // Efecto para ocultar splash cuando todo esté listo
  useEffect(() => {
    const hideSplash = async () => {
      if (!loading && firstLaunch !== null && fontsLoaded) {
        console.log('🎉 Everything ready! Hiding splash screen...');
        // Pequeño delay para asegurar que el render esté completo
        setTimeout(async () => {
          await SplashScreen.hideAsync();
          console.log('✅ Splash hidden successfully!');
        }, 100);
      }
    };

    hideSplash();
  }, [loading, firstLaunch, fontsLoaded]);

  console.log('🚀 AppContent render - loading:', loading, 'firstLaunch:', firstLaunch, 'fontsLoaded:', fontsLoaded);

  if (!fontsLoaded) {
    return null;
  }

  console.log('🚀 AppContent render - loading:', loading, 'firstLaunch:', firstLaunch);

  const handleFinishOnboarding = async () => {
    console.log('✅ Finishing onboarding...');
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setFirstLaunch(false);
    } catch (error) {
      console.log('❌ Error saving onboarding status:', error);
      setFirstLaunch(false);
    }
  };

  // Si algo está cargando, mantener splash
  if (loading || firstLaunch === null) {
    console.log('⏳ Still loading... loading:', loading, 'firstLaunch:', firstLaunch);
    return null;
  }

  console.log('🏁 Rendering navigation - firstLaunch:', firstLaunch);

  return (
    <NavigationContainer>
      {firstLaunch
        ? <Onboarding onFinish={handleFinishOnboarding} />
        : <RootStack />
      }
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
