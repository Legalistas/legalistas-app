import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Onboarding from "./src/screens/Onboarding";
import RootStack from "./src/navigation/RootStack";
import ForceUpdateScreen from "./src/screens/ForceUpdateScreen";
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initOneSignal, attachPushClickListener, setPushClickHandler } from './src/utils/onesignal';
import { navigationRef, navigate } from './src/navigation/navigationRef';
import { Toasts } from './src/components/ui/Toast';
import { BACKEND_URL, fetchWithTimeout } from './src/config/api';
import { queryClient } from './src/services/query';
import { iniciarTema } from './src/styles/tema';

import "./global.css"

SplashScreen.preventAutoHideAsync();
initOneSignal();
attachPushClickListener();
iniciarTema();

function compareVersions(current: string, minimum: string): boolean {
  const curr = current.split('.').map(Number);
  const min = minimum.split('.').map(Number);
  for (let i = 0; i < Math.max(curr.length, min.length); i++) {
    const c = curr[i] || 0;
    const m = min[i] || 0;
    if (c < m) return false;
    if (c > m) return true;
  }
  return true;
}

function AppContent() {
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const { loading } = useAuth();

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('hasSeenOnboarding')
      .then(value => { if (active) setFirstLaunch(value === null); })
      .catch(() => { if (active) setFirstLaunch(true); });
    return () => { active = false; };
  }, []);

  // Chequeo de versión mínima contra el backend
  useEffect(() => {
    let active = true;
    const currentVersion = Constants.expoConfig?.version || "0.0.0";

    fetchWithTimeout(`${BACKEND_URL}/api/v1/app/version-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: Platform.OS, currentVersion }),
    })
      .then(response => response.json())
      .then(response => {
        const minVersion = response?.data?.minVersion;
        if (active && minVersion) setNeedsUpdate(!compareVersions(currentVersion, minVersion));
      })
      .catch(() => {
        // Si falla el check, no bloquear la app
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loading && firstLaunch !== null) {
      const timer = setTimeout(() => SplashScreen.hideAsync(), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, firstLaunch]);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch {}
    setFirstLaunch(false);
  };

  if (loading || firstLaunch === null) return null;

  if (needsUpdate) return <ForceUpdateScreen />;

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setPushClickHandler((data) => {
          const consultationId = data.consultationId != null ? Number(data.consultationId) : null;
          const caseId = data.caseId != null ? Number(data.caseId) : null;

          if (consultationId && Number.isFinite(consultationId)) {
            navigate('ConsultationDetail', { consultationId });
          } else if (caseId && Number.isFinite(caseId)) {
            navigate('CaseDetail', { caseId });
          }
        });
      }}
    >
      {firstLaunch
        ? <Onboarding onFinish={handleFinishOnboarding} />
        : <RootStack />
      }
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </QueryClientProvider>
        <Toasts />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
