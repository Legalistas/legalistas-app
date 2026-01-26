# Documentación del Desarrollo - Legalistas App

## 📱 Descripción General
Aplicación móvil desarrollada en React Native con Expo para la gestión de casos legales. Permite a los clientes ver sus casos, consultar con abogados, y hacer seguimiento del progreso de sus trámites legales.

---

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Autenticación
- **Ubicación:** `src/context/AuthContext.tsx`
- Login con email y contraseña
- Almacenamiento seguro de token con AsyncStorage
- Gestión de estado de usuario autenticado
- Función de logout
- Protección de rutas

### 2. Navegación Principal
- **Ubicación:** `src/components/BottomNavigation.tsx`
- Bottom navigation con 5 tabs principales:
  - 🏠 Home (Inicio)
  - 💼 Cases (Mis Casos)
  - 💬 Chat
  - 📅 Calendar (Citas)
  - ⚙️ Settings (Ajustes)
- Diseño mejorado con bordes redondeados y sombras
- Animaciones de escala al presionar cada botón
- Indicadores visuales para tab activo

### 3. Pantalla de Inicio (HomeScreen)
- **Ubicación:** `src/screens/HomeScreen.tsx`
- **Endpoint:** `GET /api/v1/customer/cases?page=1&limit=5&customerId={userId}`

#### Características:
- Header con logo, avatar de usuario y botón de logout
- Mensaje de bienvenida personalizado
- Botones de acción:
  - Nueva Consulta
  - Subir Documento
- Sección de Agenda (próximas citas)
- **Listado de Casos** con:
  - Badge con código del caso y tipo de servicio
  - Título del caso
  - Nombre de la etapa con color según estado
  - Barra de progreso con porcentaje
  - Avatar y nombre del abogado responsable
  - Fecha de última actualización (formato relativo)
  - 6 etapas del proceso con colores distintivos

