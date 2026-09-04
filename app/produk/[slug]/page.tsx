'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  Truck, 
  Plus, 
  Minus, 
  ArrowLeft,
  Sparkles,
  Store,
  Clock,
  Share2
} from 'lucide-react';
import { useStore, formatRupiah } from '@/lib/store';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, addToCart } = useStore();
  const slug = params.slug as string;

  const product = products.find((p) => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-800">Produk Tidak Ditemukan</h1>
        <p className="text-sm text-slate-500">Barang yang kamu cari mungkin sudah dihapus atau diganti.</p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const isWearable = product.categoryId === 'cat-1' || product.categoryId === 'cat-2';
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isActive)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 sm:pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 overflow-hidden">
          <Link href="/" className="hover:text-blue-600 transition shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/katalog" className="hover:text-blue-600 transition shrink-0">
            Katalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-slate-800 font-semibold truncate">{product.name}</span>
        </nav>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition shrink-0"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Disalin!' : 'Bagikan'}</span>
        </button>
      </div>

      {/* Main Product Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Product Image Container */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="aspect-square rounded-3xl bg-slate-100 border border-slate-200/80 overflow-hidden relative shadow-inner">
              {product.image && !imgError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50/50">
                  <div className="w-24 h-24 rounded-3xl bg-white shadow-md border border-blue-100 flex items-center justify-center text-blue-600">
                    <ShoppingBag className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
              )}

              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/95 backdrop-blur-md text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-slate-200/60">
                  {product.categoryName || 'SMKN 11 Bandung'}
                </span>
              </div>
            </div>

            {/* Guarantees Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-700">100% Resmi SMKN 11</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Store className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-700">Ambil Bebas Antre</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Kode: {product.id}
                </span>
                {product.stock > 0 ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Stok: {product.stock} {product.unit || 'pcs'}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    Stok Habis
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                  {formatRupiah(product.price)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ {product.unit || 'pcs'}</span>
              </div>

              {/* Size Selector for Wearables */}
              {isWearable && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Pilihan Ukuran:</span>
                    <span className="text-blue-600 font-normal">Standar Siswa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                          selectedSize === size
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Box */}
              <div className="border-t border-b border-slate-100 py-4 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Deskripsi & Spesifikasi Produk
                </h4>
                <p>{product.description}</p>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs font-bold text-slate-700">Jumlah Beli:</span>
                <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 rounded-xl text-slate-600 hover:bg-white disabled:opacity-30 transition shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 rounded-xl text-slate-600 hover:bg-white disabled:opacity-30 transition shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  Total:{' '}
                  <strong className="text-slate-900 font-extrabold text-sm">
                    {formatRupiah(product.price * quantity)}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-95 ${
                    product.stock <= 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 animate-bounce" />
                      <span>Berhasil Ditambahkan!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Tambah ke Keranjang</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition active:scale-95 ${
                    product.stock <= 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
                  }`}
                >
                  Beli Sekarang
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Produk Terkait Lainnya
            </h3>
            <Link
              href={`/katalog?cat=${product.categoryId}`}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Lihat Kategori Ini
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
