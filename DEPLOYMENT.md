# Deployment Guide - Vercel

Panduan lengkap untuk mendeploy aplikasi Cek RH ke Vercel dengan PostgreSQL database.

## 📋 Prasyarat

- Akun GitHub
- Akun Vercel (gratis)
- Database PostgreSQL (salah satu opsi berikut):
  - Vercel Postgres (rekomendasi)
  - Neon (gratis)
  - Supabase (gratis)
  - PlanetScale (MySQL, memerlukan perubahan schema)

## 🚀 Langkah 1: Setup Database PostgreSQL

### Opsi 1: Vercel Postgres (Rekomendasi)

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Storage** → **Create Database**
3. Pilih **Postgres** → klik **Continue**
4. Pilih region terdekat (misal: Singapore)
5. Beri nama database (misal: `cek-rh-db`)
6. Klik **Create**

Setelah dibuat, Anda akan mendapatkan:
- `DATABASE_URL`
- `POSTGRES_PRISMA_URL`
- Kredensial database lainnya

### Opsi 2: Neon (Gratis)

1. Buka [Neon Console](https://console.neon.tech/)
2. Sign up/Login
3. Klik **Create a project**
4. Beri nama project: `cek-rh`
5. Pilih region (Singapore)
6. Klik **Create project**
7. Copy connection string dari dashboard

Format connection string:
```
postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

### Opsi 3: Supabase (Gratis)

1. Buka [Supabase](https://supabase.com/)
2. Sign up/Login
3. Klik **New Project**
4. Isi form:
   - Name: `cek-rh`
   - Database Password: (buat password kuat)
   - Region: Southeast Asia (Singapore)
5. Klik **Create new project**
6. Tunggu ~2 menit hingga database siap
7. Pergi ke Settings → Database
8. Copy **Connection String** → **URI**
9. Ganti `[YOUR-PASSWORD]` dengan password Anda

## 🚀 Langkah 2: Update Lokal Database (Opsional)

Jika ingin tetap menggunakan SQLite untuk development lokal:

### Setup PostgreSQL Lokal (Opsional)

#### Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**MacOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
- Download dari [PostgreSQL Official Site](https://www.postgresql.org/download/windows/)

#### Buat Database Lokal

```bash
# Masuk ke PostgreSQL
sudo -u postgres psql

# Buat database
CREATE DATABASE cek_rh;

# Buat user
CREATE USER cek_rh_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cek_rh TO cek_rh_user;

# Exit
\q
```

#### Update .env Lokal

```env
# Untuk development dengan PostgreSQL lokal
DATABASE_URL="postgresql://cek_rh_user:your_password@localhost:5432/cek_rh"

# Atau tetap gunakan SQLite untuk development
DATABASE_URL="file:./prisma/rh.db"

FONNTE_TOKEN=your_fonnte_token_here
```

## 🚀 Langkah 3: Push ke GitHub

Pastikan kode sudah di-commit dan push ke GitHub:

```bash
git add .
git commit -m "feat: migrate to PostgreSQL for Vercel deployment"
git push origin master
```

## 🚀 Langkah 4: Deploy ke Vercel

### Import Project ke Vercel

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Add New...** → **Project**
3. Pilih repository GitHub `cek-rh`
4. Klik **Import**

### Konfigurasi Environment Variables

1. Di halaman **Configure Project**, scroll ke **Environment Variables**
2. Tambahkan variables berikut:

#### Jika menggunakan Vercel Postgres:

Vercel akan otomatis mendeteksi dan mengatur environment variables. Pastikan:
- `DATABASE_URL` - akan otomatis diisi oleh Vercel
- `POSTGRES_PRISMA_URL` - akan otomatis diisi oleh Vercel
- `FONNTE_TOKEN` - masukkan token Fonnte Anda

#### Jika menggunakan Neon/Supabase:

- `DATABASE_URL` - masukkan connection string dari database Anda
- `FONNTE_TOKEN` - masukkan token Fonnte Anda

### Konfigurasi Build Settings

Pastikan setting berikut:

```
Framework Preset: Next.js
Build Command: prisma generate && next build
Output Directory: .next
Install Command: bun install
```

### Deploy

1. Klik **Deploy**
2. Tunggu proses build (~2-3 menit)
3. Setelah selesai, Anda akan mendapatkan URL deployment

## 🚀 Langkah 5: Setup Database Schema

### Opsi A: Otomatis via Prisma Migrate (Rekomendasi)

Jika menggunakan Vercel Postgres atau Neon:

1. Buka terminal lokal
2. Set environment variable untuk production:

```bash
# Set DATABASE_URL dari Vercel/Neon/Supabase
export DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

3. Run migration:

```bash
# Generate Prisma Client
bun run db:generate

# Push schema ke database production
bun run db:push

# Atau gunakan migrate (lebih aman untuk production)
bun prisma migrate deploy
```

### Opsi B: Manual via Vercel CLI

1. Install Vercel CLI:

```bash
bun global add vercel
```

2. Login:

```bash
vercel login
```

3. Run migration di production:

```bash
vercel env pull .env.production
bun prisma db push
```

### Opsi C: Via Vercel Dashboard

1. Pergi ke project di Vercel
2. Klik **Storage** (jika menggunakan Vercel Postgres)
3. Buka **Query Editor**
4. Run perintah SQL berikut untuk membuat tabel:

```sql
-- Buat tabel User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "whatsapp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Buat tabel Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "plu" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rhDays" INTEGER NOT NULL DEFAULT 14,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Buat tabel Batch
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "rhDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- Buat index
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE UNIQUE INDEX "Product_plu_key" ON "Product"("plu");
CREATE INDEX "Product_userId_idx" ON "Product"("userId");
CREATE INDEX "Batch_productId_idx" ON "Batch"("productId");
CREATE INDEX "Batch_rhDate_idx" ON "Batch"("rhDate");
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- Buat foreign key
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## 🚀 Langkah 6: Verifikasi Deployment

1. Buka URL deployment Anda
2. Coba:
   - Register akun baru
   - Login
   - Tambah produk
   - Scan barcode
   - Cek dashboard

## 🔄 Updates Berikutnya

### Cara Deploy Update

Setiap kali Anda membuat perubahan:

```bash
git add .
git commit -m "feat: description"
git push origin master
```

Vercel akan otomatis:
1. Mendeteksi perubahan
2. Build ulang
3. Deploy ke preview URL
4. Merge ke production setelah review

### Migration Schema Baru

Jika mengubah `prisma/schema.prisma`:

```bash
# Generate Prisma Client
bun prisma generate

# Buat migration baru
bun prisma migrate dev --name description

# Deploy ke production
bun prisma migrate deploy
```

## 🐛 Troubleshooting

### Error: "Connection refused"

**Masalah:** Tidak bisa connect ke database

**Solusi:**
- Pastikan DATABASE_URL benar
- Cek apakah database sudah dibuat
- Untuk Neon/Supabase, pastikan SSL di-enable (`sslmode=require`)

### Error: "Prisma Client initialization error"

**Masalah:** Prisma Client tidak ter-generate

**Solusi:**
```bash
bun prisma generate
```

### Error: "Relation does not exist"

**Masalah:** Tabel belum dibuat di database

**Solusi:**
```bash
bun prisma db push
```

### Deployment Gagal

**Masalah:** Build error di Vercel

**Solusi:**
- Cek build logs di Vercel Dashboard
- Pastikan environment variables sudah di-set dengan benar
- Cek apakah dependencies terinstall dengan benar

## 📊 Monitoring

### Vercel Analytics

1. Buka project di Vercel
2. Klik **Analytics**
3. Lihat metrics: page views, visitors, dll

### Database Monitoring

**Vercel Postgres:**
- Dashboard → Storage → Pilih database
- Lihat: connections, storage, queries

**Neon:**
- Neon Console → Dashboard
- Lihat: CPU usage, storage, active connections

**Supabase:**
- Supabase Dashboard → Database
- Lihat: CPU, Memory, Disk I/O

## 🔐 Best Practices

1. **Environment Variables:** Jangan commit `.env` file
2. **Database Password:** Gunakan password yang kuat
3. **SSL:** Selalu gunakan SSL untuk koneksi database production
4. **Backups:** Aktifkan automatic backups di database provider
5. **Monitoring:** Monitor usage dan setup alerts
6. **Rate Limiting:** Implement rate limiting untuk API endpoints
7. **Caching:** Gunakan caching untuk mengurangi database load

## 📞 Support

Jika mengalami masalah:

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Selamat!** Aplikasi Anda sekarang sudah di-deploy ke Vercel dengan database PostgreSQL! 🎉
