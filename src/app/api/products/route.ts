export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';
import { productSchema } from '@/lib/validators';

function parseProduct(p: Record<string, unknown>) {
  return {
    ...p,
    _id: p.id,
    images: JSON.parse(p.images as string),
    tags: JSON.parse(p.tags as string),
    variants: JSON.parse(p.variants as string),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const active = searchParams.get('active');
    const sortBy = searchParams.get('sortBy') ?? 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    where.isActive = active !== null ? active === 'true' : true;
    if (category) where.category = category;
    if (featured !== null) where.isFeatured = featured === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
      ];
    }

    const SORT_MAP: Record<string, string> = { price: 'price', createdAt: 'createdAt', popularity: 'sold' };
    const orderByField = SORT_MAP[sortBy] ?? 'createdAt';

    const [products, total] = await Promise.all([
      db.product.findMany({ where, orderBy: { [orderByField]: sortOrder }, skip, take: limit }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ data: { products: products.map((p) => parseProduct(p as unknown as Record<string, unknown>)), total, page, pages: Math.ceil(total / limit), limit } });
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

    const d = parsed.data as Record<string, unknown>;
    const rawImages = (body as Record<string, unknown>).images;
    const product = await db.product.create({
      data: {
        name: d.name as string, nameAr: d.nameAr as string, slug: d.slug as string, description: d.description as string,
        descriptionAr: d.descriptionAr as string, price: d.price as number, comparePrice: d.comparePrice as number | undefined,
        images: JSON.stringify(Array.isArray(rawImages) ? rawImages : []), category: d.category as string,
        variants: JSON.stringify(Array.isArray(d.variants) ? d.variants : []), stock: (d.stock as number) ?? 0,
        isActive: (d.isActive as boolean) ?? true, isFeatured: (d.isFeatured as boolean) ?? false,
        tags: JSON.stringify(Array.isArray(d.tags) ? d.tags : []),
      },
    });
    return NextResponse.json({ data: parseProduct(product as unknown as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[POST /api/products]', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
