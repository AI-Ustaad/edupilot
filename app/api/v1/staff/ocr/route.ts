// app/api/v1/staff/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import { createWorker } from "tesseract.js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get File from FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // 3. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Run OCR (Tesseract.js)
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    
    const extractedText = data.text;

    // 5. Extract Fields using Regex (Basic Auto-Fill Logic)
    const extract = (regex: RegExp) => {
      const match = extractedText.match(regex);
      return match ? match[1].trim() : "";
    };

    const fullName = extract(/(?:Name|Full Name)\s*[:\-]?\s*([A-Za-z\s\.]+)/i);
    const cnic = extract(/(?:CNIC|B-Form|C\.N\.I\.C)\s*[:\-]?\s*([0-9\-]{8,15})/i);
    const phone = extract(/(?:Phone|Mobile|Cell)\s*[:\-]?\s*([0-9\+\-\s]{11,15})/i);
    const designation = extract(/(?:Designation|Post|Role)\s*[:\-]?\s*([A-Za-z\s\.]+)/i);
    const joiningDate = extract(/(?:Joining Date|Date of Joining)\s*[:\-]?\s*([0-9\/\-]{8,10})/i);

    // 6. Convert Image to Base64 for Photo Preview (if it's an image)
    let photoBase64 = null;
    if (file.type.startsWith('image/')) {
      photoBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    // 7. Return Extracted Data
    return NextResponse.json({
      success: true,
      data: {
        fullName,
        cnic,
        phone,
        designation,
        joiningDate,
        photoBase64,
        rawText: extractedText // For debugging if needed
      }
    });

  } catch (error: any) {
    console.error("[Staff OCR API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process document. Please ensure it is a clear image or PDF." },
      { status: 500 }
    );
  }
}
