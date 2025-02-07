import type { Metadata } from 'next';
import { VT323 } from 'next/font/google';
import './globals.css';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Agent Strategy',
  description:
    'A swarm of autonomous agents analyzing, trading and managing a portfolio of AI agent tokens.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${vt323.className} antialiased`}>{children}</body>
    </html>
  );
}
