<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ actividadNombre }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Fecha de la actividad -->
      <div class="fecha-container">
        <ion-icon :icon="calendar" color="primary"></ion-icon>
        <span class="fecha-text">Fecha de la actividad: {{ formatDate(actividadFecha) }}</span>
      </div>

      <!-- Estadísticas -->
      <div v-if="estadisticas" class="stats-container">
        <div class="stat-item">
          <div class="stat-number">{{ estadisticas.total }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-item">
          <div class="stat-number stat-success">{{ estadisticas.con_salida }}</div>
          <div class="stat-label">Con Salida</div>
        </div>
        <div class="stat-item">
          <div class="stat-number stat-warning">{{ estadisticas.sin_salida }}</div>
          <div class="stat-label">Sin Salida</div>
        </div>
        <div class="stat-item">
          <div class="stat-number stat-danger">{{ estadisticas.con_permiso }}</div>
          <div class="stat-label">Permisos</div>
        </div>
      </div>

      <!-- Buscador -->
      <div class="search-container">
        <ion-searchbar
          v-model="searchText"
          placeholder="Buscar por nombre o documento..."
          :debounce="500"
        ></ion-searchbar>
        <p v-if="searchText.length > 0 && searchText.length < 3" class="search-hint">
          Escribe al menos 3 caracteres para buscar
        </p>
      </div>

      <!-- Lista de asistencias -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="asistencias-container" v-if="!loading">
        <div
          v-for="asistencia in asistencias"
          :key="asistencia.id_asistencia"
          class="asistencia-card"
        >
          <div class="card-header">
            <div class="person-info">
              <img
                v-if="asistencia.foto"
                :src="`https://davidvargas.com.bo/storage/fotos/${asistencia.foto}`"
                class="avatar"
                @error="handleImageError"
              />
              <div v-else class="avatar-placeholder">
                <span>{{ asistencia.nombre.charAt(0) }}{{ asistencia.paterno.charAt(0) }}</span>
              </div>
              <div class="person-details">
                <h4 class="person-name">
                  {{ asistencia.nombre }} {{ asistencia.paterno }} {{ asistencia.materno }}
                </h4>
                <p class="person-doc">Doc: {{ asistencia.numero_documento }}</p>
                <p class="person-group">
                  {{ asistencia.nombre_grupo }} - {{ asistencia.nombre_sucursal }}
                </p>
              </div>
            </div>
            <div class="header-actions">
              <div
                class="estado-badge"
                :style="{ backgroundColor: getEstadoColor(asistencia.estado_asistencia) }"
              >
                {{ asistencia.estado_asistencia }}
              </div>
              <ion-button
                fill="clear"
                color="danger"
                @click="handleDeleteAsistencia(asistencia)"
              >
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-button>
            </div>
          </div>

          <div class="card-body">
            <div class="time-row">
              <div class="time-item">
                <span class="time-label">Ingreso</span>
                <span class="time-value">{{ formatDateTime(asistencia.ingreso) }}</span>
              </div>
              <div class="time-item">
                <span class="time-label">Salida</span>
                <span class="time-value">{{ formatDateTime(asistencia.salida) }}</span>
              </div>
            </div>

            <div v-if="asistencia.observacion" class="observation">
              <strong>Observación:</strong> {{ asistencia.observacion }}
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="asistencias.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No hay asistencias</h3>
          <p>No se encontraron registros para esta actividad</p>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-else class="asistencias-container">
        <ion-skeleton-text
          v-for="i in 4"
          :key="i"
          animated
          style="height: 180px; margin-bottom: 16px; border-radius: 12px"
        ></ion-skeleton-text>
      </div>

      <!-- Botón flotante para escanear QR -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="scanner-fab">
        <ion-fab-button @click="goToScanner" color="primary">
          <ion-icon :icon="qrCode"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonSkeletonText,
  alertController,
  onIonViewWillEnter,
} from '@ionic/vue';
import { arrowBack, calendar, trash, qrCode } from 'ionicons/icons';
import { AsistenciasService } from '../services/asistencias';
import type { AsistenciaPersona, EstadisticasAsistencia } from '../types';
import { COLORS } from '../config/theme';

const router = useRouter();
const route = useRoute();

const actividadId = ref<number>(Number(route.query.actividadId));
const actividadNombre = ref<string>(route.query.actividadNombre as string);
const actividadFecha = ref<string>(route.query.actividadFecha as string);

