import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardShell from '../../components/DashboardShell.jsx';

export default function ManageSettings() {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
  });
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        setSettings({
          whatsapp_number: data.whatsapp_number || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          contact_address: data.contact_address || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          youtube_url: data.youtube_url || '',
        });
      })
      .catch(() => {});
  }, []);

  async function saveSetting(key, value) {
    await api.post('/settings', { key, value });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setFlash(null);
    try {
      await Promise.all(
        Object.entries(settings).map(([k, v]) => saveSetting(k, v))
      );
      setFlash({ type: 'ok', text: 'Settings updated successfully' });
    } catch (err) {
      setFlash({ type: 'err', text: err.response?.data?.message || 'Could not save settings' });
    } finally {
      setBusy(false);
    }
  }

  function set(key, val) {
    setSettings(prev => ({ ...prev, [key]: val }));
  }

  return (
    <DashboardShell variant="admin" title="Manage Settings" searchPlaceholder="Search settings">
      <div className="max-w-2xl">
        <h2 className="mb-2 text-xl font-semibold text-charcoal">Global Site Settings</h2>
        <p className="mb-6 text-sm text-charcoal/70">
          Update the global contacts, social links, and WhatsApp number used across the public landing page.
        </p>

        <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow-soft ring-1 ring-taupe/20">
          {flash && (
            <p className={'rounded-md px-3 py-2 text-sm ' + (flash.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700')}>
              {flash.text}
            </p>
          )}

          <div>
            <label className="label">WhatsApp Number (For booking notifications, e.g. +8801XXXXXXXXX)</label>
            <input
              type="text"
              className="input-field"
              value={settings.whatsapp_number}
              onChange={(e) => set('whatsapp_number', e.target.value)}
              placeholder="+8801700000000"
              required
            />
          </div>

          <div>
            <label className="label">Contact Email Address</label>
            <input
              type="email"
              className="input-field"
              value={settings.contact_email}
              onChange={(e) => set('contact_email', e.target.value)}
              placeholder="info@weddingheritagebd.com"
            />
          </div>

          <div>
            <label className="label">Contact Phone Number (For header/footer link)</label>
            <input
              type="text"
              className="input-field"
              value={settings.contact_phone}
              onChange={(e) => set('contact_phone', e.target.value)}
              placeholder="01327292323"
            />
          </div>

          <div>
            <label className="label">Contact Office Address</label>
            <input
              type="text"
              className="input-field"
              value={settings.contact_address}
              onChange={(e) => set('contact_address', e.target.value)}
              placeholder="Elephant Road, Dhaka, 1205"
            />
          </div>

          <div>
            <label className="label">Facebook Page URL</label>
            <input
              type="url"
              className="input-field"
              value={settings.facebook_url}
              onChange={(e) => set('facebook_url', e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <label className="label">Instagram Profile URL</label>
            <input
              type="url"
              className="input-field"
              value={settings.instagram_url}
              onChange={(e) => set('instagram_url', e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <label className="label">YouTube Channel URL</label>
            <input
              type="url"
              className="input-field"
              value={settings.youtube_url}
              onChange={(e) => set('youtube_url', e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={busy} className="btn-primary w-auto px-6">
              {busy ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
