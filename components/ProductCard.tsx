'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check, Plus, Eye, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { useStore, formatRupiah } from '@/lib/store';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cart } = useStore();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cartItem = cart.find((item) => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500/80 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Product Image / Visual container */}
      <Link
        href={`/produk/${product.slug}`}
        className="relative block aspect-[4/3] sm:aspect-square bg-slate-100 overflow-hidden"
      >
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 group-hover:scale-105 transition-transform duration-500">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-blue-100 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        )}

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/95 backdrop-blur-md text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200/60 uppercase tracking-wider">
            {product.categoryName || 'SMKN 11'}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          {product.stock > 0 ? (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Stok: {product.stock}
            </span>
          ) : (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Habis
            </span>
          )}
        </div>

        {/* Quick View hint on hover */}
        <div className="absolute bottom-3 left-3 right-3 z-10 hidden group-hover:flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white/95 backdrop-blur-md rounded-xl text-slate-800 text-xs font-semibold shadow-md transition-all">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Lihat Detail</span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/produk/${product.slug}`} className="block group-hover:text-blue-600 transition">
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price & Action Row */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Harga Sekolah</span>
            <span className="text-base font-extrabold text-blue-600 tracking-tight">
              {formatRupiah(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
              product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : inCartQty > 0
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 animate-bounce" />
                <span>Ditambah</span>
              </>
            ) : inCartQty > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
                <span>{inCartQty} di Keranjang</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
