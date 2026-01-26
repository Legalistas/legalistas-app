# Copilot Instructions for legalistas-app

## Arquitectura General
- Proyecto React Native con Expo, orientado a aplicaciones móviles y web.
- Navegación gestionada con React Navigation (`src/navigation/RootStack.tsx`, `src/components/AppNavigator.tsx`).
- Contexto de autenticación centralizado en `src/context/AuthContext.tsx`.
- Servicios de API aislados en `src/services/ApiService.ts` y configuración en `src/config/api.ts`.
- Pantallas principales en `src/screens/` (ej: `Login.tsx`, `Dashboard.tsx`, `Onboarding.tsx`).
- Componentes reutilizables en `src/components/`.
- Utilidades y helpers en `src/utils/`.

## Flujos de desarrollo
- **Inicio local:**
  - `npm start` o `npm run start` para Expo (elige plataforma: web, android, ios).
  - `npm run web` para solo web, `npm run android` o `npm run ios` para dispositivos/emuladores.
- **No hay scripts de test definidos** (añadir si es necesario).
- **Debug:** Usa herramientas de Expo y React Native Debugger.

## Patrones y convenciones
- Usa hooks y contextos para manejo de estado global (ejemplo: `AuthContext`).
- Navegación protegida implementada en `ProtectedRoute.tsx`.
- Lógica de comunicación con backend centralizada en `ApiService.ts`.
- Configuración de endpoints y variables en `src/config/api.ts`.
- Evita lógica de negocio en componentes de UI; usa servicios y utilidades.
- Los assets están en la carpeta `assets/`.

## Dependencias clave
- Expo, React Native, React Navigation, AsyncStorage, react-native-pager-view.
- No modificar directamente archivos generados por Expo.

## Ejemplo de flujo de autenticación
1. Usuario inicia sesión en `Login.tsx`.
2. Se actualiza el contexto de autenticación (`AuthContext.tsx`).
3. Navegación redirige según estado de autenticación (`ProtectedRoute.tsx`).

## Archivos clave
- `App.tsx`: punto de entrada principal.
- `src/context/AuthContext.tsx`: lógica de autenticación.
- `src/services/ApiService.ts`: llamadas a API.
- `src/navigation/RootStack.tsx`: configuración de rutas.

## Buenas prácticas específicas
- Centraliza cambios de estado global en contextos.
- Mantén la lógica de red y almacenamiento fuera de los componentes de UI.
- Sigue la estructura de carpetas para nuevos módulos/componentes.

---

¿Falta algún flujo, convención o integración importante? Indica detalles para mejorar estas instrucciones.