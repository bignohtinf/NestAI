import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AppProvider } from '@/lib/context'
import { ThemeProvider } from '@/components/theme-provider'
import { ErrorBoundary } from '@/components/error-boundary'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#ffffff' }],
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'NestAI – Dinh Dưỡng Thai Kỳ',
  description: 'Trợ lý dinh dưỡng AI cá nhân hóa cho mẹ bầu và mẹ cho con bú tại Việt Nam — thực đơn theo tuần thai, theo bệnh lý, món Việt quen thuộc.',
  icons: {
    icon: [
      {
        url: '/layout.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/layout.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>
            <AppProvider>
              {children}
            </AppProvider>
          </ErrorBoundary>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
