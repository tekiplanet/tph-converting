import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const platformService = {
  isNative: () => Capacitor.isNativePlatform(),
  
  getPlatform: () => Capacitor.getPlatform(),

  initializeApp: async () => {
    if (Capacitor.isNativePlatform()) {
      // Hide splash screen
      await SplashScreen.hide();

      // Set status bar style
      await StatusBar.setStyle({ style: Style.Dark });

      // Add app state change listener
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?:', isActive);
      });
    }
  },

  vibrate: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },

  exitApp: async () => {
    if (Capacitor.isNativePlatform()) {
      await App.exitApp();
    }
  }
}; 