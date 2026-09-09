'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  X, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function StudentLoginModal() {
  const { isStudentModalOpen, setIsStudentModalOpen, refreshUser } = useStore();

  const [usernameOrNisn, setUsernameOrNisn] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isStudentModalOpen) return null;

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

      await refreshUser();

      // Role Check
      if (data.user.role === 'admin' || data.user.role === 'kasir' || data.user.role === 'petugas') {
        setSuccessMsg(`Login Petugas (${data.user.name}) Berhasil! Mengalihkan...`);
        setTimeout(() => {
          setIsStudentModalOpen(false);
          window.location.href = '/admin/dashboard';
        }, 800);
        return;
      }

      setSuccessMsg(`Selamat datang, ${data.user.name}!`);
      setTimeout(() => {
        setIsStudentModalOpen(false);
      }, 500);
    } catch {
      setErrorMsg('Gagal terhubung ke server.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200/80 relative animate-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={() => setIsStudentModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold mb-2.5 shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Masuk Akun Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Silakan login untuk memesan di koperasi
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-3.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-3.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              NISN / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={usernameOrNisn}
                onChange={(e) => setUsernameOrNisn(e.target.value)}
                placeholder="Contoh: 0061234567 atau nayra"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 text-xs"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center space-y-1">
          <p className="text-[11px] text-slate-400">
            Belum punya akun? Hubungi pengurus koperasi.
          </p>
          <div>
            <a
              href="/admin/login"
              className="text-[10px] font-semibold text-slate-500 hover:text-blue-600 transition inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span>Login Petugas / Admin &rarr;</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
