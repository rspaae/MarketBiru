'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg">
                11
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">
                  KOPERASI SISWA
                </h3>
                <p className="text-xs text-blue-400">SMKN 11 KOTA BANDUNG</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pusat layanan perlengkapan sekolah, seragam resmi, atribut upacara, wearpack jurusan, buku PKL, dan kebutuhan harian siswa-siswi SMKN 11 Bandung.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Kategori Belanja
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/katalog?cat=seragam-atribut-resmi" className="hover:text-blue-400 transition">
                  Seragam & Atribut Resmi
                </Link>
              </li>
              <li>
                <Link href="/katalog?cat=pakaian-praktik-jurusan" className="hover:text-blue-400 transition">
                  Wearpack & Rompi Jurusan
                </Link>
              </li>
              <li>
                <Link href="/katalog?cat=buku-perlengkapan-belajar" className="hover:text-blue-400 transition">
                  Buku PKL & Perlengkapan Belajar
                </Link>
              </li>
              <li>
                <Link href="/katalog?cat=merchandise-kejuruan" className="hover:text-blue-400 transition">
                  Lanyard & Merchandise RPL
                </Link>
              </li>
              <li>
                <Link href="/katalog?cat=kantin-sehat-koperasi" className="hover:text-blue-400 transition">
                  Kantin Sehat Koperasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan Siswa */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Layanan Siswa
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/lacak-pesanan" className="hover:text-blue-400 transition">
                  Lacak Nota Pesanan
                </Link>
              </li>
              <li>
                <Link href="/keranjang" className="hover:text-blue-400 transition">
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link href="/admin/scan" className="hover:text-blue-400 transition">
                  Scanner QR Nota (Kasir)
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-blue-400 transition">
                  Login Petugas Koperasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Lokasi */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Lokasi & Jam Kerja
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Jl. Budi Cilember No. 11, Kota Bandung, Jawa Barat 40175</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Senin - Jumat: 07.00 - 15.30 WIB</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>(022) 6652442 / WhatsApp Koperasi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Koperasi Siswa SMKN 11 Bandung. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistem Pemesanan Online Terintegrasi QR Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
