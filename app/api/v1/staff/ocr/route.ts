// app/api/v1/staff/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import pdfParse from "pdf-parse";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let extractedText = "";
    let photoBase64 = null;

    // 1. Extract Text (Image via Google Vision, PDF via pdf-parse)
    if (file.type.startsWith('image/')) {
      const apiKey = process.env.GOOGLE_VISION_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ success: false, error: "Image OCR not configured (Missing Google Vision Key)." }, { status: 503 });
      }
      
      const base64Image = buffer.toString('base64');
      const visionRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }]
          }]
        })
      });

      const visionData = await visionRes.json();
      if (visionData.error) {
        console.error("[Staff OCR] Google Vision Error:", visionData.error);
        return NextResponse.json({ success: false, error: "Failed to read image." }, { status: 500 });
      }
      
      extractedText = visionData?.responses?.[0]?.fullTextAnnotation?.text || "";
      photoBase64 = `data:${file.type};base64,${base64Image}`;

    } else if (file.type === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
      
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Unsupported file type. Please upload an Image or a PDF file." 
      }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({ success: true, data: { fullName: "", cnic: "", phone: "", designation: "", photoBase64, rawText: "" }, message: "No readable text found in document." });
    }

    // 2. 🚀 Use Google Gemini AI to parse and structure the extracted text
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ success: false, error: "AI Service not configured (Missing GEMINI_API_KEY)." }, { status: 503 });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const prompt = `You are an expert HR data extraction assistant. 
    Analyze the following text extracted from a staff member's salary slip, CNIC, or CV.
    Extract the following fields and return them STRICTLY as a JSON object. 
    If a field is not found, return an empty string ("") for that field.
    
    Fields to extract:
    - fullName
    - fatherName
    - cnic
    - dob (Date of Birth, format: YYYY-MM-DD if possible)
    - designation
    - personnelNo
    - bps (Basic Pay Scale number)
    - basicSalary (number only, no commas or text)
    - grossPay (number only)
    - netPay (number only)
    - accountNumber
    - bankName

    Text to analyze:
    ---
    ${extractedText}
    ---
    
    Respond ONLY with the JSON object. Do not include any markdown formatting or extra text.`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: "You are a helpful HR assistant that only outputs JSON." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
      })
    });

    const geminiData = await geminiRes.json();

    if (geminiData.error) {
      console.error("[Staff OCR] Gemini API Error:", geminiData.error);
      return NextResponse.json({ success: false, error: "AI failed to structure the data." }, { status: 500 });
    }

    // 3. Parse Gemini JSON Response
    let structuredData: any = {};
    try {
      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      structuredData = JSON.parse(aiText);
    } catch (parseError) {
      console.error("[Staff OCR] Failed to parse Gemini JSON:", parseError);
      return NextResponse.json({ success: false, error: "AI returned invalid format." }, { status: 500 });
    }

    // Add photoBase64 if it was an image
    structuredData.photoBase64 = photoBase64;
    structuredData.rawText = extractedText;

    return NextResponse.json({
      success: true,
      data: structuredData
    });

  } catch (error: any) {
    console.error("[Staff OCR API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process document. Server error occurred." },
      { status: 500 }
    );
  }
}
