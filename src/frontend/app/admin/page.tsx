import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - NestAI',
  description: 'Admin dashboard for NestAI system management',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
