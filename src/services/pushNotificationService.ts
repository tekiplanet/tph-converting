import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { apiClient } from '@/lib/axios';

class PushNotificationService {
  async initialize() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      console.log('Requesting push notification permission...');
      const permissionStatus = await PushNotifications.requestPermissions();
      
      if (permissionStatus.receive === 'granted') {
        console.log('Permission granted, registering with FCM...');
        await PushNotifications.register();

        // Send FCM token to backend
        PushNotifications.addListener('registration', async (token) => {
          console.log('Got FCM token:', token.value);
          try {
            await this.sendTokenToServer(token.value);
            console.log('Token sent to server successfully');
          } catch (error) {
            console.error('Failed to send token to server:', error);
          }
        });

        // Handle incoming notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification);
        });

        // Handle notification clicks
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification clicked:', notification);
          // Handle navigation based on notification data
          if (notification.notification.data.url) {
            window.location.hash = notification.notification.data.url;
          }
        });
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Push notification initialization failed:', error);
    }
  }

  private async sendTokenToServer(token: string) {
    try {
      await apiClient.post('/api/device-tokens', { token });
    } catch (error) {
      console.error('Failed to send FCM token to server:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService(); 