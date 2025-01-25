import { NotificationPreference } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const scheduleNotification = async (
  preference: NotificationPreference
): Promise<void> => {
  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  if (!preference.enabled) {
    return;
  }

  // Register the notification schedule in the service worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      payload: preference
    });
  }

  // For immediate testing, schedule a notification in 5 seconds
  setTimeout(() => {
    new Notification('Daily Bible Reading', {
      body: 'Your daily Bible reading is ready!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'daily-reading',
      renotify: true
    });
  }, 5000);
};

export const cancelNotification = async (id: string): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CANCEL_NOTIFICATION',
      payload: { id }
    });
  }
};