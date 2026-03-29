import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ====================================================================
    // 🧠 ENTERPRISE AI INTEGRATION POINT
    // Here is where you would normally send the image to Google Cloud Vision
    // Example: const [result] = await client.documentTextDetection(imageBuffer);
    // ====================================================================

    console.log(`Processing uploaded slip: ${file.name}`);
    
    // Simulate AI processing delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulated JSON data returned by the AI reading a Govt PIFRA slip
    const extractedData = {
      fullName: "Muhammad Ali",
      cnic: "35202-1234567-8",
      designation: "SST Teacher (BPS-16)",
      basicSalary: "55400",
      academicEdu: "M.A. English",
      profEdu: "B.Ed",
    };

    return NextResponse.json({ success: true, data: extractedData });
    
  } catch (error: any) {
    console.error("OCR Error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}