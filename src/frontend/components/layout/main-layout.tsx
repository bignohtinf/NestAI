import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
}

export function MainLayout({ children, userRole, userName }: MainLayoutProps) {
  return (
    <div className="flex">
      <Sidebar userRole={userRole} userName={userName} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-auto">
        {children}
      </main>
    </div>
  );
}
