import { Category, Product, Order } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Seragam & Atribut Resmi',
    slug: 'seragam-atribut-resmi',
    description: 'Topi upacara, dasi, ikat pinggang, dan kaos kaki resmi SMKN 11 Bandung.',
    icon: 'Tag',
  },
  {
    id: 'cat-2',
    name: 'Pakaian & Seragam Sekolah',
    slug: 'pakaian-seragam-sekolah',
    description: 'Jas almamater (almet), baju batik identitas, dan setelan seragam olahraga SMKN 11 Bandung.',
    icon: 'Shirt',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    categoryId: 'cat-1',
    categoryName: 'Seragam & Atribut Resmi',
    name: 'Topi Upacara Bordir SMKN 11 Bandung',
    slug: 'topi-upacara-bordir-smkn-11-bandung',
    description: 'Topi upacara resmi hari Senin warna abu-abu kombinasi biru tua dengan bordir identitas SMKN 11 Bandung. Bagian belakang dilengkapi perekat velcro fleksibel.',
    price: 18000,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    unit: 'pcs',
  },
  {
    id: 'prod-2',
    categoryId: 'cat-1',
    categoryName: 'Seragam & Atribut Resmi',
    name: 'Sabuk / Ikat Pinggang Gesper Logam SMKN 11 Bandung',
    slug: 'sabuk-ikat-pinggang-gesper-logam-smkn-11-bandung',
    description: 'Ikat pinggang sekolah standar tata tertib SMKN 11 Bandung dengan kepala gesper kuningan timbul logo sekolah, tali nylon hitam tebal awet.',
    price: 20000,
    stock: 85,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    unit: 'pcs',
  },
  {
    id: 'prod-3',
    categoryId: 'cat-1',
    categoryName: 'Seragam & Atribut Resmi',
    name: 'Dasi Abu-Abu Resmi SMKN 11 Bandung (Bordir Logo)',
    slug: 'dasi-abu-abu-resmi-smkn-11-bandung',
    description: 'Dasi sekolah resmi warna abu-abu SMA/SMK dengan bordir komputer emblem logo SMKN 11 Bandung. Bahan twist halus, rapi, dan mudah disetrika.',
    price: 15000,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    unit: 'pcs',
  },
  {
    id: 'prod-4',
    categoryId: 'cat-1',
    categoryName: 'Seragam & Atribut Resmi',
    name: 'Kaos Kaki Putih Telapak Hitam Bordir SMKN 11',
    slug: 'kaos-kaki-putih-telapak-hitam-smkn-11',
    description: 'Kaos kaki panjang di atas mata kaki standar tata tertib sekolah, terdapat rajutan logo SMKN 11 Bandung di samping. Bahan katun PE tebal dan menyerap keringat.',
    price: 15000,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    unit: 'pasang',
  },
  {
    id: 'prod-5',
    categoryId: 'cat-2',
    categoryName: 'Pakaian & Seragam Sekolah',
    name: 'Jas Almamater (Almet) Resmi SMKN 11 Bandung',
    slug: 'jas-almamater-almet-resmi-smkn-11-bandung',
    description: 'Jas almamater (almet) resmi SMKN 11 Bandung warna biru khas dengan bordir logo sekolah di dada kiri dan kancing timbul berlogo.',
    price: 135000,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    unit: 'pcs',
  },
  {
    id: 'prod-6',
    categoryId: 'cat-2',
    categoryName: 'Pakaian & Seragam Sekolah',
    name: 'Baju Batik Khas SMKN 11 Bandung',
    slug: 'baju-batik-khas-smkn-11-bandung',
    description: 'Kain batik motif resmi identitas SMKN 11 Bandung untuk seragam hari Kamis dan Jumat. Bahan katun sanforized adem dan nyaman.',
    price: 85000,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    unit: 'pcs',
  },
  {
    id: 'prod-7',
    categoryId: 'cat-2',
    categoryName: 'Pakaian & Seragam Sekolah',
    name: 'Setelan Seragam Olahraga SMKN 11 Bandung',
    slug: 'setelan-seragam-olahraga-smkn-11-bandung',
    description: 'Setelan kaos olahraga lengan pendek dan celana training resmi SMKN 11 Bandung. Bahan elastis, adem, dan menyerap keringat dengan baik.',
    price: 95000,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    unit: 'set',
  },
];

export const INITIAL_ORDERS: Order[] = [];

