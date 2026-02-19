<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="openMenu">
            <ion-icon slot="icon-only" :icon="menu"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Actividades</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Header con filtros y botón de agregar -->
      <div class="header-section">
        <div class="filter-container">
          <ion-button
            :fill="!showOnlyToday ? 'solid' : 'outline'"
            @click="showOnlyToday = false"
          >
            Todas
          </ion-button>
          <ion-button
            :fill="showOnlyToday ? 'solid' : 'outline'"
            @click="showOnlyToday = true"
          >
            Hoy
          </ion-button>
        </div>

        <ion-button expand="block" @click="openCreateModal" color="primary">
          <ion-icon slot="start" :icon="add"></ion-icon>
          Nueva Actividad
        </ion-button>
      </div>

      <!-- Lista de actividades -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="actividades-container" v-if="!loading">
        <div
          v-for="actividad in actividades"
          :key="actividad.id"
          class="actividad-card"
        >
          <div class="actividad-header">
            <h3 class="actividad-nombre">{{ actividad.nombre_actividad }}</h3>
            <p class="actividad-fecha">📅 {{ formatDate(actividad.fecha_actividad) }}</p>
            <p v-if="actividad.descripcion" class="actividad-descripcion">
              {{ actividad.descripcion }}
            </p>
          </div>

          <div class="actividad-actions">
            <ion-button size="small" fill="outline" @click="openEditModal(actividad)">
              ✏️ Editar
            </ion-button>
            <ion-button
              size="small"
              fill="outline"
              color="danger"
              @click="handleDelete(actividad)"
            >
              🗑️ Eliminar
            </ion-button>
          </div>

          <ion-button
            expand="block"
            class="asistencias-button"
            @click="goToAsistencias(actividad)"
          >
            📋 Ver Asistencias
          </ion-button>
        </div>

        <!-- Empty state -->
        <div v-if="actividades.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No hay actividades</h3>
          <p>{{ showOnlyToday ? 'No hay actividades para hoy' : 'Crea tu primera actividad' }}</p>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-else class="actividades-container">
        <ion-skeleton-text
          v-for="i in 4"
          :key="i"
          animated
          style="height: 200px; margin-bottom: 16px; border-radius: 12px"
        ></ion-skeleton-text>
      </div>
    </ion-content>

    <!-- Modal para crear/editar -->
    <ion-modal :is-open="modalVisible" @didDismiss="modalVisible = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ editingActividad ? 'Editar Actividad' : 'Nueva Actividad' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="modalVisible = false">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="modal-form">
          <ion-item>
            <ion-label position="stacked">Nombre *</ion-label>
            <ion-input
              v-model="nombre"
              placeholder="Ej: Reunión de equipo"
            ></ion-input>
          </ion-item>

          <ion-item button @click="openDatePicker">
            <ion-label position="stacked">Fecha *</ion-label>
            <ion-input
              :value="formatDateForDisplay(selectedDate)"
              readonly
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Descripción</ion-label>
            <ion-textarea
              v-model="descripcion"
              placeholder="Descripción opcional"
              :rows="4"
            ></ion-textarea>
          </ion-item>

          <div class="modal-actions">
            <ion-button
              expand="block"
              @click="handleSave"
              color="primary"
            >
              {{ editingActividad ? 'Actualizar' : 'Crear' }}
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Modal para seleccionar fecha -->
    <ion-modal :is-open="showDatePicker" @didDismiss="showDatePicker = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Seleccionar Fecha</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showDatePicker = false">Hecho</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-datetime
          v-model="selectedDateISO"
          presentation="date"
          :prefer-wheel="true"
          locale="es-ES"
        ></ion-datetime>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
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
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonSkeletonText,
  menuController,
  alertController,
} from '@ionic/vue';
import { menu, add } from 'ionicons/icons';
import { ActividadesService } from '../services/actividades';
import type { Actividad } from '../types';

const router = useRouter();

const actividades = ref<Actividad[]>([]);
const loading = ref(false);
const modalVisible = ref(false);
const showDatePicker = ref(false);
const showOnlyToday = ref(false);
const editingActividad = ref<Actividad | null>(null);

const nombre = ref('');
const descripcion = ref('');
const selectedDate = ref(new Date());
const selectedDateISO = ref(new Date().toISOString());

const openMenu = async () => {
  await menuController.open();
};

