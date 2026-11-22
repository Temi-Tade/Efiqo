import { NextRequest, NextResponse } from "next/server";
import { userMemoryStore } from "@/lib/userStore";
import type { UserProfile } from "@/types/efiqo";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ email: string }> }
) {
  const { email } = await context.params;
  const decoded = decodeURIComponent(email);
  const user = userMemoryStore.get(decoded);
  if (!user) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }
  return NextResponse.json({ exists: true, data: user });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ email: string }> }
) {
  const { email } = await context.params;
  const decoded = decodeURIComponent(email);
  const body = (await req.json()) as Partial<UserProfile>;
  const existing = userMemoryStore.get(decoded) || ({} as UserProfile);
  const updated = { ...existing, ...body, email: decoded } as UserProfile;
  userMemoryStore.set(decoded, updated);
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ email: string }> }
) {
  const { email } = await context.params;
  const decoded = decodeURIComponent(email);
  userMemoryStore.delete(decoded);
  return NextResponse.json({ ok: true });
}
