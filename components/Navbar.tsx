'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  MapPin, 
  Receipt, 
  Shield, 
  Menu, 
  X, 
  Home, 
  Layers, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Navbar() {
  const { cartCount, isHydrated } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-950 text-blue-100 text-xs py-2 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Buka: Senin - Jumat (07:00 - 15:30 WIB)
            </span>
            <span className="hidden md:inline text-blue-500">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-blue-200">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Koperasi Siswa SMKN 11 Bandung (Jl. Budi Cilember)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/lacak-pesanan"
              className="hover:text-white transition flex items-center gap-1.5 font-semibold text-emerald-300 hover:underline"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              Lacak Pesanan
            </Link>
            <span className="text-blue-500">|</span>
            <Link
              href="/admin/dashboard"
              className="hover:text-amber-200 transition flex items-center gap-1.5 text-amber-400 font-semibold hover:underline"
            >
              <Shield className="w-3.5 h-3.5" />
              Panel Petugas
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* School Logo & Brand */}
            <Link href="/" className="flex items-center gap-3.5 group shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
                <img
                  src="/images/logo-smkn11.jpg"
                  alt="SMKN 11 Bandung"
                  className="w-full h-full object-cover rounded-[14px]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition">
                    MARKET BIRU
                  </span>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    SMKN 11
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Koperasi & Perlengkapan Siswa Resmi
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 text-sm font-semibold text-slate-600">
              <Link
                href="/"
                className={`px-4 py-2 rounded-xl transition ${
                  pathname === '/'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                Beranda
              </Link>
              <Link
                href="/katalog"
                className={`px-4 py-2 rounded-xl transition ${
                  pathname.startsWith('/katalog')
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                Katalog Lengkap
              </Link>
              <Link
                href="/lacak-pesanan"
                className={`px-4 py-2 rounded-xl transition ${
                  pathname === '/lacak-pesanan'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                Lacak Nota
              </Link>
            </nav>

            {/* Right Action: QR Kasir & Cart Button */}
            <div className="flex items-center gap-3">
              <Link
                href="/admin/scan"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition border border-slate-200/60"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                Scanner Kasir
              </Link>

              <Link
                href="/keranjang"
                className="relative inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition active:scale-95"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline">Keranjang</span>
                {isHydrated && cartCount > 0 ? (
                  <span className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow-xs animate-bounce">
                    {cartCount}
                  </span>
                ) : (
                  <span className="bg-blue-500/80 text-blue-100 font-bold text-xs px-2 py-0.5 rounded-full">
                    0
                  </span>
                )}
              </Link>

              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-100 space-y-2 text-sm font-medium animate-in fade-in slide-in-from-top-3 duration-200">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <Home className="w-4 h-4 text-blue-600" />
                <span>Beranda</span>
              </Link>
              <Link
                href="/katalog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Katalog Produk Koperasi</span>
              </Link>
              <Link
                href="/lacak-pesanan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Lacak Status & Cetak Nota</span>
              </Link>
              <Link
                href="/admin/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-blue-700 font-semibold bg-blue-50 transition"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>QR Scanner Petugas Kasir</span>
              </Link>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-700 font-semibold bg-amber-50 transition"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Dashboard Admin Koperasi</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Floating Bottom Bar for native app-like experience */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 px-3 py-2">
        <div className="grid grid-cols-4 items-center text-center">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 rounded-xl transition ${
              pathname === '/' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Beranda</span>
          </Link>
          <Link
            href="/katalog"
            className={`flex flex-col items-center gap-1 py-1 rounded-xl transition ${
              pathname.startsWith('/katalog') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Katalog</span>
          </Link>
          <Link
            href="/lacak-pesanan"
            className={`flex flex-col items-center gap-1 py-1 rounded-xl transition ${
              pathname === '/lacak-pesanan' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px]">Nota</span>
          </Link>
          <Link
            href="/keranjang"
            className={`relative flex flex-col items-center gap-1 py-1 rounded-xl transition ${
              pathname === '/keranjang' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px]">Keranjang</span>
            {isHydrated && cartCount > 0 && (
              <span className="absolute top-0 right-3 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}
