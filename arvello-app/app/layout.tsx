import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif-4',
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arvello Living | Minimalist Design & Curated Spaces',
  description:
    'A curated guide to sophisticated simplicity in modern design. Explore luxury interiors, minimalist desk setups, and editorial lifestyle articles.',
  openGraph: {
    title: 'Arvello Living | Minimalist Design & Curated Spaces',
    description: 'A curated guide to sophisticated simplicity in modern design.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${sourceSerif4.variable}`}
    >
      <body className="bg-background text-foreground antialiased font-sans flex flex-col min-h-screen">
        <Navbar />
        {/* Main Content container with paddingTop to account for fixed navbar */}
        <main className="flex-grow pt-24 pb-16">{children}</main>
        <footer className="py-8 border-t border-outline-variant/30 text-center text-xs text-foreground/40 font-sans">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Arvello Living. All rights reserved.</p>
            <p className="tracking-wider uppercase text-[10px] font-semibold text-foreground/30">Quiet Luxury & Curated Design</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
