import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect root to login page to streamline user flow
  redirect('/login');
}
