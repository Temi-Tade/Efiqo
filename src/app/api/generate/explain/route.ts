import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

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
    const promptType = body.type === "flashcard" ? "flashcard" : "quiz";
    const question = String(body.question || "").trim();
    const answer = String(body.answer || "").trim();
    const userAnswer = String(body.userAnswer || "").trim();

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required." }, { status: 400 });
    }

    const prompt =
      promptType === "flashcard"
        ? `A student is studying the flashcard term "${question}" with definition "${answer}". Provide a clear, memorable 2-3 sentence real-world analogy or study mnemonic to help them retain this concept.`
        : `A student answered a quiz question: "${question}". The correct answer is "${answer}"${
            userAnswer && userAnswer !== answer ? `, and the student chose "${userAnswer}"` : ""
          }. Explain concisely in 2-3 sentences why "${answer}" is correct${
            userAnswer && userAnswer !== answer ? ` and why "${userAnswer}" is a common misconception` : ""
          }.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are Efi, an elite, encouraging academic study tutor optimized for the Nigerian and global education markets. Provide a crystal-clear, memorable real-world analogy or study breakdown to help the student master the concept. Keep explanations crisp, accurate, and under 80 words.",
      },
    });

    return NextResponse.json({ explanation: (response.text ?? "").trim() });
  } catch (error) {
    console.error("Explanation generation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to generate explanation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
