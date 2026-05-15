import { AuthForm } from '../../components/AuthForm';

export default function LoginPage() {
  return (
    <main className="page-shell">
      <section className="page-panel">
        <div className="page-heading">
          <p className="eyebrow">Secure access</p>
          <h1>Sign in to your encrypted vault</h1>
          <p className="page-copy">Use your credentials to access device registration and upload sessions.</p>
        </div>
        <AuthForm type="login" />
      </section>
    </main>
  );
}
