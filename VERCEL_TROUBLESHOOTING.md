# Vercel Deployment Troubleshooting

Guide untuk mengatasi masalah umum saat deploy ke Vercel.

## 🔥 Masalah Umum

### 1. Error: "Connection refused"

**Error Message:**
```
Error: P1001: Can't reach database server at `host:port`
```

**Penyebab:**
- Database URL tidak benar
- Database belum dibuat
- SSL tidak di-enable untuk Neon/Supabase

**Solusi:**

1. Pastikan `DATABASE_URL` benar di Vercel Environment Variables:
```env
# Untuk Neon (wajib sslmode)
DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"

# Untuk Vercel Postgres
DATABASE_URL="postgres://user:password@host:port/database?pgbouncer=true"
```

2. Test koneksi dari lokal:
```bash
# Set DATABASE_URL production
export DATABASE_URL="postgresql://user:password@host:port/database"

# Test connection
bun prisma db pull
```

3. Untuk Vercel Postgres, cek apakah database sudah dibuat:
   - Dashboard → Storage → Cek database status

### 2. Error: "Prisma Client initialization error"

**Error Message:**
```
Error: Prisma Client is not initialized
```

**Penyebab:**
- Prisma Client belum di-generate

**Solusi:**

1. Generate Prisma Client:
```bash
bun prisma generate
```

2. Tambahkan `postinstall` script di `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

3. Re-deploy ke Vercel (Vercel akan otomatis run `postinstall`)

### 3. Error: "Relation does not exist"

**Error Message:**
```
Error: P2025: The database schema is not empty. Read more at https://pris.ly/d/...
```

**Penyebab:**
- Tabel belum dibuat di database production

**Solusi:**

**Opsi A: Push Schema**
```bash
# Set DATABASE_URL production
export DATABASE_URL="postgresql://user:password@host:port/database"

# Push schema ke database
bun prisma db push
```

**Opsi B: Via Vercel CLI**
```bash
# Install Vercel CLI
bun global add vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.production

# Push schema
bun prisma db push
```

**Opsi C: Manual via Database Dashboard**
- Buka dashboard database (Neon/Supabase/Vercel Postgres)
- Buka SQL Editor
- Copy dan jalankan schema dari [DEPLOYMENT.md](./DEPLOYMENT.md)

### 4. Error: "Build Failed"

**Error Message:**
```
Error: Build failed with exit code 1
```

**Penyebab:**
- Ada error di kode
- Dependencies tidak terinstall
- TypeScript error

**Solusi:**

1. Cek build logs di Vercel Dashboard → Deployments → Pilih deployment → View Logs

2. Test build lokal:
```bash
bun run build
```

3. Jika ada TypeScript error:
```bash
bun run lint
```

4. Fix error dan re-deploy

### 5. Error: "Module not found"

**Error Message:**
```
Error: Module not found: Can't resolve '@prisma/client'
```

**Penyebab:**
- Prisma Client belum di-generate

**Solusi:**

1. Cek `package.json` punya script:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

2. Re-deploy untuk trigger `postinstall`

### 6. Error: "Environment variable not found"

**Error Message:**
```
Error: Error: Environment variable DATABASE_URL is not defined
```

**Penyebab:**
- Environment variables belum di-set di Vercel

**Solusi:**

1. Pergi ke Vercel Dashboard → Project → Settings → Environment Variables
2. Tambahkan variables:
   - `DATABASE_URL`
   - `FONNTE_TOKEN` (opsional)
3. Klik "Save" dan re-deploy

### 7. Masalah: "Login/Register Gagal"

**Symptoms:**
- User bisa register tapi tidak bisa login
- Error: "Username/password salah"

**Penyebab:**
- Password tidak di-hash
- User tidak tersimpan di database

**Solusi:**

1. Cek database via Prisma Studio:
```bash
bun prisma studio
```

2. Verify user table ada data:
   - Buka User table
   - Cek apakah user yang register muncul

3. Test API endpoint:
```bash
# Register
curl -X POST https://your-app.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST https://your-app.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "password123"
  }'
