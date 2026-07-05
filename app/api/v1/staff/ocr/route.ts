// app/api/v1/staff/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";

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

    // Check if API Key is configured
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Google Vision API Key not configured." }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 🚀 Call Google Cloud Vision API (Takes 1-2 seconds)
    const visionRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          image: { content: base64Image },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }] // Better for documents than TEXT_DETECTION
        }]
      })
    });

    const visionData = await visionRes.json();
    
    if (!visionData.responses || !visionData.responses[0]) {
      throw new Error("No response from Google Vision");
    }

    const extractedText = visionData.responses[0].fullTextAnnotation?.text || "";

    // 5. Extract Fields using Regex
    const extract = (regex: RegExp) => {
      const match = extractedText.match(regex);
      return match ? match[1].trim() : "";
    };

    const fullName = extract(/(?:Name|Full Name)\s*[:\-]?\s*([A-Za-z\s\.]+)/i);
    const cnic = extract(/(?:CNIC|B-Form)\s*[:\-]?\s*([0-9\-]{8,15})/i);
    const phone = extract(/(?:Phone|Mobile|Cell)\s*[:\-]?\s*([0-9\+\-\s]{11,15})/i);
    const designation = extract(/(?:Designation|Post|Role)\s*[:\-]?\s*([A-Za-z\s\.]+)/i);

    // Convert Image to Base64 for Photo Preview
    const photoBase64 = `data:${file.type};base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      data: {
        fullName,
        cnic,
        phone,
        designation,
        photoBase64,
        rawText: extractedText
      }
    });

  } catch (error: any) {
    console.error("[Staff OCR API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process document." },
      { status: 500 }
    );
  }
}
