import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface WhatsAppMessage {
  to: string;
  message: string;
}

// Send WhatsApp message using Fonnte API
async function sendWhatsAppMessage(to: string, message: string): Promise<{ success: boolean; error?: string; response?: any }> {
  try {
    // Get Fonnte API token from environment
    const token = process.env.FONNTE_TOKEN;

    if (!token || token === 'your_fonnte_token_here') {
      console.error('FONNTE_TOKEN not configured in environment variables');
      return { 
        success: false, 
        error: 'WhatsApp API belum dikonfigurasi. Silakan set FONNTE_TOKEN di environment variables.' 
      };
    }

    // Clean phone number - remove any non-numeric characters
    const cleanPhone = to.replace(/[^0-9]/g, '');

    // Validate phone number format (Indonesia: starts with 62)
    if (!cleanPhone.startsWith('62')) {
      return { success: false, error: 'Format nomor WhatsApp tidak valid (harus mulai dengan 62 untuk Indonesia)' };
    }

    // Validate token
    if (token.length < 10) {
      return { success: false, error: 'Token WhatsApp API tidak valid' };
    }

    // Prepare request to Fonnte API
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: cleanPhone,
        message: message,
        countryCode: '62', // Indonesia country code
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Fonnte API Error:', data);
      return { 
        success: false, 
        error: data.message || 'Gagal mengirim pesan via Fonnte API',
        response: data
      };
    }

    console.log('=== WhatsApp Notification Sent via Fonnte ===');
    console.log(`To: +${cleanPhone}`);
    console.log(`Status: ${data.status}`);
    console.log(`Message: ${message}`);
    console.log('======================================');

    if (data.status) {
      return { 
        success: true, 
        response: data 
      };
    } else {
      return { 
        success: false, 
        error: data.message || 'Pesan gagal dikirim',
        response: data
      };
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Gagal mengirim pesan WhatsApp'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, productInfo } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'UserId dan message wajib diisi' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user has WhatsApp number
    if (!user.whatsapp) {
      return NextResponse.json(
        { error: 'User tidak memiliki nomor WhatsApp' },
        { status: 400 }
      );
    }

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(user.whatsapp, message);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Gagal mengirim pesan WhatsApp' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan WhatsApp berhasil dikirim',
      to: user.whatsapp,
      content: message,
      provider: 'Fonnte',
      response: result.response,
    });
  } catch (error) {
    console.error('Send WhatsApp notification error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim notifikasi WhatsApp' },
      { status: 500 }
    );
  }
}

// GET endpoint to test notification system
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId parameter required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get products that need attention (mock data for testing)
    const productsNeedingAttention = [
      {
        name: 'Contoh Produk 1',
        barcode: '8991234567890',
        status: 'warning',
        rhDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        quantity: 100,
        batchNumber: 'BATCH001',
        plu: 'PLU001',
      },
      {
        name: 'Contoh Produk 2',
        barcode: '8999876543210',
        status: 'expired',
        rhDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        quantity: 50,
        batchNumber: 'BATCH002',
        plu: 'PLU002',
      },
    ];

    // Generate test message
    const warningProducts = productsNeedingAttention.filter(p => p.status === 'warning');
    const expiredProducts = productsNeedingAttention.filter(p => p.status === 'expired');

    let message = `🔔 *TEST NOTIFIKASI RH KADALUARSA*\n\n`;
    message += `Halo ${user.name || 'User'}, ini adalah pesan TES dari sistem.\n\n`;

    if (expiredProducts.length > 0) {
      message += `❌ *PRODUK JATU RH (TEST)*\n`;
      expiredProducts.forEach((product, index) => {
        message += `\n${index + 1}. ${product.name}\n`;
        message += `   Barcode: ${product.barcode}\n`;
        message += `   PLU: ${product.plu}\n`;
        message += `   Batch: ${product.batchNumber}\n`;
        message += `   Tgl Kadaluarsa: ${new Date(product.expiryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
        message += `   Tgl RH: ${new Date(product.rhDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
        message += `   Jumlah: ${product.quantity}\n`;
      });
      message += `\n`;
    }

    if (warningProducts.length > 0) {
      message += `⚠️ *PRODUK WAJIB RETUR (TEST)*\n`;
      warningProducts.forEach((product, index) => {
        message += `\n${index + 1}. ${product.name}\n`;
        message += `   Barcode: ${product.barcode}\n`;
        message += `   PLU: ${product.plu}\n`;
        message += `   Batch: ${product.batchNumber}\n`;
        message += `   Tgl Kadaluarsa: ${new Date(product.expiryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
        message += `   Tgl RH: ${new Date(product.rhDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
        message += `   Jumlah: ${product.quantity}\n`;
      });
      message += `\n`;
    }

    message += `*Ini adalah pesan TES untuk memastikan notifikasi berfungsi.*\n\n`;
    message += `Sistem akan mengirim notifikasi otomatis untuk produk yang memang perlu perhatian.\n\n`;
    message += `© RH KADALUARSA`;

    // Send test message
    const result = await sendWhatsAppMessage(user.whatsapp, message);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Gagal mengirim pesan WhatsApp' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pesan test WhatsApp berhasil dikirim via Fonnte',
      to: user.whatsapp,
      content: message,
      provider: 'Fonnte',
      response: result.response,
    });
  } catch (error) {
    console.error('Test WhatsApp notification error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim notifikasi test' },
      { status: 500 }
    );
  }
}
