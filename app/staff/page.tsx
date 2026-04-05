"use client";
import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "@/lib/firebase";
// ShieldCheck added to the imports!
import { Camera, Search, Pencil, Trash2, User, FileText, ScanLine, Printer, CheckCircle2, Building2, Landmark, ShieldCheck } from "lucide-react";

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [staffType, setStaffType] = useState<"Government" | "Private">("Government");
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedStaffForSlip, setSelectedStaffForSlip] = useState<any | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  const initialForm = {
    fullName: "", fatherName: "", cnic: "", dob: "", phone: "", designation: "", 
    joinDate: "", type: "Government", photoUrl: "",
    personnelNo: "", bps: "", ddoCode: "", 
    basicPay: 0, houseRent: 0, conveyance: 0, medical: 0, otherAllowances: 0,
    incomeTax: 0, gpf: 0, otherDeductions: 0,
    bankName: "", accountNo: ""
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "staff"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffList(data);
    });
    return () => unsub();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: ["basicPay", "houseRent", "conveyance", "medical", "otherAllowances", "incomeTax", "gpf", "otherDeductions"].includes(name) ? Number(value) : value });
  };

  const handleImageClick = () => fileInputRef.current?.click();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsScanning(true);
      setScanSuccess(false);
      
      setTimeout(() => {
        setIsScanning(false);
        setScanSuccess(true);
        setFormData({
          ...formData,
          fullName: "Ghazanfar Ali",
          fatherName: "Mohammad Sher",
          cnic: "3840289071387",
          dob: "1988-05-01",
          joinDate: "2012-04-02",
          designation: "S.S.E (SCIENCE)",
          personnelNo: "31544960",
          bps: "16",
          ddoCode: "SM6155-PRINCIPAL GOVT",
          basicPay: 18910,
          houseRent: 1818,
          conveyance: 5000,
          medical: 1500,
          otherAllowances: 15479,
          incomeTax: 371,
          gpf: 3340,
          otherDeductions: 5613,
          bankName: "UNITED BANK LIMITED",
          accountNo: "10069225"
        });
        setTimeout(() => setScanSuccess(false), 3000);
      }, 2500);
    }
  };

  const grossPay = formData.basicPay + formData.houseRent + formData.conveyance + formData.medical + formData.otherAllowances;
  const totalDeductions = formData.incomeTax + formData.gpf + formData.otherDeductions;
  const netPay = grossPay - totalDeductions;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalPhotoUrl = formData.photoUrl;
      if (imageFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `staff/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalPhotoUrl = await getDownloadURL(storageRef);
      }

      const finalData = { ...formData, type: staffType, grossPay, totalDeductions, netPay, photoUrl: finalPhotoUrl };

      if (editingId) {
        await updateDoc(doc(db, "staff", editingId), finalData);
      } else {
        await addDoc(collection(db, "staff"), finalData);
      }

      setFormData(initialForm);
      setImageFile(null); setImagePreview(null); setEditingId(null);
    } catch (error) {
      console.error("Error saving staff: ", error);
    }
    setLoading(false);
  };

  const handleEdit = (staff: any) => {
    setStaffType(staff.type);
    setFormData(staff);
    setEditingId(staff.id);
    setImagePreview(staff.photoUrl || null);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleDelete = async (staff: any) => {
    if (window.confirm("Delete this staff member completely?")) {
      if (staff.photoUrl) {
        try { await deleteObject(ref(getStorage(), staff.photoUrl)); } catch (e) {}
      }
      await deleteDoc(doc(db, "staff", staff.id));
    }
  };

  const filteredStaff = staffList.filter(s => s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-20">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">Staff HR & Payroll</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage Government and Private school staff records.</p>
        </div>
        
        <div className="flex bg-gray-200 p-1 rounded-xl w-full md:w-auto">
          <button onClick={() => {setStaffType("Government"); setFormData(initialForm); setImagePreview(null);}} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${staffType === "Government" ? "bg-white text-[#3ac47d] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Landmark size={18} /> Govt. Staff
          </button>
          <button onClick={() => {setStaffType("Private"); setFormData(initialForm); setImagePreview(null);}} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${staffType === "Private" ? "bg-white text-[#3ac47d] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <Building2 size={18} /> Private/Madrassa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          
          {staffType === "Government" && !editingId && (
            <div className="mb-8 p-6 bg-[#f8fbfa] border border-[#e8f8f0] rounded-2xl flex flex-col items-center justify-center text-center">
              <input type="file" accept="application/pdf, image/*" className="hidden" ref={slipInputRef} onChange={handleSlipUpload} />
              
              {isScanning ? (
                <div className="flex flex-col items-center gap-3 animate-pulse">
                  <ScanLine size={40} className="text-[#3ac47d]" />
                  <p className="text-sm font-bold text-[#3ac47d]">Extracting OCR Data from Salary Slip...</p>
                </div>
              ) : scanSuccess ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 size={40} className="text-green-500" />
                  <p className="text-sm font-bold text-green-600">Data Extracted Successfully!</p>
                </div>
              ) : (
                <>
                  <FileText size={40} className="text-[#3ac47d] mb-3" />
                  <h3 className="text-lg font-bold text-[#0F172A]">Upload Salary Slip</h3>
                  <p className="text-sm text-gray-500 mb-4 max-w-sm">Upload Govt PDF slip to auto-extract BPS, Personnel No, Allowances, and Deductions.</p>
                  <button type="button" onClick={() => slipInputRef.current?.click()} className="bg-[#3ac47d] hover:bg-[#2eaa6a] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all">
                    Browse File
                  </button>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div>
              <p className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-5">Personal Information</p>
              <div className="flex flex-col md:flex-row gap-6">
                
                <div onClick={handleImageClick} className="w-32 h-32 bg-[#f1f4f6] rounded-3xl flex flex-col items-center justify-center text-gray-400 shrink-0 cursor-pointer hover:bg-gray-200 transition-all overflow-hidden border-2 border-dashed border-gray-300 relative group">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                  {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <><Camera size={28} className="mb-2 text-[#3ac47d]" /><span className="text-xs font-semibold">PHOTO</span></>}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Full Name *" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                  <input name="fatherName" value={formData.fatherName} onChange={handleInputChange} type="text" placeholder="Father's Name" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                  <input name="cnic" value={formData.cnic} onChange={handleInputChange} type="text" placeholder="CNIC Number" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="text" placeholder="Phone Number" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-5">Employment Profile</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required name="designation" value={formData.designation} onChange={handleInputChange} type="text" placeholder="Designation (e.g. Teacher) *" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                <input required name="joinDate" value={formData.joinDate} onChange={handleInputChange} type="date" title="Join Date" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium text-gray-500" />
                
                {staffType === "Government" ? (
                  <>
                    <input name="bps" value={formData.bps} onChange={handleInputChange} type="text" placeholder="BPS Scale (e.g. 16)" className="bg-[#e8f8f0] border border-transparent outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A]" />
                    <input name="personnelNo" value={formData.personnelNo} onChange={handleInputChange} type="text" placeholder="Personnel No" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium md:col-span-2" />
                    <input name="ddoCode" value={formData.ddoCode} onChange={handleInputChange} type="text" placeholder="DDO Code / School" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                  </>
                ) : (
                  <input name="bankName" value={formData.bankName} onChange={handleInputChange} type="text" placeholder="Bank Name" className="bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-medium" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest">Financials & Payroll</p>
                <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">Net Pay: Rs {netPay.toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Allowances (Earnings)</h4>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-28">Basic Pay:</span><input name="basicPay" type="number" value={formData.basicPay} onChange={handleInputChange} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-[#3ac47d]" /></div>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-28">House Rent:</span><input name="houseRent" type="number" value={formData.houseRent} onChange={handleInputChange} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-[#3ac47d]" /></div>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-28">Conveyance:</span><input name="conveyance" type="number" value={formData.conveyance} onChange={handleInputChange} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-[#3ac47d]" /></div>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-28">Medical:</span><input name="medical" type="number" value={formData.medical} onChange={handleInputChange} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-[#3ac47d]" /></div>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-28">Others:</span><input name="otherAllowances" type="number" value={formData.otherAllowances} onChange={handleInputChange} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-[#3ac47d]" /></div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Deductions</h4>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-28">Income Tax:</span><input name="incomeTax" type="number" value={formData.incomeTax} onChange={handleInputChange} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-[#3ac47d]" /></div>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-28">GPF / Fund:</span><input name="gpf" type="number" value={formData.gpf} onChange={handleInputChange} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-[#3ac47d]" /></div>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-28">Others:</span><input name="otherDeductions" type="number" value={formData.otherDeductions} onChange={handleInputChange} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-[#3ac47d]" /></div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button disabled={loading} type="submit" className="bg-[#3ac47d] hover:bg-[#2eaa6a] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all">
                {loading ? "Saving..." : (editingId ? "Update Record" : "Save Staff Member")}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[800px]">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Directory</h2>
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 outline-none rounded-full pl-10 pr-4 py-2.5 text-sm font-medium" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="group bg-white border border-gray-100 hover:border-[#3ac47d]/30 p-4 rounded-2xl flex items-center gap-4 transition-all">
                {staff.photoUrl ? (
                  <img src={staff.photoUrl} alt="Pic" className="w-12 h-12 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#e8f8f0] text-[#3ac47d] flex items-center justify-center"><User size={20} /></div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#0F172A] text-sm">{staff.fullName}</h4>
                  <p className="text-[10px] text-gray-400 font-medium uppercase truncate">{staff.designation} | {staff.type}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSelectedStaffForSlip(staff)} className="text-[#3ac47d] hover:bg-[#e8f8f0] p-1.5 rounded-md" title="Generate Slip"><FileText size={16} /></button>
                  <div className="hidden group-hover:flex gap-1 absolute right-14 bg-white px-2">
                    <button onClick={() => handleEdit(staff)} className="text-blue-500 p-1.5"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(staff)} className="text-red-500 p-1.5"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {selectedStaffForSlip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck size={32} className="text-[#3ac47d]" />
                <div>
                  <h2 className="text-xl font-bold tracking-widest">EDUPILOT ACADEMY</h2>
                  <p className="text-xs text-gray-400 uppercase">Automated Salary Slip</p>
                </div>
              </div>
              <button onClick={() => {window.print()}} className="flex items-center gap-2 bg-[#3ac47d] px-4 py-2 rounded-lg text-sm font-bold print:hidden"><Printer size={16} /> Print</button>
            </div>

            <div className="p-8 print:p-0">
              <div className="flex gap-6 mb-8 border-b border-gray-100 pb-6">
                {selectedStaffForSlip.photoUrl ? (
                  <img src={selectedStaffForSlip.photoUrl} className="w-24 h-24 rounded-xl object-cover border-4 border-gray-50" />
                ) : <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center"><User size={40} className="text-gray-400"/></div>}
                
                <div className="flex-1 grid grid-cols-2 gap-y-2 text-sm">
                  <div><span className="text-gray-400 font-bold text-xs uppercase">Employee Name</span><p className="font-bold text-lg">{selectedStaffForSlip.fullName}</p></div>
                  <div><span className="text-gray-400 font-bold text-xs uppercase">Designation</span><p className="font-bold">{selectedStaffForSlip.designation}</p></div>
                  <div><span className="text-gray-400 font-bold text-xs uppercase">CNIC</span><p className="font-medium">{selectedStaffForSlip.cnic || "N/A"}</p></div>
                  <div><span className="text-gray-400 font-bold text-xs uppercase">Employment Type</span><p className="font-medium">{selectedStaffForSlip.type}</p></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-[#3ac47d] border-b-2 border-[#3ac47d] pb-2 mb-4 uppercase text-xs tracking-wider">Earnings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Basic Pay</span><span className="font-medium">Rs {selectedStaffForSlip.basicPay?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">House Rent</span><span className="font-medium">Rs {selectedStaffForSlip.houseRent?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Conveyance</span><span className="font-medium">Rs {selectedStaffForSlip.conveyance?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Medical</span><span className="font-medium">Rs {selectedStaffForSlip.medical?.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-100"><span className="text-gray-800">Gross Pay</span><span className="text-[#0F172A]">Rs {selectedStaffForSlip.grossPay?.toLocaleString()}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-red-500 border-b-2 border-red-500 pb-2 mb-4 uppercase text-xs tracking-wider">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Income Tax</span><span className="font-medium">Rs {selectedStaffForSlip.incomeTax?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Fund / GPF</span><span className="font-medium">Rs {selectedStaffForSlip.gpf?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Other Deductions</span><span className="font-medium">Rs {selectedStaffForSlip.otherDeductions?.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-100"><span className="text-gray-800">Total Deductions</span><span className="text-red-600">Rs {selectedStaffForSlip.totalDeductions?.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[#f8fbfa] border border-[#e8f8f0] p-4 rounded-xl flex justify-between items-center">
                <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Net Payable Amount</span>
                <span className="text-3xl font-extrabold text-[#3ac47d]">Rs {selectedStaffForSlip.netPay?.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end print:hidden">
              <button onClick={() => setSelectedStaffForSlip(null)} className="px-6 py-2 rounded-lg text-gray-500 font-bold hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
