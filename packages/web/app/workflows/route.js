import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';

export async function POST(req) {
  const yamlText = await req.text();
  await fs.mkdir('data', { recursive: true });
  await fs.writeFile(`data/${Date.now()}.yaml`, yamlText);
  return NextResponse.json({ ok: true }, { status: 201 });
}
