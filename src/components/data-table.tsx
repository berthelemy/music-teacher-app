import { useEffect, useRef } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { Api, Config } from 'datatables.net-bs5'

/**
 * React wrapper around datatables.net (Bootstrap 5 styling + Responsive).
 *
 * DataTables owns the table DOM, so React only renders an empty container and
 * the library is loaded in the browser after hydration. Cells are rendered as
 * HTML strings; interactive cells use:
 *  - `data-action="<name>" data-id="<rowId>"` on a <button> → `onAction`
 *  - `<a href="/path" data-nav>` → client-side navigation
 */
export type Column<T> = {
  title: string
  /** Plain value used for sorting, searching and (escaped) display */
  value: (row: T) => string | number
  /** Optional HTML for display; must escape any user content with `esc` */
  html?: (row: T) => string
  orderable?: boolean
  className?: string
  /** Responsive priority: lower stays visible longer on narrow screens */
  priority?: number
}

export function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function DataTable<T>({
  rows,
  columns,
  caption,
  emptyMessage = 'No records to show',
  onAction,
  order = [[0, 'asc']],
  pageLength = 10,
}: {
  rows: T[]
  columns: Column<T>[]
  caption: string
  emptyMessage?: string
  onAction?: (action: string, id: string) => void
  order?: [number, 'asc' | 'desc'][]
  pageLength?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<Api<T> | null>(null)
  const rowsRef = useRef(rows)
  const router = useRouter()

  // Initialise once on the client.
  useEffect(() => {
    let cancelled = false
    const container = containerRef.current!
    void (async () => {
      const { default: DT } = await import('datatables.net-bs5')
      await import('datatables.net-responsive-bs5')
      if (cancelled) return
      const table = document.createElement('table')
      table.className = 'table table-hover align-middle w-100'
      const cap = table.createCaption()
      cap.className = 'visually-hidden'
      cap.textContent = caption
      container.appendChild(table)
      const options = {
        data: rowsRef.current,
        columns: columns.map((c) => ({
          title: c.title,
          data: null,
          orderable: c.orderable ?? true,
          className: c.className,
          responsivePriority: c.priority,
          render: (_d: unknown, type: string, row: T) =>
            type === 'display'
              ? (c.html?.(row) ?? esc(c.value(row)))
              : c.value(row),
        })),
        order,
        pageLength,
        responsive: true,
        autoWidth: false,
        language: {
          emptyTable: emptyMessage,
          zeroRecords: 'No matching records found',
          search: 'Search:',
        },
      }
      apiRef.current = new DT<T>(table, options as unknown as Config)
    })()
    return () => {
      cancelled = true
      apiRef.current?.destroy(true)
      apiRef.current = null
      container.innerHTML = ''
    }
    // Columns and options are static for each table instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push data changes into the existing table, keeping the current page.
  useEffect(() => {
    rowsRef.current = rows
    const api = apiRef.current
    if (!api) return
    api.clear()
    api.rows.add(rows)
    api.draw(false)
  }, [rows])

  return (
    <div
      ref={containerRef}
      className="cz-datatable"
      onClick={(e) => {
        const target = e.target as HTMLElement
        const link = target.closest<HTMLAnchorElement>('a[data-nav]')
        if (link && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
          e.preventDefault()
          router.history.push(link.getAttribute('href')!)
          return
        }
        const btn = target.closest<HTMLElement>('[data-action]')
        if (btn && onAction) onAction(btn.dataset.action!, btn.dataset.id!)
      }}
    />
  )
}
