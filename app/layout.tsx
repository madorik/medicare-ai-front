import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'MediCare AI',
  description: 'Created with 민균',
  generator: 'mgjeong',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense 코드 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6951210541539723"
          crossOrigin="anonymous"
        />
        {/* Google Analytics GA4 태그 */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JP7BEMQ18S"
          strategy="afterInteractive"
        />
        <Script
          id="ga-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-JP7BEMQ18S');
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Google AdSense 코드 - body 끝에 추가 */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const script = document.createElement('script');
                script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6951210541539723';
                script.async = true;
                script.crossOrigin = 'anonymous';
                document.head.appendChild(script);
              })();
            `
          }}
        />
      </body>
    </html>
  )
}
