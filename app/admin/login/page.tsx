'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  Building2,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Database status
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [checkingDb, setCheckingDb] = useState(true);

  useEffect(() => {
    // Check if already logged in
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          if (data.user.role === 'admin' || data.user.role === 'kasir' || data.user.role === 'petugas') {
            router.replace('/admin/dashboard');
          }
        }
      })
      .catch(() => {});

    // Check DB connection
    fetch('/api/db/test')
      .then(async (res) => {
        const data = await res.json();
        setDbStatus(data);
      })
      .catch(() => {
        setDbStatus({
          connected: false,
          message: 'Supabase Cloud belum terhubung atau skema belum diimport.',
        });
      })
      .finally(() => setCheckingDb(false));
  }, [router]);

  const [initLoading, setInitLoading] = useState(false);

  const handleInitDb = async () => {
    setInitLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/db/init', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        setDbStatus({ connected: true, message: 'Database Supabase aktif dan terhubung!' });
      } else {
        setErrorMsg(data.message || 'Gagal sinkronisasi database.');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke Supabase Cloud.');
    } finally {
      setInitLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !password) {
      setErrorMsg('Harap isi username/email dan password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Login gagal. Periksa kembali username dan password Anda.');
        setLoading(false);
        return;
      }

      // Role check
      if (data.user.role === 'siswa') {
        setSuccessMsg(`Anda login sebagai Siswa (${data.user.name}). Mengalihkan ke Halaman Belanja...`);
        setTimeout(() => {
          router.replace('/katalog');
        }, 800);
        return;
      }

      setSuccessMsg(`Login Petugas (${data.user.role.toUpperCase()}) Berhasil! Mengalihkan ke Dashboard...`);
      setTimeout(() => {
        router.replace('/admin/dashboard');
      }, 700);
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan jaringan atau server tidak merespons.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/30 text-white font-black text-2xl mb-4 border border-white/20">
            11
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Portal Admin Koperasi
          </h1>
          <p className="text-blue-200/80 text-sm mt-1 flex items-center justify-center gap-1.5 font-medium">
            <Building2 className="w-4 h-4 text-blue-400" />
            SMK Negeri 11 Kota Bandung
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40 shadow-black/40">
          
          {/* DB Status Badge */}
          <div className="mb-6">
            <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
              checkingDb 
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : dbStatus?.connected 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <Database className={`w-4 h-4 shrink-0 mt-0.5 ${
                checkingDb 
                  ? 'text-slate-500 animate-spin'
                  : dbStatus?.connected 
                    ? 'text-emerald-600' 
                    : 'text-amber-600'
              }`} />
              <div className="flex-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Status Cloud Database Supabase:</span>
                  {checkingDb ? (
                    <span className="text-slate-500">Mengecek...</span>
                  ) : dbStatus?.connected ? (
                    <span className="text-emerald-700 font-black">Terhubung (Supabase PostgreSQL)</span>
                  ) : (
                    <span className="text-amber-700 font-bold">Fallback Siap</span>
                  )}
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {checkingDb
                    ? 'Memeriksa koneksi ke Supabase Cloud...'
                    : dbStatus?.connected
                      ? 'Koneksi ke Supabase PostgreSQL cloud database aktif.'
                      : 'Supabase Cloud belum terhubung atau skema belum diimport.'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInitDb}
                    disabled={initLoading}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-[10px] font-bold shadow-2xs transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {initLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Menyinkronkan...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>⚡ Sinkronkan Data Awal Supabase</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition duration-200 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Sesi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-blue-300/60 mt-6">
          © {new Date().getFullYear()} Koperasi Siswa Market Biru SMKN 11 Bandung
        </p>
      </div>
    </div>
  );
}
