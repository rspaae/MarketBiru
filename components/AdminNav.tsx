'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  QrCode, 
  Store, 
  ShieldCheck, 
  RotateCcw 
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminNav() {
  const pathname = usePathname();
  const { orders, resetToDefault } = useStore();

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Manajemen Pesanan',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      name: 'Manajemen Produk',
      href: '/admin/products',
      icon: Package,
    },
    {
      name: 'Scanner QR Kasir',
      href: '/admin/scan',
      icon: QrCode,
      highlight: true,
    },
  ];

  return (
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
                <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Koperasi SMKN 11 Bandung</p>
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Reset semua data produk & pesanan ke data awal SMKN 11?')) {
                  resetToDefault();
                  alert('Data berhasil di-reset!');
                }
              }}
              title="Reset Data ke Default"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Lihat Toko Siswa</span>
            </Link>
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
        </div>
      </div>
    </header>
  );
}
