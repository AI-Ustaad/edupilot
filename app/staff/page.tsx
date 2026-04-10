// --- دی میجک: AI سکیننگ اور آٹو فل (UPDATED) ---
  const handleAIScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMsg("");
    try {
      const base64Data = await convertToBase64(file);
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, documentType: schoolCategory === "Government" ? "salary_slip" : "cv" })
      });
      
      const extractedData = await response.json();
      
      // یہ کوڈ اب سلپ سے آنے والی ایک ایک چیز کو فارم میں بھرے گا!
      setFormData(prev => ({
        ...prev,
        name: extractedData.name || prev.name,
        cnic: extractedData.cnic ? formatCNIC(extractedData.cnic) : prev.cnic,
        email: extractedData.email || prev.email,
        dob: extractedData.dob || prev.dob,
        personnelNo: extractedData.personnelNo || prev.personnelNo,
        scale: extractedData.scale || prev.scale,
        employmentCategory: extractedData.employmentCategory || prev.employmentCategory,
        designation: extractedData.designation || prev.designation,
        bankAccount: extractedData.bankAccount || prev.bankAccount,
        basicPay: extractedData.basicPay || prev.basicPay,
        grossPay: extractedData.grossPay || prev.grossPay,
        netPay: extractedData.netPay || prev.netPay,
        deductionsTotal: extractedData.deductionsTotal || prev.deductionsTotal,
        education: extractedData.education || prev.education,
        experience: extractedData.experience || prev.experience,
        // Arrays for detailed view
        allowances: extractedData.allowances || prev.allowances,
        deductionsList: extractedData.deductionsList || prev.deductionsList,
      }));
      
      alert("AI Scan Complete! All details extracted and auto-filled.");
    } catch (error) {
      setErrorMsg("AI Scan failed. Please enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };
