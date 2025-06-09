import './globals.css';
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import Navbar from './components/Navbar';
import FluidCanvas from './components/FluidCanvas';

// Load Inter as the primary font
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Load Roboto Mono as the monospace font
const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prathamesh Nehete - Portfolio',
  description: 'Full-stack developer and UI/UX designer. Explore my projects, skills, and professional journey.',
  keywords: 'Prathamesh Nehete, Portfolio, Web Developer, Full Stack Developer, React, Next.js, TypeScript',
  authors: [{ name: 'Prathamesh Nehete' }],
  creator: 'Prathamesh Nehete',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Prathamesh Nehete - Portfolio',
    description: 'Full-stack developer and UI/UX designer portfolio',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prathamesh Nehete - Portfolio',
    description: 'Full-stack developer and UI/UX designer portfolio',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased bg-black text-white overflow-x-hidden">
        {/* Fluid Background Canvas - Fixed behind everything */}
        <FluidCanvas 
          
        />

        {/* Main App Container */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Navigation */}
          <header className="relative z-20">
            <Navbar />
          </header>

          {/* Main Content */}
          <main className="relative z-10 flex-1">
            {children}
          </main>

          {/* Optional Footer */}
          <footer className="relative z-20 mt-auto">
            {/* Footer content can go here */}
          </footer>
        </div>

        
      </body>
    </html>
  );
}
