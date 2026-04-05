import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { AuthOptions } from 'next-auth';

type FastApiLoginUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  is_active?: boolean;
};

function normalizeBaseUrl(baseUrl?: string): string {
  if (!baseUrl) return 'http://localhost:3000';
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) return baseUrl;
  return `http://${baseUrl}`;
}

export const authConfig: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember me', type: 'checkbox' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) {
          return null;
        }

        // NextAuth runs server-side; call our Next.js wrapper which forwards to FastAPI.
        const rememberMeRaw = (credentials as any)?.rememberMe;
        const rememberMe =
          rememberMeRaw === true ||
          rememberMeRaw === 'true' ||
          rememberMeRaw === 1 ||
          rememberMeRaw === '1';

        try {
          const appBaseUrl = normalizeBaseUrl(process.env.NEXTAUTH_URL);
          const url = new URL('/api/auth/fastapi/login', appBaseUrl);

          const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              rememberMe,
            }),
          });

          if (!res.ok) return null;

          const data = (await res.json().catch(() => null)) as any;
          const user: FastApiLoginUser | null = (data?.user ?? data) ?? null;

          if (!user) return null;
          if (user.is_active === false) return null;
          if (user.role !== 'admin' && user.role !== 'staff') return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
