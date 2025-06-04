import './globals.css';
import type { Metadata } from 'next';
import CanvasBackground from './components/CanvasBackground';
import { Inter, Roboto_Mono } from 'next/font/google'; // Use supported Google Fonts
import Navbar from './components/Navbar';

// Load Inter as the sans-serif font
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Load Roboto Mono as the monospace font
const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Prathamesh Nehete - Portfolio',
  description: 'Portfolio website for Prathamesh Nehete',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable}`}>
        {/* Canvas Background - Fixed behind everything */}
        <CanvasBackground />

        {/* Main App Container */}
        <div className="relative">
          {/* Navigation */}
          <header>
            <Navbar />
          </header>

          {/* Main Content */}
          <main className="relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}