<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">
        <!-- Header -->
        <div class="login-header">
          <img
            src="../assets/logo-mts.png"
            alt="Logo"
            class="logo"
            @error="handleImageError"
          />
          <h1 class="title">Control de Actividades y Asistencia</h1>
          <p class="subtitle">Inicia sesión para continuar</p>
        </div>

        <!-- Formulario -->
        <div class="login-form">
          <ion-item class="input-item">
            <ion-label position="stacked">Usuario</ion-label>
            <ion-input
              v-model="loginUsername"
              placeholder="nombre_usuario"
              :disabled="loading"
              @keyup.enter="handleLogin"
            ></ion-input>
          </ion-item>

          <ion-item class="input-item">
            <ion-label position="stacked">Contraseña</ion-label>
            <ion-input
              v-model="password"
              type="password"
              placeholder="••••••••"
              :disabled="loading"
              @keyup.enter="handleLogin"
            ></ion-input>
          </ion-item>

          <ion-button
            expand="block"
            class="login-button"
            @click="handleLogin"
            :disabled="loading"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Iniciar Sesión</span>
          </ion-button>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p class="footer-text">La sesión expirará en 4 horas</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  alertController,
} from '@ionic/vue';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loginUsername = ref('');
const password = ref('');
const loading = ref(false);

const handleImageError = (e: Event) => {
  // Si falla la carga de la imagen, ocultarla
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
};

const handleLogin = async () => {
  if (!loginUsername.value || !password.value) {
    const alert = await alertController.create({
      header: 'Error',
      message: 'Por favor ingresa usuario y contraseña',
      buttons: ['OK'],
    });
    await alert.present();
    return;
  }

  loading.value = true;
  try {
    await authStore.login(loginUsername.value, password.value);
    router.replace('/home');
  } catch (error: any) {
    const alert = await alertController.create({
      header: 'Error',
      message: error.message || 'No se pudo iniciar sesión',
      buttons: ['OK'],
    });
    await alert.present();
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-content {
  --background: #ffffff;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.login-header {
  text-align: center;
  margin-bottom: 48px;
}

.logo {
  width: 150px;
  height: 150px;
  margin: 0 auto 24px;
  display: block;
  object-fit: contain;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #478aff;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666666;
}

.login-form {
  margin-bottom: 32px;
}

.input-item {
  --background: #ffffff;
  --border-color: #e5e5e5;
  --border-width: 2px;
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  margin-bottom: 24px;
}

.input-item ion-label {
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
}

.login-button {
  --background: #478aff;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(0, 108, 46, 0.3);
  font-size: 20px;
  font-weight: bold;
  height: 50px;
  margin-top: 16px;
}

.login-footer {
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: #666666;
}
</style>
