"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 🔥 BILINGUAL TRANSLATION ENGINE
const translations = {
  en: {
    topPhone: "0092-300-4134853",
    logo: "EduPilot",
    navHome: "HOME",
    navFeatures: "FEATURES",
    navContact: "CONTACT",
    loginBtn: "LOGIN / REGISTER",
    heroTitle: "DIGITIZE YOUR SCHOOL WITH EDUPILOT",
    heroSubtitle: "Pakistan's most advanced AI-powered school management system.",
    readMoreBtn: "GET STARTED NOW",
    
    box1Title: "Students & Staff",
    box1Desc: "Manage complete student profiles, admissions, and teacher records in one secure database.",
    box2Title: "Smart Attendance",
    box2Desc: "Record daily attendance in seconds with an easy-to-use interface for all classes.",
    box3Title: "Fees & Budget",
    box3Desc: "Track collected fees, manage pending dues, staff salaries, and overall school budget.",
    box4Title: "AI Result Cards",
    box4Desc: "Automatically generate beautiful PDF report cards with AI-driven parent instructions.",
    
    aboutTitle: "Let's Know Us: Why Choose EduPilot?",
    aboutSubtitle: "The Ultimate Educational ERP Built specifically for Pakistan",
    aboutPoint1Title: "Cloud-Based Fast Infrastructure",
    aboutPoint1Desc: "Access from anywhere, anytime, on any device without any heavy software installation.",
    aboutPoint2Title: "Native Bilingual Experience",
    aboutPoint2Desc: "Empower your entire staff to use the software easily in English or Urdu.",
    aboutPoint3Title: "Next-Generation AI Automation",
    aboutPoint3Desc: "From reading government payslips to writing remarks, our AI does the heavy lifting.",
    aboutPoint4Title: "Unified 360° Dashboards",
    aboutPoint4Desc: "See financials, academics, attendance, and HR data all in one single, beautiful view.",

    modal1Title: "👨‍🎓 360° Students & HR Panel",
    modal1Text: "Manage thousands of student and staff records effortlessly. Features include complete bio-data tracking, digital document storage, academic history, disciplinary records, and fast search filters all connected in one unified ecosystem.",
    modal2Title: "⏱️ Lightning-Fast Attendance",
    modal2Text: "Say goodbye to paper registers. Mark daily attendance in seconds. The system automatically tracks 'Present', 'Absent', and 'Late' metrics, providing monthly visual reports and identifying chronic absentees instantly.",
    modal3Title: "💰 Advanced Finance & Payroll",
    modal3Text: "A complete financial ecosystem. Generate custom fee vouchers with school watermarks. Automatically calculate late fines, surcharges, and previous arrears. Manage staff salaries flawlessly with cutting-edge AI payslip reading.",
    modal4Title: "📄 AI-Powered Result Cards",
    modal4Text: "Generate beautiful, print-ready PDF result cards in one click. Enter marks and let the system automatically calculate percentages, assign grades, and generate AI-driven personalized advice for parents.",
    modal5Title: "☁️ Secure Cloud Infrastructure",
    modal5Text: "Experience blazing-fast performance with our secure cloud infrastructure. No local servers required. Access your school's data securely from any device, anywhere in the world, with 99.9% uptime and automated daily backups.",
    modal6Title: "🇵🇰 English & Urdu Support",
    modal6Text: "Designed specifically for the Pakistani educational ecosystem. Switch seamlessly between English and Urdu. Empower your clerical staff, teachers, and administration to work in their preferred language without any learning curve.",
    modal7Title: "🧠 Artificial Intelligence",
    modal7Text: "Automate tedious administrative tasks with built-in AI. From extracting data from uploaded payslips using OCR technology to generating personalized student behavioral reports, our AI works continuously as your invisible assistant.",
    modal8Title: "📊 Real-Time Analytics",
    modal8Text: "Eliminate scattered data. Our unified dashboards bring Admissions, HR, Finance, and Academics onto a single screen. Make informed decisions quickly with real-time analytics, visual charts, and comprehensive drill-down capabilities.",

    featuresMenuTitle: "Explore Our Features",
    featuresSub1Title: "👨‍🎓 360° Student Profiles",
    featuresSub1Intro: "A centralized command center for every student. Access their bio-data, academic progress, disciplinary actions, and financial standing from a single, beautifully designed screen.",
    featuresSub1Benefits: ["Instantly search and locate any student record.", "View total fees paid and pending arrears.", "Track term-by-term exam results.", "Monitor classroom behavior and assignments."],
    featuresSub2Title: "🧑‍🏫 HR & AI Payroll",
    featuresSub2Intro: "Designed to handle the complexities of government and private school staffing. Keep track of ACRs, medical fitness, basic pay scales, and professional qualifications.",
    featuresSub2Benefits: ["AI OCR instantly extracts data from uploaded payslips.", "Securely log Annual Confidential Reports (ACRs).", "Track Basic Pay, Allowances, and Deductions.", "Maintain records of disciplinary actions."],
    featuresSub3Title: "💰 Automated Fee Vouchers",
    featuresSub3Intro: "Stop calculating fees manually. Our dynamic fee system allows you to build customized vouchers with automatically calculated surcharges and tax ratios.",
    featuresSub3Benefits: ["Print 1-page PDF vouchers with school watermarks.", "Automatically calculate tax percentages.", "Carry forward previous arrears instantly.", "Add custom categories like Uniforms, Books, and Fines."],
    featuresSub4Title: "📊 One-Click Result Cards",
    featuresSub4Intro: "The fastest way to process terminal examinations. Input raw marks, and the system handles the complex percentages, grading logic, and parent instructions.",
    featuresSub4Benefits: ["Auto-calculate percentages out of 100 for each subject.", "Generate beautiful, print-ready Result Cards.", "AI-generated personalized remarks for parents.", "Zero manual calculation errors."],

    contactSectionTitle: "Get in Touch",
    contactSectionDesc: "Ready to digitize your school? Contact our team for a personalized demo.",
    closeBtn: "Close Window",
  },
  ur: {
    topPhone: "0092-300-4134853",
    logo: "ایجوپائلٹ",
    navHome: "ہوم",
    navFeatures: "خصوصیات",
    navContact: "رابطہ کریں",
    loginBtn: "لاگ ان / رجسٹر",
    heroTitle: "ایجوپائلٹ کے ساتھ اپنے سکول کو ڈیجیٹل بنائیں",
    heroSubtitle: "پاکستان کا سب سے جدید اور اے آئی سے لیس سکول مینجمنٹ سسٹم۔",
    readMoreBtn: "ابھی شروع کریں",
    
    box1Title: "طلباء اور اساتذہ",
    box1Desc: "تمام طلباء، اساتذہ اور عملے کا مکمل اور محفوظ ریکارڈ ایک جگہ پر رکھیں۔",
    box2Title: "سمارٹ حاضری",
    box2Desc: "سیکنڈوں میں روزانہ کی حاضری لگائیں اور ریکارڈ کو محفوظ کریں۔",
    box3Title: "فیس اور بجٹ",
    box3Desc: "وصول شدہ فیس، واجب الادا رقم، اساتذہ کی تنخواہوں اور بجٹ کا حساب رکھیں۔",
    box4Title: "اے آئی رپورٹ کارڈ",
    box4Desc: "والدین کے لیے تجاویز کے ساتھ خوبصورت پی ڈی ایف رزلٹ کارڈ خودکار طور پر بنائیں۔",

    aboutTitle: "ہمیں جانیں: ایجوپائلٹ کا انتخاب کیوں کریں؟",
    aboutSubtitle: "پاکستان کے لیے بنایا گیا بہترین ایجوکیشنل سافٹ ویئر",
    aboutPoint1Title: "تیز ترین کلاؤڈ انفراسٹرکچر",
    aboutPoint1Desc: "کسی بھی وقت، کہیں سے بھی اور کسی بھی ڈیوائس پر استعمال کریں، بغیر کسی بھاری سافٹ ویئر کے۔",
    aboutPoint2Title: "مقامی دو لسانی انٹرفیس",
    aboutPoint2Desc: "آپ کا تمام عملہ اپنی پسند کی زبان (اردو یا انگریزی) میں اسے آسانی سے استعمال کر سکتا ہے۔",
    aboutPoint3Title: "جدید ترین AI آٹومیشن",
    aboutPoint3Desc: "پے سلپ پڑھنے سے لے کر والدین کے لیے ریمارکس لکھنے تک، AI آپ کا کام آسان بناتا ہے۔",
    aboutPoint4Title: "یونیفائیڈ 360° ڈیش بورڈز",
    aboutPoint4Desc: "فنانس، تعلیم اور ایچ آر کا ڈیٹا ایک ہی خوبصورت سکرین پر ریئل ٹائم میں دیکھیں۔",

    modal1Title: "👨‍🎓 360° طلباء اور ایچ آر پینل",
    modal1Text: "ہزاروں طلباء اور عملے کا ریکارڈ آسانی سے کنٹرول کریں۔ بائیو ڈیٹا، ڈیجیٹل دستاویزات، تعلیمی ہسٹری، اور ڈسپلن ریکارڈ کی مکمل ٹریکنگ ایک ہی جگہ پر۔",
    modal2Title: "⏱️ تیز ترین حاضری سسٹم",
    modal2Text: "کاغذی رجسٹروں سے جان چھڑائیں۔ سیکنڈوں میں روزانہ حاضری لگائیں۔ سسٹم خود بخود حاضر، غیر حاضر اور لیٹ آنے والوں کا حساب رکھتا ہے اور فوری رپورٹس دیتا ہے۔",
    modal3Title: "💰 جدید فنانس اور پے رول",
    modal3Text: "ایک مکمل مالیاتی نظام۔ سکول واٹرمارک کے ساتھ فیس واؤچر بنائیں۔ جرمانے اور بقایا جات کا خودکار حساب۔ AI کے ذریعے اساتذہ کی تنخواہوں کا جدید ترین انتظام۔",
    modal4Title: "📄 AI سے لیس رزلٹ کارڈز",
    modal4Text: "خوبصورت اور پرنٹ کے لیے تیار رزلٹ کارڈ بنائیں۔ نمبر درج کریں اور سسٹم خود بخود فیصد، گریڈ اور والدین کے لیے بہترین تجاویز تیار کرے گا۔",
    modal5Title: "☁️ محفوظ کلاؤڈ انفراسٹرکچر",
    modal5Text: "ہمارے محفوظ کلاؤڈ کے ساتھ تیز ترین کارکردگی کا تجربہ کریں۔ کسی مقامی سرور کی ضرورت نہیں۔ 99.9% اپ ٹائم اور روزانہ خودکار بیک اپ کے ساتھ دنیا میں کہیں بھی اپنے سکول کے ڈیٹا تک رسائی حاصل کریں۔",
    modal6Title: "🇵🇰 مکمل اردو اور انگریزی سپورٹ",
    modal6Text: "خاص طور پر پاکستانی تعلیمی نظام کے لیے ڈیزائن کیا گیا۔ انگریزی اور اردو کے درمیان باآسانی سوئچ کریں۔ اپنے سٹاف اور اساتذہ کو بغیر کسی مشکل کے ان کی پسندیدہ زبان میں کام کرنے کے قابل بنائیں۔",
    modal7Title: "🧠 آرٹیفیشل انٹیلیجنس",
    modal7Text: "AI کے ساتھ انتظامی کاموں کو خودکار بنائیں۔ اپ لوڈ کی گئی پے سلپ سے OCR کے ذریعے ڈیٹا نکالنے سے لے کر طلباء کی کارکردگی کی رپورٹس بنانے تک، ہمارا AI آپ کے پوشیدہ اسسٹنٹ کے طور پر کام کرتا ہے۔",
    modal8Title: "📊 ریئل ٹائم تجزیات اور ڈیش بورڈ",
    modal8Text: "بکھرے ہوئے ڈیٹا کو ختم کریں۔ ہمارے ڈیش بورڈز داخلے، ایچ آر، فنانس اور تعلیم کو ایک ہی سکرین پر لاتے ہیں۔ ریئل ٹائم چارٹس، اور جامع ڈیٹا کے ساتھ تیزی سے باخبر اور درست فیصلے کریں۔",

    featuresMenuTitle: "ہماری خصوصیات دریافت کریں",
    featuresSub1Title: "👨‍🎓 360° طلباء کی پروفائلز",
    featuresSub1Intro: "ہر طالب علم کے لیے ایک مرکزی کمانڈ سینٹر۔ ان کا بائیو ڈیٹا، تعلیمی پیشرفت، ڈسپلن کی کارروائیاں، اور مالی حیثیت ایک ہی خوبصورت سکرین پر دیکھیں۔",
    featuresSub1Benefits: ["کسی بھی طالب علم کا ریکارڈ فوری طور پر تلاش کریں۔", "جمع شدہ فیس اور بقایا جات دیکھیں۔", "ٹرم کے لحاظ سے امتحان کے نتائج ٹریک کریں۔", "کلاس روم کے رویے کی نگرانی کریں۔"],
    featuresSub2Title: "🧑‍🏫 ایچ آر اور AI پے رول",
    featuresSub2Intro: "سرکاری اور نجی سکولوں کے عملے کی پیچیدگیوں کو سنبھالنے کے لیے ڈیزائن کیا گیا۔ ACRs، میڈیکل فٹنس، اور پیشہ ورانہ قابلیت کا ریکارڈ رکھیں۔",
    featuresSub2Benefits: ["AI فوراً اپ لوڈ شدہ پے سلپس سے ڈیٹا نکالتا ہے۔", "سالانہ خفیہ رپورٹس (ACRs) محفوظ کریں۔", "بنیادی تنخواہ، الاؤنسز اور کٹوتیوں کو ٹریک کریں۔", "تادیبی کارروائیوں کا ریکارڈ برقرار رکھیں۔"],
    featuresSub3Title: "💰 خودکار فیس واؤچرز",
    featuresSub3Intro: "فیس کا دستی حساب لگانا بند کریں۔ ہمارا جدید فیس سسٹم آپ کو خودکار سرچارج اور ٹیکس تناسب کے ساتھ اپنی مرضی کے واؤچر بنانے کی اجازت دیتا ہے۔",
    featuresSub3Benefits: ["سکول واٹرمارک کے ساتھ 1 صفحے کا پی ڈی ایف واؤچر پرنٹ کریں۔", "ٹیکس فیصد کا خودکار حساب لگائیں۔", "پچھلے بقایا جات کو فوری طور پر آگے لائیں۔", "وردی، کتابیں اور جرمانے جیسی اپنی مرضی کی کیٹیگریز شامل کریں۔"],
    featuresSub4Title: "📊 ون کلک رزلٹ کارڈز",
    featuresSub4Intro: "امتحانات پر کارروائی کا تیز ترین طریقہ۔ صرف نمبر درج کریں، اور سسٹم پیچیدہ فیصد، گریڈنگ اور والدین کی ہدایات کو خود سنبھالتا ہے۔",
    featuresSub4Benefits: ["ہر مضمون کے لیے 100 میں سے فیصد کا خودکار حساب۔", "خوبصورت، پرنٹ کے لیے تیار رزلٹ کارڈز بنائیں۔", "والدین کے لیے AI سے تیار کردہ بہترین تجاویز۔", "دستی حساب کی صفر غلطیاں۔"],

    contactSectionTitle: "ہم سے رابطہ کریں",
    contactSectionDesc: "اپنے سکول کو ڈیجیٹل بنانے کے لیے تیار ہیں؟ ذاتی ڈیمو کے لیے ہماری ٹیم سے رابطہ کریں۔",
    closeBtn: "بند کریں",
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ur">("en");
  const t = translations[lang];

  const [activeModal, setActiveModal] = useState<number | string | null>(null);
  const [activeSubFeature, setActiveSubFeature] = useState<number>(1);

  const scrollToContact = () => {
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div dir={lang === "ur" ? "rtl" : "ltr"} style={{ minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", background: "#f8fafc", position: "relative" }}>
      
      <div style={{ background: "#0f172a", color: "white", padding: "10px 5%", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ fontWeight: "bold", letterSpacing: "1px" }}>📞 {t.topPhone}</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button onClick={() => setLang("ur")} style={{ background: lang === "ur" ? "#3ea2e0" : "transparent", color: "white", border: "none", padding: "3px 10px", borderRadius: "3px", cursor: "pointer", fontWeight: "bold" }}>اردو</button>
           <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "#3ea2e0" : "transparent", color: "white", border: "none", padding: "3px 10px", borderRadius: "3px", cursor: "pointer", fontWeight: "bold" }}>EN</button>
        </div>
      </div>

      <header style={{ background: "white", padding: "20px 5%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#334155", fontWeight: "900", letterSpacing: "-1px" }}>{t.logo}</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>Best Education SaaS Platform</p>
        </div>
        <div style={{ background: "#f1f5f9", padding: "10px 15px", borderRadius: "5px", width: "250px", display: "flex", justifyContent: "space-between", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
          <span>Search...</span><span>🔍</span>
        </div>
      </header>

      <nav style={{ background: "#3ea2e0", padding: "15px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white", fontWeight: "bold", fontSize: "14px" }}>
        <div style={{ display: "flex", gap: "30px" }}>
          <span onClick={scrollToHome} className="nav-link" style={{ cursor: "pointer", letterSpacing: "1px" }}>{t.navHome}</span>
          <span onClick={() => setActiveModal('features')} className="nav-link" style={{ cursor: "pointer", letterSpacing: "1px" }}>{t.navFeatures}</span>
          <span onClick={scrollToContact} className="nav-link" style={{ cursor: "pointer", letterSpacing: "1px" }}>{t.navContact}</span>
        </div>
        <button onClick={() => router.push("/login")} style={{ background: "#0f172a", color: "white", border: "none", padding: "10px 25px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", fontSize: "14px", textTransform: "uppercase" }}>
          {t.loginBtn}
        </button>
      </nav>

      <div style={{ position: "relative", height: "550px", backgroundImage: "url('/image.png')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", padding: "0 5%" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.65)" }}></div>
        <div style={{ position: "relative", zIndex: 10, maxWidth: "700px", color: "white" }}>
          <h2 style={{ fontSize: "clamp(35px, 4vw, 55px)", fontWeight: "900", lineHeight: "1.1", marginBottom: "15px", textTransform: "uppercase" }}>{t.heroTitle}</h2>
          <p style={{ fontSize: "18px", marginBottom: "30px", lineHeight: "1.6", opacity: 0.9 }}>{t.heroSubtitle}</p>
          <button onClick={() => router.push("/login")} style={{ background: "#3ea2e0", color: "white", border: "none", padding: "15px 35px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", borderRadius: "4px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", transition: "transform 0.2s" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
            {t.readMoreBtn}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "-60px auto 50px auto", position: "relative", zIndex: 20, padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
          <div onClick={() => setActiveModal(1)} className="hover-card" style={{ ...boxStyle, background: "#746b8e" }}><div style={{ fontSize: "40px", marginBottom: "15px" }}>🎓</div><h3 style={{ fontSize: "20px", marginBottom: "15px", fontWeight: "bold" }}>{t.box1Title}</h3><p style={{ fontSize: "14px", lineHeight: "1.6", margin: "0 0 15px 0", opacity: 0.9 }}>{t.box1Desc}</p><span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "5px 10px", borderRadius: "20px" }}>Click to learn more</span></div>
          <div onClick={() => setActiveModal(2)} className="hover-card" style={{ ...boxStyle, background: "#51a9a8" }}><div style={{ fontSize: "40px", marginBottom: "15px" }}>⏱️</div><h3 style={{ fontSize: "20px", marginBottom: "15px", fontWeight: "bold" }}>{t.box2Title}</h3><p style={{ fontSize: "14px", lineHeight: "1.6", margin: "0 0 15px 0", opacity: 0.9 }}>{t.box2Desc}</p><span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "5px 10px", borderRadius: "20px" }}>Click to learn more</span></div>
          <div onClick={() => setActiveModal(3)} className="hover-card" style={{ ...boxStyle, background: "#7b9f71" }}><div style={{ fontSize: "40px", marginBottom: "15px" }}>💰</div><h3 style={{ fontSize: "20px", marginBottom: "15px", fontWeight: "bold" }}>{t.box3Title}</h3><p style={{ fontSize: "14px", lineHeight: "1.6", margin: "0 0 15px 0", opacity: 0.9 }}>{t.box3Desc}</p><span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "5px 10px", borderRadius: "20px" }}>Click to learn more</span></div>
          <div onClick={() => setActiveModal(4)} className="hover-card" style={{ ...boxStyle, background: "#eb7777" }}><div style={{ fontSize: "40px", marginBottom: "15px" }}>📄</div><h3 style={{ fontSize: "20px", marginBottom: "15px", fontWeight: "bold" }}>{t.box4Title}</h3><p style={{ fontSize: "14px", lineHeight: "1.6", margin: "0 0 15px 0", opacity: 0.9 }}>{t.box4Desc}</p><span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "5px 10px", borderRadius: "20px" }}>Click to learn more</span></div>
        </div>
      </div>

      <div style={{ padding: "60px 5%", background: "white", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", color: "#0f172a", fontWeight: "900", marginBottom: "10px" }}>{t.aboutTitle}</h2>
        <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "50px" }}>{t.aboutSubtitle}</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px", maxWidth: "1200px", margin: "0 auto" }}>
          <div onClick={() => setActiveModal(5)} className="hover-card" style={infoCard}><div style={infoIcon}><svg fill="none" stroke="#3b82f6" viewBox="0 0 24 24" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg></div><h4 style={infoTitle}>{t.aboutPoint1Title}</h4><p style={infoDesc}>{t.aboutPoint1Desc}</p><span style={clickBadge}>Click to learn more</span></div>
          <div onClick={() => setActiveModal(6)} className="hover-card" style={infoCard}><div style={infoIcon}><svg fill="none" stroke="#10b981" viewBox="0 0 24 24" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg></div><h4 style={infoTitle}>{t.aboutPoint2Title}</h4><p style={infoDesc}>{t.aboutPoint2Desc}</p><span style={clickBadge}>Click to learn more</span></div>
          <div onClick={() => setActiveModal(7)} className="hover-card" style={infoCard}><div style={infoIcon}><svg fill="none" stroke="#8b5cf6" viewBox="0 0 24 24" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></div><h4 style={infoTitle}>{t.aboutPoint3Title}</h4><p style={infoDesc}>{t.aboutPoint3Desc}</p><span style={clickBadge}>Click to learn more</span></div>
          <div onClick={() => setActiveModal(8)} className="hover-card" style={infoCard}><div style={infoIcon}><svg fill="none" stroke="#f59e0b" viewBox="0 0 24 24" width="36" height="36"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg></div><h4 style={infoTitle}>{t.aboutPoint4Title}</h4><p style={infoDesc}>{t.aboutPoint4Desc}</p><span style={clickBadge}>Click to learn more</span></div>
        </div>
      </div>

      <div id="contact-section" style={{ background: "#0f172a", padding: "60px 5%", color: "white", textAlign: "center", borderTop: "4px solid #3ea2e0" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "10px" }}>{t.contactSectionTitle}</h2>
        <p style={{ color: "#94a3b8", marginBottom: "30px", fontSize: "16px" }}>{t.contactSectionDesc}</p>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", padding: "20px 40px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)" }}>
           <h3 style={{ margin: "0 0 10px 0", fontSize: "24px", color: "#3ea2e0" }}>📞 {t.topPhone}</h3>
           <p style={{ margin: 0, color: "#cbd5e1" }}>Available Mon-Sat, 9AM to 5PM (PKT)</p>
        </div>
        <p style={{ marginTop: "50px", fontSize: "12px", color: "#64748b" }}>© 2026 EduPilot Pakistan. All rights reserved.</p>
      </div>

      {activeModal === 'features' && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(10px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "24px", maxWidth: "900px", width: "100%", height: "600px", display: "flex", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", position: "relative", animation: "popIn 0.3s ease-out" }}>
            <button onClick={() => setActiveModal(null)} style={{ position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8", zIndex: 50 }}>✖</button>

            <div style={{ width: "300px", background: "#f8fafc", padding: "30px 20px", borderRight: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "20px" }}>{t.featuresMenuTitle}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button onClick={() => setActiveSubFeature(1)} style={activeSubFeature === 1 ? activeSubBtn : subBtn}>{t.featuresSub1Title}</button>
                <button onClick={() => setActiveSubFeature(2)} style={activeSubFeature === 2 ? activeSubBtn : subBtn}>{t.featuresSub2Title}</button>
                <button onClick={() => setActiveSubFeature(3)} style={activeSubFeature === 3 ? activeSubBtn : subBtn}>{t.featuresSub3Title}</button>
                <button onClick={() => setActiveSubFeature(4)} style={activeSubFeature === 4 ? activeSubBtn : subBtn}>{t.featuresSub4Title}</button>
              </div>
            </div>

            <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
              {activeSubFeature === 1 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "15px" }}>{t.featuresSub1Title}</h2>
                  <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.7", marginBottom: "25px" }}>{t.featuresSub1Intro}</p>
                  <h4 style={{ color: "#3ea2e0", marginBottom: "10px" }}>Key Benefits:</h4>
                  <ul style={{ color: "#334155", lineHeight: "2", paddingLeft: lang === 'ur' ? "0" : "20px", paddingRight: lang === 'ur' ? "20px" : "0" }}>
                    {t.featuresSub1Benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}
              {activeSubFeature === 2 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "15px" }}>{t.featuresSub2Title}</h2>
                  <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.7", marginBottom: "25px" }}>{t.featuresSub2Intro}</p>
                  <h4 style={{ color: "#3ea2e0", marginBottom: "10px" }}>Key Benefits:</h4>
                  <ul style={{ color: "#334155", lineHeight: "2", paddingLeft: lang === 'ur' ? "0" : "20px", paddingRight: lang === 'ur' ? "20px" : "0" }}>
                    {t.featuresSub2Benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}
              {activeSubFeature === 3 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "15px" }}>{t.featuresSub3Title}</h2>
                  <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.7", marginBottom: "25px" }}>{t.featuresSub3Intro}</p>
                  <h4 style={{ color: "#3ea2e0", marginBottom: "10px" }}>Key Benefits:</h4>
                  <ul style={{ color: "#334155", lineHeight: "2", paddingLeft: lang === 'ur' ? "0" : "20px", paddingRight: lang === 'ur' ? "20px" : "0" }}>
                    {t.featuresSub3Benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}
              {activeSubFeature === 4 && (
                <div className="fade-in">
                  <h2 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "15px" }}>{t.featuresSub4Title}</h2>
                  <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.7", marginBottom: "25px" }}>{t.featuresSub4Intro}</p>
                  <h4 style={{ color: "#3ea2e0", marginBottom: "10px" }}>Key Benefits:</h4>
                  <ul style={{ color: "#334155", lineHeight: "2", paddingLeft: lang === 'ur' ? "0" : "20px", paddingRight: lang === 'ur' ? "20px" : "0" }}>
                    {t.featuresSub4Benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {typeof activeModal === 'number' && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(5px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "20px", maxWidth: "550px", width: "100%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", textAlign: "center", position: "relative", animation: "popIn 0.3s ease-out" }}>
            <button onClick={() => setActiveModal(null)} style={{ position: "absolute", top: "15px", right: "20px", background: "transparent", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}>✖</button>

            {activeModal === 1 && <><h2 style={modalTitle}>{t.modal1Title}</h2><p style={modalText}>{t.modal1Text}</p></>}
            {activeModal === 2 && <><h2 style={modalTitle}>{t.modal2Title}</h2><p style={modalText}>{t.modal2Text}</p></>}
            {activeModal === 3 && <><h2 style={modalTitle}>{t.modal3Title}</h2><p style={modalText}>{t.modal3Text}</p></>}
            {activeModal === 4 && <><h2 style={modalTitle}>{t.modal4Title}</h2><p style={modalText}>{t.modal4Text}</p></>}
            {activeModal === 5 && <><h2 style={modalTitle}>{t.modal5Title}</h2><p style={modalText}>{t.modal5Text}</p></>}
            {activeModal === 6 && <><h2 style={modalTitle}>{t.modal6Title}</h2><p style={modalText}>{t.modal6Text}</p></>}
            {activeModal === 7 && <><h2 style={modalTitle}>{t.modal7Title}</h2><p style={modalText}>{t.modal7Text}</p></>}
            {activeModal === 8 && <><h2 style={modalTitle}>{t.modal8Title}</h2><p style={modalText}>{t.modal8Text}</p></>}

            <button onClick={() => setActiveModal(null)} style={{ marginTop: "30px", background: "#3ea2e0", color: "white", padding: "12px 35px", borderRadius: "30px", border: "none", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}>{t.closeBtn}</button>
          </div>
        </div>
      )}

      <style>{`
        .hover-card { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
        .hover-card:hover { transform: translateY(-8px) !important; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; }
        .nav-link:hover { opacity: 0.8; }
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateX(10px); } 100% { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

const boxStyle = { padding: "40px 30px", color: "white", textAlign: "center" as const };
const infoCard = { background: "#f8fafc", padding: "35px 25px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" as const, display: "flex", flexDirection: "column" as const, alignItems: "center" };
const infoIcon = { marginBottom: "20px", background: "white", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" };
const infoTitle = { margin: "0 0 15px 0", fontSize: "18px", color: "#0f172a", fontWeight: "bold" };
const infoDesc = { margin: "0 0 20px 0", fontSize: "14px", color: "#64748b", lineHeight: "1.7", flexGrow: 1 };
const clickBadge = { fontSize: "11px", fontWeight: "bold", color: "#3ea2e0", background: "#e0f2fe", padding: "6px 12px", borderRadius: "20px", textTransform: "uppercase" as const };
const modalTitle = { fontSize: "24px", color: "#0f172a", marginBottom: "20px", fontWeight: "900" };
const modalText = { fontSize: "16px", color: "#475569", lineHeight: "1.8" };
const subBtn = { width: "100%", padding: "15px", textAlign: "left" as const, background: "transparent", border: "none", color: "#64748b", fontSize: "15px", fontWeight: "bold", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s" };
const activeSubBtn = { ...subBtn, background: "#3ea2e0", color: "white", boxShadow: "0 4px 6px rgba(62, 162, 224, 0.2)" };