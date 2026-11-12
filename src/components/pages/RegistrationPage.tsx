/* eslint-disable */
// Backend API integration for Registration page
import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { A } from "@/components/A";
import { inr, TOKEN_PER_PERSON, TOTAL_PER_PERSON } from "@/lib/registration";
import { Header } from "@/components/Header";

const logo = "/assets/main logo.png";


export function RegistrationPage() {
  const [count, setCount] = useState(1);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const g = (k: string) => String(fd.get(k) ?? "").trim();
    
    // 1. Co-travellers ka array banaya
    const coTravellers = Array.from({ length: count - 1 }, (_, i) => ({
      name: g(`co_name_${i + 2}`), age: g(`co_age_${i + 2}`), gender: g(`co_gender_${i + 2}`),
    }));
    
    // 2. Poora data ek object mein band kiya
    const registrationData = {
      name: g("name"), mobile: g("mobile"), whatsapp: g("whatsapp"), aadhaar: g("aadhaar"), city: g("city"),
      station: g("station"), roomType: g("roomType"), coachType: g("coachType"),
      emergencyName: g("emergencyName"), emergencyRelation: g("emergencyRelation"), emergencyPhone: g("emergencyPhone"),
      count, coTravellers,
    };

    try {
      // 3. Backend ko data bheja (POST Request)
      const response = await fetch('https://jagannath-backend.jagannath1.workers.dev/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`जय श्री जगन्नाथ! आपका पंजीकरण सफलतापूर्वक दर्ज हो गया है।\nआपकी Registration ID: ${result.id}`);
        
        // FIX: Ab count aur regId URL ke through Payment page par bheje jayenge
        navigate({ to: "/payment", search: { count: count, regId: result.id } });
      } else {
        alert('पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।');
      }
    } catch (error) {
      console.error('Frontend Error:', error);
      alert('सर्वर से कनेक्ट नहीं हो सका। कृपया बाद में प्रयास करें।');
    }
  };

  const coTravellerList = (
    <>
      <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 shrink-0 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center justify-center">1</span>
          <div className="min-w-0">
            <span className="font-label-md text-label-md text-on-surface font-bold">यात्री १ (मुख्य आवेदक)</span>
            <p className="font-body-sm text-[13px] sm:text-body-sm text-on-surface-variant">उपरोक्त व्यक्तिगत विवरण से स्वतः मान्य</p>
          </div>
        </div>
        <span className="px-2.5 sm:px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[12px] sm:text-label-sm font-semibold shrink-0">प्रधान यात्री</span>
      </div>
      {Array.from({ length: count - 1 }, (_, idx) => {
        const i = idx + 2;
        const field = "w-full h-11 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary";
        return (
          <div key={i} className="p-4 sm:p-5 rounded-xl bg-surface-container-low space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold flex items-center justify-center">{i}</span>
                <span className="font-label-md text-[14px] sm:text-label-md text-on-surface font-bold">सह-यात्री {i} का विवरण</span>
              </div>
              <span className="font-label-sm text-[12px] sm:text-label-sm text-secondary font-semibold">यात्री {i}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block font-label-sm text-[12px] sm:text-label-sm text-on-surface-variant">पूरा नाम *</label>
                <input name={`co_name_${i}`} type="text" required placeholder="सह-यात्री का नाम" className={field} />
              </div>
              <div className="space-y-1">
                <label className="block font-label-sm text-[12px] sm:text-label-sm text-on-surface-variant">आयु (Age) *</label>
                <input name={`co_age_${i}`} type="number" min={1} max={100} required placeholder="वर्ष" className={field} />
              </div>
              <div className="space-y-1">
                <label className="block font-label-sm text-[12px] sm:text-label-sm text-on-surface-variant">लिंग (Gender) *</label>
                <select name={`co_gender_${i}`} required className={field}>
                  <option value="male">पुरुष</option>
                  <option value="female">महिला</option>
                  <option value="child">बालक/बालिका</option>
                </select>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased overflow-x-hidden">
<Header /><main className="w-full max-w-full overflow-x-hidden pt-24 sm:pt-28 bg-surface pb-28 md:pb-24"><div className="flex flex-col w-full">
<div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-10">
{/* Top Banner & Devotional Notice */}
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-container to-secondary p-5 sm:p-8 text-on-primary shadow-xl">
<div className="absolute -right-8 -bottom-8 w-56 h-56 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
<div className="space-y-2">
<div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[12px] sm:text-label-sm uppercase tracking-wider font-bold">
<span className="material-symbols-outlined text-[16px]">temple_hindu</span>
<span className="">॥ जय श्री जगन्नाथ ॥ 5 से 15 जनवरी 2027</span>
</div>
<h1 className="font-headline-lg text-[24px] sm:text-headline-lg leading-tight text-surface-bright tracking-tight font-bold">
            ऑनलाइन यात्रा पंजीकरण फॉर्म
          </h1>
<p className="font-body-md text-[14px] sm:text-body-md text-tertiary-fixed-dim max-w-2xl leading-relaxed">
            श्री जगन्नाथ धाम पुरी तीर्थ यात्रा एवं श्रीमद्भागवत कथा अमृत महोत्सव। सात्विक आवास, विशेष ट्रेन एवं संपूर्ण व्यवस्था।
          </p>
</div>
<div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 bg-surface-container-lowest/15 backdrop-blur-md p-3.5 sm:p-4 rounded-xl text-surface-bright w-full sm:w-auto">
<span className="font-label-sm text-[12px] sm:text-label-sm text-tertiary-fixed font-semibold tracking-wide uppercase">सकल यात्रा शुल्क</span>
<div className="font-display-lg text-[32px] sm:text-display-lg leading-none font-bold text-tertiary-fixed">
            ₹12,500<span className="font-body-sm text-[14px] sm:text-body-sm font-normal text-surface-bright/80">/ यात्री</span>
</div>
<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary font-label-sm text-[12px] sm:text-label-sm font-bold shadow-sm">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
<span className="">अग्रिम टोकन: मात्र ₹2,500/-</span>
</div>
</div>
</div>
</div>
{/* 4-Step Progress Indicator: Responsive Grid on Mobile */}
<div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm">
<div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 w-full"><div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-primary-fixed/40 min-w-0 flex-1"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold font-label-md text-[14px] sm:text-label-md shrink-0 shadow-md">१</div><div className="min-w-0"><div className="font-label-sm text-[11px] sm:text-label-sm text-primary font-bold">चरण 1</div><div className="font-label-md text-[13px] sm:text-label-md text-on-surface font-semibold truncate">मुख्य विवरण</div></div></div><div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-surface-container-low min-w-0 flex-1"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold font-label-md text-[14px] sm:text-label-md shrink-0">२</div><div className="min-w-0"><div className="font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant font-medium">चरण 2</div><div className="font-label-md text-[13px] sm:text-label-md text-on-surface font-semibold truncate">सह-यात्री</div></div></div><div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-surface-container-low min-w-0 flex-1"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold font-label-md text-[14px] sm:text-label-md shrink-0">३</div><div className="min-w-0"><div className="font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant font-medium">चरण 3</div><div className="font-label-md text-[13px] sm:text-label-md text-on-surface font-semibold truncate">आपातकालीन</div></div></div><div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-surface-container-low min-w-0 flex-1"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold font-label-md text-[14px] sm:text-label-md shrink-0">४</div><div className="min-w-0"><div className="font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant font-medium">चरण 4</div><div className="font-label-md text-[13px] sm:text-label-md text-on-surface font-semibold truncate">पुष्टि</div></div></div></div>
</div>
{/* Main Registration Grid */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full">
{/* Left 8-col: Comprehensive Form */}
<div className="lg:col-span-8 space-y-6 sm:space-y-8 w-full min-w-0">
<form className="space-y-6 sm:space-y-8 w-full" id="yatraRegistrationForm" onSubmit={onSubmit}>
{/* Section 1: Lead Pilgrim Details */}
<div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl shadow-sm space-y-5 sm:space-y-6">
<div className="flex flex-wrap items-center justify-between gap-2">
<div className="flex items-center gap-2.5 sm:gap-3">
<span className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">person</span>
</span>
<h2 className="font-headline-md text-[18px] sm:text-headline-md text-primary font-bold">१. मुख्य यात्री विवरण</h2>
</div>
<span className="font-label-sm text-label-sm text-error bg-error-container/50 px-2.5 py-0.5 rounded-full font-semibold">* अनिवार्य</span>
</div>
<p className="font-body-sm text-[13px] sm:text-body-sm text-on-surface-variant">
              कृपया अपना सही विवरण दर्ज करें। यात्रा पास व आईआरसीटीसी रिजर्वेशन हेतु आधार कार्ड अनुरूप नाम दर्ज करना आवश्यक है।
            </p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">पूरा नाम (Full Name) <span className="text-error">*</span></label><div className="relative"><input className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all" name="name" placeholder="उदा. रमेश कुमार शर्मा" required type="text" /><span className="material-symbols-outlined absolute right-3 top-3.5 text-outline text-[20px]">badge</span></div></div><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">मोबाइल नंबर (Mobile Number) <span className="text-error">*</span></label><div className="relative"><input className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all" pattern="[0-9]{10}" name="mobile" placeholder="10 अंकों का मोबाइल नंबर" required type="tel" /><span className="material-symbols-outlined absolute right-3 top-3.5 text-outline text-[20px]">call</span></div></div><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">WhatsApp नंबर <span className="text-error">*</span></label><div className="relative"><input className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all" pattern="[0-9]{10}" name="whatsapp" placeholder="WhatsApp नंबर दर्ज करें" required type="tel" /><span className="material-symbols-outlined absolute right-3 top-3.5 text-outline text-[20px]">chat</span></div></div><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">आधार कार्ड नंबर <span className="text-error">*</span></label><div className="relative"><input className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all" pattern="[0-9]{12}" name="aadhaar" placeholder="12 अंकों का आधार नंबर" required type="text" /><span className="material-symbols-outlined absolute right-3 top-3.5 text-outline text-[20px]">credit_card</span></div></div><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">शहर एवं राज्य <span className="text-error">*</span></label><div className="relative"><input className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all" name="city" placeholder="उदा. इंदौर (मध्य प्रदेश)" required type="text" /><span className="material-symbols-outlined absolute right-3 top-3.5 text-outline text-[20px]">home_pin</span></div></div><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">बोर्डिंग स्टेशन <span className="text-error">*</span></label><div className="relative"><select className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none cursor-pointer" name="station" defaultValue="" required><option disabled value="">स्टेशन चुनें</option><option value="indore">इंदौर जंक्शन (Indore Jn - INDB)</option><option value="dewas">देवास जंक्शन (Dewas Jn - DWX)</option><option value="ujjain">उज्जैन जंक्शन (Ujjain Jn - UJN)</option><option value="itarsi">इटारसी जंक्शन (Itarsi Jn - ET)</option><option value="nagpur">नागपुर जंक्शन (Nagpur Jn - NGP)</option></select><span className="material-symbols-outlined absolute right-3 top-3.5 text-outline text-[20px] pointer-events-none">train</span></div></div></div>
</div>
{/* Section 2: Travellers Count & Co-Pilgrims */}
<div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl shadow-sm space-y-5 sm:space-y-6">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div className="flex items-center gap-3">
<span className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">group_add</span>
</span>
<div>
<h2 className="font-headline-md text-[18px] sm:text-headline-md text-primary font-bold">२. सह-यात्री विवरण</h2>
<p className="font-body-sm text-[13px] sm:text-body-sm text-on-surface-variant">साथ जाने वाले सदस्यों की संख्या</p>
</div>
</div>
{/* Pilgrim Counter Buttons: Full width friendly tap on Mobile */}
<div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-1.5 bg-surface-container-high p-1 rounded-xl w-full sm:w-auto">
<button className={count === 1 ? "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm" : "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg text-on-surface-variant hover:text-primary font-label-md text-label-md font-bold transition-all"} id="btnCount1" onClick={() => setCount(1)} type="button">1</button>
<button className={count === 2 ? "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm" : "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg text-on-surface-variant hover:text-primary font-label-md text-label-md font-bold transition-all"} id="btnCount2" onClick={() => setCount(2)} type="button">2</button>
<button className={count === 3 ? "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm" : "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg text-on-surface-variant hover:text-primary font-label-md text-label-md font-bold transition-all"} id="btnCount3" onClick={() => setCount(3)} type="button">3</button>
<button className={count === 4 ? "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm" : "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg text-on-surface-variant hover:text-primary font-label-md text-label-md font-bold transition-all"} id="btnCount4" onClick={() => setCount(4)} type="button">4</button>
<button className={count === 5 ? "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm" : "flex-1 sm:flex-none px-3.5 py-2.5 sm:py-1.5 rounded-lg text-on-surface-variant hover:text-primary font-label-md text-label-md font-bold transition-all"} id="btnCount5" onClick={() => setCount(5)} type="button">5+</button>
</div>
</div>
{/* Dynamic Co-traveller Container */}
<div className="space-y-4" id="coTravellerList">{coTravellerList}</div>
</div>
{/* Section 3: Room & Travel Preferences */}
<div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl shadow-sm space-y-5 sm:space-y-6">
<div className="flex items-center gap-3">
<span className="w-8 h-8 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">hotel</span>
</span>
<h2 className="font-headline-md text-[18px] sm:text-headline-md text-primary font-bold">३. कमरा एवं यात्रा विकल्प</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
{/* Room Preference */}
<div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low space-y-3">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[22px]">bed</span>
<h3 className="font-headline-sm text-[16px] sm:text-headline-sm text-on-surface font-semibold">ठहरने की व्यवस्था (AC Room)</h3>
</div>
<p className="font-body-sm text-[13px] sm:text-body-sm text-on-surface-variant">पैकेज में 3, 5 अथवा 7 यात्रियों का संयुक्त सात्विक AC कमरा सम्मिलित है।</p>
<div className="space-y-2 pt-1">
<label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high transition-colors">
<input defaultChecked className="w-4 h-4 text-primary focus:ring-primary accent-primary shrink-0" name="roomType" type="radio" value="sharing" />
<div className="flex flex-col">
<span className="font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">सामान्य AC शेयरिंग (3/5/7 यात्री)</span>
<span className="font-label-sm text-[12px] sm:text-label-sm text-secondary font-medium">पैकेज शुल्क में पूर्णतः सम्मिलित</span>
</div>
</label>
<label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high transition-colors">
<input className="w-4 h-4 text-primary focus:ring-primary accent-primary shrink-0" name="roomType" type="radio" value="private" />
<div className="flex flex-col">
<span className="font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">व्यक्तिगत / सेपरेट 2-बेड AC कमरा</span>
<span className="font-label-sm text-[12px] sm:text-label-sm text-primary font-medium">अतिरिक्त शुल्क: ₹3,500/- प्रति युगल</span>
</div>
</label>
</div>
</div>
{/* Rail Coach Preference */}
<div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low space-y-3">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[22px]">directions_subway</span>
<h3 className="font-headline-sm text-[16px] sm:text-headline-sm text-on-surface font-semibold">रेलवे कोच श्रेणी</h3>
</div>
<p className="font-body-sm text-[13px] sm:text-body-sm text-on-surface-variant">विशेष आरक्षित हमसफ़र एक्सप्रेस द्वारा सुरक्षित एवं आरामदायक यात्रा।</p>
<div className="space-y-2 pt-1">
<label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high transition-colors">
<input defaultChecked className="w-4 h-4 text-primary focus:ring-primary accent-primary shrink-0" name="coachType" type="radio" value="sleeper" />
<div className="flex flex-col">
<span className="font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">स्लीपर क्लास (Sleeper Coach)</span>
<span className="font-label-sm text-[12px] sm:text-label-sm text-secondary font-medium">पैकेज शुल्क में सम्मिलित</span>
</div>
</label>
<label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high transition-colors">
<input className="w-4 h-4 text-primary focus:ring-primary accent-primary shrink-0" name="coachType" type="radio" value="ac3" />
<div className="flex flex-col">
<span className="font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">AC 3-Tier अपग्रेड विकल्प</span>
<span className="font-label-sm text-[12px] sm:text-label-sm text-primary font-medium">अतिरिक्त शुल्क: ₹2,800/- प्रति यात्री</span>
</div>
</label>
</div>
</div>
</div>
</div>
{/* Section 4: Emergency Contact Details */}
<div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl shadow-sm space-y-5 sm:space-y-6">
<div className="flex items-center gap-3">
<span className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">contact_emergency</span>
</span>
<div>
<h2 className="font-headline-md text-[18px] sm:text-headline-md text-primary font-bold">४. आपातकालीन संपर्क सूत्र</h2>
<p className="font-body-sm text-[13px] sm:text-body-sm text-on-surface-variant">परिवार के ऐसे सदस्य का विवरण जो यात्रा में साथ न जा रहे हों</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5"><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">संपर्क व्यक्ति का नाम <span className="text-error">*</span></label><input className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all" name="emergencyName" placeholder="उदा. सतीश शर्मा" required type="text" /></div><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">यात्री से संबंध (Relation) <span className="text-error">*</span></label><input className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all" name="emergencyRelation" placeholder="उदा. पुत्र / भाई / दामाद" required type="text" /></div><div className="space-y-1.5 sm:space-y-2"><label className="block font-label-md text-[14px] sm:text-label-md text-on-surface font-semibold">आपातकालीन फोन नंबर <span className="text-error">*</span></label><input className="w-full h-12 px-4 py-3 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-[15px] sm:text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all" pattern="[0-9]{10}" name="emergencyPhone" placeholder="10 अंकों का फोन नंबर" required type="tel" /></div></div>
</div>
{/* Section 5: Sacred Rules & Declaration */}
<div className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl shadow-sm space-y-5 sm:space-y-6">
<div className="flex items-center gap-3">
<span className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">verified_user</span>
</span>
<h2 className="font-headline-md text-[18px] sm:text-headline-md text-primary font-bold">५. नियम एवं घोषणा पत्र</h2>
</div>
<div className="p-4 rounded-xl bg-surface-container text-on-surface-variant font-body-sm text-[13px] sm:text-body-sm space-y-2.5">
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span className="">प्रत्येक यात्री अपने साथ मूल आधार कार्ड, नियमित दवाइयाँ एवं आवश्यक सामान रखें।</span>
</div>
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span className="">धार्मिक दर्शनीय स्थलों (कोणार्क, भुवनेश्वर आदि) की स्थानीय यात्रा यात्री स्वयं व्यय करेंगे।</span>
</div>
<div className="flex items-start gap-2.5">
<span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span className="">टोकन राशि जमा करने के पश्चात पंजीकरण मान्य होगा। शेष राशि यात्रा से 15 दिन पूर्व देय होगी।</span>
</div>
</div>
<label className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-primary-fixed/20 cursor-pointer">
<input className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary accent-primary shrink-0" required type="checkbox" />
<span className="font-label-md text-[13px] sm:text-label-md text-on-surface font-semibold leading-relaxed">
                मैं पुष्टि करता/करती हूँ कि मेरे द्वारा दी गई समस्त जानकारी सत्य है। मैं श्री भगवन् कृपा सेवा समिति के नियमों का पूर्ण पालन करूँगा/करूँगी।
              </span>
</label>
{/* Submit Button Bar */}
<div className="pt-2 sm:pt-4 flex flex-col items-stretch"><button className="w-full flex items-center justify-center gap-2 py-4 px-5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-[16px] sm:text-headline-sm font-bold shadow-xl transition-all" type="submit"><span className="material-symbols-outlined text-[22px] sm:text-[24px]">payments</span><span className="">पंजीकरण सबमिट करें एवं टोकन जमा करें (₹<span id="submitTotalAmount" className="">{inr(count * TOKEN_PER_PERSON)}</span>/-)</span></button></div>
</div>
</form>
</div>
{/* Right 4-col: Sticky Summary Card & Quick Help */}
<div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32 w-full">
{/* Booking Summary Card */}
<div className="bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden">
<div className="bg-primary p-4 sm:p-5 text-on-primary space-y-1">
<div className="flex items-center justify-between">
<span className="font-label-sm text-[12px] sm:text-label-sm text-tertiary-fixed font-bold tracking-wider uppercase">श्री जगन्नाथ यात्रा</span>
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-[12px] sm:text-label-sm font-semibold">लाइव कोटा</span>
</div>
<h3 className="font-headline-md text-[20px] sm:text-headline-md font-bold text-surface-bright">पंजीकरण सारांश</h3>
</div>
<div className="p-4 sm:p-6 space-y-5">
{/* Cost Breakdown */}
<div className="space-y-3 font-body-sm text-[14px] sm:text-body-sm">
<div className="flex justify-between items-center text-on-surface-variant">
<span className="">कुल यात्री संख्या</span>
<span className="font-label-md text-label-md font-bold text-on-surface" id="summaryTravellerCount">{count} यात्री</span>
</div>
<div className="flex justify-between items-center text-on-surface-variant">
<span className="">सकल यात्रा शुल्क</span>
<span className="font-label-md text-label-md font-bold text-on-surface" id="summaryTotalCost">₹{inr(count * TOTAL_PER_PERSON)}</span>
</div>
<div className="flex justify-between items-center text-on-surface-variant">
<span className="">अग्रिम टोकन राशि</span>
<span className="font-label-md text-label-md font-bold text-primary" id="summaryTokenAmount">₹{inr(count * TOKEN_PER_PERSON)}</span>
</div>
<div className="p-3 rounded-xl bg-surface-container-low flex justify-between items-center">
<div className="flex flex-col">
<span className="font-label-sm text-[12px] sm:text-label-sm text-on-surface-variant">शेष देय राशि</span>
<span className="font-label-sm text-[11px] sm:text-label-sm text-secondary font-medium">यात्रा के 15 दिन पूर्व</span>
</div>
<span className="font-headline-sm text-[18px] sm:text-headline-sm font-bold text-secondary" id="summaryRemainingCost">₹{inr(count * (TOTAL_PER_PERSON - TOKEN_PER_PERSON))}</span>
</div>
</div>
{/* Inclusions Checklist */}
<div className="space-y-2 pt-1">
<span className="font-label-sm text-[12px] sm:text-label-sm text-on-surface font-bold uppercase tracking-wider block">शुल्क में सम्मिलित सुविधाएं:</span>
<ul className="space-y-2 font-body-sm text-[13px] sm:text-body-sm text-on-surface-variant">
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[18px]">train</span>
<span className="">आने-जाने का स्लीपर हमसफ़र एक्सप्रेस टिकट</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[18px]">ac_unit</span>
<span className="">पुरी में AC रूम ठहरने की उत्तम व्यवस्था</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[18px]">restaurant</span>
<span className="">दोनों समय शुद्ध सात्विक भोजन, चाय एवं नाश्ता</span>
</li>
<li className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[18px]">auto_stories</span>
<span className="">श्रीमद्भागवत कथा अमृत महोत्सव में प्रवेश</span>
</li>
</ul>
</div>
{/* Help Contact Box */}
<div className="p-4 rounded-xl bg-surface-container space-y-3">
<div className="flex items-center gap-2 text-primary font-label-md text-[14px] sm:text-label-md font-bold">
<span className="material-symbols-outlined text-[18px]">support_agent</span>
<span className="">पंजीकरण सहायता एवं मार्गदर्शन</span>
</div>
<div className="grid grid-cols-2 gap-2 text-label-md text-[13px] sm:text-label-md font-semibold">
<A className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm" href="tel:9630033396">
<span className="material-symbols-outlined text-[15px]">call</span>
<span className="">96300 33396</span>
</A>
<A className="flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm" href="tel:8954672057">
<span className="material-symbols-outlined text-[15px]">call</span>
<span className="">89546 72057</span>
</A>
</div>
</div>
{/* Existing Pass Link */}
<div className="pt-1 text-center">
<A className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-[13px] sm:text-label-md font-bold underline transition-colors" href="/pass">
<span className="material-symbols-outlined text-[16px]">search</span>
<span className="">Already Registered? Pass खोजें</span>
</A>
</div>
</div>
</div>
{/* Sacred Society Banner Note */}
<div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low text-center space-y-1.5">
<p className="font-headline-sm text-[16px] sm:text-headline-sm text-primary font-bold">
            "अच्छे व बड़े कार्य सभी के सहयोग से ही संभव है"
          </p>
<p className="font-label-sm text-[12px] sm:text-label-sm text-secondary font-semibold">
            आयोजक: श्री भगवन् कृपा सेवा समिति
          </p>
</div>
</div>
</div>
</div>
</div>
</main><footer className="w-full bg-surface-container-low border-t border-outline-variant/40 mt-16"><div className="bg-primary text-tertiary-fixed py-3 text-center"><p className="font-headline-sm text-headline-sm font-bold tracking-wide">॥ जय श्री जगन्नाथ ॥ जय श्री कृष्ण ॥</p></div><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"><div className="flex flex-col gap-4"><div className="flex items-center gap-3"><img alt="श्री जगन्नाथ यात्रा" className="h-12 w-auto object-contain" src={logo} /><div className="flex flex-col"><span className="font-headline-sm text-headline-sm text-primary font-bold leading-tight">श्री जगन्नाथ यात्रा</span><span className="font-label-sm text-label-sm text-secondary font-semibold">श्री भगवन् कृपा सेवा समिति</span></div></div><p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">श्री भगवन् कृपा सेवा समिति द्वारा आयोजित दिव्य जगन्नाथ पुरी तीर्थ यात्रा एवं श्रीमद्भागवत कथा। भक्ति, सेवा और सत्संग का पावन संगम।</p><div className="bg-surface-container p-3 rounded-lg border-l-4 border-primary"><p className="font-label-sm text-label-sm text-on-surface font-semibold">सीमित सीटें उपलब्ध हैं। कृपया शीघ्र अति शीघ्र अपना स्थान सुनिश्चित करें।</p></div></div><div className="flex flex-col gap-4"><h4 className="font-headline-sm text-headline-sm text-primary font-bold border-b border-outline-variant/30 pb-2">महत्वपूर्ण तिथियां</h4><ul className="flex flex-col gap-3 font-body-sm text-body-sm text-on-surface-variant"><li className="flex items-start gap-2.5"><span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">event</span><div className=""><strong className="text-on-surface block font-semibold">संपूर्ण तीर्थ यात्रा:</strong>5 से 15 जनवरी 2027</div></li><li className="flex items-start gap-2.5"><span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">auto_stories</span><div className=""><strong className="text-on-surface block font-semibold">श्रीमद्भागवत कथा:</strong>7 से 13 जनवरी 2027</div></li><li className="flex items-start gap-2.5"><span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">train</span><div className=""><strong className="text-on-surface block font-semibold">यात्रा साधन:</strong>विशेष आरक्षित हमसफ़र एक्सप्रेस</div></li></ul></div><div className="flex flex-col gap-4"><h4 className="font-headline-sm text-headline-sm text-primary font-bold border-b border-outline-variant/30 pb-2">त्वरित संपर्क सूत्र</h4><div className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant"><A className="flex items-center gap-2 hover:text-primary transition-colors" href="tel:9630033396"><span className="material-symbols-outlined text-secondary text-[18px]">call</span><span className="">96300 33396</span></A><A className="flex items-center gap-2 hover:text-primary transition-colors" href="tel:8954672057"><span className="material-symbols-outlined text-secondary text-[18px]">call</span><span className="">89546 72057</span></A><A className="flex items-center gap-2 hover:text-primary transition-colors" href="tel:9407007443"><span className="material-symbols-outlined text-secondary text-[18px]">call</span><span className="">94070 07443</span></A><A className="flex items-center gap-2 hover:text-primary transition-colors" href="tel:7000453199"><span className="material-symbols-outlined text-secondary text-[18px]">call</span><span className="">70004 53199</span></A><div className="flex items-start gap-2 pt-1"><span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">location_on</span><span className="">कार्यालय: इंदौर (म.प्र.) / तीर्थ कैंप: जगन्नाथ पुरी (ओडिशा)</span></div></div></div><div className="flex flex-col gap-4"><h4 className="font-headline-sm text-headline-sm text-primary font-bold border-b border-outline-variant/30 pb-2">त्वरित लिंक</h4><nav className="flex flex-col gap-2 font-label-md text-label-md" data-active-classes="text-primary font-bold"><A className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5" data-path="mukhya-prishth" href="/"><span className="material-symbols-outlined text-[16px]">chevron_right</span>मुख्य पृष्ठ (Home)</A><A className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5" data-path="bhagwat-katha" href="/#katha-section"><span className="material-symbols-outlined text-[16px]">chevron_right</span>कथा रूपरेखा (Katha)</A><A className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5" data-path="darshan-sthal" href="/#darshan-section"><span className="material-symbols-outlined text-[16px]">chevron_right</span>पवित्र दर्शन स्थल (Darshan)</A><A className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5" data-path="yatra-package" href="/#package-section"><span className="material-symbols-outlined text-[16px]">chevron_right</span>यात्रा पैकेज व व्यवस्था (Package)</A><A className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5" data-path="yatra-pass-status" href="/pass"><span className="material-symbols-outlined text-[16px]">chevron_right</span>Yatra Pass स्थिति जांचें</A></nav></div></div></div><div className="bg-surface-container py-4 border-t border-outline-variant/30 text-center font-label-sm text-label-sm text-on-surface-variant px-4"><p className="max-w-7xl mx-auto">अच्छे व बड़े कार्य सभी के सहयोग से ही संभव है — सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। © 2027 श्री भगवन् कृपा सेवा समिति। सर्वाधिकार सुरक्षित।</p></div></footer>

<div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-outline-variant/40 md:hidden px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"><div className="flex items-center justify-around"><A className="flex flex-col items-center py-1 px-2 text-on-surface-variant hover:text-primary transition-colors" href="/"><span className="material-symbols-outlined text-[20px]">home</span><span className="text-[12px] font-medium mt-0.5">Home</span></A><A className="flex flex-col items-center py-1 px-2 text-on-surface-variant hover:text-primary transition-colors" href="/#darshan-section"><span className="material-symbols-outlined text-[20px]">temple_hindu</span><span className="text-[12px] font-medium mt-0.5">दर्शन</span></A><A className="flex flex-col items-center py-1 px-2 text-primary font-bold" href="/registration"><span className="material-symbols-outlined text-[20px]">how_to_reg</span><span className="text-[12px] font-bold mt-0.5">पंजीकरण</span></A><A className="flex flex-col items-center py-1 px-2 text-on-surface-variant hover:text-primary transition-colors" href="/pass"><span className="material-symbols-outlined text-[20px]">confirmation_number</span><span className="text-[12px] font-medium mt-0.5">Pass</span></A><A className="flex flex-col items-center py-1 px-2 text-on-surface-variant hover:text-primary transition-colors" href="/#contact-section"><span className="material-symbols-outlined text-[20px]">menu</span><span className="text-[12px] font-medium mt-0.5">More</span></A></div></div>
    </div>
  );
}