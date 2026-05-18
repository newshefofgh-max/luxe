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

  const rows = await db.siteContent.findMany();
  const content: Record<string, unknown> = {};
  for (const row of rows) {
    try { content[row.key] = JSON.parse(row.value); }
    catch { content[row.key] = row.value; }
  }
  return NextResponse.json({ data: content });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });

  const serialized = typeof value === 'string' ? value : JSON.stringify(value);

  const row = await db.siteContent.upsert({
    where: { key },
    update: { value: serialized },
    create: { key, value: serialized },
  });

  return NextResponse.json({ data: row });
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
