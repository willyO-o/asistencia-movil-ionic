<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Escanear QR</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="scanner-content">
      <div class="scanner-container">
        <!-- Overlay de procesamiento -->
        <div v-if="loading" class="loading-overlay">
          <ion-spinner name="crescent" color="light"></ion-spinner>
          <p>Marcando asistencia...</p>
        </div>

        <!-- Vista de escaneo activa -->
        <div v-if="isScanning || scannerActive" class="scanning-view">
          <div class="scan-instructions">
            <p>Enfoca el código QR</p>
            <p class="scan-count">Escaneando continuamente...</p>
          </div>
          <div class="button-container">
            <ion-button @click="stopScanning" expand="block" color="danger" size="large">
              <ion-icon slot="start" :icon="arrowBack"></ion-icon>
              Cerrar Scanner
            </ion-button>
            <ion-button @click="openManualInput" expand="block" fill="outline" color="light">
              Ingresar Código Manualmente
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Modal para ingresar código manualmente -->
    <ion-modal :is-open="showManualInput" @didDismiss="showManualInput = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Ingresar Código QR</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showManualInput = false">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="manual-input-container">
          <ion-item>
            <ion-label position="stacked">Código MD5 o URL Completa</ion-label>
            <ion-input
              v-model="manualCode"
              placeholder="Ingresa el código"
            ></ion-input>
          </ion-item>
          <ion-button
            expand="block"
            @click="processManualCode"
            :disabled="!manualCode"
            class="submit-button"
          >
            Marcar Asistencia
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
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
  IonSpinner,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  toastController,
  onIonViewDidEnter,
} from '@ionic/vue';
import { arrowBack } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AttendanceService } from '../services/attendance';

const router = useRouter();
const route = useRoute();

const actividadId = ref<number>(Number(route.query.actividadId));

const loading = ref(false);
const showManualInput = ref(false);
const manualCode = ref('');
const isScanning = ref(false);
const scannerActive = ref(false);

const goBack = async () => {
  if (isScanning.value) {
    await stopScanning();
  }
  router.back();
};

// Iniciar scanner automáticamente al entrar
onIonViewDidEnter(() => {
  if (!scannerActive.value) {
    startScanning();
  }
});

const startScanning = async () => {
  if (scannerActive.value) return;
  
  try {
    // Solicitar permisos
    const { camera: permission } = await BarcodeScanner.requestPermissions();
    
    if (permission === 'granted' || permission === 'limited') {
      scannerActive.value = true;
      await scanLoop();
    } else {
      const toast = await toastController.create({
        message: 'Necesitas habilitar los permisos de cámara para escanear códigos QR.',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      router.back();
    }
  } catch (error: any) {
    console.error('Error al escanear:', error);
    const toast = await toastController.create({
      message: error.message || 'No se pudo activar la cámara',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

// Loop de escaneo continuo
const scanLoop = async () => {
  while (scannerActive.value) {
    try {
      isScanning.value = true;
      document.body.classList.add('barcode-scanner-active');
      
      const result = await BarcodeScanner.scan();
      
      if (result.barcodes && result.barcodes.length > 0) {
        const barcode = result.barcodes[0];
        if (barcode && barcode.rawValue) {
          const qrData = barcode.rawValue;
          // Mostrar overlay de procesamiento
          isScanning.value = false;
          document.body.classList.remove('barcode-scanner-active');
          
          await handleQRScanned(qrData);
          
          // Esperar un poco antes de continuar escaneando
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error: any) {
      console.error('Error en scanLoop:', error);
      break;
    }
  }
  
  // Limpiar al salir del loop
  isScanning.value = false;
  document.body.classList.remove('barcode-scanner-active');
};

const stopScanning = async () => {
  try {
    scannerActive.value = false;
    await BarcodeScanner.stopScan();
    document.body.classList.remove('barcode-scanner-active');
    isScanning.value = false;
  } catch (error) {
    console.error('Error deteniendo scanner:', error);
  }
};

onUnmounted(async () => {
  if (isScanning.value) {
    await stopScanning();
  }
});

const openManualInput = () => {
  showManualInput.value = true;
  manualCode.value = '';
};

const processManualCode = async () => {
  if (!manualCode.value) return;
  
  showManualInput.value = false;
  await handleQRScanned(manualCode.value);
};

const handleQRScanned = async (qrData: string) => {
  if (loading.value) return;

  loading.value = true;

  try {
    // Extraer el código MD5 del QR
    const codigoMD5 = AttendanceService.extractMD5FromQR(qrData);

    console.log('📷 QR escaneado:', qrData);
    console.log('✅ MD5 extraído:', codigoMD5);

    // Marcar asistencia
    if (actividadId.value) {
      const response = await AttendanceService.markAttendanceForActivity(
        codigoMD5,
        actividadId.value
      );

      const personaInfo = response.data?.persona
        ? `${response.data.persona.nombre} ${response.data.persona.paterno} ${response.data.persona.materno}`
        : '';
      const horaEntrada = response.data?.hora_entrada || '';

      // Mostrar toast en lugar de alert para no interrumpir el escaneo
      const toast = await toastController.create({
        header: '✅ Asistencia Registrada',
        message: `${personaInfo}${horaEntrada ? ' - ' + horaEntrada : ''}`,
        duration: 3000,
        color: 'success',
        position: 'top',
        buttons: [
          {
            icon: 'checkmark-circle',
            side: 'start'
          }
        ]
      });
      await toast.present();
    }
  } catch (error: any) {
    // Mostrar toast de error y continuar escaneando
    const toast = await toastController.create({
      message: error.message || 'No se pudo marcar la asistencia',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

// Limpiar cualquier estado al desmontar
onUnmounted(async () => {
  if (scannerActive.value || isScanning.value) {
    try {
      scannerActive.value = false;
      await BarcodeScanner.stopScan();
      document.body.classList.remove('barcode-scanner-active');
      isScanning.value = false;
    } catch (error) {
      console.error('Error limpiando scanner:', error);
    }
  }
});
</script>

<style scoped>
.scanner-content {
  --background: #000000;
}

.scanner-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanning-view {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.scan-instructions {
  padding: 24px;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.scan-instructions p {
  font-size: 18px;
  margin: 0;
  font-weight: 500;
}

.scan-count {
  font-size: 14px !important;
  color: #4ade80 !important;
  margin-top: 8px !important;
}

.button-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  z-index: 2000;
}

.loading-overlay p {
  margin-top: 16px;
  font-size: 16px;
}

.manual-input-container {
  padding: 24px;
}

.manual-input-container ion-item {
  margin-bottom: 24px;
}

.submit-button {
  margin-top: 16px;
}
</style>