const loadActividades = async () => {
  loading.value = true;
  try {
    if (showOnlyToday.value) {
      const response = await ActividadesService.getActividadesHoy();
      actividades.value = response.actividades;
    } else {
      const response = await ActividadesService.getActividades({ per_page: 50 });
      actividades.value = response.data;
    }
  } catch (error: any) {
    const alert = await alertController.create({
      header: 'Error',
      message: error.message,
      buttons: ['OK'],
    });
    await alert.present();
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async (event: any) => {
  await loadActividades();
  event.target.complete();
};

const openCreateModal = () => {
  editingActividad.value = null;
  nombre.value = '';
  descripcion.value = '';
  const today = new Date();
  selectedDate.value = today;
  selectedDateISO.value = today.toISOString();
  modalVisible.value = true;
};

const openEditModal = (actividad: Actividad) => {
  editingActividad.value = actividad;
  nombre.value = actividad.nombre_actividad;
  descripcion.value = actividad.descripcion || '';
  const actividadDate = new Date(actividad.fecha_actividad + 'T00:00:00');
  selectedDate.value = actividadDate;
  selectedDateISO.value = actividadDate.toISOString();
  modalVisible.value = true;
};

const openDatePicker = () => {
  showDatePicker.value = true;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateForDisplay = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateForAPI = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const handleSave = async () => {
  if (!nombre.value.trim() || !selectedDate.value) {
    const alert = await alertController.create({
      header: 'Error',
      message: 'Nombre y fecha son requeridos',
      buttons: ['OK'],
    });
    await alert.present();
    return;
  }

  try {
    const fecha = formatDateForAPI(selectedDate.value);

    if (editingActividad.value) {
      await ActividadesService.updateActividad(editingActividad.value.id, {
        nombre_actividad: nombre.value,
        fecha_actividad: fecha,
        descripcion: descripcion.value || undefined,
      });
      const alert = await alertController.create({
        header: 'Éxito',
        message: 'Actividad actualizada correctamente',
        buttons: ['OK'],
      });
      await alert.present();
    } else {
      await ActividadesService.createActividad({
        nombre_actividad: nombre.value,
        fecha_actividad: fecha,
        descripcion: descripcion.value || undefined,
      });
      const alert = await alertController.create({
        header: 'Éxito',
        message: 'Actividad creada correctamente',
        buttons: ['OK'],
      });
      await alert.present();
    }

    modalVisible.value = false;
    await loadActividades();
  } catch (error: any) {
    const alert = await alertController.create({
      header: 'Error',
      message: error.message,
      buttons: ['OK'],
    });
    await alert.present();
  }
};

const handleDelete = async (actividad: Actividad) => {
  const alert = await alertController.create({
    header: 'Confirmar',
    message: `¿Eliminar "${actividad.nombre_actividad}"?`,
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
            await ActividadesService.deleteActividad(actividad.id);
            const successAlert = await alertController.create({
              header: 'Éxito',
              message: 'Actividad eliminada',
              buttons: ['OK'],
            });
            await successAlert.present();
            await loadActividades();
          } catch (error: any) {
            const errorAlert = await alertController.create({
              header: 'Error',
              message: error.message,
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

const goToAsistencias = (actividad: Actividad) => {
  router.push({
    path: '/asistencias',
    query: {
      actividadId: actividad.id.toString(),
      actividadNombre: actividad.nombre_actividad,
      actividadFecha: actividad.fecha_actividad,
    },
  });
};

// Watch para actualizar selectedDate cuando cambia selectedDateISO
watch(selectedDateISO, (newValue) => {
  if (newValue) {
    selectedDate.value = new Date(newValue);
  }
});

// Watch para recargar cuando cambia el filtro
watch(showOnlyToday, () => {
  loadActividades();
});

onMounted(() => {
  loadActividades();
});
</script>

<style scoped>
.header-section {
  padding: 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e5e5e5;
}

.filter-container {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-container ion-button {
  flex: 1;
}

.actividades-container {
  padding: 16px;
}

.actividad-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 2px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.actividad-header {
  margin-bottom: 12px;
}

.actividad-nombre {
  font-size: 18px;
  font-weight: bold;
  color: #478aff;
  margin: 0 0 8px 0;
}

.actividad-fecha {
  font-size: 14px;
  color: #666666;
  margin: 0 0 8px 0;
}

.actividad-descripcion {
  font-size: 14px;
  color: #666666;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.actividad-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.actividad-actions ion-button {
  flex: 1;
}

.asistencias-button {
  margin-top: 8px;
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

.modal-form {
  padding: 16px;
}

.modal-form ion-item {
  --padding-start: 0;
  margin-bottom: 16px;
}

.modal-actions {
  margin-top: 24px;
}
</style>
