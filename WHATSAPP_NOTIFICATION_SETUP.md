# WhatsApp Notification Setup Guide

Sistem RH KADALUARSA telah dilengkapi dengan fitur notifikasi otomatis ke WhatsApp untuk memberitahu pengguna tentang produk yang membutuhkan perhatian (mendekati tanggal RH atau sudah jatuh RH).

---

## 📱 Fitur Notifikasi WhatsApp

### **Kapan Notifikasi Dikirim?**
- ✅ Produk mendekati tanggal RH (H-14)
- ✅ Produk sudah jatuh RH
- ✅ Bisa juga dikirim untuk batch tertentu yang perlu perhatian

### **Format Pesan WhatsApp:**
```
🔔 NOTIFIKASI RH KADALUARSA

Halo Admin, berikut produk yang perlu perhatian:

❌ PRODUK SUDAH JATUH RH

1. Indomie Goreng Spesial
   Barcode: 8991234567890
   PLU: PLU001
   Batch: BATCH001
   Tgl Kadaluarsa: 15 Feb 2026
   Tgl RH: 01 Feb 2026
   Jumlah: 100

⚠️ PRODUK WAJIB RETUR (H-14)

1. Aqua 600ml
   Barcode: 8999876543210
   PLU: PLU002
   Batch: BATCH002
   Tgl Kadaluarsa: 20 Mar 2026
   Tgl RH: 06 Mar 2026
   Jumlah: 50

Mohon segera lakukan pengecekan dan tindaklanjuti.

Terima kasih,
📱 Sistem RH KADALUARSA
© Copyright Safir
```

---

## 🔧 Cara Menghubungkan WhatsApp API

Untuk mengaktifkan notifikasi WhatsApp otomatis, Anda perlu mengintegrasikan salah satu layanan WhatsApp API. Berikut pilihan yang tersedia:

---

### **Option 1: Twilio WhatsApp API** (Recommended)

**Kelebihan:**
- API yang stabil dan terpercaya
- Dokumentasi lengkap
- Mendukung berbagai fitur WhatsApp

**Langkah Setup:**

1. Buat akun Twilio di https://www.twilio.com
2. Dapatkan `ACCOUNT_SID` dan `AUTH_TOKEN`
3. Aktifkan WhatsApp sandbox di Twilio Console
4. Tambahkan environment variables di `.env` file:
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

5. Update `/src/app/api/send-whatsapp/route.ts` dengan implementasi Twilio:
```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendWhatsAppMessage(to: string, message: string) {
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:+${to}`,
    body: message,
  });
}
```

---

### **Option 2: WhatsApp Business API (Meta)**

**Kelebihan:**
- Official dari Meta
- Gratis untuk pengiriman ke nomor yang sama (sandbox mode)
- Tanpa biaya untuk pengembangan

**Langkah Setup:**

1. Buka https://developers.facebook.com/apps/
2. Buat aplikasi WhatsApp Business
3. Dapatkan `ACCESS_TOKEN` dan `PHONE_NUMBER_ID`
4. Tambahkan environment variables:
```bash
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

5. Update `/src/app/api/send-whatsapp/route.ts`:
```typescript
async function sendWhatsAppMessage(to: string, message: string) {
  const response = await fetch('https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message },
    }),
  });

  return await response.json();
}
```

---

### **Option 3: Waboxapp**

**Kelebihan:**
- Mudah diimplementasikan
- Harga terjangkau
- Mendukung banyak fitur WhatsApp

**Langkah Setup:**

1. Daftar di https://www.waboxapp.com
2. Dapatkan API Key
3. Update `/src/app/api/send-whatsapp/route.ts`:
```typescript
async function sendWhatsAppMessage(to: string, message: string) {
  const response = await fetch('https://www.waboxapp.com/app/api/send.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: 'YOUR_WABOXAPP_API_KEY',
      number: `62${to}`,
      message: message,
    }),
  });

  return await response.json();
}
```

---

### **Option 4: Fonnte**

**Keuntungan:**
- Server lokal Indonesia (cepat)
- Murah
- Mudah digunakan

**Langkah Setup:**

1. Daftar di https://fonnte.com
2. Dapatkan Token
3. Update `/src/app/api/send-whatsapp/route.ts`:
```typescript
async function sendWhatsAppMessage(to: formatWhatsApp, message: string) {
  const response = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization: 'YOUR_FONNTE_TOKEN',
    },
    body: JSON.stringify({
      target: to,
      message: message,
      countryCode: '62',
    }),
  });

  return await response.json();
}
```

---

