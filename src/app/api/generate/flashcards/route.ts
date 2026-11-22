import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { getGeminiClient } from "@/lib/gemini";

const flashcardSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      term: {
        type: Type.STRING,
        description: "The key concept, term, or prompt on the front of the flashcard.",
      },
      def: {
        type: Type.STRING,
        description: "A concise, accurate definition or explanation for the back of the flashcard.",
      },
    },
    required: ["term", "def"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in Settings > Secrets." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const course = String(body.course || "").trim();
    const topic = String(body.topic || "").trim();
    const isPremium = Boolean(body.isPremium);
    const maxAllowedCount = isPremium ? 50 : 20;
    const maxPdfMb = isPremium ? 15 : 5;
    const count = Math.min(Math.max(Number(body.number) || 10, 3), maxAllowedCount);
    const fileData = body.fileData ? String(body.fileData) : "";
    const mimeType = body.mimeType ? String(body.mimeType) : "";

    if (!course) {
      return NextResponse.json({ error: "Course or subject is required." }, { status: 400 });
    }

    if (fileData) {
      const approxBytes = Math.ceil((fileData.length * 3) / 4);
      if (approxBytes > maxPdfMb * 1024 * 1024) {
        return NextResponse.json(
          { error: `Uploaded PDF exceeds the ${maxPdfMb} MB limit for your plan.` },
          { status: 413 }
        );
      }
    }

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];
    if (fileData && mimeType) {
      parts.push({ inlineData: { data: fileData, mimeType } });
      parts.push({
        text: `You are Efi, an elite academic AI tutor optimized for the Nigerian and global education markets (WAEC, NECO, JAMB, GCE, Undergraduate & Postgraduate studies). Analyze this lecture material thoroughly and create exactly ${count} rigorous, high-yield active-recall flashcards covering core concepts, definitions, formulas, and mechanisms in ${course}. Keep terms precise and definitions concise yet comprehensive (1-3 sentences).`,
      });
    } else {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required when no lecture PDF is uploaded." }, { status: 400 });
      }
      parts.push({
        text: `You are Efi, an elite academic AI tutor optimized for the Nigerian and global education markets (WAEC, NECO, JAMB, GCE, Undergraduate & Postgraduate studies). Create exactly ${count} rigorous, high-yield active-recall flashcards on the topic "${topic}" for ${course}. Keep terms precise and definitions concise yet comprehensive (1-3 sentences).`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: flashcardSchema,
      },
    });

    const parsed = JSON.parse((response.text ?? "[]").trim());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Flashcard generation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to generate flashcards.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
