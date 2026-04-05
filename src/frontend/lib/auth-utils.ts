import { auth } from '../auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(role: 'admin' | 'staff') {
  const session = await requireAuth();
  const userRole = (session.user as any).role;
  
  if (userRole !== role && userRole !== 'admin') {
    redirect('/unauthorized');
  }
  
  return session;
}

export async function requireAdmin() {
  return requireRole('admin');
}

export function hasAccess(userRole: string, requiredRole: string): boolean {
  if (userRole === 'admin') return true;
  return userRole === requiredRole;
}

export function canAccessRoute(userRole: string, route: string): boolean {
  if (userRole === 'admin') return true;
  
  if (route.startsWith('/staff')) {
    return userRole === 'staff';
  }
  
  return false;
}
