// Remove these imports at the top of the file if they are no longer used:
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// ... inside your component ...

const handleDownloadPDF = async () => {
  if (!selectedStudentForCard) return;
  
  // Show a quick loading state (optional)
  const originalText = "Download PDF";
  // You can add a loading state here if you want
  
  try {
    // Call our new secure API route
    const res = await fetch(`/api/v1/reports/generate?studentId=${selectedStudentForCard.id}&term=${encodeURIComponent(selectedTerm)}`);
    
    if (!res.ok) throw new Error("Failed to generate PDF");
    
    // Convert the response to a Blob and trigger download
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report_${selectedStudentForCard.name || 'Student'}_${selectedTerm}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Failed to generate PDF. Please try again.");
  }
};

// ... then update your button:
<button 
  onClick={handleDownloadPDF} 
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md"
>
  <Printer size={14}/> Download Vector PDF
</button>
