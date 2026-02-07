<template>
  <ion-menu side="start" content-id="main-content">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Menú</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Header con info del usuario -->
      <div class="menu-header">
        <div class="avatar-container">
          <img
            v-if="authStore.user?.avatar"
            :src="`https://davidvargas.com.bo/storage/user/avatar/${authStore.user.avatar}`"
            class="avatar"
            @error="handleImageError"
          />
          <div v-else class="avatar-placeholder">
            <span class="avatar-text">
              {{ authStore.user?.name?.charAt(0).toUpperCase() || '?' }}
            </span>
          </div>
        </div>
        <h3 class="user-name">{{ authStore.user?.name || 'Usuario' }}</h3>
        <p class="user-email">{{ authStore.user?.email || '' }}</p>
      </div>

      <div class="divider"></div>

      <!-- Opciones del menú -->
      <ion-list class="menu-list">
        <ion-item button @click="navigateTo('/home')">
          <ion-icon :icon="home" slot="start"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-item>

        <ion-item button @click="navigateTo('/actividades')">
          <ion-icon :icon="calendar" slot="start"></ion-icon>
          <ion-label>Actividades</ion-label>
        </ion-item>

        <ion-item button @click="navigateTo('/history')">
          <ion-icon :icon="timeOutline" slot="start"></ion-icon>
          <ion-label>Historial</ion-label>
        </ion-item>
      </ion-list>

      <!-- Botón de logout en el footer -->
      <div class="menu-footer">
        <ion-button expand="block" fill="outline" color="danger" @click="handleLogout">
          <ion-icon :icon="exitOutline" slot="start"></ion-icon>
          Cerrar Sesión
        </ion-button>
      </div>
    </ion-content>
  </ion-menu>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  menuController,
} from '@ionic/vue';
import { home, calendar, timeOutline, exitOutline } from 'ionicons/icons';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
};

const navigateTo = async (path: string) => {
  await menuController.close();
  router.push(path);
};

const handleLogout = async () => {
  await menuController.close();
  await authStore.logout();
  router.replace('/login');
};
</script>

<style scoped>
.menu-header {
  background: var(--ion-color-primary);
  padding: 32px 24px;
  text-align: center;
  color: white;
}

.avatar-container {
  margin-bottom: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  object-fit: cover;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
}

.avatar-text {
  font-size: 32px;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.divider {
  height: 1px;
  background: #e5e5e5;
}

.menu-list {
  padding: 8px 0;
}

.menu-list ion-item {
  --padding-start: 24px;
  font-size: 16px;
}

.menu-list ion-icon {
  font-size: 24px;
  margin-right: 16px;
}

.menu-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e5e5;
}
</style>
