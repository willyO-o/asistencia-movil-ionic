<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="openMenu">
            <ion-icon slot="icon-only" :icon="menu"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Historial</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="history-header">
        <h2 class="title">Historial de Asistencia</h2>
        <p class="subtitle">
          {{ records.length }} registro{{ records.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="records-container" v-if="!loading">
        <div v-for="record in records" :key="record.id" class="record-card">
          <div class="record-header">
            <span class="record-date">{{ formatDate(record.timestamp) }}</span>
            <div
              class="status-badge"
              :class="{ 'status-present': record.status === 'present' }"
            >
              {{ record.status === 'present' ? 'Presente' : 'Ausente' }}
            </div>
          </div>
          <div class="record-time">{{ formatTime(record.timestamp) }}</div>
          <div v-if="record.location" class="record-location">
            📍 {{ record.location }}
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="records.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No hay registros aún</h3>
          <p>Tus marcados de asistencia aparecerán aquí</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-else class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p>Cargando historial...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  menuController,
} from '@ionic/vue';
import { menu } from 'ionicons/icons';

interface AttendanceRecord {
  id: string;
  timestamp: string;
  location?: string;
  status: string;
}

const loading = ref(true);
const records = ref<AttendanceRecord[]>([]);

const openMenu = async () => {
  await menuController.open();
};

const loadHistory = async () => {
  try {
    // Mock data - en producción esto vendría de un servicio
    await new Promise((resolve) => setTimeout(resolve, 1000));

    records.value = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        location: 'Oficina Principal',
        status: 'present',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        location: 'Oficina Principal',
        status: 'present',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        status: 'absent',
      },
    ];
  } catch (error) {
    console.error('Error loading history:', error);
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async (event: any) => {
  await loadHistory();
  event.target.complete();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadHistory();
});
</script>

<style scoped>
.history-header {
  padding: 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #ffffff;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #006c2e;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 16px;
  color: #666666;
  margin: 0;
}

.records-container {
  padding: 16px;
}

.record-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-date {
  font-size: 16px;
  font-weight: bold;
  color: #000000;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  background: #d32f2f;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}

.status-present {
  background: #4caf50;
}

.record-time {
  font-size: 20px;
  font-weight: 600;
  color: #006c2e;
  margin-bottom: 4px;
}

.record-location {
  font-size: 12px;
  color: #666666;
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
  color: #006c2e;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-container p {
  margin-top: 16px;
  font-size: 14px;
  color: #666666;
}
</style>
