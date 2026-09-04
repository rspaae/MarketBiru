import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Koperasi SMKN 11 Bandung - Toko & Kebutuhan Sekolah Online',
  description: 'Pesan seragam resmi, dasi, topi upacara, sabuk, wearpack jurusan, buku PKL, dan konsumsi koperasi SMKN 11 Bandung secara online.',
  icons: {
    icon: '/images/logo-smkn11.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="flex flex-col min-h-full bg-slate-50 text-slate-800 antialiased">
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