export interface SeedUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'petugas' | 'kasir' | 'siswa';
  nisn?: string | null;
  studentClass?: string | null;
  whatsapp?: string | null;
}

export const INITIAL_USERS: SeedUser[] = [
  { id: 1, name: 'Administrator Koperasi', username: 'admin', email: 'admin@smkn11bdg.sch.id', password: 'admin123', role: 'admin', whatsapp: '081234567890' },
  { id: 2, name: 'Petugas Kasir Koperasi 11', username: 'kasir', email: 'kasir@smkn11bdg.sch.id', password: 'admin123', role: 'kasir', whatsapp: '081234567891' },
  { id: 3, name: 'Aqila Qisya H.', username: 'aqila', email: 'aqila@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061010001', studentClass: 'X AKL 1', whatsapp: '081200000001' },
  { id: 4, name: 'Alzena Syalwiah', username: 'alzena', email: 'alzena@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061010002', studentClass: 'X AKL 2', whatsapp: '081200000002' },
  { id: 5, name: 'Zahira Khoirunnisa', username: 'zahira', email: 'zahira@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061010003', studentClass: 'X AKL 3', whatsapp: '081200000003' },
  { id: 6, name: 'Ahmad Anugrah Mahesa', username: 'anugrah', email: 'anugrah@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061020001', studentClass: 'X MPLB 1', whatsapp: '081200000004' },
  { id: 7, name: 'Mentari Febriani', username: 'mentari', email: 'mentari@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061020002', studentClass: 'X MPLB 2', whatsapp: '081200000005' },
  { id: 8, name: 'Nadita Marsyagina', username: 'nadita', email: 'nadita@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061020003', studentClass: 'X MPLB 3', whatsapp: '081200000006' },
  { id: 9, name: 'Dara Ramadani', username: 'dara', email: 'dara@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061020004', studentClass: 'X MPLB 4', whatsapp: '081200000007' },
  { id: 10, name: 'Salma Supri Salsabila', username: 'salma', email: 'salma@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061020005', studentClass: 'X MPLB 5', whatsapp: '081200000008' },
  { id: 11, name: 'Keisya Afifah', username: 'keisya', email: 'keisya@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061030001', studentClass: 'X PM 1', whatsapp: '081200000009' },
  { id: 12, name: 'Almaira Putri Ramadhany', username: 'almaira', email: 'almaira@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061030002', studentClass: 'X PM 2', whatsapp: '081200000010' },
  { id: 13, name: 'Selky Aulia Agustin', username: 'selky', email: 'selky@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061030003', studentClass: 'X PM 3', whatsapp: '081200000011' },
  { id: 14, name: 'Nayra Aulia Khoirunnisa', username: 'nayra', email: 'nayra@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061040001', studentClass: 'X PPLG 1', whatsapp: '081200000012' },
  { id: 15, name: 'Khansa Khairunnisa', username: 'khansa', email: 'khansa@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061040002', studentClass: 'X PPLG 2', whatsapp: '081200000013' },
  { id: 16, name: 'Qatrinnada Maswahid', username: 'qatrinnada', email: 'qatrinnada@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061050002', studentClass: 'X DKV 2', whatsapp: '081200000014' },
  { id: 17, name: 'Muhamad Raisa Prayoga', username: 'raisa', email: 'raisa@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061060001', studentClass: 'X TJKT', whatsapp: '081200000015' },
  { id: 18, name: 'Syifa Cinta Aulia', username: 'syifa', email: 'syifa@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061110001', studentClass: 'XI AK 1', whatsapp: '081200000016' },
  { id: 19, name: 'Anggita Dwi Putri', username: 'anggita', email: 'anggita@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061110002', studentClass: 'XI AK 2', whatsapp: '081200000017' },
  { id: 20, name: 'Nurul Aulia Akhwati', username: 'nurul', email: 'nurul@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061110003', studentClass: 'XI AK 3', whatsapp: '081200000018' },
  { id: 21, name: 'Zya Agnia Khoirunnisa', username: 'zya', email: 'zya@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061120001', studentClass: 'XI MP 1', whatsapp: '081200000019' },
  { id: 22, name: 'Melisa', username: 'melisa', email: 'melisa@siswa.smkn11bdg.sch.id', password: 'admin123', role: 'siswa', nisn: '0061120002', studentClass: 'XI MP 2', whatsapp: '081200000020' },
];

