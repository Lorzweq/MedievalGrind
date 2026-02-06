import { useState, useEffect } from 'react'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }

  return { notifications, addNotification }
}

export function NotificationToast({ notifications }) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`
            animate-slide-in-right px-4 py-3 rounded-lg-panel text-sm font-semibold
            ${notif.type === 'success' ? 'bg-moss text-parchment' : ''}
            ${notif.type === 'info' ? 'bg-steel text-parchment' : ''}
            ${notif.type === 'warning' ? 'bg-ember text-parchment' : ''}
            ${notif.type === 'royal' ? 'bg-royal text-parchment' : ''}
          `}
        >
          {notif.message}
        </div>
      ))}
    </div>
  )
}
