import { Card } from '@qrd/ui';
import { ArrowRightIcon, LogoIcon } from '@qrd/ui';

const metrics = [
  { label: 'Encrypted Files', value: '0', description: 'Your secure objects in the vault' },
  { label: 'Connected Devices', value: '0', description: 'Devices linked to your account' },
  { label: 'Storage Optimized', value: '0 GB', description: 'Local storage freed with cloud backups' },
];

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <section className="dashboard-hero">
        <div className="dashboard-panel">
          <LogoIcon className="h-12 w-12" />
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Encrypted sync status</h1>
            <p className="page-copy">Your devices and upload sessions are managed securely with client-side encryption.</p>
          </div>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <Card key={metric.label} className="space-y-2">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="text-3xl font-semibold text-slate-900">{metric.value}</p>
              <p className="text-sm text-slate-600">{metric.description}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-6 flex items-center justify-between gap-3 px-6 py-5">
          <div>
            <p className="text-sm text-slate-500">Next step</p>
            <p className="text-lg font-semibold text-slate-900">Register a device and start direct encrypted uploads.</p>
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Manage devices
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </Card>
      </section>
    </main>
  );
}
