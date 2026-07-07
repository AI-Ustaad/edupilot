// app/api/v1/staff/ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";
export const maxDuration = 60; // 🛡️ Allow up to 60 seconds for large files

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
      return NextResponse.json({ 
        success: false, 
        error: "File is too large. Maximum size is 4MB." 
      }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ success: false, error: "Server Error: GEMINI_API_KEY is missing." }, { status: 503 });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const prompt = `You are a strict HR data extraction system. 
    Analyze the attached document (salary slip, CNIC, or CV).
    Extract fields and return STRICTLY as a JSON object. If not found, return "".
    {
      "fullName": "", "fatherName": "", "cnic": "", "dob": "", "designation": "", "personnelNo": "", "bps": "", "basicSalary": "", "grossPay": "", "netPay": "", "accountNumber": "", "bankName": ""
    }`;

    // 🚀 Send file directly to Gemini (Supports both Images and PDFs natively)
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: file.type,
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
        }],
        generationConfig: { 
          temperature: 0.1,
          responseMimeType: "application/json" 
        }
      })
    });

    // 🛡️ Safely read the response text first
    const responseText = await geminiRes.text();

    if (!geminiRes.ok) {
      console.error("[Staff OCR] Gemini API Error Response:", responseText);
      return NextResponse.json({ 
        success: false, 
        error: "AI failed to process the document. Please try a clearer file." 
      }, { status: 500 });
    }

    let geminiData;
    try {
      geminiData = JSON.parse(responseText);
    } catch (e) {
      console.error("[Staff OCR] Failed to parse Gemini response as JSON:", responseText);
      return NextResponse.json({ success: false, error: "AI returned invalid response." }, { status: 500 });
    }

    let structuredData: any = {};
    try {
      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      structuredData = JSON.parse(aiText);
    } catch (parseError) {
      console.error("[Staff OCR] Failed to parse Gemini JSON output:", parseError);
      return NextResponse.json({ success: false, error: "AI returned invalid format." }, { status: 500 });
    }

    // If it's an image, we can still use it as the profile photo
    if (file.type.startsWith('image/')) {
      structuredData.photoBase64 = `data:${file.type};base64,${base64Data}`;
    } else {
      structuredData.photoBase64 = null;
    }

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
