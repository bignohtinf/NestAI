# Authentication & RBAC Setup Guide

## Overview

This application uses **NextAuth.js v5** with **Supabase PostgreSQL** for authentication and role-based access control (RBAC).

## Architecture

### Database Schema

**Users Table** (`users`)
- `id` (UUID): Primary key
- `email` (VARCHAR): Unique identifier
- `name` (VARCHAR): User full name
- `password_hash` (VARCHAR): bcrypt hashed password
- `role` (VARCHAR): 'admin' or 'staff'
- `is_active` (BOOLEAN): Account status
- `remember_token` (VARCHAR): Optional token for "Remember Me"
- `last_login` (TIMESTAMP): Last login timestamp
- `created_at` (TIMESTAMP): Account creation date
- `updated_at` (TIMESTAMP): Last update date

### Roles & Permissions

#### Admin Role
- Access to `/admin` dashboard
- View all users in `/admin/users`
- Configure nutrition standards in `/admin/nutrition-config`
- Access all staff features

#### Staff Role
- Access to `/staff` dashboard
- Create/manage menus in `/staff/menu`
- Manage allergies in `/staff/allergies`
- Manage inventory in `/staff/inventory`

## Demo Credentials

### Admin Users
```
Email: admin@school.edu
Password: Admin@123

Email: admin2@school.edu
Password: Admin@123
```

### Staff Users
```
Email: staff1@school.edu to staff13@school.edu
Password: Staff@123
```

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

## Key Files

### Authentication Files
- `auth.ts` - NextAuth configuration wrapper
- `lib/auth.ts` - NextAuth configuration and Credentials provider
- `lib/auth-utils.ts` - Helper functions for auth (requireAuth, requireRole, etc.)
- `middleware.ts` - Route protection middleware

### Pages
- `app/login/page.tsx` - Login page
- `app/page.tsx` - Home page (redirects based on role)
- `app/admin/page.tsx` - Admin dashboard
- `app/admin/users/page.tsx` - User management table
- `app/admin/nutrition-config/page.tsx` - Nutrition standards config
- `app/staff/page.tsx` - Staff dashboard
- `app/staff/menu/page.tsx` - Menu creation
- `app/staff/allergies/page.tsx` - Allergy management
- `app/staff/inventory/page.tsx` - Inventory management

### Components
- `components/auth/login-form.tsx` - Login form with "Remember Me"
- `components/layout/sidebar.tsx` - Role-aware navigation sidebar
- `components/layout/main-layout.tsx` - Main layout wrapper
- `components/admin/users-table.tsx` - User management table

### Utilities
- `lib/navigation.ts` - Navigation items with role-based filtering

## Security Features

1. **Password Hashing**: do FastAPI backend xử lý (không còn bcryptjs trên Next.js)
2. **Session Management**: NextAuth.js JWT tokens with callbacks
3. **Route Protection**: Middleware protects sensitive routes
4. **Role-Based Access**: Sidebar hides unauthorized menu items
5. **Row Level Security**: RLS policies on Supabase tables

## How It Works

### Login Flow
1. User enters credentials on `/login`
2. LoginForm calls `signIn('credentials', {...})`
3. NextAuth passes credentials to Credentials provider
4. Provider queries Supabase users table
5. Password is verified with bcrypt
6. Session is created with user info and role
7. User is redirected based on role (admin → /admin, staff → /staff)

### Route Protection
1. Middleware checks every request
2. Public routes: `/login`, `/`
3. Protected routes: `/admin`, `/staff`
4. Unauthorized routes redirect to `/login` or `/unauthorized`

### Role-Based Navigation
1. Sidebar reads user role from session
2. Uses `getAvailableNavItems(userRole)` to filter menu items
3. Only shows routes the user has permission to access

## Customization

### Adding New Roles

1. Update database `role` check constraint
2. Update type definitions in `types/auth.ts`
3. Add role-based routes in middleware
4. Add navigation items in `lib/navigation.ts`

### Adding New Routes

1. Create route directory in `app/` with role prefix
2. Add route to `lib/navigation.ts` with allowed roles
3. Add protection in `middleware.ts` if needed
4. Sidebar will automatically show/hide based on role

### Modifying Password Requirements

Update password generation in the seed script and validation in login form.

## Testing

Use the demo credentials to test:
- Admin login and access admin features
- Staff login and access staff features
- Try accessing restricted routes to verify protection
- Check that sidebar only shows available menu items

## Troubleshooting

### "Table does not exist" error
- Ensure the SQL migration script was executed
- Check Supabase database tables exist

### Login not working
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
- Check user exists in database
- Verify password hash matches (demo users depend on FastAPI backend hashing)

### Session not persisting
- Ensure NEXTAUTH_SECRET is set
- Check browser cookies are enabled
- Verify NEXTAUTH_URL matches your domain

## Next Steps

1. Customize the dashboard layouts
2. Implement actual menu, allergy, and inventory features
3. Add edit/delete functionality to user management table
4. Set up proper error handling and logging
