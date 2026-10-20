import { useEffect, useId, useRef } from 'react'

/**
 * Accessible modal built on the native <dialog> element: focus is trapped and
 * restored by the browser, Escape closes it, and it is labelled by its title.
 * Styled with Bootstrap's modal classes.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'lg'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="cz-dialog"
      style={size === 'lg' ? { width: 'min(52rem, calc(100vw - 2rem))' } : undefined}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      {open && (
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <div>
              <h2 className="modal-title h5 mb-0" id={titleId}>
                {title}
              </h2>
              {description && (
                <p className="small text-body-secondary mb-0 mt-1" id={descId}>
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close dialog"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      )}
    </dialog>
  )
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  danger,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  body: string
  confirmLabel: string
  danger?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="mb-0">{body}</p>
    </Modal>
  )
}
