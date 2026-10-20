import { createContext, useCallback, useContext, useState } from 'react'

/**
 * Bootstrap toasts that double as a polite live region, so screen-reader users
 * hear the result of every save, archive and delete.
 */
type Toast = { id: number; message: string; tone: 'success' | 'danger' | 'info' }

const AnnounceContext = createContext<(message: string, tone?: Toast['tone']) => void>(
  () => {},
)

export function AnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const announce = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000)
  }, [])

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div
        className="toast-container position-fixed bottom-0 end-0 p-3"
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center text-bg-${t.tone} border-0`}
          >
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Dismiss notification"
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              />
            </div>
          </div>
        ))}
      </div>
    </AnnounceContext.Provider>
  )
}

export function useAnnounce() {
  return useContext(AnnounceContext)
}
