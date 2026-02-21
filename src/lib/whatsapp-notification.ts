import { db } from '@/lib/db';

interface ProductNeedingAttention {
  productId: string;
  productName: string;
  barcode: string;
  plu: string;
  batchNumber: string;
  expiryDate: Date;
  rhDate: Date;
  status: 'warning' | 'expired';
  quantity: number;
}

interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}

// Check if product needs attention (warning or expired)
function needsAttention(rhDate: Date, rhDays: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const warningDate = new Date(today);
  warningDate.setDate(warningDate.getDate() + rhDays);

  return rhDate <= warningDate;
}

// Get products that need attention from store data
export function getProductsNeedingAttentionFromStore(
  products: any[],
  rhDays: number = 14
): ProductNeedingAttention[] {
  const productsNeedingAttention: ProductNeedingAttention[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  products.forEach((product: any) => {
    product.batches.forEach((batch: any) => {
      if (needsAttention(new Date(batch.rhDate), rhDays)) {
        productsNeedingAttention.push({
          productId: product.id,
          productName: product.name,
          barcode: product.barcode,
          plu: product.plu,
          batchNumber: batch.batchNumber,
          expiryDate: new Date(batch.expiryDate),
          rhDate: new Date(batch.rhDate),
          status: batch.status,
          quantity: batch.quantity,
        });
      }
    });
  });

  return productsNeedingAttention;
}

// Get products that need attention (from database - placeholder)
export async function getProductsNeedingAttention(userId: string): Promise<ProductNeedingAttention[]> {
  try {
    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // In a real application, you would query the database for products
    // For now, this returns empty array
    // You would replace this with actual database queries like:
    // const products = await db.product.findMany({
    //   where: { userId },
    //   include: { batches: true },
    // });

    return [];
  } catch (error) {
    console.error('Error getting products needing attention:', error);
    return [];
  }
}

// Generate WhatsApp message for products needing attention
export function generateWhatsAppNotification(
  userName: string,
  products: ProductNeedingAttention[],
  rhDays: number = 14
): string {
  if (products.length === 0) {
    return '';
  }

  const warningProducts = products.filter(p => p.status === 'warning');
  const expiredProducts = products.filter(p => p.status === 'expired');

  let message = `🔔 *NOTIFIKASI RH KADALUARSA*\n\n`;
  message += `Halo ${userName}, berikut produk yang perlu perhatian:\n\n`;

  if (expiredProducts.length > 0) {
    message += `❌ *PRODUK SUDAH JATU RH*\n`;
    expiredProducts.forEach((product, index) => {
      message += `\n${index + 1}. ${product.productName}\n`;
      message += `   Barcode: ${product.barcode}\n`;
      message += `   PLU: ${product.plu}\n`;
      message += `   Batch: ${product.batchNumber}\n`;
      message += `   Tgl Kadaluarsa: ${formatDate(product.expiryDate)}\n`;
      message += `   Tgl RH: ${formatDate(product.rhDate)}\n`;
      message += `   Jumlah: ${product.quantity}\n`;
    });
    message += `\n`;
  }

  if (warningProducts.length > 0) {
    message += `⚠️ *PRODUK WAJIB RETUR (H-${rhDays})*\n`;
    warningProducts.forEach((product, index) => {
      message += `\n${index + 1}. ${product.productName}\n`;
      message += `   Barcode: ${product.barcode}\n`;
      message += `   PLU: ${product.plu}\n`;
      message += `   Batch: ${product.batchNumber}\n`;
      message += `   Tgl Kadaluarsa: ${formatDate(product.expiryDate)}\n`;
      message += `   Tgl RH: ${formatDate(product.rhDate)}\n`;
      message += `   Jumlah: ${product.quantity}\n`;
    });
    message += `\n`;
  }

  message += `Mohon segera lakukan pengecekan dan tindaklanjuti.\n\n`;
  message += `Terima kasih,\n`;
  message += `📱 Sistem RH KADALUARSA\n`;
  message += `© Copyright Safir`;

  return message;
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Send WhatsApp notification to user using Fonnte API
export async function sendWhatsAppNotification(
  userId: string,
  message: string
): Promise<{ success: boolean; error?: string; response?: any }> {
  try {
    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User tidak ditemukan' };
    }

    if (!user.whatsapp) {
      return { success: false, error: 'User tidak memiliki nomor WhatsApp' };
    }

    // Clean phone number
    const cleanPhone = user.whatsapp.replace(/[^0-9]/g, '');

    if (!cleanPhone.startsWith('62')) {
      return { success: false, error: 'Format nomor WhatsApp tidak valid (harus mulai dengan 62)' };
    }

    // Get Fonnte API token from environment
    const token = process.env.FONNTE_TOKEN;

    if (!token || token === 'your_fonnte_token_here') {
      return { 
        success: false, 
        error: 'WhatsApp API belum dikonfigurasi. Silakan set FONNTE_TOKEN di environment variables.' 
      };
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
        countryCode: '62',
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
    console.log(`To: +${cleanPhone} (${user.name})`);
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
    console.error('Error sending WhatsApp notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Gagal mengirim notifikasi WhatsApp'
    };
  }
}

// Check and send notifications for user
export async function checkAndSendNotifications(
  userId: string,
  rhDays: number = 14,
  products?: any[]
): Promise<NotificationResult> {
  try {
    // Get products needing attention
    let productsNeedingAttention: ProductNeedingAttention[];
    
    if (products && products.length > 0) {
      productsNeedingAttention = getProductsNeedingAttentionFromStore(products, rhDays);
    } else {
      productsNeedingAttention = await getProductsNeedingAttention(userId);
    }

    if (productsNeedingAttention.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        errors: [],
      };
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        sent: 0,
        failed: 1,
        errors: ['User tidak ditemukan'],
      };
    }

    // Generate notification message
    const message = generateWhatsAppNotification(user.name || 'User', productsNeedingAttention, rhDays);

    if (!message) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        errors: [],
      };
    }

    // Send notification
    const result = await sendWhatsAppNotification(userId, message);

    if (result.success) {
      return {
        success: true,
        sent: 1,
        failed: 0,
        errors: [],
      };
    } else {
      return {
        success: false,
        sent: 0,
        failed: 1,
        errors: [result.error || 'Gagal mengirim notifikasi'],
      };
    }
  } catch (error) {
    console.error('Error in checkAndSendNotifications:', error);
    return {
      success: false,
      sent: 0,
      failed: 1,
      errors: ['Terjadi kesalahan sistem'],
    };
  }
}

// Schedule daily notification check
export async function scheduleDailyNotifications() {
  // This function should be called by a cron job or scheduled task
  // In production, you would:
  // 1. Get all users
  // 2. For each user, check their products
  // 3. Send notifications for products needing attention
  // 4. Log the results

  console.log('Running daily notification check...');
  
  // Implementation would go here
}
