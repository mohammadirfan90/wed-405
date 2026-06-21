import { Eye, Pencil, Trash2 } from 'lucide-react';

/**
 * Reusable content card with image cover, body slot, and View / Edit / Delete
 * action buttons. Used on every admin CRUD grid and on the read-only user
 * dashboards. Buttons are optional — pass only the ones you need.
 *
 * Props:
 *   image        — cover image URL
 *   badge        — small label rendered on top of the image
 *   title        — string | ReactNode
 *   subtitle     — string | ReactNode (small, muted)
 *   children     — body content (description, features list, etc.)
 *   footer       — optional ReactNode rendered at the bottom-left
 *   onView       — () => void  (shows the "View details" button)
 *   onEdit       — () => void
 *   onDelete     — () => void
 *   viewLabel    — defaults to "View"
 *   busy         — disables buttons while a request is in flight
 */
export default function Card({
  image,
  badge,
  title,
  subtitle,
  children,
  footer,
  onView,
  onEdit,
  onDelete,
  viewLabel = 'View',
  busy = false,
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-lav-200 transition hover:-translate-y-0.5 hover:shadow-lg">
      {image ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-lav-100">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink shadow">
              {badge}
            </span>
          )}
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-lav-100 text-ink-muted">
          <span className="text-xs uppercase tracking-wide">No image</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {title && <h3 className="truncate text-base font-semibold text-ink">{title}</h3>}
        {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}

        {children && <div className="mt-3 flex-1 text-sm text-ink/80">{children}</div>}

        <div className="mt-4 flex items-center gap-2">
          {onView && (
            <button
              type="button"
              onClick={onView}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white disabled:opacity-60"
            >
              <Eye className="h-3.5 w-3.5" />
              {viewLabel}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-lav-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-lav-100 disabled:opacity-60"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-600 hover:text-white disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
        {footer && <div className="mt-3 text-xs text-ink-muted">{footer}</div>}
      </div>
    </article>
  );
}
