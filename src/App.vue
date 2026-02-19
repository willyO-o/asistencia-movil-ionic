<template>
  <ion-app>
    <side-menu />
    <ion-router-outlet id="main-content" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import SideMenu from './components/SideMenu.vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initialize();
});
</script>

<style>
/* Estilos globales de la app */
* {
  box-sizing: border-box;
}

ion-toolbar {
  --padding-start: 8px;
  --padding-end: 8px;
}

/* Variables globales de Ionic personalizadas */
:root {
  --ion-color-primary: #478aff;
  --ion-color-primary-rgb: 0, 108, 46;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #236ef0;
  --ion-color-primary-tint: rgb(38, 122, 74);

  --ion-color-secondary: #e19964;
  --ion-color-secondary-rgb: 225, 153, 100;
  --ion-color-secondary-contrast: #000000;
  --ion-color-secondary-contrast-rgb: 0, 0, 0;
  --ion-color-secondary-shade: #c68758;
  --ion-color-secondary-tint: #e4a374;
}

/* Estilos para el scanner de c\u00f3digos de barras */
body.barcode-scanner-active {
  visibility: hidden;
  --background: transparent;
  --ion-background-color: transparent;
}
</style>
