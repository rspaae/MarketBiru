import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME, AuthUser } from '@/lib/auth';
import { SMKN11_CLASSES } from '@/lib/constants';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, 
      username, 
      email, 
      password, 
      student_class, 
      nisn, 
      whatsapp, 
      role = 'siswa',
      autoLogin = true 
    } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap, username, dan password wajib diisi!' },
        { status: 400 }
      );
    }

    if (role === 'siswa' && !student_class) {
      return NextResponse.json(
        { success: false, message: 'Pilihan kelas siswa wajib dipilih!' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    const cleanEmail = (email || `${cleanUsername}@siswa.smkn11bdg.sch.id`).trim().toLowerCase();
    const hashedPassword = await hashPassword(password);

    let insertedId: number = Date.now();

    try {
      // Cek apakah username / email / NISN sudah terdaftar di MySQL
      const existing = await query<RowDataPacket[]>(
        'SELECT id FROM users WHERE username = ? OR email = ? OR (nisn IS NOT NULL AND nisn = ? AND nisn != "") LIMIT 1',
        [cleanUsername, cleanEmail, nisn || '']
      );

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Username, Email, atau NISN sudah terdaftar di sistem.' },
          { status: 400 }
        );
      }

      // Insert ke MySQL
      const result = await query<ResultSetHeader>(
        `INSERT INTO users (name, username, email, password, role, nisn, student_class, whatsapp) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name.trim(),
          cleanUsername,
          cleanEmail,
          hashedPassword,
          role,
          nisn ? nisn.trim() : null,
          student_class || null,
          whatsapp ? whatsapp.trim() : null,
        ]
      );

      if (result && result.insertId) {
        insertedId = result.insertId;
      }
    } catch (dbError: any) {
      console.warn('Gagal menyimpan ke MySQL (mode standalone/fallback):', dbError.message);
    }

    const newUser: AuthUser = {
      id: insertedId,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      role: role as 'siswa' | 'admin' | 'kasir' | 'petugas',
      nisn: nisn ? nisn.trim() : undefined,
      student_class: student_class || undefined,
      whatsapp: whatsapp ? whatsapp.trim() : undefined,
    };

    const response = NextResponse.json({
      success: true,
      message: `Akun ${name} berhasil didaftarkan!`,
      user: newUser,
    });

    // Jika autoLogin aktif (misal registrasi dari halaman siswa), pasang cookie session
    if (autoLogin) {
      const token = await createSessionToken(newUser);
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Error Register API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat mendaftarkan akun.' },
      { status: 500 }
    );
  }
}
