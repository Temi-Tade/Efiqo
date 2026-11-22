import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { getGeminiClient } from "@/lib/gemini";

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "Clear, unambiguous multiple-choice question testing conceptual understanding.",
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactly 4 plausible answer choices, one of which matches the answer field verbatim.",
      },
      answer: {
        type: Type.STRING,
        description: "The exact string of the correct option from the options array.",
      },
      explanation: {
        type: Type.STRING,
        description: "A 1-2 sentence explanation of why the correct answer is right.",
      },
    },
    required: ["question", "options", "answer", "explanation"],
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
    const count = Math.min(Math.max(Number(body.number) || 10, 3), 20);
    const fileData = body.fileData ? String(body.fileData) : "";
    const mimeType = body.mimeType ? String(body.mimeType) : "";

    if (!course) {
      return NextResponse.json({ error: "Course or subject is required." }, { status: 400 });
    }

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];
    if (fileData && mimeType) {
      parts.push({ inlineData: { data: fileData, mimeType } });
      parts.push({
        text: `You are a university professor in ${course}. Analyze this lecture material and create ${count} multiple-choice exam questions with 4 distinct options each. Ensure the answer field matches one of the 4 options verbatim.`,
      });
    } else {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required when no lecture PDF is uploaded." }, { status: 400 });
      }
      parts.push({
        text: `You are a university professor in ${course}. Create ${count} multiple-choice exam questions on the topic "${topic}" with 4 distinct options each. Ensure the answer field matches one of the 4 options verbatim.`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const parsed = JSON.parse((response.text ?? "[]").trim());
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Quiz generation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to generate quiz.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