```

### 8. Masalah: "Database Connection Timeout"

**Symptoms:**
- App kadang-kadang error
- Error: "Connection timeout"

**Penyebab:**
- Connection pool exhausted
- Too many connections

**Solusi:**

1. Update `src/lib/db.ts` dengan connection pooling:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
```

2. Untuk Vercel Postgres, gunakan connection string dengan `pgbouncer=true`:
```env
DATABASE_URL="postgres://user:password@host:port/database?pgbouncer=true"
```

### 9. Masalah: "404 Not Found pada API Routes"

**Symptoms:**
- API routes mengembalikan 404
- Dashboard tidak load data

**Penyebab:**
- API routes tidak ter-deploy
- File path salah

**Solusi:**

1. Pastikan struktur folder benar:
```
src/app/
  ├── api/
  │   ├── login/
  │   │   └── route.ts
  │   ├── register/
  │   │   └── route.ts
  │   └── ...
```

2. Re-deploy dan cek build logs

3. Test API di production:
```bash
curl https://your-app.vercel.app/api/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'
```

### 10. Masalah: "Page Load Sangat Lambat"

**Symptoms:**
- First Contentful Paint > 3 detik
- Interactive Time > 5 detik

**Penyebab:**
- Database query tidak optimized
- Tidak ada caching
- Image tidak optimized

**Solusi:**

1. Tambahkan index di `prisma/schema.prisma`:
```prisma
model Product {
  id          String   @id @default(cuid())
  barcode     String   @unique
  // ... other fields
  userId      String

  @@index([userId])
}

model Batch {
  id          String   @id @default(cuid())
  // ... other fields
  productId   String
  rhDate      DateTime
  status      String

  @@index([productId])
  @@index([rhDate])
  @@index([status])
}
```

2. Apply index:
```bash
bun prisma db push
```

3. Gunakan Next.js Image component untuk images
4. Implement caching untuk API responses

## 🔧 Debug Tools

### Cek Logs di Vercel

1. Buka Vercel Dashboard
2. Pilih Project
3. Klik tab "Deployments"
4. Pilih deployment terbaru
5. Klik "View Logs"

### Cek Database Connection

```bash
# Set DATABASE_URL production
export DATABASE_URL="postgresql://user:password@host:port/database"

# Test connection
bun prisma db pull

# Jika berhasil, akan menampilkan schema
# Jika gagal, akan menampilkan error
```

### Monitor Database Queries

1. Enable query logging di development:
```typescript
// src/lib/db.ts
new PrismaClient({
  log: ['query', 'error', 'warn'],
})
```

2. Cek Vercel logs untuk production queries

### Debug Mode di Production

Untuk debug di production, tambahkan environment variable:

1. Di Vercel Dashboard → Settings → Environment Variables
2. Tambahkan:
   - `NODE_ENV=development` (sementara untuk debug)
3. Re-deploy
4. Cek logs untuk detailed information

**⚠️ HATI-HATI:** Jangan lupa hapus `NODE_ENV=development` setelah selesai debugging!

## 📞 Support

Jika masih mengalami masalah:

1. Cek [Vercel Documentation](https://vercel.com/docs)
2. Cek [Prisma Documentation](https://www.prisma.io/docs)
3. Buka issue di GitHub repository
4. Hubungi Vercel Support

## 📝 Checklist Sebelum Deploy

- [ ] Database sudah dibuat (Vercel Postgres/Neon/Supabase)
- [ ] `DATABASE_URL` sudah di-set di Vercel Environment Variables
- [ ] `FONNTE_TOKEN` sudah di-set (jika pakai WhatsApp)
- [ ] Schema sudah di-push ke production: `bun prisma db push`
- [ ] Build berhasil lokal: `bun run build`
- [ ] Tidak ada TypeScript errors: `bun run lint`
- [ ] Semua API routes ter-test
- [ ] Database connection berhasil

---

Semoga guide ini membantu! 🚀
