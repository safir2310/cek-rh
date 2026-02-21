import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, whatsapp } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId wajib diisi' },
        { status: 400 }
      );
    }

    if (!whatsapp) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp wajib diisi' },
        { status: 400 }
      );
    }

    // Validate WhatsApp number format
    const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
    
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp tidak valid' },
        { status: 400 }
      );
    }

    // Update user WhatsApp number
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        whatsapp: cleanPhone,
      },
    });

    // Format phone number for display
    const formattedPhone = cleanPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');

    return NextResponse.json({
      success: true,
      message: 'Nomor WhatsApp berhasil diupdate',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        whatsapp: formattedPhone,
      },
    });
  } catch (error) {
    console.error('Update WhatsApp error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat update nomor WhatsApp' },
      { status: 500 }
    );
  }
}
