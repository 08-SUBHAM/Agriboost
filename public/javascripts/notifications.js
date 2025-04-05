// Request permission for notifications
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
            return true;
        } else {
            console.log('Notification permission denied');
            return false;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// Subscribe to push notifications
async function subscribeToPushNotifications() {
    try {
        const permission = await requestNotificationPermission();
        if (!permission) return;

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID public key
        });

        // Send subscription to your server
        await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription)
        });

        console.log('Successfully subscribed to push notifications');
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
    }
}

// Show a notification
function showNotification(title, options) {
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

// Initialize notifications
document.addEventListener('DOMContentLoaded', () => {
    // Check if notifications are supported
    if ('Notification' in window) {
        // Add notification button to the UI
        const notificationButton = document.createElement('button');
        notificationButton.textContent = 'Enable Notifications';
        notificationButton.className = 'fixed bottom-4 left-4 bg-agri-green text-white px-4 py-2 rounded-lg shadow-lg';
        notificationButton.onclick = subscribeToPushNotifications;
        document.body.appendChild(notificationButton);
    }
}); 