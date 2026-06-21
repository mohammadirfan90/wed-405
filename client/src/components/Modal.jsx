import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Themed modal used everywhere we need a dialog: card details, edit forms,
 * confirmations. Closes on backdrop click, Escape, or X button.
 *
 * Props:
 *   open        — boolean; when true the modal is visible
 *   onClose     — () => void
 *   title       — string | ReactNode; rendered in the header
 *   children    — body content
 *   footer      — optional ReactNode; rendered in the footer row
 *   size        — 'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *   hideClose   — hide the X button (use when footer has its own cancel)
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  hideClose = false,
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    // lock body scroll while the modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={
          'w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-lav-200 ' +
          widths[size]
        }
      >
        <header className="flex items-center justify-between gap-3 border-b border-lav-200 bg-lav-50/60 px-5 py-3">
          <h3 className="truncate text-base font-semibold text-ink">{title}</h3>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-ink-muted transition hover:bg-lav-100 hover:text-ink"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-lav-200 bg-lav-50/40 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
