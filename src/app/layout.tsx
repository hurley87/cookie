import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
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
      <body
        className={`${spaceGrotesk.className} antialiased text-white tracking-wide leading-relaxed relative min-h-screen overflow-x-hidden`}
        style={{
          background: `
            radial-gradient(circle at 50% -20%, rgba(120, 119, 198, 0.3), rgba(17, 24, 39, 0) 70%),
            radial-gradient(circle at 100% 0%, rgba(79, 70, 229, 0.25), rgba(79, 70, 229, 0) 60%),
            radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0) 60%),
            radial-gradient(circle at 50% 50%, rgba(17, 24, 39, 0), rgba(17, 24, 39, 1) 100%),
            linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 1) 100%)
          `,
          backgroundBlendMode: 'normal',
          textShadow: '0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5,#0ea5e9)] opacity-[0.015] pointer-events-none"
          style={{
            maskImage:
              'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="none"/%3E%3Cpath d="M0 0h1v1H0zM4 4h1v1H4zM8 8h1v1H8zM12 12h1v1h-1zM16 16h1v1h-1z" fill="rgba(255,255,255,0.1)"/%3E%3C/svg%3E")',
            maskSize: '20px 20px',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.01] pointer-events-none"
          style={{
            background:
              'linear-gradient(45deg, transparent 48%, #4f46e5 48%, #4f46e5 52%, transparent 52%)',
            backgroundSize: '300px 300px',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none animate-pulse"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.3) 0%, transparent 60%)',
            backgroundSize: '100% 100%',
          }}
        />
        <nav className="flex justify-between items-center max-w-screen mx-auto w-full container">
          <Link
            href="/"
            className="text-xl font-bold hover:text-indigo-400 transition-colors duration-200"
          >
            AgentStrategy
          </Link>
          <ul className="flex space-x-6 text-lg font-medium p-6">
            <li>
              <Link
                href="/"
                className="hover:text-indigo-400 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Analyst
              </Link>
            </li>
            <li>
              <Link
                href="/trades"
                className="hover:text-indigo-400 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Trader
              </Link>
            </li>
          </ul>
        </nav>
        <div className="container mx-auto py-6 px-4 max-w-2xl">{children}</div>
      </body>
    </html>
  );
}
