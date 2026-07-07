// app/api/v1/staff/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";
export const maxDuration = 60; // 🛡️ Allow up to 60 seconds for large files

const GEMINI_MODEL = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite").trim();
const GEMINI_BASE = (process.env.GEMINI_BASE ?? "https://generativelanguage.googleapis.com/v1beta").trim();
const GEMINI_TIMEOUT_MS = 55000; // Leave 5s buffer before Vercel's 60s limit
const MAX_IMAGE_DIMENSION = 2000;
const MAX_PDF_PAGES = 10;
const MAX_RETRIES = 3;

console.log(`[Staff OCR] Initialized with model: ${GEMINI_MODEL}, base: ${GEMINI_BASE}`);

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "pdf"]);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJson(text: string): any {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON found in response");
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

async function resizeImageIfNeeded(buffer: Buffer, mimeType: string): Promise<Buffer> {
  if (!mimeType.startsWith("image/")) return buffer;

  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
    return buffer;
  }

  console.log(`[Staff OCR] Resizing image from ${width}x${height}`);
  const resized = await sharp(buffer)
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toBuffer();

  // Re-wrap via Uint8Array to avoid ArrayBufferLike type mismatch on Node v26
  return Buffer.from(new Uint8Array(resized.buffer, resized.byteOffset, resized.byteLength));
}

async function getPdfPageCount(buffer: Buffer, mimeType: string): Promise<number> {
  if (mimeType !== "application/pdf") return 0;

  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.numpages;
}

interface GeminiCallResult {
  responseText: string;
  status: number;
  ok: boolean;
}

async function callGeminiWithRetry(geminiUrl: string, body: object): Promise<GeminiCallResult> {
  let lastError: any = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const responseText = await res.text();
      return { responseText, status: res.status, ok: res.ok };
    } catch (error: any) {
      lastError = error;
      if (error.name === "AbortError") {
        console.warn(`[Staff OCR] Gemini request timed out (attempt ${attempt + 1})`);
      } else {
        console.warn(`[Staff OCR] Gemini request failed (attempt ${attempt + 1}):`, error.message);
      }

      const isRetryable =
        error.name === "AbortError" ||
        (lastError?.message && /429|500|502|503|504/.test(lastError.message));

      if (attempt < MAX_RETRIES - 1 && isRetryable) {
        const backoff = 1000 * (attempt + 1);
        console.log(`[Staff OCR] Retrying in ${backoff}ms...`);
        await delay(backoff);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error("TIMEOUT");
  }

  throw lastError || new Error("Gemini request failed after retries");
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // 🛡️ Vercel Serverless limit is 4.5MB for request body
    if (file.size > 4000000) {
      return NextResponse.json(
        { success: false, error: "File is too large. Maximum size is 4MB." },
        { status: 413 }
      );
    }

    const extension = getFileExtension(file.name);

    // 🛡️ Gemini inline_data only supports images and PDFs
    if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type} (.${extension}). Please upload PNG, JPG, WEBP, or PDF.`,
        },
        { status: 415 }
      );
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(new Uint8Array(bytes));

    // 🛡️ Resize oversized images
    buffer = Buffer.from(await resizeImageIfNeeded(buffer, file.type));

    // 🛡️ Reject PDFs with too many pages
    const pdfPageCount = await getPdfPageCount(buffer, file.type);
    if (pdfPageCount > MAX_PDF_PAGES) {
      return NextResponse.json(
        {
          success: false,
          error: `PDF has ${pdfPageCount} pages. Maximum allowed is ${MAX_PDF_PAGES} pages.`,
        },
        { status: 413 }
      );
    }

    const base64Data = buffer.toString("base64");

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: "Server Error: GEMINI_API_KEY is missing." },
        { status: 503 }
      );
    }

    const geminiUrl = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

    const prompt = `You are a strict HR data extraction system.
