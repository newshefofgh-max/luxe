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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, nameAr, nameEn, sortOrder } = await req.json();
  try {
    const category = await db.category.update({
      where: { id: params.id },
      data: { ...(slug && { slug }), ...(nameAr && { nameAr }), ...(nameEn && { nameEn }), ...(sortOrder !== undefined && { sortOrder }) },
    });
    return NextResponse.json({ data: category });
  } catch {
    return NextResponse.json({ error: 'Not found or slug conflict' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
