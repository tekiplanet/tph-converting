import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

class PlatformService {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  getPlatform(): string {
    return Capacitor.getPlatform();
  }

  async initializeApp(): Promise<void> {
    if (this.isNative()) {
      try {
        // Hide splash screen
        await SplashScreen.hide();

        // Set status bar style
        await StatusBar.setStyle({ style: Style.Dark });

        // Add app state change listener
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active?:', isActive);
        });
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    }
  }

  async vibrate(): Promise<void> {
    if (this.isNative()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        console.error('Error with haptics:', error);
      }
    }
  }

  async exitApp(): Promise<void> {
    if (this.isNative()) {
      try {
        await App.exitApp();
      } catch (error) {
        console.error('Error exiting app:', error);
      }
    }
  }
}

export const platformService = new PlatformService(); 