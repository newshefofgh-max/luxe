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
    // 'all' = no filter (admin), 'true'/'false' = explicit, null = default active-only (store)
    const activeParam = searchParams.get('active') ?? searchParams.get('isActive');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // sort shorthand from store pages: newest | price_asc | price_desc | popular
    const sortShorthand = searchParams.get('sort');
    let orderByField = searchParams.get('sortBy') ?? 'createdAt';
    let orderDir: 'asc' | 'desc' = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    if (sortShorthand) {
      if (sortShorthand === 'newest')     { orderByField = 'createdAt'; orderDir = 'desc'; }
      else if (sortShorthand === 'oldest'){ orderByField = 'createdAt'; orderDir = 'asc'; }
      else if (sortShorthand === 'price_asc') { orderByField = 'price'; orderDir = 'asc'; }
      else if (sortShorthand === 'price_desc'){ orderByField = 'price'; orderDir = 'desc'; }
      else if (sortShorthand === 'popular')   { orderByField = 'sold';  orderDir = 'desc'; }
    }

    const where: Record<string, unknown> = {};
    if (activeParam === null) where.isActive = true;           // default: store sees active only
    else if (activeParam !== 'all') where.isActive = activeParam === 'true';
    // activeParam === 'all': no isActive filter (admin sees everything)
    if (category) where.category = category;
    if (featured !== null) where.isFeatured = featured === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    const SORT_MAP: Record<string, string> = { price: 'price', createdAt: 'createdAt', sold: 'sold' };
    const safeField = SORT_MAP[orderByField] ?? 'createdAt';

    const [products, total] = await Promise.all([
      db.product.findMany({ where, orderBy: { [safeField]: orderDir }, skip, take: limit }),
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
