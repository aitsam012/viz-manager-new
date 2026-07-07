import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  projectId?: string;
  actionUrl?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulate checking for deadline reminders
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Project Deadline Approaching',
          message: 'TechCorp Solutions project deadline is in 3 days',
          type: 'warning',
          timestamp: now.toISOString(),
          read: false,
          projectId: '1'
        },
        {
          id: '2',
          title: 'Milestone Completed',
          message: 'SEO audit completed for GreenLeaf Organics',
          type: 'success',
          timestamp: new Date(now.getTime() - 86400000).toISOString(),
          read: false,
          projectId: '2'
        }
      ];

      setNotifications(prev => {
        const existingIds = prev.map(n => n.id);
        const newNotifications = mockNotifications.filter(n => !existingIds.includes(n.id));
        return [...prev, ...newNotifications];
      });
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
};