#### Sistema de Etapas:
1. **Documentación Pendiente** - Naranja (#f97316)
2. **Caso En Trámite** - Azul (#3b82f6)
3. **Cierre Logrado** - Verde (#10b981)
4. **Cobrado** - Púrpura (#8b5cf6)
5. **Experiencia** - Rosa (#ec4899)
6. **Cerrado** - Gris (#64748b)

### 4. Detalle de Caso (CaseDetailScreen)
- **Ubicación:** `src/screens/CaseDetailScreen.tsx`
- **Endpoint:** `GET /api/v1/customer/case/{id}`

#### Secciones:
1. **Header:** Título del caso, tipo de servicio, fecha de creación
2. **Etapa del Proceso:** Timeline visual con 6 iconos de progreso
3. **Consultas:**
   - Botón para crear nueva consulta
   - Lista de consultas abiertas (clickeables)
   - Lista de consultas cerradas
   - Cada consulta muestra título, estado, fecha y preview del último mensaje
4. **Expedientes:**
   - Título del expediente con juzgado
   - Fecha del accidente
   - Número CUIJ
   - Nombre del juzgado
   - Botón "Ver Detalles"
5. **Detalles del Caso:**
   - Servicio legal
   - Estado actual
   - Abogado responsable (con avatar)
   - Fecha de inicio

### 5. Detalle de Consulta (ConsultationDetailScreen)
- **Ubicación:** `src/screens/ConsultationDetailScreen.tsx`
- **Endpoint:** `GET /api/v1/consultation/{id}`

#### Características:
- Header con título de la consulta y badge de estado (Abierto/Cerrado)
- Vista de chat con mensajes
- Diferenciación visual entre mensajes del cliente y del abogado
- Timestamps relativos y fecha/hora completa
- Input para enviar mensajes (solo si la consulta está abierta)
- Banner informativo cuando la consulta está cerrada

### 6. Pantalla de Ajustes (SettingsScreen)
- **Ubicación:** `src/screens/SettingsScreen.tsx`

#### Formulario de perfil:
- Nombre completo
- Email
- Tipo de documento (DNI, Pasaporte, CUIT/CUIL)
- Número de documento
- Teléfono
- Fecha de nacimiento
- Género
- País
- Estado/Provincia (carga dinámica según país)
- Botón "Acerca de Legalistas"

### 7. Pantalla Acerca de (AboutScreen)
- **Ubicación:** `src/screens/AboutScreen.tsx`

#### Secciones:
1. **Logo y versión de la app**
2. **Nuestra Misión:** Descripción de los valores
3. **Nuestros Servicios:** 6 servicios legales con iconos
   - Accidentes de tránsito
   - Accidentes de trabajo
   - Jubilaciones
   - Sucesiones
   - Daños y materiales
   - Despidos
4. **¿Por qué elegirnos?:** 4 características destacadas
5. **Contacto:** Email, web, Instagram (clickeables)
6. **Enlaces legales:** Términos y Condiciones, Política de Privacidad
7. **Footer:** Copyright y mensaje

### 8. WebView para Contenido Legal (WebViewScreen)
- **Ubicación:** `src/screens/WebViewScreen.tsx`
- Componente genérico reutilizable
- Muestra páginas web dentro de la app
- URLs integradas:
  - `https://legalistas.ar/terminos-condiciones`
  - `https://legalistas.ar/politica-privacidad`
- Loading state con indicador
- Manejo de errores con botón de reintentar

---

## 🛠️ Utilidades Desarrolladas

### 1. Gestión de Etapas (`src/utils/caseStages.ts`)
```typescript
- getStageColors(stageId): Retorna colores de fondo, texto, borde y progress bar
- getStageIconName(stageId): Retorna nombre del ícono de Ionicons
- getStageName(stageId): Retorna nombre legible de la etapa
- getProgressFromStage(stageId): Calcula porcentaje de progreso
```

### 2. Formateadores (`src/utils/formatters.ts`)
```typescript
- formatDate(): "23 ene 2026"
- formatDateWithTime(): "23 ene 2026, 14:30"
- formatDateLong(): "lunes, 23 de enero de 2026"
- formatTime(): "14:30"
- getMonthDay(): { month: "ENE", day: "23" }
- formatNumber(): "1.234.567"
- formatCurrency(): "$1.234.567,00"
- getRelativeTime(): "hace 2 horas"
- isToday(): boolean
- formatPercentage(): "75%"
```

### 3. Tipos de Servicio (`src/utils/serviceTypes.ts`)
```typescript
- 6 tipos de servicios legales definidos
- getServiceName(id): Retorna nombre del servicio
```

---

## 🌐 API Service (`src/services/ApiService.ts`)

### Métodos Implementados:

#### Autenticación:
```typescript
- login(credentials): POST /api/v1/auth/login
- logout(): POST /api/v1/auth/logout
- getUserProfile(): GET /api/v1/auth/profile
```

#### Casos:
```typescript
- getCases(customerId, page, limit): GET /api/v1/customer/cases
- getCaseById(caseId): GET /api/v1/customer/case/{id}
```

#### Consultas:
```typescript
- getConsultationById(consultationId): GET /api/v1/consultation/{id}
```

#### Dashboard:
```typescript
- getDashboardData(): GET /api/v1/dashboard
```

#### Genéricos:
```typescript
- customRequest(endpoint, options, authenticated)
- uploadFile(endpoint, file)
```

### Características del Service:
- Gestión automática de tokens
- Headers por defecto
- Timeout configurable (10s)
- Validación de content-type JSON
- Manejo de errores centralizado
- Logging de errores en consola

---

## 📋 Configuración de API (`src/config/api.ts`)

### Base URL:
```typescript
BASE_URL: 'https://backend.legalistas.ar'
```

### Endpoints Configurados:
```typescript
ENDPOINTS: {
  LOGIN: '/api/v1/auth/login',
  LOGOUT: '/api/v1/auth/logout',
  PROFILE: '/api/v1/auth/profile',
  USER_PROFILE: '/api/v1/user/profile',
  DASHBOARD: '/api/v1/dashboard',
  CASES: '/api/v1/customer/cases',
  GET_BY_ID: (id) => `/api/v1/customer/case/${id}`,
  CONSULTATION_BY_ID: (id) => `/api/v1/consultation/${id}`,
  DOCUMENTS: '/api/v1/documents',
  SETTINGS_COUNTRY: '/api/v1/settings/countries'
}
```

### Funciones Helper:
```typescript
- buildURL(endpoint): Construye URL completa
- getAuthHeaders(token): Agrega Bearer token
- fetchWithTimeout(url, options, timeout): Fetch con timeout
```

---

## 🎨 Sistema de Diseño

### Colores Principales:
- **Primary:** #09A4B5 (Turquesa)
- **Dark Background:** #1C2434
- **Light Background:** #f8fafc
- **Text Primary:** #1C2434
- **Text Secondary:** #64748b
- **Text Muted:** #94a3b8
- **Border:** #e2e8f0
- **Success:** #10b981
- **Error:** #e11d48

### Tipografía:
- **Headers:** 18-28px, font-weight: 700
- **Body:** 14-16px, font-weight: 400-500
- **Small:** 11-13px, font-weight: 600

### Espaciado:
- **Cards:** padding: 20px, borderRadius: 16px
- **Margin vertical:** 16-20px entre secciones
- **Gap en flex:** 8-16px

### Sombras:
```typescript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.05,
shadowRadius: 8,
elevation: 2
```

---

## 📁 Estructura de Archivos

```
legalistas-app/
├── App.tsx
├── index.ts
├── package.json
├── tsconfig.json
├── assets/
│   ├── logo.png
│   ├── grid-bg.png
│   └── 1x/
├── src/
│   ├── components/
│   │   ├── AppNavigator.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── SimplePagerView.tsx
│   ├── config/
│   │   └── api.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── navigation/
│   │   └── RootStack.tsx
│   ├── screens/
│   │   ├── AboutScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── CaseDetailScreen.tsx
│   │   ├── CasesScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ConsultationDetailScreen.tsx
│   │   ├── Dashboard.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── Login.tsx
│   │   ├── MainAppScreen.tsx
│   │   ├── Onboarding.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── WebViewScreen.tsx
│   ├── services/
│   │   └── ApiService.ts
│   └── utils/
│       ├── alert.ts
│       ├── caseStages.ts
│       ├── formatters.ts
│       └── serviceTypes.ts
```

---

## 🔄 Flujo de Navegación

```
Login
  ↓
MainApp
  ├── Home
  │   └── CaseDetail
  │       └── ConsultationDetail
  ├── Cases
  ├── Chat
  ├── Calendar
  └── Settings
      └── About
          └── WebView (Términos/Privacidad)
```

---

## 📦 Dependencias Principales

```json
{
  "expo": "~52.0.27",
  "react": "18.3.1",
  "react-native": "0.76.6",
  "@react-navigation/native": "^7.0.15",
  "@react-navigation/native-stack": "^7.2.0",
  "@expo/vector-icons": "^14.0.5",
  "@react-native-async-storage/async-storage": "^2.1.0",
  "react-native-webview": "^13.12.5",
  "react-native-pager-view": "6.5.1"
}
```

---

## 🎯 Características Técnicas

### Manejo de Estado:
- React Hooks (useState, useEffect)
- Context API para autenticación
- Estado local para formularios y pantallas

### Navegación:
- React Navigation Stack Navigator
- Navegación condicional basada en autenticación
- Rutas protegidas con componente ProtectedRoute

### Animaciones:
- Animated API de React Native
- Spring animations para botones
- Transiciones suaves entre pantallas

### Optimizaciones:
- Lazy loading de imágenes
- Carga paginada de casos (5 por página)
- Timeout en peticiones API (10s)
- Loading states en todas las pantallas
- Error boundaries y manejo de errores

### Accesibilidad:
- TouchableOpacity con activeOpacity
- Indicadores visuales claros
- Mensajes de error descriptivos
- Loading states informativos

---

## 🚀 Flujo de Usuario Típico

1. **Login:** Usuario ingresa email y contraseña
2. **Home:** Ve sus últimos 5 casos y agenda
3. **Selección de Caso:** Presiona una tarjeta de caso
4. **Detalle de Caso:** Ve información completa, etapas, consultas, expedientes
5. **Abrir Consulta:** Presiona una consulta para ver los mensajes
6. **Chat:** Lee mensajes del abogado, puede responder si está abierta
7. **Regreso:** Vuelve al detalle del caso, luego al home
8. **Ajustes:** Accede a su perfil, puede ver "Acerca de"
9. **Información Legal:** Desde About, puede ver Términos o Privacidad en WebView

---

## 🔐 Seguridad

- Tokens JWT almacenados en AsyncStorage
- Headers de autenticación en todas las peticiones protegidas
- Validación de content-type para prevenir inyecciones
- HTTPS en todas las peticiones
- Timeout para prevenir ataques de denegación de servicio
- Logout seguro con limpieza de estado

---

## 📱 Compatibilidad

- **Plataformas:** iOS, Android, Web
- **Orientación:** Portrait (vertical)
- **Tamaños de pantalla:** Responsivo para móviles y tablets
- **Versiones:** React Native 0.76.6, Expo SDK 52

---

## 🎨 Assets Requeridos

### Imágenes:
- `logo.png` - Logo de Legalistas (180x48px)
- `grid-bg.png` - Patrón de fondo para headers
- Avatar del usuario (desde API)
- Avatar de abogados (desde API)

### Iconos:
- Todos de @expo/vector-icons (Ionicons)
- No se requieren assets adicionales

---

## 🐛 Manejo de Errores

### Casos Cubiertos:
1. **Error de red:** Timeout, sin conexión
2. **Error de API:** Status 400-500
3. **Datos inválidos:** Parseo JSON, campos faltantes
4. **Autenticación:** Token inválido o expirado
5. **Imágenes:** Fallback a placeholders
6. **WebView:** Error de carga de página

### UX de Errores:
- Mensajes claros y descriptivos
- Iconos visuales (alerta, error)
- Botones de reintento cuando aplica
- Estados de loading apropiados

---

## 🎯 Próximas Mejoras Sugeridas

### ✅ Funcionalidades Completadas

#### Sistema de Autenticación
- [x] Login con email y contraseña
- [x] Gestión de tokens JWT con AsyncStorage
- [x] Logout con limpieza de estado
- [x] Protección de rutas
- [x] Context API para autenticación global

#### Navegación y UI
- [x] Bottom Navigation con 5 tabs (Home, Cases, Chat, Calendar, Settings)
- [x] Animaciones de escala en botones
- [x] Diseño con bordes redondeados y sombras
- [x] Indicadores visuales para tab activo
- [x] Stack Navigation entre pantallas
- [x] Navegación condicional según autenticación

#### Pantalla de Inicio (Home)
- [x] Header con logo, avatar y logout
- [x] Mensaje de bienvenida personalizado
- [x] Botones de acción rápida
- [x] Sección de agenda
- [x] Listado de últimos 5 casos
- [x] Sistema de etapas con 6 estados y colores
- [x] Badges con código y tipo de servicio
- [x] Barras de progreso visuales
- [x] Avatares de abogados responsables
- [x] Fechas en formato relativo ("hace 2 horas")
- [x] Integración con API de casos

#### Detalle de Caso
- [x] Header con información del caso
- [x] Timeline visual de etapas del proceso
- [x] Sección de consultas (abiertas y cerradas)
- [x] Preview de último mensaje en consultas
- [x] Información de expedientes con CUIJ
- [x] Detalles del juzgado
- [x] Información del abogado responsable con avatar
- [x] Navegación a detalle de consulta
- [x] Integración con API de detalle de caso

#### Sistema de Consultas
- [x] Vista de chat con mensajes
- [x] Diferenciación visual cliente/abogado
- [x] Timestamps relativos y completos
- [x] Input para enviar mensajes (cuando está abierta)
- [x] Banner informativo para consultas cerradas
- [x] Estados de carga y errores
- [x] Integración con API de consultas

#### Configuración y Perfil
- [x] Formulario de perfil completo
- [x] Campos de información personal
- [x] Selectores para tipo de documento
- [x] Selector de género
- [x] Selector de país
- [x] Selector de estado/provincia (dinámico)
- [x] Botón de acceso a "Acerca de"

#### Información de la App
- [x] Pantalla "Acerca de" completa
- [x] Sección de misión y valores
- [x] Lista de servicios legales
- [x] Características destacadas
- [x] Información de contacto (clickeable)
- [x] Enlaces a redes sociales
- [x] WebView para Términos y Condiciones
- [x] WebView para Política de Privacidad
- [x] Footer con copyright

#### Sistema de Utilidades
- [x] Gestión de etapas (colores, iconos, nombres, progreso)
- [x] Formateadores de fecha (10+ funciones)
- [x] Formateadores de números y moneda
- [x] Sistema de tiempo relativo
- [x] Definición de tipos de servicios legales
- [x] Helper para nombres de servicios

#### API y Servicios
- [x] ApiService centralizado
- [x] Métodos de autenticación (login, logout, profile)
- [x] Métodos de casos (lista, detalle por ID)
- [x] Método de consultas (detalle por ID)
- [x] Método de dashboard
- [x] Gestión automática de tokens
- [x] Headers de autorización
- [x] Timeout configurable (10s)
- [x] Validación de content-type JSON
- [x] Manejo centralizado de errores
- [x] Logging de errores

#### Configuración
- [x] Configuración centralizada de API
- [x] Base URL configurable por ambiente
- [x] Endpoints definidos como constantes
- [x] Funciones helper (buildURL, getAuthHeaders, fetchWithTimeout)

#### UX y Manejo de Errores
- [x] Loading states en todas las pantallas
- [x] Mensajes de error descriptivos
- [x] Iconos visuales para estados
- [x] Botones de reintento
- [x] Estados vacíos informativos
- [x] Placeholders para imágenes faltantes

#### Diseño y Estilo
- [x] Sistema de colores definido
- [x] Tipografía consistente
- [x] Espaciado estandarizado
- [x] Sombras y elevaciones
- [x] Diseño responsivo
- [x] Compatibilidad iOS, Android, Web

---

### 🚀 Mejoras Futuras Propuestas

1. **Notificaciones push** para nuevos mensajes
2. **Subida de documentos** desde la app
3. **Calendario interactivo** con citas
4. **Chat en tiempo real** con WebSockets
5. **Búsqueda y filtros** de casos
6. **Modo oscuro**
7. **Multiidioma** (i18n)
8. **Biometría** para login
9. **Compartir** casos o documentos
10. **Tutorial interactivo** en onboarding

---

## 📝 Notas de Desarrollo

- Todas las fechas en formato ISO 8601
- Locale español (es-ES) para formateo
- Moneda en pesos argentinos (ARS)
- URLs de backend concatenadas dinámicamente
- Imágenes de API con prefijo `https://backend.legalistas.ar`

---

## 👥 Contacto

**Legalistas**
- Email: contacto@legalistas.ar
- Web: https://www.legalistas.ar
- Instagram: @legalistas

---

*Documentación generada el 20 de enero de 2026*
*Versión de la App: 1.0.0*
