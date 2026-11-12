import { useState } from "react";

export function PaymentPage() {
  const [cashSelected, setCashSelected] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // URL se data read karna
  const urlParams = new URLSearchParams(window.location.search);
  const count = Number(urlParams.get('count')) || 1;
  const regId = urlParams.get('regId') || "N/A";

  // Amount Calculation
  const totalAmount = count * 12500;
  const tokenAmount = count * 2500;
  const remainingAmount = totalAmount - tokenAmount;

  // Pay Now (UPI) Function - Backend tracking ke sath
  const handlePayNowUPI = async () => {
    try {
      // 1. Backend ko batao ki UPI select kiya gaya hai
      await fetch(`https://jagannath-backend.jagannath1.workers.dev/api/registrations/${regId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: "UPI Initiated",
          paymentMethod: "UPI",
          paymentInitiatedAt: new Date()
        })
      });

      // 2. Ab UPI app kholo
      const upiId = "8954672057@ybl";
      const payeeName = "Shri Jagannath Yatra";
      const amount = tokenAmount;
      const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Token for ${regId}`;
      window.location.href = upiLink;
    } catch (error) {
      alert("Server error. Payment method record nahi ho saka.");
    }
  };

  // Cash Payment Function - Backend tracking ke sath + AUTO HOME PAGE REDIRECT
  const handleCashPayment = async () => {
    if (!window.confirm("Cash payment ke liye sahaymati?")) return;

    try {
      // 1. Backend ko batao ki Cash select kiya gaya hai
      await fetch(`https://jagannath-backend.jagannath1.workers.dev/api/registrations/${regId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: "Cash Pending",
          paymentMethod: "Cash",
          paymentInitiatedAt: new Date()
        })
      });

      // 2. Brief confirmation (so user knows request was registered)
      setCashSelected(true);
      setRedirecting(true);

      // 3. 1.5 second baad auto home page par redirect
      // User ko green "requested" box dikhta hai, phir home page khul jaata hai
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (error) {
      setRedirecting(false);
      alert("Server error. Payment method record nahi ho saka.");
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface">
      {/* Header */}
      <header className="bg-primary text-on-primary shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 text-center">
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight">पंजीकरण शुल्क भुगतान</h1>
          <p className="text-sm text-on-primary-container/80 mt-1">Reg No: {regId} | {count} Yatri</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">

        {/* Calculation Box */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-lg overflow-hidden border border-outline-variant/20 mb-6">
          <div className="bg-secondary-fixed/40 px-5 py-3 border-b border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">calculate</span>
              शुल्क गणना एवं विवरण
            </h2>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center text-on-surface-variant text-sm">
              <span>पैकेज शुल्क (₹12,500 × {count})</span>
              <span className="font-bold text-on-surface">₹{totalAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-green-700 text-sm bg-green-50 p-2 rounded-lg">
              <span className="flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                टोकन राशि (₹2,500 × {count})
              </span>
              <span className="font-bold">₹{tokenAmount.toLocaleString()}</span>
            </div>

            <div className="border-t border-outline-variant/30 pt-3 flex justify-between items-center">
              <div>
                <span className="block font-headline-sm text-headline-sm text-error font-bold text-sm">शेष देय राशि</span>
                <span className="text-[10px] text-on-surface-variant">(यात्रा के 15 दिन पूर्व)</span>
              </div>
              <span className="font-headline-lg text-headline-lg text-secondary font-bold">₹{remainingAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        {cashSelected ? (
          <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-2xl text-center shadow-sm">
            <span className="material-symbols-outlined text-[36px] text-green-600">
              {redirecting ? "progress_activity" : "task_alt"}
            </span>
            <h3 className="font-bold mt-1">
              {redirecting ? "होम पेज पर जा रहे हैं..." : "Cash Payment Requested"}
            </h3>
            <p className="text-xs mt-1">Office mein ₹{tokenAmount.toLocaleString()} jama karein.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-center font-headline-sm text-headline-sm text-on-surface-variant font-bold text-sm">
              ₹{tokenAmount.toLocaleString()} टोकन जमा करने के लिए विकल्प चुनें
            </h3>

            {/* Cash Payment - Click ke baad auto home redirect */}
            <button
              onClick={handleCashPayment}
              className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl shadow-sm border-2 border-transparent hover:border-secondary transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[20px]">payments</span>
                </div>
                <div className="text-left">
                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface text-sm">संस्था कार्यालय में Cash</h4>
                  <p className="text-[10px] text-on-surface-variant">Direct cash dekar token verify karein.</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
            </button>

            {/* Pay Now - Direct UPI */}
            <button
              onClick={handlePayNowUPI}
              className="w-full flex items-center justify-between p-4 bg-primary text-on-primary rounded-xl shadow-lg hover:bg-primary-container transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">qr_code_2</span>
                </div>
                <div className="text-left">
                  <h4 className="font-headline-sm text-headline-sm font-bold text-sm">Pay Now (UPI)</h4>
                  <p className="text-[10px] text-on-primary/80">PhonePe, GPay ya Paytm se turant pay karein.</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default PaymentPage;
