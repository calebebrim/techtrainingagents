import React from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationPopupProps {
  title?: string;
  message: string;
  type?: NotificationType;
  onClose?: () => void;
}

const variantClasses: Record<NotificationType, string> = {
  info: 'border-sky-200 bg-sky-50/90 text-sky-900 dark:border-sky-400/50 dark:bg-sky-900/40 dark:text-sky-100',
  success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-900/40 dark:text-emerald-100',
  warning: 'border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-500/60 dark:bg-amber-900/40 dark:text-amber-100',
  error: 'border-red-200 bg-red-50/90 text-red-900 dark:border-red-500/60 dark:bg-red-900/40 dark:text-red-100'
};

const accentClasses: Record<NotificationType, string> = {
  info: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500'
};

const NotificationPopup: React.FC<NotificationPopupProps> = ({ title, message, type = 'info', onClose }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`pointer-events-auto w-full max-w-sm rounded-xl border px-5 py-4 text-sm shadow-xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-lg transition ${variantClasses[type]}`}
    >
      <div className="flex items-start gap-4">
        <span className={`mt-1 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${accentClasses[type]}`} />
        <div className="flex-1 space-y-1">
          {title ? <h3 className="font-semibold leading-5">{title}</h3> : null}
          <p className="leading-5 text-current/90">{message}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="-m-1 rounded-md p-1 text-current/60 transition hover:bg-white/20 hover:text-current focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="Dismiss notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M11.414 10l4.95-4.95a1 1 0 10-1.414-1.414L10 8.586 5.05 3.636a1 1 0 00-1.414 1.414L8.586 10l-4.95 4.95a1 1 0 101.414 1.414L10 11.414l4.95 4.95a1 1 0 001.414-1.414L11.414 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default NotificationPopup;
