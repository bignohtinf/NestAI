import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  UtensilsCrossed, 
  AlertCircle, 
  Package,
  LogOut,
  type LucideIcon 
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: ('admin' | 'staff')[];
  children?: NavItem[];
}

export const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['admin', 'staff'],
  },
  {
    label: 'Quản Lý Nhân Viên',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Cấu Hình Dinh Dưỡng',
    href: '/admin/nutrition-config',
    icon: Settings,
    roles: ['admin'],
  },
  {
    label: 'Lập Thực Đơn',
    href: '/staff/menu',
    icon: UtensilsCrossed,
    roles: ['admin', 'staff'],
  },
  {
    label: 'Quản Lý Dị Ứng',
    href: '/staff/allergies',
    icon: AlertCircle,
    roles: ['admin', 'staff'],
  },
  {
    label: 'Kho Nguyên Liệu',
    href: '/staff/inventory',
    icon: Package,
    roles: ['admin', 'staff'],
  },
];

export function getAvailableNavItems(userRole: string): NavItem[] {
  return navigationItems.filter(item =>
    item.roles.includes(userRole as 'admin' | 'staff')
  );
}
