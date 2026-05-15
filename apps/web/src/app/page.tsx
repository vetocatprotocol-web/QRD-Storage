export default function HomePage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '3rem' }}>
      <div style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1rem' }}>QRD Storage</h1>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#4a5568' }}>
          Privacy-first encrypted sync storage designed for automatic device backup, client-side encryption, and smart local storage optimization.
        </p>
      </div>
    </main>
  );
}
