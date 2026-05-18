import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';


export async function GET() {
  try {
    const rows = await db.siteContent.findMany();
    const content = { ...DEFAULT_CONTENT };
    for (const row of rows) {
      try {
        content[row.key] = JSON.parse(row.value);
      } catch {
        content[row.key] = row.value;
      }
    }
    return NextResponse.json({ data: content });
  } catch {
    return NextResponse.json({ data: DEFAULT_CONTENT });
  }
}
