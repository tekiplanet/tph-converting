import Pusher from 'pusher-js';
import { apiClient } from '@/lib/axios';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
    private pusher: Pusher;
    private channel: any;
    private isConnected: boolean = false;

    constructor() {
        const token = localStorage.getItem('token');
        console.log('Token for Pusher auth:', token); // Debug log

        this.pusher = new Pusher('2f14ebc513254579c12a', {
            cluster: 'eu',
            forceTLS: true,
            authEndpoint: 'http://192.168.96.190:8000/api/broadcasting/auth',
            auth: {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Socket-ID': this.pusher?.connection?.socket_id
                }
            }
        });

        // Monitor connection status
        this.pusher.connection.bind('connected', () => {
            console.log('✅ Pusher connected');
            this.isConnected = true;
        });

        this.pusher.connection.bind('error', (error: any) => {
            console.error('Pusher connection error:', {
                error,
                headers: this.pusher.config.auth?.headers,
                socketId: this.pusher.connection.socket_id
            });
        });

        // Initialize push notifications if on mobile
        if (Capacitor.isNativePlatform()) {
            this.initializePushNotifications();
        }
    }

    private async initializePushNotifications() {
        try {
            // Request permissions first
            const permResult = await PushNotifications.checkPermissions();
            
            if (permResult.receive === 'prompt' || permResult.receive === 'prompt-with-rationale') {
                const permissionResult = await PushNotifications.requestPermissions();
                if (permissionResult.receive !== 'granted') {
                    throw new Error('Push notification permission denied');
                }
            }

            // Clear old notifications before registering
            await PushNotifications.removeAllDeliveredNotifications();
            
            // Register for push notifications
            await PushNotifications.register();

            // Add listeners
            await this.addNotificationListeners();

        } catch (error) {
            console.error('Push Notification Error:', error);
            throw error;
        }
    }

    private async addNotificationListeners() {
        // Registration success
        PushNotifications.addListener('registration', async (token) => {
            console.log('Push registration success:', token.value);
            await this.registerDeviceToken(token.value);
        });

        // Registration error
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration:', error);
        });

        // Handle incoming notifications when app is in foreground
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received:', notification);
            // Show local notification
            this.showLocalNotification(notification);
        });

        // Handle notification click
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('Push notification action:', action);
            const { notification } = action;
            if (notification.data?.action_url) {
                window.location.href = notification.data.action_url;
            }
        });
    }

    private async showLocalNotification(notification: any) {
        // Create local notification when app is in foreground
        await LocalNotifications.schedule({
            notifications: [{
                title: notification.title,
                body: notification.body,
                id: Date.now(),
                sound: 'default',
                attachments: notification.attachments,
                actionTypeId: notification.actionTypeId,
                extra: notification.data
            }]
        });
    }

    private async registerDeviceToken(token: string) {
        try {
            console.log('🔄 Sending token to server...', {
                url: `${import.meta.env.VITE_API_URL}/device-tokens`,
                token: token.substring(0, 10) + '...',  // Log partial token for security
                authToken: localStorage.getItem('token')?.substring(0, 10) + '...'
            });

            const response = await apiClient.post('/device-tokens', { token });
            console.log('✅ Token registration response:', response.data);
        } catch (error: any) {
            console.error('❌ Token registration error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
                config: {
                    url: error.config?.url,
                    headers: error.config?.headers
                }
            });
            throw error;
        }
    }

    subscribe(userId: string, onNotification: (data: any) => void) {
        const channelName = `private-notifications.${userId}`;
        console.log('🔌 Subscribing to channel:', {
            channelName,
            token: localStorage.getItem('token'),
            socketId: this.pusher.connection.socket_id
        });
        
        try {
            this.channel = this.pusher.subscribe(channelName);
            
            this.channel.bind('pusher:subscription_succeeded', () => {
                console.log('✅ Successfully subscribed to channel:', channelName);
            });

            this.channel.bind('pusher:subscription_error', (error: any) => {
                console.error('❌ Subscription error:', {
                    message: error.message,
                    type: error.type,
                    data: error.data,
                    socketId: this.pusher.connection.socket_id,
                    auth: this.pusher.config.auth
                });
            });

            this.channel.bind('NewNotification', (data: any) => {
                console.log('📨 Received notification data:', data);
                try {
                    onNotification(data);
                    console.log('✅ Notification handler executed successfully');
                } catch (error) {
                    console.error('❌ Error in notification handler:', error);
                }
            });
        } catch (error) {
            console.error('Subscribe error:', error);
        }
    }

    unsubscribe(userId: string) {
        const channelName = `private-notifications.${userId}`;
        if (this.channel) {
            console.log('🔌 Unsubscribing from channel:', channelName);
            this.pusher.unsubscribe(channelName);
        }
    }

    async getNotifications(page = 1) {
        const response = await apiClient.get(`/notifications?page=${page}`);
        return response.data;
    }

    async markAsRead(notificationId: string) {
        const response = await apiClient.post(`/notifications/${notificationId}/read`);
        return response.data;
    }

    async markAllAsRead() {
        const response = await apiClient.post('/notifications/mark-all-read');
        return response.data;
    }

    async deleteNotification(id: string) {
        try {
            const response = await apiClient.delete(`/notifications/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Delete notification error:', {
                error,
                response: error.response?.data
            });
            throw error;
        }
    }

    async testNotification() {
        try {
            console.log('🔔 Starting test notification process...');
            
            // Only check permissions on native platforms
            if (Capacitor.isNativePlatform()) {
                // Check current permission status
                const permResult = await PushNotifications.checkPermissions();
                console.log('📋 Current permission status:', permResult);

                // Request permission if not granted
                if (permResult.receive !== 'granted') {
                    console.log('🔐 Requesting permissions...');
                    const permissionResult = await PushNotifications.requestPermissions();
                    
                    if (permissionResult.receive !== 'granted') {
                        throw new Error('Push notification permission denied');
                    }
                }
            }

            // Send test notification request
            console.log('📤 Sending test notification request...');
            const response = await apiClient.post('/test-push-notification');
            
            // Log success
            console.log('✅ Test notification sent successfully:', response.data);
            
            // Show a local notification immediately if on native platform
            if (Capacitor.isNativePlatform()) {
                await LocalNotifications.schedule({
                    notifications: [{
                        title: 'Test Notification',
                        body: 'This is a test local notification',
                        id: Date.now(),
                        sound: 'default',
                        schedule: { at: new Date(Date.now() + 1000) }
                    }]
                });
            }

            return response.data;
        } catch (error: any) {
            console.error('❌ Test notification failed:', {
                error: error.message,
                response: error.response?.data,
                stack: error.stack
            });
            
            // Throw a more user-friendly error
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Failed to send test notification'
            );
        }
    }
}

export const notificationService = new NotificationService(); 