package com.tekiplanet.org;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create notification channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            String channelId = getString(R.string.default_notification_channel_id);
            String channelName = getString(R.string.default_notification_channel_name);
            String channelDescription = getString(R.string.default_notification_channel_description);
            
            NotificationChannel channel = new NotificationChannel(
                channelId,
                channelName,
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription(channelDescription);
            channel.enableVibration(true);
            channel.enableLights(true);

            // Register the channel with the system
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }

        try {
            Log.d(TAG, "Registering push notification plugin");
            registerPlugin(com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin.class);
            Log.d(TAG, "Push notification plugin registered successfully");

            // Add only this new line for LocalNotifications
            registerPlugin(com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin.class);

            // Initialize Firebase
            FirebaseMessaging.getInstance().setAutoInitEnabled(true);
        } catch (Exception e) {
            Log.e(TAG, "Error registering push notification plugin", e);
        }
    }
}
