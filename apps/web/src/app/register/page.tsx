import { AuthForm } from '../../components/AuthForm';

export default function RegisterPage() {
  return (
    <main className="page-shell">
      <section className="page-panel">
        <div className="page-heading">
          <p className="eyebrow">Get started</p>
          <h1>Create your QRD Storage account</h1>
          <p className="page-copy">Register once and link your devices to a private encrypted sync layer.</p>
        </div>
        <AuthForm type="register" />
      </section>
    </main>
  );
}
