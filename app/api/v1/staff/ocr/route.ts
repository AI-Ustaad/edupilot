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

    // 🚀 Hybrid Logic: Image vs PDF
    if (file.type.startsWith('image/')) {
      // CASE 1: It's an Image -> Use Google Vision API
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
      // CASE 2: It's a PDF -> Use pdf-parse
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
      
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Unsupported file type. Please upload an Image (JPG, PNG) or a PDF file." 
      }, { status: 400 });
    }

    if (!extractedText) {
      return NextResponse.json({ success: true, data: { fullName: "", cnic: "", phone: "", designation: "", photoBase64, rawText: "" }, message: "No text found in document." });
    }

    // 🚀 Enterprise Regex Patterns for Salary Slips
    const extract = (regex: RegExp) => {
      const match = extractedText.match(regex);
      return match ? match[1].trim() : "";
    };

    const fullName = extract(/(?:Payee Name|Name of Mr|Name)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?=\s*(?:d\/w\/s|CNIC|Father|Personnel|Designation|$))/i) 
                  || extract(/(?:Payee Name|Name)\s*[:\-]?\s*([A-Za-z\s\.]+)/i);
                  
    const fatherName = extract(/(?:d\/w\/s of|Father Name|Father)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?=\s*(?:CNIC|Personnel|NTN|Date|$))/i);
    const cnic = extract(/(?:CNIC|C\.N\.I\.C|Identity)\s*[:\-]?\s*([0-9\-]{8,15})/i);
    const dob = extract(/(?:Date of Birth|D\.O\.B|DOB)\s*[:\-]?\s*([0-9\.\-\/]{8,10})/i);
    const personnelNo = extract(/(?:Personnel Number|Personnel No|P\.No|Emp ID|Employee ID)\s*[:\-]?\s*([0-9A-Za-z\-]{4,15})/i);
    const designation = extract(/(?:Designation|Post|Grade|Role)\s*[:\-]?\s*([A-Za-z\s\.\(\)]+?)(?=\s*(?:DDO|0000|Payroll|Pay\s|Scale|$))/i);
    const bps = extract(/(?:BPS|Scale|Pay Scale)\s*[:\-]?\s*(\d{1,2})/i);

    const basicSalaryStr = extract(/(?:Basic Pay|Basic Salary|0001 Basic Pay)\s*[:\-]?\s*(?:Rs\.?\s*)?([0-9,]+)/i);
    const basicSalary = basicSalaryStr ? basicSalaryStr.replace(/,/g, '') : "";
    
    const netPayStr = extract(/(?:Net Pay|Net Salary|Net Amount)\s*[:\-]?\s*(?:Rs\.?\s*)?\(?(Rs\.?\s*)?([0-9,]+)/i);
    const netPay = netPayStr ? netPayStr.replace(/,/g, '') : "";
    
    const grossPayStr = extract(/(?:Gross Pay|Gross Salary)\s*[:\-]?\s*(?:Rs\.?\s*)?\(?(Rs\.?\s*)?([0-9,]+)/i);
    const grossPay = grossPayStr ? grossPayStr.replace(/,/g, '') : "";

    const accountNumber = extract(/(?:Account Number|A\/C No|Account No)\s*[:\-]?\s*([0-9\-]{8,20})/i);
    const bankName = extract(/(?:Bank Details|Bank Name)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?=\s*(?:Branch|$))/i);

    return NextResponse.json({
      success: true,
      data: {
        fullName,
        fatherName,
        cnic,
        dob,
        designation,
        personnelNo,
        bps,
        basicSalary,
        netPay,
        grossPay,
        accountNumber,
        bankName,
        photoBase64,
        rawText: extractedText
      }
    });

  } catch (error: any) {
    console.error("[Staff OCR API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process document. Server error occurred." },
      { status: 500 }
    );
  }
}
