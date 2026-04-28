import { NextResponse } from 'next/server';
import path from 'path';
import { readFileSync } from 'fs';

// Load the medicines data once at module level (server-only, never bundled to client)
let cachedData = null;

function getMedicinesData() {
  if (cachedData) return cachedData;
  const filePath = path.join(process.cwd(), 'public', 'medicines.json');
  cachedData = JSON.parse(readFileSync(filePath, 'utf-8'));
  return cachedData;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query    = searchParams.get('q')?.toLowerCase().trim() || '';
  const category = searchParams.get('category') || 'all';
  const sort     = searchParams.get('sort') || 'name';
  const page     = parseInt(searchParams.get('page') || '1', 10);
  const limit    = parseInt(searchParams.get('limit') || '12', 10);

  let results = getMedicinesData();

  // Filter by search query
  if (query) {
    results = results.filter(
      (med) =>
        med.name.toLowerCase().includes(query) ||
        med.salt.toLowerCase().includes(query) ||
        med.manufacturer.toLowerCase().includes(query)
    );
  } else if (category !== 'all') {
    results = results.filter((med) => med.category === category);
  }

  // Sort
  if (sort === 'price-low')       results = [...results].sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') results = [...results].sort((a, b) => b.price - a.price);
  else                            results = [...results].sort((a, b) => a.name.localeCompare(b.name));

  const total      = results.length;
  const startIndex = (page - 1) * limit;
  const items      = results.slice(startIndex, startIndex + limit);

  return NextResponse.json(
    { items, total, page, totalPages: Math.ceil(total / limit) },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
  );
}
