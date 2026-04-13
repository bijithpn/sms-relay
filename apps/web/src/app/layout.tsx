'use client';

import './globals.css';
import Providers from '../components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="h-full antialiased text-slate-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
