import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Cormorant_Garamond, Fraunces } from 'next/font/google';
import Navbar from './components/Navbar';
import FluidCanvas from './components/FluidCanvas';
import Starfield from './components/Starfield';
import Providers from './providers';
import { Analytics } from "@vercel/analytics/next"

// Classic book-typography serif — used for the "scroll" coursework section
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Modern editorial serif with personality — for narrative sections like My Story
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prathamesh Nehete - Data Scientist & ML Engineer',
  description: 'Data scientist and machine learning engineer. Northwestern MSDS (AI concentration). Explore my projects in analytics, statistical modeling, and AI.',
  keywords: 'Prathamesh Nehete, Data Scientist, Machine Learning, AI, Analytics, Northwestern, MSDS, Python, R, Statistics, Deep Learning',
  authors: [{ name: 'Prathamesh Nehete' }],
  creator: 'Prathamesh Nehete',
  robots: 'index, follow',
  openGraph: {
    title: 'Prathamesh Nehete - Data Scientist & ML Engineer',
    description: 'Data scientist and ML engineer. Northwestern MSDS with AI concentration.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prathamesh Nehete - Data Scientist & ML Engineer',
    description: 'Data scientist and ML engineer. Northwestern MSDS with AI concentration.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable} ${fraunces.variable}`}>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <script defer src="https://t.raah.dev/script.js" data-pid="proj_eewqwa3njk7g09r4" data-domain="mewebsite-delta.vercel.app"></script>
      </head>
      <body className="font-sans antialiased bg-white dark:bg-black text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-500">
        <Providers>
          {/* Starry space layer */}
          <Starfield />

          {/* Fluid Background Canvas - transparent, sits over starfield */}
          <FluidCanvas />

          {/* Main App Container */}
          <div className="relative z-10 min-h-screen flex flex-col">
            {/* Navigation */}
            <header className="relative z-20">
              <Navbar />
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1">{children}</main>

            {/* Optional Footer */}
            <footer className="relative z-20 mt-auto">
              {/* Footer content can go here */}
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
