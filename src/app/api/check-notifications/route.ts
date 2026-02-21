import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAndSendNotifications } from '@/lib/whatsapp-notification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, rhDays } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId wajib diisi' },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check and send notifications
    const result = await checkAndSendNotifications(userId, rhDays || 14);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Gagal mengecek notifikasi',
          details: result.errors
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pengecekan notifikasi selesai',
      sent: result.sent,
      failed: result.failed,
      details: result.errors.length > 0 ? result.errors : null,
    });
  } catch (error) {
    console.error('Check notifications error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek notifikasi' },
      { status: 500 }
    );
  }
}

// GET endpoint to check notification status
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

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user has WhatsApp
    const hasWhatsApp = !!user.whatsapp;
    const whatsappNumber = user.whatsapp || '';

    return NextResponse.json({
      userId,
      userName: user.name,
      hasWhatsApp,
      whatsappNumber: hasWhatsApp ? whatsappNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '',
      notificationEnabled: hasWhatsApp,
    });
  } catch (error) {
    console.error('Get notification status error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek status notifikasi' },
      { status: 500 }
    );
  }
}
