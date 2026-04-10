{/* --- SCHOOL PLACEMENT SECTION (UPDATED) --- */}
<section>
  <h3 className="text-[11px] font-bold text-[#3ac47d] uppercase tracking-widest mb-4">School Placement</h3>
  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
    <input required name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} type="date" className="sm:col-span-2 w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-100 focus:ring-2 focus:ring-[#3ac47d]/50 text-green-700" />
    
    {/* CLASS DROPDOWN */}
    <select required name="classGrade" value={formData.classGrade} onChange={handleInputChange} className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 text-slate-700">
      <option value="" disabled>Select Class</option>
      {["Playgroup", "Nursery", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "11th", "12th"].map(c => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>

    {/* SECTION DROPDOWN */}
    <select required name="section" value={formData.section} onChange={handleInputChange} className="w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50 text-slate-700">
      <option value="" disabled>Section</option>
      {["A", "B", "C", "D", "Iqbal", "Jinnah", "Rose", "Tulip", "None"].map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>

    <input required name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} type="number" placeholder="Roll No. (e.g. 15)" className="sm:col-span-2 w-full bg-slate-50/50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 focus:bg-white focus:ring-2 focus:ring-[#3ac47d]/50" />
  </div>
</section>
