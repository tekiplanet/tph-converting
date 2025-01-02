import type { CapacitorConfig } from '@capacitor/cli';
import { defineConfig } from 'vite';

const config: CapacitorConfig = {
  appId: 'com.tekiplanet.org',
  appName: 'TekiPlanet',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http',
    cleartext: true,
    url: 'http://192.168.96.190:8080',
    hostname: 'localhost'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
    App: {
      url: 'http://192.168.96.190:8080',
      launchUrl: '/',
      webDir: 'dist'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      importance: "high",
      sound: true,
      vibrate: true,
      smallIcon: "ic_notification",
      iconColor: "#488AFF",
      forceShow: true
    },
    LocalNotifications: {
      smallIcon: "ic_notification",
      iconColor: "#488AFF",
      sound: "notification.wav"
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: "#ffffff",
    includePlugins: ["@capacitor/push-notifications"],
    notificationSettings: {
      importance: "high",
      sound: "notification",
      vibrate: true
    }
  },
  ios: {
    contentInset: "always",
    allowsLinkPreview: true,
    scrollEnabled: true,
    usesFontScaling: true,
    includePlugins: ["@capacitor/push-notifications"],
    backgroundColor: "#ffffff"
  },
  deepLinks: {
    routes: [
      {
        name: 'Payment Callback',
        path: '/paystack-callback',
      },
      {
        name: 'Dashboard',
        path: '/dashboard',
      }
    ]
  }
};

export default config;
