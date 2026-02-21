# Cek RH - Sistem Manajemen Tanggal Kadaluarsa

Sistem manajemen tanggal kadaluarsa (RH - Rehydration Date) untuk produk dengan fitur scan barcode, notifikasi otomatis, dan integrasi WhatsApp.

## 🚀 Fitur Utama

- **📱 Scan Barcode**: Pindai barcode produk dengan kamera atau input manual
- **🔍 Auto-Search Product**: Mencari nama produk otomatis dari Google berdasarkan barcode
- **📦 Manajemen Produk**: Tambah, edit, dan hapus produk dengan multiple batch
- **📊 Dashboard Interaktif**: Tampilan statistik dan status produk (Aman, Wajib Retur, Jatuh RH)
- **🔔 Notifikasi Cerdas**: Notifikasi otomatis untuk produk yang membutuhkan perhatian
- **💬 WhatsApp Integration**: Kirim notifikasi otomatis ke WhatsApp
- **🌙 Dark Mode**: Dukungan mode gelap
- **📱 Responsive Design**: Tampilan optimal di desktop dan mobile

## 🛠️ Teknologi

- **Framework**: Next.js 16 dengan App Router
- **Bahasa**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: Prisma ORM dengan SQLite
- **State Management**: Zustand
- **Authentication**: Custom backend authentication
- **Icons**: Lucide React

## 📋 Prasyarat

- Node.js 18+ atau Bun
- npm, yarn, atau bun

## 🚀 Instalasi

1. Clone repository ini
```bash
git clone https://github.com/username/cek-rh.git
cd cek-rh
```

2. Install dependencies
```bash
bun install
```

3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` file dan sesuaikan konfigurasi:
```env
DATABASE_URL="file:./prisma/rh.db"
FONNTE_TOKEN=your_fonnte_token_here
```

4. Setup database
```bash
bun run db:push
```

5. Jalankan development server
```bash
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📖 Penggunaan

### 1. Registrasi Akun
- Buka aplikasi dan klik "Daftar Akun"
- Isi username, nama, email, dan password
- Klik "Buat Akun"

### 2. Login
- Masukkan username dan password
- Klik "Masuk"

### 3. Tambah Produk
- Klik tombol "Tambah" di dashboard
- Masukkan barcode (scan atau manual)
- Nama produk akan otomatis dicari dari Google
- Atur RH (Rehydration Date) dan tanggal kadaluarsa
- Tambahkan batch jika diperlukan
- Klik "Simpan Produk"

### 4. Scan Barcode
- Klik tombol "Scan Barcode"
- Arahkan kamera ke barcode produk
- Atau input kode secara manual
- Sistem akan otomatis mencari nama produk dari Google

### 5. Notifikasi
- Cek notifikasi di dashboard
- Produk dengan status "Wajib Retur" (H-14) akan muncul di notifikasi
- Produk yang sudah jatuh RH juga akan diberitahu

### 6. Pengaturan WhatsApp
- Klik ikon pesan di dashboard
- Masukkan token Fonnte
- Atur notifikasi otomatis untuk produk yang membutuhkan perhatian

## 📊 Status Produk

- **Aman**: Produk masih dalam masa aman
- **Wajib Retur**: Produk akan jatuh RH dalam 14 hari (H-14)
- **Jatuh RH**: Produk sudah melewati tanggal RH

## 🗂️ Struktur Proyek

```
cek-rh/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeder
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── login/         # Authentication
│   │   │   ├── register/      # User registration
│   │   │   ├── search-product/ # Google search
│   │   │   └── ...
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── pages/             # Page components
│   │   │   ├── dashboard-page.tsx
│   │   │   ├── scan-page.tsx
│   │   │   ├── add-product-page.tsx
│   │   │   └── ...
│   │   ├── ui/                # shadcn/ui components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   └── whatsapp-notification.ts
│   ├── store/
│   │   └── rh-store.ts        # Zustand store
│   └── types/
│       └── rh.ts              # TypeScript types
├── mini-services/             # Additional services
└── package.json
```

## 🔧 Konfigurasi

### Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  name      String
  password  String
  whatsapp  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  barcode     String   @unique
  plu         String   @unique
  name        String
  rhDays      Int      @default(14)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  batches     Batch[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Batch {
  id          String   @id @default(cuid())
  batchNumber String
  expiryDate  DateTime
  rhDate      DateTime
  quantity    Int
  status      String
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  createdAt   DateTime @default(now())
}
```

## 📱 API Routes

### Authentication
- `POST /api/login` - Login user
- `POST /api/register` - Register new user

### Product Management
- `GET /api/search-product?barcode={barcode}` - Search product by barcode (Google)
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Notifications
- `GET /api/check-notifications` - Check product notifications
- `POST /api/send-whatsapp` - Send WhatsApp notification

## 🤝 Kontribusi

Kontribusi sangat diapresiasi! Silakan:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur/AmazingFitur`)
3. Commit perubahan (`git commit -m 'Add some AmazingFitur'`)
4. Push ke branch (`git push origin fitur/AmazingFitur`)
5. Buka Pull Request

## 📝 License

Proyek ini dilisensikan di bawah MIT License.

## 👥 Author

Dibuat dengan ❤️ oleh tim Cek RH

## 📞 Support

Jika Anda memiliki pertanyaan atau membutuhkan bantuan, silakan:
- Buka issue di GitHub
- Hubungi tim support

---

**Cek RH** - Sistem manajemen tanggal kadaluarsa yang modern dan mudah digunakan!
