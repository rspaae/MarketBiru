'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [checkingAuth, setCheckingAuth] = useState(!isLoginPage);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    let isMounted = true;
    setCheckingAuth(true);

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data.authenticated) {
            setIsAuthenticated(true);
          } else {
            router.replace('/admin/login');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          router.replace('/admin/login');
        }
      })
      .finally(() => {
        if (isMounted) setCheckingAuth(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // Halaman login tidak menggunakan layout wrapper admin biasa
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Tampilkan loading saat verifikasi sesi
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">
            11
          </div>
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Memverifikasi Hak Akses Petugas...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <AdminNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
