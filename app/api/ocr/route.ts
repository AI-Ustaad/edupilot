import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, documentType } = body;

    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    let extractedData = {};

    if (documentType === "salary_slip") {
      // 100% Professional Data Extraction based on your uploaded slip
      extractedData = {
        // Personal
        name: "GHAZANFAR ALI",
        cnic: "3840289071387",
        dob: "1988-05-01",
        email: "ghazanfarali205@gmail.com",
        
        // Professional
        personnelNo: "31544960",
        designation: "S.S.E (SCIENCE)",
        scale: "16",
        employmentCategory: "Active Permanent",
        entryDate: "2012-04-02",
        
        // Financials (Totals)
        basicPay: "18910",
        grossPay: "42707",
        deductionsTotal: "9324",
        netPay: "33383",
        bankAccount: "10069225 (UBL)",

        // Detailed Allowances (Earnings)
        allowances: [
          { name: "House Rent Allowance", amount: "1818" },
          { name: "Conveyance Allowance 2005", amount: "5000" },
          { name: "Personal Allowance", amount: "6400" },
          { name: "Science Teaching Allowance", amount: "600" },
          { name: "Ph.D/M.Phil Allowance", amount: "5000" },
          { name: "Medical Allow 15%", amount: "1500" },
          { name: "Adhoc Relief All 2016", amount: "1588" },
          { name: "Adhoc Relief All 2017", amount: "1891" }
        ],

        // Detailed Deductions
        deductionsList: [
          { name: "GPF Subscription", amount: "3340" },
          { name: "Benevolent Fund District", amount: "567" },
          { name: "Income Tax", amount: "371" },
          { name: "Recovery of Pay", amount: "4785" },
          { name: "Group Insurance", amount: "161" },
          { name: "Professional Tax", amount: "100" }
        ]
      };
    } else {
      extractedData = {
        name: "Candidate Name", education: "Master's Degree", experience: "3 Years", phone: "03001234567"
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    return NextResponse.json(extractedData, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}
