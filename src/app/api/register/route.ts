import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, email } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter' },
        { status: 400 }
      );
    }

    if (password.length < 3) {
      return NextResponse.json(
        { error: 'Password minimal 3 karakter' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Create new user
    const newUser = await db.user.create({
      data: {
        username,
        password, // In real app, use bcrypt for password hashing
        name: name || username,
        email: email || null,
      },
    });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Registrasi berhasil',
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
