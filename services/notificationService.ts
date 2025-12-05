
import { Reminder } from '../types';

const STORAGE_KEY = 'kb_reminders';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    alert("This browser does not support desktop notifications");
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/icon.png', // Fallback icon path
    });
  }
};

export const saveReminder = (reminder: Reminder) => {
  const existing = localStorage.getItem(STORAGE_KEY);
  const reminders: Reminder[] = existing ? JSON.parse(existing) : [];
  reminders.push(reminder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
};

export const getReminders = (): Reminder[] => {
  const existing = localStorage.getItem(STORAGE_KEY);
  return existing ? JSON.parse(existing) : [];
};

export const checkDueReminders = () => {
  const reminders = getReminders();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  // Filter reminders that match today and haven't been completed
  // For a real app, you'd check exact timestamps. Here we check "Day of"
  reminders.forEach(r => {
    if (r.date === today && !r.isCompleted) {
        // Send alert
        sendNotification(r.title, r.body);
        // Mark strictly as completed for this session context or rely on user action?
        // For simplicity, we won't mark completed automatically unless we have a robust ID system 
        // effectively suppressing repeat notifications for the same day.
        // We'll rely on browser deduping or just simple "Today" checks.
    }
  });
};
