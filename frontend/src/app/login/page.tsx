import type { Metadata } from 'next';
import { AdminDashboard } from './AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Nepal Cricket Hub admin login — sign in to manage content.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AdminDashboard />;
}