## 🎯 Cara Penggunaan

### **1. Atur Nomor WhatsApp:**

1. Login ke dashboard
2. Klik ikon **💬 WhatsApp** (warna hijau) di pojok kan atas
3. Dialog pengaturan akan muncul
4. Masukkan nomor WhatsApp dengan format: `6281234567890`
5. Klik **Simpan**
6. Nomor akan disimpan ke database

### **2. Kirim Notifikasi Test:**

1. Dalam dialog pengaturan WhatsApp
2. Klik **"Kirim Pesan Test ke WhatsApp"**
3. Pesan test akan dikirim ke WhatsApp Anda
4. Cek WhatsApp untuk memastikan pesan diterima

### **3. Pengiriman Otomatis:**

Sistem akan mengecek produk secara berkala dan mengirim notifikasi otomatis jika ada produk yang perlu perhatian.

Untuk mengaktifkan pengecekan otomatis, Anda perlu:

**Option A: Cron Job (Recommended)**
- Setup cron job untuk menjalankan endpoint `/api/check-notifications` setiap jam/hari
- Contoh cron job (setiap hari jam 8 pagi):
```bash
0 8 * * * curl -X POST https://yourdomain.com/api/check-notifications \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id_here", "rhDays": 14}'
```

**Option B: Trigger dari Dashboard**
- Tambah tombol "Cek & Kirim Notifikasi" di dashboard
- User bisa manual trigger pengecekan

**Option C: Auto-check saat Login**
- Jalankan pengecekan saat user login ke dashboard

---

## 📋 API Endpoints

### **1. `/api/send-whatsapp`**
- **Method:** POST, GET
- **POST Body:**
  ```json
  {
    "userId": "user_id",
    "message": "Custom message",
    "productInfo": { ... }
  }
  ```
- **GET Query:** `?userId=user_id` (untuk test notification)

### **2. `/api/user/update-whatsapp**
- **Method:** POST
- **Body:**
  ```json
  {
    "userId": "user_id",
    "whatsapp": "6281234567890"
  }
  ```

### **3. `/api/check-notifications`**
- **Method:** POST, GET
- **POST Body:**
  ```json
  {
    "userId": "user_id",
    "rhDays": 14
  }
  ```
- **GET Query:** `?userId=user_id` (cek status notifikasi)

---

## 🔐 Security Best Practices

1. **Jangan hardcode API keys di frontend** - Selalu gunakan environment variables
2. **Validasi nomor WhatsApp** - Pastikan format valid
3. **Rate limiting** - Batasi jumlah notifikasi per hari
4. **Encrypt WhatsApp numbers** - Simpan di database dengan encryption
5. **Log semua notifikasi** - Untuk audit trail

---

## 🐛 Troubleshooting

### **Problem: Pesan tidak terkirim**
- Cek API key dan credentials
- Pastikan format nomor WhatsApp benar (mulai dengan 62)
- Cek log server untuk error details

### **Problem: Nomor tidak diterima**
- Pastikan nomor sudah terhubung ke WhatsApp Business
- Cek apakah nomor di-blacklist
- Pastikan nomor dalam format internasional (62...)

### **Problem: Notifikasi spam**
- Implementasikan rate limiting
- Tambah jeda antar notifikasi
- Limit notifikasi per hari

---

## 📞 Dukungan WhatsApp API

Jika Anda memerlukan bantuan untuk setup WhatsApp API, kunjungi dokumentasi masing-masing provider:

- **Twilio**: https://www.twilio.com/docs/whatsapp
- **WhatsApp Business**: https://developers.facebook.com/docs/whatsapp
- **Waboxapp**: https://www.waboxapp.com/documentation
- **Fonnte**: https://fonnte.com/api

---

## 🚀 Next Steps

1. Pilih provider WhatsApp API yang sesuai dengan kebutuhan
2. Ikuti langkah setup di atas
3. Update file `/src/app/api/send-whatsapp/route.ts` dengan implementasi provider
4. Test kirim notifikasi
5. Setup cron job atau trigger otomatis
6. Monitor dan log notifikasi

---

## 📝 Notes

- Saat ini sistem hanya mengirim notifikasi log ke console (mock implementation)
- Untuk production, WAJIB mengintegrasikan dengan WhatsApp API asli
- Pastikan mengikuti kebijakan penggunaan WhatsApp Business API
- Hindari mengirim notifikasi spam yang berlebihan

---

## 📞 Kontak

Jika ada pertanyaan atau butuh bantuan, hubungi tim pengembang.

© Copyright Safir. All Rights Reserved.
