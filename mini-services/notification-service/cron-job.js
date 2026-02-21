/**
 * Cron Job Script to Check and Send WhatsApp Notifications
 * 
 * This script will:
 * 1. Get all users from database
 * 2. For each user, check products that need attention
 * 3. Send WhatsApp notification if needed
 * 
 * Usage:
 * - Run manually: node mini-services/notification-service/cron-job.js
 * - Schedule with cron: node mini-services/notification-service/cron-job.js
 * 
 * Cron Schedule Examples:
 * - Every hour: 0 * * * * node mini-services/notification-service/cron-job.js
 * - Every day at 8 AM: 0 8 * * * node mini-services/notification-service/cron-job.js
 * - Every Monday at 9 AM: 0 9 * * 1 node mini-services/notification-service/cron-job.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const RH_DAYS = 14; // Default H-14

async function getProductsNeedingAttention() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const warningDate = new Date(today);
  warningDate.setDate(warningDate.getDate() + RH_DAYS);

  // Get all products with their batches
  const products = await prisma.product.findMany({
    include: {
      batches: true,
    },
  });

  const notifications = [];

  products.forEach((product) => {
    product.batches.forEach((batch) => {
      const rhDate = new Date(batch.rhDate);
      
      // Check if batch needs attention
      if (rhDate <= warningDate) {
        notifications.push({
          productName: product.name,
          barcode: product.barcode,
          plu: product.plu,
          batchNumber: batch.batchNumber,
          expiryDate: new Date(batch.expiryDate),
          rhDate: rhDate,
          status: batch.status,
          quantity: batch.quantity,
          userId: product.userId || 'unknown',
        });
      }
    });
  });

  return notifications;
}

async function generateWhatsAppMessage(notifications, userName) {
  const warningProducts = notifications.filter(n => n.status === 'warning');
  const expiredProducts = notifications.filter(n => n.status === 'expired');

  if (notifications.length === 0) {
    return null;
  }

  let message = `🔔 *NOTIFIKASI RH KADALUARSA*\n\n`;
  message += `Halo ${userName}, berikut produk yang perlu perhatian:\n\n`;

  if (expiredProducts.length > 0) {
    message += `❌ *PRODUK SUDAH JATU RH*\n`;
    expiredProducts.forEach((product, index) => {
      message += `\n${index + 1}. ${product.productName}\n`;
      message += `   Barcode: ${product.barcode}\n`;
      message += `   PLU: ${product.plu}\n`;
      message += `   Batch: ${product.batchNumber}\n`;
      message += `   Tgl Kadaluarsa: ${product.expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
      message += `   Tgl RH: ${product.rhDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
      message += `   Jumlah: ${product.quantity}\n`;
    });
    message += `\n`;
  }

  if (warningProducts.length > 0) {
    message += `⚠️ *PRODUK WAJIB RETUR (H-${RH_DAYS})*\n`;
    warningProducts.forEach((product, index) => {
      message += `\n${index + 1}. ${product.productName}\n`;
      message += `   Barcode: ${product.barcode}\n`;
      message += `   PLU: ${product.plu}\n`;
      message += `   Batch: ${product.batchNumber}\n`;
      message += `   Tgl Kadaluarsa: ${product.expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
      message += `   Tgl RH: ${product.rhDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
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

async function sendWhatsAppNotification(userId, message, userName, productName) {
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.whatsapp) {
      return {
        success: false,
        error: 'User tidak ditemukan atau tidak ada nomor WhatsApp',
      };
    }

    // Clean phone number
    const cleanPhone = user.whatsapp.replace(/[^0-9]/g, '');

    if (!cleanPhone.startsWith('62')) {
      return {
        success: false,
        error: 'Format nomor WhatsApp tidak valid (harus mulai dengan 62)',
      };
    }

    // Get Fonnte API token
    const token = process.env.FONNTE_TOKEN;

    if (!token || token === 'your_fonnte_token_here') {
      console.error('FONNTE_TOKEN not configured');
      return {
        success: false,
        error: 'WhatsApp API belum dikonfigurasi. Set FONNTE_TOKEN di environment variables',
      };
    }

    // Send to Fonnte API
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
        error: data.message || 'Gagal mengirim pesan WhatsApp via Fonnte',
        response: data,
      };
    }

    if (data.status) {
      console.log(`✅ WhatsApp sent to ${userName} (${cleanPhone}) for ${productName}`);
      return {
        success: true,
        response: data,
      };
    } else {
      console.warn(`⚠️ Fonnte returned status: ${data.status}`);
      return {
        success: false,
        error: `Fonnte API returned non-success status: ${data.status}`,
        response: data,
      };
    }
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengirim notifikasi WhatsApp',
    };
  }
}

// Main execution
async function main() {
  try {
    console.log('='.repeat(60, '='));
    console.log('  WhatsApp Notification Cron Job');
    console.log('  Running at:', new Date().toISOString());
    console.log('  RH Days:', RH_DAYS, 'days before expiry date triggers warning');
    console.log('='.repeat(60, '='));

    const notifications = await getProductsNeedingAttention();
    
    if (notifications.length === 0) {
      console.log('\n✅ Tidak ada produk yang perlu notifikasi');
      return;
    }

    console.log(`\n📋 Found ${notifications.length} products/batches needing attention`);

    // Group notifications by userId
    const userNotificationsMap = new Map();
    notifications.forEach(n => {
      if (!userNotificationsMap.has(n.userId)) {
        userNotificationsMap.set(n.userId, []);
      }
      userNotificationsMap.get(n.userId).push(n);
    });

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Process each user's notifications
    for (const [userId, userNotifs] of userNotificationsMap.entries()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          failCount += userNotifs.length;
          errors.push(`User ID ${userId} not found in database`);
          continue;
        }

        if (!user.whatsapp) {
          failCount += userNotifs.length;
          errors.push(`User ${user.username} has no WhatsApp number`);
          continue;
        }

        // Generate message for this user
        const message = generateWhatsAppMessage(userNotifs, user.name || 'User');

        if (!message) {
          console.log(`⚠️ No message generated for user ${user.username} (${userNotifs.length} notifications)`);
          continue;
        }

        // Send all notifications for this user in one message
        const result = await sendWhatsAppNotification(userId, message, user.name, userNotifs[0].productName);

        if (result.success) {
          successCount++;
        } else {
          failCount++;
          errors.push(`Failed for user ${user.username}: ${result.error}`);
        }
      } catch (error) {
        failCount += userNotifs.length;
        errors.push(`Exception for user ID ${userId}: ${error}`);
        console.error(`Exception processing user ${userId}:`, error);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60, '='));
    console.log('  SUMMARY');
    console.log('='.repeat(60, '='));
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total processed: ${successCount + failCount}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️ Errors:');
      errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    }
    console.log('\n✅ Cron job completed');

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n💀 Fatal Error:');
    console.error(error);
    console.error('  Stack:', error.stack);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { main };