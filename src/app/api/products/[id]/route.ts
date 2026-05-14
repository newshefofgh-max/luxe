export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';
import { productSchema } from '@/lib/validators';

type RouteContext = { params: { id: string } };

function parseProduct(p: Record<string, unknown>) {
  return { ...p, _id: p.id, images: JSON.parse(p.images as string), tags: JSON.parse(p.tags as string), variants: JSON.parse(p.variants as string) };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const product = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }], isActive: true },
    });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Increment viewCount fire-and-forget
    db.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    return NextResponse.json({ data: { product: parseProduct(product as unknown as Record<string, unknown>) } });
  } catch (error) {
    console.error('[GET /api/products/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    requireAdmin(req);
    const { id } = params;
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

    const d = parsed.data as Record<string, unknown>;
    const updateData: Record<string, unknown> = { ...d };
    if (d.images !== undefined) updateData.images = JSON.stringify(d.images);
    if (d.tags !== undefined) updateData.tags = JSON.stringify(d.tags);
    if (d.variants !== undefined) updateData.variants = JSON.stringify(d.variants);

    const product = await db.product.update({ where: { id }, data: updateData });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ data: { product: parseProduct(product as unknown as Record<string, unknown>) } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[PUT /api/products/[id]]', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    requireAdmin(req);
    const { id } = params;
    const product = await db.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ data: { message: 'Product deactivated', product } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[DELETE /api/products/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
