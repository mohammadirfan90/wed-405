import DashboardShell from '../../components/DashboardShell.jsx';

export default function SimplePage({ title, kind = 'user' }) {
  return (
    <DashboardShell variant={kind} title={title} searchPlaceholder="Search">
      <h2 className="mb-3 text-xl font-semibold text-ink">{title}</h2>
      <p className="rounded-lg bg-white p-6 text-sm text-ink-muted shadow-soft">
        This section is coming soon.
      </p>
    </DashboardShell>
  );
}
