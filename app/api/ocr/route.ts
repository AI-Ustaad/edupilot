import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, documentType } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // چونکہ ابھی ہمارے پاس Google Cloud Vision یا ChatGPT کا مہنگا API Key نہیں ہے، 
    // اس لیے ہم نے آپ کی دی ہوئی سیلری سلپ کا ایک "Smart Mock Engine" بنایا ہے 
    // جو فرنٹ اینڈ کو بالکل صحیح Keys میں ڈیٹا بھیجے گا۔

    let extractedData = {};

    if (documentType === "salary_slip") {
      // یہ وہ ڈیٹا ہے جو آپ کی "Ghazanfar Ali" والی سلپ سے نکالا گیا ہے
      extractedData = {
        name: "GHAZANFAR ALI",
        cnic: "3840289071387",
        designation: "S.S.E (SCIENCE)",
        basicPay: "18910",
        grossPay: "42707",
        deductions: "9324",
        netPay: "33383"
      };
    } else {
      // اگر کوئی CV اپلوڈ کرے گا تو یہ ڈیٹا جائے گا
      extractedData = {
        name: "Candidate Name",
        education: "Master's Degree",
        experience: "3 Years",
        phone: "03001234567"
      };
    }

    // ہم سسٹم کو 2 سیکنڈ کا ڈیلے (Delay) دے رہے ہیں تاکہ AI سکیننگ کا اصلی فیل (Feel) آئے۔
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // یہ وہ ڈیٹا ہے جو سیدھا آپ کے فارم کے خانوں میں جا کر گرے گا!
    return NextResponse.json(extractedData, { status: 200 });

  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}
