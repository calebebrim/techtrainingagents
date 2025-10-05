import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import NotificationPopup, { NotificationType } from '../components/common/NotificationPopup';

interface NotificationRecord {
  id: number;
  title?: string;
  message: string;
  type: NotificationType;
}

export interface ShowNotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  duration?: number;
}

interface NotificationContextValue {
  showNotification: (options: ShowNotificationOptions) => number;
  dismissNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

let notificationCounter = 0;

const defaultDuration = 6000;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications(current => current.filter(notification => notification.id !== id));
    clearTimer(id);
  }, [clearTimer]);

  const scheduleDismissal = useCallback(
    (id: number, duration?: number) => {
      const timeout = typeof duration === 'number' ? duration : defaultDuration;
      if (!timeout || timeout <= 0) {
        return;
      }
      const timer = setTimeout(() => {
        dismissNotification(id);
      }, timeout);
      timersRef.current.set(id, timer);
    },
    [dismissNotification]
  );

  const showNotification = useCallback(
    (options: ShowNotificationOptions) => {
      const id = ++notificationCounter;
      const { message, title, type = 'info', duration } = options;
      setNotifications(current => [...current, { id, message, title, type }]);
      scheduleDismissal(id, duration);
      return id;
    },
    [scheduleDismissal]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const contextValue = useMemo(
    () => ({ showNotification, dismissNotification }),
    [showNotification, dismissNotification]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[1200] flex flex-col items-center gap-3 px-4 py-6 sm:items-end sm:justify-start">
        {notifications.map(notification => (
          <NotificationPopup
            key={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => dismissNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
