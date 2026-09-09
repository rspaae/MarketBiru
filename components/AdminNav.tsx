'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  QrCode, 
  Store, 
  RotateCcw,
  LogOut,
  User,
  Users,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { AuthUser } from '@/lib/auth';

import ConfirmModal from '@/components/ConfirmModal';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { orders, resetToDefault } = useStore();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetSuccessModalOpen, setIsResetSuccessModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    try {
      localStorage.removeItem('smkn11_current_user');
    } catch (e) {}
    window.location.href = '/admin/login';
  };

  const handleResetConfirm = () => {
    resetToDefault();
    setIsResetModalOpen(false);
    setIsResetSuccessModalOpen(true);
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Pesanan',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      name: 'Laporan & Omset',
      href: '/admin/laporan',
      icon: TrendingUp,
    },
    {
      name: 'Produk',
      href: '/admin/products',
      icon: Package,
    },
    {
      name: 'Pengguna',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'Scanner QR',
      href: '/admin/scan',
      icon: QrCode,
      highlight: true,
    },
  ];

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-md">
                11
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    PANEL KASIR & PENGELOLA
                  </span>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                    {currentUser?.role || 'ADMIN'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {currentUser ? `Halo, ${currentUser.name}` : 'Koperasi SMKN 11 Bandung'}
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition ${
                      item.highlight
                        ? 'bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs'
                        : isActive
                        ? 'bg-slate-800 text-blue-400 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                title="Reset Data ke Default"
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700"
              >
                <Store className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Lihat Toko Siswa</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                disabled={loggingOut}
                title="Keluar dari Akun Admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-bold transition border border-rose-500/30 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Nav Bar */}
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-[11px] font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
                    isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name.replace('Manajemen ', '')}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 rounded-lg flex flex-col items-center gap-1 text-rose-400 hover:text-rose-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modern Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari sesi petugas koperasi saat ini?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        variant="danger"
        icon="logout"
        isLoading={loggingOut}
      />

      {/* Modern Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Data ke Default"
        description="Tindakan ini akan mengembalikan data katalog 7 seragam resmi SMKN 11 dan membersihkan riwayat pesanan demo lokal."
        confirmText="Reset Data"
        cancelText="Batal"
        variant="warning"
        icon="reset"
      />

      {/* Reset Success Modal */}
      <ConfirmModal
        isOpen={isResetSuccessModalOpen}
        onClose={() => setIsResetSuccessModalOpen(false)}
        onConfirm={() => setIsResetSuccessModalOpen(false)}
        title="Data Berhasil Direset"
        description="Katalog produk dan pesanan telah dikembalikan ke kondisi awal SMKN 11 Bandung."
        confirmText="Tutup"
        cancelText="OK"
        variant="success"
        icon="check"
      />
    </>
  );
}
