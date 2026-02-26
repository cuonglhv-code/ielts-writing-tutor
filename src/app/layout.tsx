import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jaxtina IELTS Writing Tutor',
  description:
    'Practice IELTS Writing Task 1 and Task 2 with AI-powered examiner feedback and personalised coaching.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