Analyze the attached document (salary slip, CNIC, or CV).
Extract the following fields and return them as a single JSON object. Use an empty string "" for any field that is not found.
Return ONLY JSON. No markdown. No explanation. No code block. No comments. No notes.
{
  "fullName": "",
  "fatherName": "",
  "cnic": "",
  "dob": "",
  "designation": "",
  "personnelNo": "",
  "bps": "",
  "basicSalary": "",
  "grossPay": "",
  "netPay": "",
  "accountNumber": "",
  "bankName": ""
}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: file.type,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    };

    const { responseText, status: geminiStatus, ok: geminiOk } = await callGeminiWithRetry(geminiUrl, requestBody);

    if (!geminiOk) {
      console.error("[Staff OCR] Gemini API Error Response:", responseText);
      let message = "AI failed to process the document. Please try a clearer file.";
      try {
        const parsed = JSON.parse(responseText);
        if (parsed.error?.message) message = parsed.error.message;
      } catch {}

      const statusCode = geminiStatus === 429 ? 429 : 502;
      return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }

    let geminiData;
    try {
      geminiData = JSON.parse(responseText);
    } catch (e) {
      console.error("[Staff OCR] Failed to parse Gemini response as JSON:", responseText);
      return NextResponse.json(
        { success: false, error: "AI returned invalid response." },
        { status: 502 }
      );
    }

    // 🛡️ Handle safety blocks
    if (geminiData.promptFeedback?.blockReason) {
      const reason = geminiData.promptFeedback.blockReason;
      console.error("[Staff OCR] Gemini safety block:", reason);
      return NextResponse.json(
        { success: false, error: `Content blocked by AI safety filter: ${reason}` },
        { status: 422 }
      );
    }

    if (!geminiData.candidates?.length) {
      console.error("[Staff OCR] Gemini returned no candidates:", geminiData);
      return NextResponse.json(
        { success: false, error: "AI returned no extractable content." },
        { status: 502 }
      );
    }

    const candidate = geminiData.candidates[0];

    // 🛡️ Check finish reason
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      console.warn("[Staff OCR] Gemini finish reason:", candidate.finishReason);

      if (candidate.finishReason === "SAFETY" || candidate.finishReason === "RECITATION") {
        return NextResponse.json(
          { success: false, error: `Content blocked: ${candidate.finishReason}` },
          { status: 422 }
        );
      }

      if (candidate.finishReason === "MAX_TOKENS") {
        return NextResponse.json(
          { success: false, error: "AI response was truncated. Please try a smaller or clearer file." },
          { status: 502 }
        );
      }
    }

    let structuredData: any = {};
    try {
      const aiText = candidate.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "{}";
      structuredData = extractJson(aiText);
    } catch (parseError) {
      console.error("[Staff OCR] Failed to parse Gemini JSON output:", parseError);
      return NextResponse.json(
        { success: false, error: "AI returned invalid format." },
        { status: 502 }
      );
    }

    // If it's an image, we can still use it as the profile photo
    if (file.type.startsWith("image/")) {
      structuredData.photoBase64 = `data:${file.type};base64,${base64Data}`;
    } else {
      structuredData.photoBase64 = null;
    }

    console.log({
      tenant: user.tenantId,
      user: user.uid,
      model: GEMINI_MODEL,
      mime: file.type,
      size: file.size,
      pdfPages: pdfPageCount,
      candidates: geminiData.candidates?.length,
      finishReason: candidate.finishReason,
      tokens: geminiData.usageMetadata?.totalTokenCount,
    });

    return NextResponse.json({
      success: true,
      data: structuredData,
    });
  } catch (error: any) {
    if (error.message === "TIMEOUT") {
      console.error("[Staff OCR] Gemini request timed out after retries");
      return NextResponse.json(
        { success: false, error: "AI processing timed out. Please try a smaller or clearer file." },
        { status: 504 }
      );
    }

    console.error("[Staff OCR API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process document. Server error occurred." },
      { status: 500 }
    );
  }
}
