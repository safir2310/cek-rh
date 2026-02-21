# Vercel Deployment Guide - Cek RH

Panduan singkat untuk deploy aplikasi Cek RH ke Vercel dengan database Neon yang sudah siap.

## 📦 Status Saat Ini

✅ **Database**: Neon PostgreSQL (sudah di-setup)
✅ **Schema**: Tabel User, Product, Batch sudah dibuat
✅ **Test Data**: Admin dan user test sudah dibuat
✅ **Environment**: .env sudah dikonfigurasi
✅ **Code**: Semua perubahan sudah di-push ke GitHub

## 🚀 Langkah-langkah Deploy

### 1. Login ke Vercel

Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.

### 2. Import Project

1. Klik **"Add New..."** → **"Project"**
2. Pilih repository **`safir2310/cek-rh`**
3. Klik **"Import"**

### 3. Konfigurasi Project

Di halaman "Configure Project":

**Framework Preset**: Next.js (otomatis terdeteksi)

**Build Command**:
```
prisma generate && next build
```

**Output Directory**: `.next`

**Install Command**: `bun install`

### 4. Environment Variables

Di bagian **Environment Variables**, tambahkan variable berikut:

#### DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_r3SdDk4LjYbq@ep-dry-silence-ai22kt8o-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
Environment: Production, Preview, Development
```

#### FONNTE_TOKEN (Opsional)
```
Key: FONNTE_TOKEN
Value: [token Fonnte Anda jika ada]
Environment: Production, Preview, Development
```

**PENTING**: Klik **"Add"** untuk setiap variable dan pastikan checkbox untuk semua environment tercentang.

### 5. Deploy

1. Klik **"Deploy"**
2. Tunggu proses build (~2-3 menit)
3. Setelah selesai, Anda akan mendapatkan URL deployment

### 6. Verifikasi Deployment

Buka URL deployment dan cek:

1. **Halaman Login** muncul ✅
2. **Register** akun baru berhasil ✅
3. **Login** dengan akun yang baru dibuat ✅
4. **Dashboard** menampilkan statistik ✅
5. **Tambah Produk** berfungsi ✅

### 7. Test dengan Akun yang Sudah Ada

Anda juga bisa login dengan akun test yang sudah ada di database:

**Admin Account:**
- Username: `admin`
- Password: `admin`
- Email: `admin@safir.com`

**Test User:**
- Username: `user`
- Password: `user`
- Email: `user@safir.com`

## 📊 Database Schema

Database Neon sudah berisi:

### Tabel
- **User**: Menyimpan data user
- **Product**: Menyimpan data produk
- **Batch**: Menyimpan data batch produk

### Index
- `User.username` (unique)
- `User.email` (unique)
- `Product.barcode` (unique)
- `Product.plu` (unique)
- `Product.userId`
- `Batch.productId`
- `Batch.rhDate`
- `Batch.status`

### Test Data
- 1 Admin user
- 1 Test user

## 🔧 Environment Variables Detail

### DATABASE_URL

Connection string ke database Neon:
```
postgresql://neondb_owner:npg_r3SdDk4LjYbq@ep-dry-silence-ai22kt8o-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Breakdown:**
- Protocol: `postgresql://`
- User: `neondb_owner`
- Password: `npg_r3SdDk4LjYbq`
- Host: `ep-dry-silence-ai22kt8o-pooler.c-4.us-east-1.aws.neon.tech`
- Database: `neondb`
- SSL: `sslmode=require` (wajib untuk Neon)

### FONNTE_TOKEN (Opsional)

Token untuk WhatsApp notification service.
- Daftar di [Fonnte](https://fonnte.com)
- Dapatkan token dari dashboard Fonnte
- Masukkan sebagai environment variable

## 🔄 Update Berikutnya

Setiap kali Anda membuat perubahan:

1. Commit dan push ke GitHub:
```bash
git add .
git commit -m "feat: your changes"
git push origin master
```

2. Vercel akan otomatis:
   - Mendeteksi perubahan
   - Build ulang
   - Deploy ke preview URL
   - Promote ke production

3. Cek deployment di Vercel Dashboard untuk status

## 📱 Cara Akses Database Neon

Untuk melihat dan mengelola database:

1. Buka [Neon Console](https://console.neon.tech/)
2. Login dengan akun Anda
3. Pilih project `cek-rh`
4. Buka **SQL Editor** untuk menjalankan query
5. Buka **Tables** untuk melihat data

### Contoh Query

**Cek semua user:**
```sql
SELECT id, username, email, name FROM "User";
```

**Cek semua produk:**
```sql
SELECT p.id, p.name, p.barcode, p.plu, u.name as owner
FROM "Product" p
JOIN "User" u ON p.userId = u.id;
```

**Cek batch yang akan jatuh RH dalam 7 hari:**
```sql
SELECT b.id, b."batchNumber", b."expiryDate", b."rhDate", p.name as product
FROM "Batch" b
JOIN "Product" p ON b."productId" = p.id
WHERE b."rhDate" BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY b."rhDate" ASC;
```

## 🐛 Troubleshooting

### Error: "Connection refused"

**Solusi:**
1. Cek apakah `DATABASE_URL` sudah di-set dengan benar di Vercel
2. Pastikan connection string menggunakan protocol `postgresql://`
3. Pastikan `sslmode=require` ada di connection string

### Error: "Prisma Client initialization error"

**Solusi:**
1. Re-deploy project di Vercel
2. `postinstall` script akan otomatis run dan generate Prisma Client

### Error: "Login/Register Gagal"

**Solusi:**
1. Cek logs di Vercel Dashboard
2. Pastikan database connection berhasil
3. Cek apakah User table ada data

### Halaman Tidak Muncul

**Solusi:**
1. Cek deployment logs di Vercel Dashboard
2. Pastikan build berhasil (status "Ready")
3. Clear browser cache dan reload

## 📞 Support

Jika mengalami masalah:

1. Cek [Vercel Dashboard](https://vercel.com/dashboard) untuk deployment logs
2. Buka [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md) untuk solusi umum
3. Buka [Neon Console](https://console.neon.tech/) untuk cek database
4. Hubungi support jika perlu

## ✅ Checklist Sebelum Deploy

- [x] Database Neon sudah dibuat
- [x] Schema sudah di-push ke database
- [x] Test users sudah dibuat
- [x] `.env` sudah dikonfigurasi
- [x] Code sudah di-push ke GitHub
- [ ] Import project ke Vercel
- [ ] Set `DATABASE_URL` di Vercel Environment Variables
- [ ] (Opsional) Set `FONNTE_TOKEN` di Vercel Environment Variables
- [ ] Deploy dan verify

## 🎉 Setelah Deploy

Setelah deployment berhasil:

1. **Simpan URL deployment**
2. **Setup custom domain** (opsional)
3. **Configure analytics** di Vercel
4. **Setup monitoring** untuk production
5. **Configure backups** di Neon

---

**Selamat!** Aplikasi Cek RH Anda siap di-deploy ke Vercel! 🚀

URL production akan muncul setelah deployment selesai.
