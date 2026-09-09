'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react';
import { useStore, formatRupiah } from '@/lib/store';

export default function KeranjangPage() {
  const router = useRouter();
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    isHydrated, 
    currentUser, 
    requireStudentAuth 
  } = useStore();

  if (!isHydrated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        Memuat keranjang belanja...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Keranjang Belanja Kamu Masih Kosong</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Yuk cari seragam resmi, dasi, topi upacara, atau jajanan koperasi yang kamu butuhkan sekarang.
          </p>
        </div>
        <div>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-200 transition active:scale-95"
          >
            <span>Mulai Belanja</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    requireStudentAuth(() => {
      router.push('/checkout');
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Keranjang Belanja
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Periksa item pesanan kamu sebelum lanjut ke pembayaran
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Kosongkan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs divide-y divide-slate-100">
          {cart.map(({ product, quantity }) => (
            <div key={product.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
              {/* Product Thumbnail */}
              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-7 h-7 text-blue-500" />
              </div>

              {/* Title & Price */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/produk/${product.slug}`}
                  className="font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-600 transition truncate block"
                >
                  {product.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-blue-600">
                    {formatRupiah(product.price)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Stok: {product.stock} {product.unit || 'pcs'}
                  </span>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                <button
                  onClick={() => updateCartQty(product.id, quantity - 1)}
                  className="p-1 rounded text-slate-600 hover:bg-white transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => updateCartQty(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="p-1 rounded text-slate-600 hover:bg-white transition cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtotal Item */}
              <div className="text-right min-w-[5rem]">
                <div className="font-bold text-xs sm:text-sm text-slate-900">
                  {formatRupiah(product.price * quantity)}
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-[10px] text-rose-500 hover:underline mt-0.5 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 sticky top-24">
          <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
            Ringkasan Pesanan
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Total Item:</span>
              <strong className="text-slate-900">
                {cart.reduce((s, i) => s + i.quantity, 0)} barang
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal:</span>
              <strong className="text-slate-900">{formatRupiah(cartTotal)}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Pengambilan:</span>
              <span>Dipilih di Checkout</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">Total Pembayaran</span>
              <span className="text-xl font-black text-blue-600 tracking-tight">
                {formatRupiah(cartTotal)}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition active:scale-95 cursor-pointer"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!currentUser && (
              <p className="text-[10px] text-amber-600 text-center mt-2 font-medium flex items-center justify-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Wajib masuk akun siswa saat checkout</span>
              </p>
            )}

            <Link
              href="/katalog"
              className="w-full mt-2 py-2.5 px-4 text-center block text-slate-600 hover:text-blue-600 font-semibold text-xs transition"
            >
              ← Tambah Barang Lain
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
