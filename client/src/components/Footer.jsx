import { Camera, Heart } from 'lucide-react';

/**
 * Site-wide footer. Rendered by DashboardShell so every dashboard page
 * (user and admin) gets the same chrome.
 */
export default function Footer() {
  return (
    <footer className="mt-12 border-t border-lav-200 bg-lav-50/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-sm text-ink-muted sm:flex-row sm:px-6 sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Camera className="h-4 w-4 text-brand" />
          <span>
            © 2026 <span className="font-semibold text-ink">BiyeBuzz.com</span>. All rights reserved.
          </span>
        </div>
        <p className="flex items-center gap-1 text-xs">
          Made with <Heart className="h-3.5 w-3.5 fill-brand text-brand" /> for timeless memories.
        </p>
      </div>
    </footer>
  );
}
