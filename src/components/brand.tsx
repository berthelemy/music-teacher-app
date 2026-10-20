export const PRODUCT_NAME = 'Cadenza'

export function BrandMark({ light }: { light?: boolean }) {
  return (
    <span className="d-inline-flex align-items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? '#c9952f' : '#1f2f57'} />
        <path
          d="M20 7v13.2a3.8 3.8 0 1 1-2-3.35V10.5l-6 1.6v10.1a3.8 3.8 0 1 1-2-3.35V10.6L20 7z"
          fill={light ? '#141c33' : '#f3e6c8'}
        />
      </svg>
      <span className={`brand-mark fs-5 ${light ? 'text-white' : 'text-primary'}`}>
        {PRODUCT_NAME}
      </span>
    </span>
  )
}
