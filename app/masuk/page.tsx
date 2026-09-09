'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Lock, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Loader2,
  ShieldCheck
} from 'lucide-react';

function StudentAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [usernameOrNisn, setUsernameOrNisn] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check if already logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          if (data.user.role === 'admin' || data.user.role === 'kasir' || data.user.role === 'petugas') {
            router.replace('/admin/dashboard');
          } else {
            router.replace(redirectUrl);
          }
        }
      })
      .catch(() => {});
  }, [router, redirectUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrNisn.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'NISN / Username atau password salah.');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined' && data.user) {
        try {
          localStorage.setItem('market_biru_user', JSON.stringify(data.user));
        } catch (e) {}
      }

      if (data.user.role === 'admin' || data.user.role === 'kasir' || data.user.role === 'petugas') {
        setSuccessMsg(`Login Petugas (${data.user.role.toUpperCase()}) Berhasil! Mengalihkan...`);
        setTimeout(() => {
          router.replace('/admin/dashboard');
        }, 800);
        return;
      }

      setSuccessMsg(`Selamat datang, ${data.user.name}!`);
      setTimeout(() => {
        router.replace(redirectUrl);
      }, 600);
    } catch {
      setErrorMsg('Gagal terhubung ke server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm">
        
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Toko</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold mb-3 shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Masuk Akun Siswa
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Koperasi SMKN 11 Bandung
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                NISN / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={usernameOrNisn}
                  onChange={(e) => setUsernameOrNisn(e.target.value)}
                  placeholder="Contoh: 0061234567 atau nayra"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs font-medium"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center space-y-1.5">
            <p className="text-[11px] text-slate-400">
              Akun siswa didaftarkan oleh pengurus koperasi sekolah.
            </p>
            <div>
              <a
                href="/admin/login"
                className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Portal Admin & Kasir &rarr;</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function StudentAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center p-8 text-slate-400 text-xs">
          Memuat halaman masuk...
        </div>
      }
    >
      <StudentAuthContent />
    </Suspense>
  );
}
