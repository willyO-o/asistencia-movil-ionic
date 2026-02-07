<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="openMenu" class="menu-button">
            <ion-icon slot="icon-only" :icon="menu"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Inicio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="home-content">
      <div class="home-container">
        <!-- Header -->
        <div class="home-header">
          <h2 class="greeting">¡Hola!</h2>
          <h1 class="user-name">{{ authStore.user?.name || authStore.user?.email }}</h1>
        </div>

        <!-- Actions -->
        <div class="actions-container">
          <div class="action-card" @click="handleActividades">
            <div class="action-icon">📅</div>
            <h3 class="action-title">Actividades</h3>
            <p class="action-subtitle">Gestionar eventos</p>
          </div>

          <div class="action-card" @click="handleLogout">
            <div class="action-icon">🚪</div>
            <h3 class="action-title">Cerrar Sesión</h3>
            <p class="action-subtitle">Salir de la app</p>
          </div>
        </div>

        <!-- Info -->
        <div class="info-container">
          <p class="info-text">
            Tu sesión expirará automáticamente después de 4 horas de inactividad
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
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
  menuController,
} from '@ionic/vue';
import { menu } from 'ionicons/icons';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const openMenu = async () => {
  await menuController.open();
};

const handleActividades = () => {
  router.push('/actividades');
};

const handleLogout = async () => {
  await authStore.logout();
  router.replace('/login');
};
</script>

<style scoped>
.home-content {
  --background: #ffffff;
}

.home-container {
  padding: 24px;
}

.home-header {
  margin-bottom: 32px;
}

.greeting {
  font-size: 20px;
  color: #666666;
  margin: 0 0 4px 0;
}

.user-name {
  font-size: 32px;
  font-weight: bold;
  color: #006c2e;
  margin: 0;
}

.actions-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.action-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 2px solid #e5e5e5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:active {
  transform: scale(0.98);
  background: #f5f5f5;
}

.action-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.action-title {
  font-size: 16px;
  font-weight: bold;
  color: #006c2e;
  margin: 0 0 4px 0;
}

.action-subtitle {
  font-size: 12px;
  color: #666666;
  margin: 0;
}

.info-container {
  background: #e5e5e5;
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
}

.info-text {
  font-size: 12px;
  color: #666666;
  text-align: center;
  margin: 0;
}

.menu-button {
  font-size: 28px;
}
</style>
