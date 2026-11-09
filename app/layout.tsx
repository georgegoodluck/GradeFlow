import type { Metadata } from 'next';
import { Inter, Playfair_Display, Caveat } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' });

export const metadata: Metadata = {
  title: 'Grading App',
  description: 'Premium school grading and report cards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
