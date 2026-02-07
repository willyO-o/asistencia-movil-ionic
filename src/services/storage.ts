import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const StorageService = {
  // Guardar token
  async saveToken(token: string): Promise<void> {
    await Preferences.set({
      key: TOKEN_KEY,
      value: token,
    });
  },

  // Obtener token
  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    return value;
  },

  // Eliminar token
  async removeToken(): Promise<void> {
    await Preferences.remove({ key: TOKEN_KEY });
  },

  // Guardar datos de usuario
  async saveUser(user: any): Promise<void> {
    await Preferences.set({
      key: USER_KEY,
      value: JSON.stringify(user),
    });
  },

  // Obtener datos de usuario
  async getUser(): Promise<any | null> {
    const { value } = await Preferences.get({ key: USER_KEY });
    return value ? JSON.parse(value) : null;
  },

  // Eliminar datos de usuario
  async removeUser(): Promise<void> {
    await Preferences.remove({ key: USER_KEY });
  },

  // Verificar si el token existe
  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },

  // Limpiar todo el almacenamiento
  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  },
};
