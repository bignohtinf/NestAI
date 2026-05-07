# Admin Dashboard Components

## Cấu trúc thư mục

```
components/admin/
├── admin-layout.tsx          # Layout chính cho admin
├── admin-header.tsx          # Header với user menu & logout
├── admin-sidebar.tsx         # Sidebar navigation
├── dashboard-stats.tsx       # Stats cards (KPIs)
├── dashboard-charts.tsx      # Chart components (Revenue, Orders)
├── recent-activity.tsx       # Activity feed
├── users-table.tsx           # Users management table
└── README.md                 # This file
```

## Cách sử dụng

### Admin Dashboard chính
```tsx
import AdminDashboard from '@/components/dashboards/admin-dashboard';

export default function AdminPage() {
  return <AdminDashboard />;
}
```

### Admin Layout (với role checking)
```tsx
import AdminLayout from '@/components/admin/admin-layout';

export default function AdminPage() {
  return (
    <AdminLayout>
      {/* Nội dung trang */}
    </AdminLayout>
  );
}
```

## API Endpoints

### Check Admin Role
```typescript
POST /api/admin/check-role

Body:
{
  "userId": "user-id"
}

Response:
{
  "isAdmin": true,
  "userId": "user-id",
  "email": "admin@example.com",
  "role": "admin"
}
```

## Hooks

### useAdminCheck
```typescript
import { useAdminCheck } from '@/hooks/useAdminCheck';

export default function MyComponent() {
  const { isAdmin, checking, user } = useAdminCheck();
  
  if (checking) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access Denied</div>;
  
  return <div>Admin Content</div>;
}
```

## Features

- ✅ Role-based access control (Admin only)
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Dark mode support
- ✅ Charts & Statistics
- ✅ User management
- ✅ Activity logging
- ✅ Navigation with submenu
- ✅ User profile dropdown with logout

## Customization

### Thay đổi màu theme
Tất cả components sử dụng Tailwind CSS và gradient từ rose-500 to pink-500. Để thay đổi, hãy sửa class names trong các files.

### Thêm menu items
Chỉnh sửa `menuItems` array trong `admin-sidebar.tsx`:

```typescript
const menuItems = [
  {
    icon: Home,
    label: 'Tên mục',
    href: '/admin/path',
  },
  // ...
];
```

### Thêm stats
Chỉnh sửa `stats` array trong `dashboard-stats.tsx`:

```typescript
const stats: StatCard[] = [
  {
    icon: Users,
    label: 'Label',
    value: '0',
    change: '+0%',
    positive: true,
  },
  // ...
];
```

## Authentication

Admin dashboard tự động kiểm tra:
1. User đã login hay chưa (redirect to login)
2. User có role = 'admin' hay không (redirect to home)

Điều này được xử lý bởi `AdminLayout` component sử dụng hook `useAdminCheck()`.

## Routes

- `/admin` - Dashboard chính
- `/admin/users` - Quản lý người dùng
- `/admin/analytics` - Thống kê & Báo cáo
- `/admin/products` - Quản lý sản phẩm
- `/admin/orders` - Quản lý đơn hàng
- `/admin/support` - Hỗ trợ khách hàng
- `/admin/content` - Quản lý nội dung
- `/admin/security` - An ninh & Quyền hạn
- `/admin/settings` - Cài đặt hệ thống

## Notes

- Logo sử dụng từ `/public/IMG_0174.PNG`
- Tất cả text đã được chuyển sang tiếng Việt
- Components hoàn toàn responsive
- Hỗ trợ dark mode
