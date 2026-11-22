import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function readEnvFileFallback(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    try {
      const content = fs.readFileSync(filePath, "utf8");
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const eqIdx = line.indexOf("=");
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key && !(key in out)) {
          out[key] = val;
        }
      }
    } catch {
      // Ignore unreadable env file
    }
  }
  return out;
}

export async function GET() {
  const fileEnv = readEnvFileFallback();
  const readVar = (name: string) => process.env[name] || fileEnv[name] || "";

  const config = {
    apiKey: readVar("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readVar("NEXT_PUBLIC_FIREBASE_APP_ID"),
    measurementId: readVar("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
  };

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
