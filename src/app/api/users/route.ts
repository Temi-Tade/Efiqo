import { NextResponse } from "next/server";
import { userMemoryStore } from "@/lib/userStore";

export async function GET() {
  return NextResponse.json(Array.from(userMemoryStore.values()));
}
