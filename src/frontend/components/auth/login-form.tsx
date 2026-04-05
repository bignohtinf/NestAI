'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        rememberMe,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email hoặc mật khẩu không đúng');
        setPassword('');
      } else if (result?.ok) {
        toast.success('Đăng nhập thành công');
        // Get session to determine redirect
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        const userRole = session?.user?.role;
        
        if (userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push('/staff');
        }
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="admin@school.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Mật khẩu
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          disabled={isLoading}
        />
        <label
          htmlFor="rememberMe"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Ghi nhớ đăng nhập
        </label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>

      <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm">
        <p className="font-semibold">Tài khoản Demo:</p>
        <p>Admin: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">admin@school.edu</code> / <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Admin@123</code></p>
        <p>Staff: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">staff1@school.edu</code> / <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Staff@123</code></p>
      </div>
    </form>
  );
}
