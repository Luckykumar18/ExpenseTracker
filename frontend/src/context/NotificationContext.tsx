// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState } from "react";

export interface Notification {
  id: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAllAsRead: () => void;
  removeNotificationByMessage: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotificationByMessage = (message: string) => {
    setNotifications((prev) => prev.filter((n) => n.message !== message));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllAsRead, removeNotificationByMessage }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};
