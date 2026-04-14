'use client';

import './globals.css';
import Providers from '../components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-warm-ivory" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fa520f" />
      </head>
      <body className="h-full antialiased text-mistral-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
