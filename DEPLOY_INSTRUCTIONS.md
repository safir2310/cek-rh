# Deployment Instructions - Vercel

Panduan cepat untuk deploy ke Vercel menggunakan CLI.

## ⚠️ SECURITY NOTICE

**PENTING: Jangan pernah membagikan token Vercel atau API key secara terbuka!**

### Security Best Practices:

1. **Jika Anda Telah Membagikan Token**
   - Buka [Vercel Dashboard](https://vercel.com/account/tokens)
   - Cari token yang sudah dibagikan
   - Klik "Revoke" untuk menghapus token
   - Token yang sudah terbuka tidak lagi aman

2. **Generate Token Baru**
   - Klik "Create Token"
   - Beri nama yang jelas (misal: "Cek RH Production")
   - Pilih scope yang sesuai
   - Copy token baru dan simpan di tempat aman
   - **Jangan** bagikan token di chat, email, atau tempat publik
   - Gunakan environment variables untuk menyimpan token

## 🚀 Deployment dengan Vercel CLI

### 1. Install Vercel CLI

```bash
bun global add vercel
```

### 2. Login ke Vercel

```bash
vercel login
```

Pilih opsi yang sesuai:
- Login with GitHub (rekomendasi)

### 3. Deploy Project

```bash
vercel
```

Ikuti instruksi:
- Set up and deploy? **Yes**
- Which scope? Pilih akun Anda
- Link to existing project? **Yes** (jika sudah import) atau **No** (jika baru)
- Project name: `cek-rh`
- Directory: `./`
- Settings: Gunakan default (Next.js, bun)

### 4. Set Environment Variables

Setelah deployment pertama, set environment variables:

```bash
vercel env add DATABASE_URL production
```

Masukkan value (dari Neon dashboard):
```
postgresql://neondb_owner:npg_r3SdDk4LjYbq@ep-dry-silence-ai22kt8o-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Untuk FONNTE_TOKEN (opsional):
```bash
vercel env add FONNTE_TOKEN production
```

Masukkan token Fonnte Anda.

### 5. Redeploy dengan Environment Variables

```bash
vercel --prod
```

### 6. Deploy ke Production

```bash
# Deploy ke production
vercel --prod

# Atau gunakan preview deployment dulu
vercel
```

## 📋 Check Deployment Status

```bash
# List semua deployments
vercel list

# Cek production URL
vercel ls --prod

# Buka production di browser
vercel open --prod
```

## 🔧 Update Environment Variables

Untuk update environment variables:

```bash
# Hapus dan tambahkan ulang
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production

# Atau update via Vercel Dashboard
# https://vercel.com/dashboard
```

## 🌐 Custom Domain (Opsional)

```bash
# Set custom domain
vercel domains add yourdomain.com

# List domains
vercel domains ls

# Remove domain
vercel domains rm yourdomain.com
```

## 📊 Deployment Checklist

- [ ] Install Vercel CLI
- [ ] Login ke Vercel
- [ ] Import/deploy project ke Vercel
- [ ] Set DATABASE_URL di environment variables
- [ ] Set FONNTE_TOKEN (opsional)
- [ ] Deploy ke production
- [ ] Test deployment URL
- [ ] Verify semua features berfungsi

## 🐛 Troubleshooting

### Error: "Authentication Failed"

**Solusi:**
1. Logout: `vercel logout`
2. Login ulang: `vercel login`
3. Gunakan token: `vercel login --token=YOUR_TOKEN` (jika perlu)

### Error: "Environment Variable Not Found"

**Solusi:**
1. Cek env vars: `vercel env ls`
2. Tambahkan missing var: `vercel env add VAR_NAME production`
3. Redeploy: `vercel --prod`

### Error: "Build Failed"

**Solusi:**
1. Cek build log: `vercel logs`
2. Test build lokal: `bun run build`
3. Fix error dan redeploy: `vercel --prod`

### Error: "Database Connection Failed"

**Solusi:**
1. Verify DATABASE_URL: `vercel env ls`
2. Test connection: `bun prisma db pull` (dengan DATABASE_URL)
3. Cek Neon dashboard untuk status database

## 📝 Update Token yang Aman

**DONT:**
- ❌ Bagikan token di chat/public
- ❌ Commit token ke git
- ❌ Tulis token di file README atau dokumentasi
- ❌ Kirim token via email tanpa encryption

**DO:**
- ✅ Gunakan environment variables
- ✅ Simpan di password manager
- ✅ Bagikan via secure channel (end-to-end encryption)
- ✅ Revoke token jika tidak lagi digunakan
- ✅ Rotate token secara berkala

## 🎯 Quick Start Commands

```bash
# 1. Install CLI
bun global add vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables
vercel env add DATABASE_URL production

# 5. Deploy to production
vercel --prod

# 6. Open in browser
vercel open --prod
```

## 📞 Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Console: https://console.neon.tech/

---

**REMEMBER**: Selalu simpan token dan API key dengan aman! Jangan pernah membagikan secara terbuka. 🔒
