'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Truck, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Tag, 
  Shirt, 
  BookOpen, 
  Coffee,
  Zap,
  Users,
  Award,
  ChevronRight
} from 'lucide-react';
import { useStore } from '@/lib/store';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const { categories, products } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeProducts = products.filter((p) => p.isActive);

  const filteredProducts = activeProducts.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'seragam-atribut-resmi':
        return <Tag className="w-4 h-4" />;
      case 'pakaian-praktik-jurusan':
        return <Shirt className="w-4 h-4" />;
      case 'buku-perlengkapan-belajar':
        return <BookOpen className="w-4 h-4" />;
      case 'merchandise-kejuruan':
        return <Sparkles className="w-4 h-4" />;
      case 'kantin-sehat-koperasi':
        return <Coffee className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-12 pb-24 sm:pb-16">
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_60%)] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading & Quick Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Koperasi Digital Siswa SMKN 11 Bandung</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Pesan Seragam & Kebutuhan Sekolah,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                  Tinggal Scan QR di Koperasi!
                </span>
              </h1>

              <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                Beli atribut resmi, dasi bordir, topi upacara, wearpack kejuruan, buku jurnal PKL, hingga jajanan kantin sehat tanpa antre lama.
              </p>

              {/* Quick Search Bar */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari dasi, wearpack RPL, topi, buku PKL..."
                    className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-slate-800 placeholder-slate-400 text-sm shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Statistics Badges */}
              <div className="pt-4 grid grid-cols-3 gap-2.5 sm:gap-3 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <QrCode className="w-5 h-5 text-amber-300 mb-1" />
                  <h4 className="text-xs font-bold text-white">QR Code Cepat</h4>
                  <p className="text-[10px] text-blue-200">Scan instan di kasir</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <Truck className="w-5 h-5 text-emerald-300 mb-1" />
                  <h4 className="text-xs font-bold text-white">Bisa Diantar</h4>
                  <p className="text-[10px] text-blue-200">Langsung ke kelas</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-sky-300 mb-1" />
                  <h4 className="text-xs font-bold text-white">Resmi SMKN 11</h4>
                  <p className="text-[10px] text-blue-200">Standar tata tertib</p>
                </div>
              </div>
            </div>

            {/* Right Column: Steps Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-400 text-blue-950 font-black flex items-center justify-center text-sm shadow-md">
                      11
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Alur Belanja Siswa</h3>
                      <p className="text-[11px] text-blue-200">3 Langkah simpel & cepat</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Sistem Aktif
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                      1
                    </span>
                    <div>
                      <strong className="text-white block">Pilih Barang & Checkout</strong>
                      <p className="text-blue-200 text-[11px] mt-0.5">Pilih ambil di koperasi atau antar langsung ke ruang kelas.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                      2
                    </span>
                    <div>
                      <strong className="text-white block">Dapatkan Nota & QR Code</strong>
                      <p className="text-blue-200 text-[11px] mt-0.5">Nota digital & QR Barcode tersimpan otomatis di handphone kamu.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                      3
                    </span>
                    <div>
                      <strong className="text-white block">Scan di Kasir $\rightarrow$ Selesai!</strong>
                      <p className="text-blue-200 text-[11px] mt-0.5">Petugas scan QR, serahkan barang, tanpa perlu antre panjang.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/katalog"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg transition"
                  >
                    <span>Mulai Belanja Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area: Categories & Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Category Header & Filter Pills */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Kategori Produk
              </h2>
              <p className="text-xs text-slate-500">Pilih kategori barang perlengkapan sekolah</p>
            </div>
            <Link
              href="/katalog"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              <span>Lihat Semua ({products.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Semua Kategori ({products.length})</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Banner for Jurusan & Wearpack */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-blue-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current" /> Rekomendasi Jurusan
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Wearpack Praktik & Seragam Jurusan RPL, TKJ & DKV
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Bahan American Drill tebal berkualitas tinggi dengan bordir komputer emblem resmi SMKN 11 Bandung.
            </p>
          </div>
          <Link
            href="/katalog?cat=pakaian-praktik-jurusan"
            className="z-10 px-6 py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-2 whitespace-nowrap active:scale-95"
          >
            <span>Beli Seragam Jurusan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Daftar Barang Koperasi ({filteredProducts.length})
            </h3>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Hapus Pencarian &ldquo;{searchQuery}&rdquo;
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-base">Tidak ada produk ditemukan</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Coba cari dengan kata kunci lain atau ubah pilihan filter kategori di atas.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
