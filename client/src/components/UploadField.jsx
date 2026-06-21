import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import api from '../lib/api';

/**
 * Image-picker + uploader. Shows a preview, lets the user pick a file,
 * POSTs it to /api/uploads, and writes the returned URL into the parent form.
 *
 * Props:
 *   value       — current image URL (string)
 *   onChange    — (url: string) => void
 *   endpoint    — default '/uploads'
 *   label       — optional label rendered above
 *   accept      — defaults to image/*
 *   maxSizeMB   — defaults to 5
 */
export default function UploadField({
  value,
  onChange,
  endpoint = '/uploads',
  label,
  accept = 'image/*',
  maxSizeMB = 5,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErr(`File too large (max ${maxSizeMB} MB)`);
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post(endpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data?.url) onChange(data.url);
    } catch (e) {
      setErr(e.response?.data?.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && (
        <label className="label">{label}</label>
      )}
      <div className="flex items-start gap-3">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-lav-300 bg-lav-50">
          {value ? (
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="h-6 w-6 text-ink-muted" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-lav-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-lav-100 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {value ? 'Replace image' : 'Upload image'}
          </button>
          <input
            type="url"
            className="input-field"
            placeholder="…or paste an image URL"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}
