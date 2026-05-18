import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    const payload = verifyToken(token) as { role?: string } | null;
    if (!payload || payload.role !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ data: categories });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, nameAr, nameEn, sortOrder } = await req.json();
  if (!slug || !nameAr || !nameEn) {
    return NextResponse.json({ error: 'slug, nameAr, nameEn required' }, { status: 400 });
  }

  try {
    const category = await db.category.create({
      data: { slug, nameAr, nameEn, sortOrder: sortOrder ?? 0 },
    });
    return NextResponse.json({ data: category });
  } catch {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
  }
}
