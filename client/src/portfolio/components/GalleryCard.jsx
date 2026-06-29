/**
 * GalleryCard — vertical-format image card used in the portfolio grid.
 * Hover reveals a film-strip caption with category, title, and location.
 */
export default function GalleryCard({ item, onOpen, priority = false }) {
  const cover = item.coverImage || item.image || (item.images && item.images[0]);
  const tall = item.aspect && /tall|portrait|9|4\/5|3\/4/i.test(String(item.aspect));

  return (
    <article
      className="pf-card group relative cursor-pointer overflow-hidden bg-carbon/5"
      onClick={() => onOpen && onOpen(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onOpen) onOpen(item);
      }}
    >
      <div className={`relative w-full overflow-hidden ${tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        {cover ? (
          <img
            src={cover}
            alt={item.title || ''}
            loading={priority ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center pf-eyebrow">No image</div>
        )}

        {/* Permanent: category strip across the bottom */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
          <div className="space-y-1.5">
            <span className="pf-tag !border-paper !text-paper bg-carbon/40 backdrop-blur-sm">
              {item.category || 'Untitled'}
            </span>
            <h3 className="pf-display text-paper text-xl sm:text-2xl leading-tight max-w-[18ch]">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Hover: dark veil + meta */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/85 via-carbon/20 to-transparent opacity-60 group-hover:opacity-95 transition-opacity duration-500" />

        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-start justify-between">
            <span className="pf-eyebrow !text-sepia-200">
              Roll 0{((item._id || item.id || '0').toString().charCodeAt(0) % 9) + 1} · Frame{' '}
              {((item._id || item.id || '1').toString().charCodeAt(1) % 36) + 1 || 12}
            </span>
            {item.location && (
              <span className="pf-tag !border-paper/60 !text-paper/80 bg-carbon/30 backdrop-blur-sm">
                {item.location}
              </span>
            )}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="pf-display text-paper text-2xl leading-tight max-w-[18ch]">
                {item.title}
              </h3>
              {item.eventDate && (
                <p className="mt-1 pf-eyebrow !text-paper/70">
                  {new Date(item.eventDate).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
            <span className="text-paper text-2xl -translate-x-1 group-hover:translate-x-0 transition-transform">
              ↗
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