const asistencias = ref<AsistenciaPersona[]>([]);
const estadisticas = ref<EstadisticasAsistencia | null>(null);
const loading = ref(false);
const searchText = ref('');

const goBack = () => {
  router.back();
};

const loadAsistencias = async () => {
  loading.value = true;
  try {
    const params =
      searchText.value && searchText.value.trim().length >= 3
        ? { search: searchText.value.trim() }
        : undefined;
    const response = await AsistenciasService.getAsistenciasPorActividad(
      actividadId.value,
      params
    );
    asistencias.value = response.asistencias;
    estadisticas.value = response.estadisticas;
  } catch (error: any) {
    console.error('Error cargando asistencias:', error);
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async (event: any) => {
  await loadAsistencias();
  event.target.complete();
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
};

const handleDeleteAsistencia = async (asistencia: AsistenciaPersona) => {
  const alert = await alertController.create({
    header: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar la asistencia de ${asistencia.nombre} ${asistencia.paterno}?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await AsistenciasService.deleteAsistencia(asistencia.id_asistencia);
            const successAlert = await alertController.create({
              header: 'Éxito',
              message: 'Asistencia eliminada correctamente',
              buttons: ['OK'],
            });
            await successAlert.present();
            await loadAsistencias();
          } catch (error: any) {
            const errorAlert = await alertController.create({
              header: 'Error',
              message: error.message || 'No se pudo eliminar la asistencia',
              buttons: ['OK'],
            });
            await errorAlert.present();
          }
        },
      },
    ],
  });
  await alert.present();
};

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'PRESENTE':
      return COLORS.success;
    case 'PERMISO':
      return '#FFA500';
    case 'FALTA':
      return COLORS.error;
    default:
      return COLORS.gray;
  }
};

const formatDateTime = (dateTime: string | null) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'Sin fecha';
  try {
    const date = dateString.includes('T')
      ? new Date(dateString)
      : new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return 'Fecha inválida';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return 'Fecha inválida';
  }
};

const goToScanner = () => {
  router.push({
    path: '/qr-scanner',
    query: {
      actividadId: actividadId.value.toString(),
      actividadNombre: actividadNombre.value,
    },
  });
};

// Recargar al volver del escáner
onIonViewWillEnter(() => {
  loadAsistencias();
});

// Watch para el buscador
watch(searchText, (newValue) => {
  const trimmed = newValue.trim();
  if (trimmed.length === 0 || trimmed.length >= 3) {
    loadAsistencias();
  }
});

onMounted(() => {
  loadAsistencias();
});
</script>

<style scoped>
.fecha-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

.fecha-text {
  font-size: 14px;
  color: #666666;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #478aff;
}

.stat-success {
  color: #4caf50;
}

.stat-warning {
  color: #ffa500;
}

.stat-danger {
  color: #d32f2f;
}

.stat-label {
  font-size: 12px;
  color: #666666;
  margin-top: 4px;
}

.search-container {
  padding: 0 16px;
  border-bottom: 1px solid #e5e5e5;
}

.search-hint {
  font-size: 12px;
  color: #ffa500;
  margin: 0 0 8px 0;
  padding: 0 8px;
}

.asistencias-container {
  padding: 16px;
}

.asistencia-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 2px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.person-info {
  display: flex;
  gap: 12px;
  flex: 1;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  object-fit: cover;
  border: 2px solid #478aff;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #478aff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 20px;
}

.person-details {
  flex: 1;
}

.person-name {
  font-size: 16px;
  font-weight: bold;
  color: #000000;
  margin: 0 0 4px 0;
}

.person-doc {
  font-size: 12px;
  color: #666666;
  margin: 0 0 4px 0;
}

.person-group {
  font-size: 12px;
  color: #666666;
  margin: 0;
}

.header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.estado-badge {
  padding: 4px 12px;
  border-radius: 12px;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}

.card-body {
  border-top: 1px solid #e5e5e5;
  padding-top: 12px;
}

.time-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.time-item {
  text-align: center;
}

.time-label {
  display: block;
  font-size: 12px;
  color: #666666;
  margin-bottom: 4px;
}

.time-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #478aff;
}

.observation {
  font-size: 12px;
  color: #666666;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: bold;
  color: #478aff;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.scanner-fab {
  margin-bottom: 48px;
}
</style>
