import './globals.css'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ToastProvider } from '../contexts/ToastContext'
import { I18nProvider } from '../contexts/I18nContext'
import { AmbientGlowProvider } from '../contexts/AmbientGlowContext'
import { ScreenReaderAnnouncerProvider } from '../components/ui/ScreenReaderAnnouncer'
import { WebVitalsReporter } from '../components/WebVitalsReporter'
import { ErrorBoundary } from '../components/ErrorBoundary'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body-next',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display-next',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
})

export const metadata: Metadata = {
  title: 'Folio',
  description: 'Simple budgeting for college students and young adults',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Folio',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#12121f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" className={`${dmSans.variable} ${fraunces.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-background text-foreground">
        <WebVitalsReporter />
        <ErrorBoundary>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                <ToastProvider>
                  <AmbientGlowProvider>
                    <ScreenReaderAnnouncerProvider>
                      {children}
                    </ScreenReaderAnnouncerProvider>
                  </AmbientGlowProvider>
                </ToastProvider>
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
