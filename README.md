# Control de Actividades y Asistencia - Ionic

Aplicación móvil para control de actividades y asistencia construida con **Ionic 8**, **Vue 3**, **Capacitor** y **TypeScript**.

## 🚀 Características

- ✅ **Autenticación** con JWT y almacenamiento seguro
- 📅 **Gestión de Actividades** (CRUD completo)
- 📋 **Control de Asistencias** por actividad
- 📷 **Escáner QR** para marcar asistencia
- 📊 **Estadísticas** en tiempo real
- 🔄 **Sincronización** con API REST
- 📱 **Diseño responsive** y moderno
- 🎨 **Tema personalizado** con colores corporativos

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x

## 🛠️ Instalación

```bash
# Navegar al directorio
cd asistencia-ionic

# Instalar dependencias (si es necesario)
npm install
```

## 🏃 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Build de Producción

```bash
# Compilar para producción
npm run build

# Preview del build
npm run preview
```

## 📱 Compilar para Móvil

### Android

```bash
# Sincronizar y abrir en Android Studio
npm run android
```

### iOS

```bash
# Sincronizar y abrir en Xcode
npm run ios
```

## 🏗️ Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes reutilizables
├── config/          # Configuración
├── router/          # Rutas
├── services/        # Servicios de API
├── stores/          # Estado global (Pinia)
├── types/           # TypeScript types
├── views/           # Vistas/Pantallas
├── App.vue         # Componente raíz
└── main.ts         # Punto de entrada
```

## 📄 Pantallas

1. **Login** - Autenticación
2. **Home** - Pantalla principal
3. **Actividades** - Gestión de actividades (CRUD)
4. **Asistencias** - Lista de asistentes
5. **QR Scanner** - Escaneo de códigos QR
6. **Historial** - Historial de asistencias

---

**Nota**: Aplicación creada como equivalente Ionic de la versión React Native.