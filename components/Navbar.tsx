'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  User,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { AuthUser } from '@/lib/auth';

export default function Navbar() {
  const { cartCount, isHydrated } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    try {
      localStorage.removeItem('smkn11_current_user');
    } catch (_) {}
    setCurrentUser(null);
    window.location.href = '/';
  };

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
              href="/admin/login"
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

            {/* Right Action: Student User & Cart */}
            <div className="flex items-center gap-3">
              
              {/* User / Student / Staff Login Status */}
              {currentUser ? (
                currentUser.role === 'admin' || currentUser.role === 'kasir' || currentUser.role === 'petugas' ? (
                  <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-2xl">
                    <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <div className="font-bold text-slate-900 max-w-[120px] truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-amber-700 font-extrabold uppercase">
                        {currentUser.role === 'admin' ? '👑 Admin Utama' : currentUser.role === 'kasir' ? '🏷️ Kasir' : '🛡️ Petugas'}
                      </div>
                    </div>
                    <Link
                      href="/admin/dashboard"
                      className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded-lg font-bold transition ml-1 shrink-0"
                    >
                      Dashboard &rarr;
                    </Link>
                    <button
                      onClick={handleLogout}
                      title="Keluar Akun"
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 px-3 py-1.5 rounded-2xl">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <div className="font-bold text-slate-900 max-w-[120px] truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-blue-700 font-semibold">
                        {currentUser.student_class || 'Siswa SMKN 11'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      title="Keluar Akun"
                      className="p-1 text-slate-400 hover:text-rose-600 transition ml-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              ) : (
                <Link
                  href="/masuk"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-xl transition border border-slate-200/70"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Masuk Siswa</span>
                </Link>
              )}

              {/* Cart Button */}
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
              {currentUser ? (
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{currentUser.name}</div>
                      <div className="text-[10px] text-blue-700 font-semibold">
                        {currentUser.student_class || currentUser.role}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-rose-600 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/masuk"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white font-bold transition shadow-sm"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Masuk / Daftar Akun Siswa</span>
                </Link>
              )}

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
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-700 font-semibold bg-amber-50 transition"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Portal Admin & Kasir</span>
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
            href="/masuk"
            className={`flex flex-col items-center gap-1 py-1 rounded-xl transition ${
              pathname === '/masuk' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">{currentUser ? 'Akun' : 'Masuk'}</span>
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
