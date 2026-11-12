import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

function AdminPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReg, setSelectedReg] = useState<any>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("jagannath_admin_session");
    if (loggedIn === "true") setIsLoggedIn(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "jagannath123") {
      localStorage.setItem("jagannath_admin_session", "true");
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("गलत यूज़रनेम या पासवर्ड!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jagannath_admin_session");
    setIsLoggedIn(false);
    setSelectedReg(null);
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchData = async () => {
      try {
        const response = await fetch('https://jagannath-backend.jagannath1.workers.dev/api/registrations');
        const data = await response.json();
        if (Array.isArray(data)) setRegistrations(data);
      } catch (err) {
        console.log("Backend error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  // Ye function backend ko update karega aur history bhi save karega
  const handleVerifyPayment = async (id: string, newStatus: string, newTotalPaid?: number, newPaymentEntry?: any) => {
    try {
      const body: any = { paymentStatus: newStatus };
      if (newTotalPaid !== undefined) body.totalPaid = newTotalPaid;
      if (newPaymentEntry) body.newPaymentEntry = newPaymentEntry;

      const response = await fetch(`https://jagannath-backend.jagannath1.workers.dev/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        const updatedReg = await response.json();
        setRegistrations(prev => prev.map(reg => reg._id === id ? updatedReg : reg));
        if (selectedReg?._id === id) setSelectedReg(updatedReg);
      }
    } catch (error) { console.log(error); }
  };

  const handleAllocateRoom = async (id: string) => {
    const hotelName = window.prompt("Hotel Name:");
    if (!hotelName) return;
    const roomNumber = window.prompt("Room Number:");
    if (!roomNumber) return;
    try {
      const response = await fetch(`https://jagannath-backend.jagannath1.workers.dev/api/registrations/allocate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelName, roomNumber })
      });
      if (response.ok) {
        const updatedReg = await response.json();
        setRegistrations(prev => prev.map(reg => reg._id === id ? updatedReg : reg));
        if (selectedReg?._id === id) setSelectedReg(updatedReg);
      }
    } catch (error) { console.log(error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this registration?")) {
      try {
        await fetch(`https://jagannath-backend.jagannath1.workers.dev/api/registrations/${id}`, { method: 'DELETE' });
        setRegistrations(prev => prev.filter(reg => reg._id !== id));
        alert("Deleted!");
      } catch (error) {}
    }
  };

  // Stats
  const totalYatri = registrations.reduce((sum, reg) => sum + reg.count, 0);
  const verifiedRegs = registrations.filter(r => r.paymentStatus === "Verified" || r.paymentStatus === "Fully Paid" || r.paymentStatus === "Partially Paid");
  const pendingCount = registrations.length - verifiedRegs.length;
  const totalCollection = verifiedRegs.reduce((sum, reg) => sum + (reg.totalPaid || 2500), 0);

  const filteredRegs = registrations.filter(reg => 
    reg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    reg.mobile.includes(searchQuery)
  );

  // --- LOGIN UI ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-body-md">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-8 border border-outline-variant/30">
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-primary text-[48px]">admin_panel_settings</span>
            <h1 className="font-headline-lg text-primary font-bold mt-2">एडमिन लॉगिन</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary outline-none" placeholder="Username (admin)" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary outline-none" placeholder="Password" required />
            {loginError && <div className="bg-error-container/50 text-error p-2 rounded text-center text-sm">{loginError}</div>}
            <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">lock_open</span> लॉगिन करें
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- FULL DETAIL PAGE (2-COLUMN LAYOUT) ---
  if (selectedReg) {
    const totalAmount = selectedReg.count * 12500;
    const totalPaid = selectedReg.totalPaid || 0;
    const remainingAmount = totalAmount - totalPaid;
    
    // Robust logic: Ek baar verify hoke wapas verify nahi bolega
    const isTokenVerified = totalPaid >= 2500 || selectedReg.paymentStatus === "Verified" || selectedReg.paymentStatus === "Partially Paid" || selectedReg.paymentStatus === "Fully Paid";
    const isFullyPaid = selectedReg.paymentStatus === "Fully Paid" || remainingAmount <= 0;

    return (
      <div className="min-h-screen bg-surface font-body-md p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <button onClick={() => setSelectedReg(null)} className="flex items-center gap-2 text-primary font-bold mb-4">
            <span className="material-symbols-outlined">arrow_back</span> वापस Dashboard पर
          </button>

          <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-2xl text-on-primary shadow-lg">
            <h1 className="text-2xl font-bold">{selectedReg.name}</h1>
            <p>Reg ID: #{selectedReg._id.substring(selectedReg._id.length - 8).toUpperCase()} | Mobile: {selectedReg.mobile}</p>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-2">
                  <h2 className="text-lg font-bold text-primary border-b pb-2 mb-2">यात्री विवरण</h2>
                  <p><b>नाम:</b> {selectedReg.name}</p>
                  <p><b>आधार:</b> {selectedReg.aadhaar}</p>
                  <p><b>शहर:</b> {selectedReg.city}</p>
                  <p><b>मोबाइल:</b> {selectedReg.mobile}</p>
                  <p><b>WhatsApp:</b> {selectedReg.whatsapp}</p>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-2">
                  <h2 className="text-lg font-bold text-primary border-b pb-2 mb-2">यात्रा विवरण</h2>
                  <p><b>स्टेशन:</b> {selectedReg.station}</p>
                  <p><b>कोच:</b> {selectedReg.coachType}</p>
                  <p><b>कुल यात्री:</b> {selectedReg.count}</p>
                  <div className="mt-2 pt-2 border-t">
                    <p><b>होटल:</b> {selectedReg.hotelName || "N/A"}</p>
                    <p><b>रूम:</b> {selectedReg.roomNumber || "N/A"}</p>
                    <button onClick={() => handleAllocateRoom(selectedReg._id)} className="mt-2 bg-tertiary text-on-tertiary px-3 py-1 rounded text-sm font-bold w-full">Update Room</button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold text-primary border-b pb-2 mb-4">सह-यात्री (Co-Travellers)</h2>
                {selectedReg.coTravellers && selectedReg.coTravellers.length > 0 ? (
                  <div className="space-y-3">
                    {selectedReg.coTravellers.map((trav: any, i: number) => (
                      <div key={i} className="flex justify-between bg-surface-container-low p-3 rounded-lg">
                        <span><b>{i+2}.</b> {trav.name}</span>
                        <span className="text-sm text-on-surface-variant">उम्र: {trav.age} | {trav.gender}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-on-surface-variant">कोई सह-यात्री नहीं है।</p>}
              </div>
            </div>

            {/* RIGHT COLUMN (Accounting & Actions) */}
            <div className="space-y-6">
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-sm">history</span> Payment Tracking
                </h3>
                <p className="text-xs text-gray-700"><b>Method:</b> {selectedReg.paymentMethod || "None"}</p>
                <p className="text-xs text-gray-700"><b>Initiated:</b> {selectedReg.paymentInitiatedAt ? new Date(selectedReg.paymentInitiatedAt).toLocaleString('en-IN') : "N/A"}</p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-primary border-b pb-2">Accounting</h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between bg-green-50 p-2 rounded">
                    <span>Total Amount:</span>
                    <span className="font-bold text-green-700">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-blue-50 p-2 rounded">
                    <span>Total Paid:</span>
                    <span className="font-bold text-blue-700">₹{totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-red-50 p-2 rounded">
                    <span>Remaining:</span>
                    <span className="font-bold text-red-700">₹{remainingAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {!isTokenVerified ? (
                    <button 
                      onClick={() => handleVerifyPayment(selectedReg._id, "Verified", 2500)} 
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span> Verify Token (₹2,500)
                    </button>
                  ) : (
                    <div className="w-full bg-green-100 text-green-800 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-green-200">
                      <span className="material-symbols-outlined text-sm">verified</span> Token Verified ✔️
                    </div>
                  )}

                  {isTokenVerified && !isFullyPaid && (
                    <div className="bg-yellow-50 p-3 rounded-xl space-y-2 border border-yellow-200">
                      <h3 className="font-bold text-yellow-800 text-xs">Add Manual Payment</h3>
                      <input type="number" id="partialAmount" placeholder="Amount (₹)" className="w-full p-2 border rounded text-sm outline-none" />
                      <input type="text" id="partialDate" placeholder="Date (e.g., 15 Nov)" className="w-full p-2 border rounded text-sm outline-none" />
                      <button 
                        onClick={() => {
                          const amtInput = document.getElementById('partialAmount') as HTMLInputElement;
                          const dtInput = document.getElementById('partialDate') as HTMLInputElement;
                          if(!amtInput.value || !dtInput.value) { alert("Amount aur Date dono daalo"); return; }
                          const newTotal = totalPaid + parseInt(amtInput.value);
                          const newEntry = { amount: parseInt(amtInput.value), date: dtInput.value };
                          handleVerifyPayment(selectedReg._id, "Partially Paid", newTotal, newEntry);
                        }}
                        className="w-full bg-yellow-600 text-white py-1.5 rounded font-bold text-xs"
                      >
                        Save Entry
                      </button>
                    </div>
                  )}

                  {isTokenVerified && !isFullyPaid && (
                    <button 
                      onClick={() => {
                        if(window.confirm(`Confirm: Full Remaining ₹${remainingAmount.toLocaleString()} received?`)) {
                          handleVerifyPayment(selectedReg._id, "Fully Paid", totalAmount);
                        }
                      }} 
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                    >
                      Mark Full Paid
                    </button>
                  )}

                  {isFullyPaid && (
                    <div className="w-full bg-green-100 text-green-800 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-green-200">
                      Full Payment Received!
                    </div>
                  )}

                  <a href={`https://wa.me/91${selectedReg.mobile}`} target="_blank" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                    WhatsApp Message
                  </a>
                </div>

                <div className="pt-2 border-t border-gray-200 mt-2">
                  {isTokenVerified ? (
                    <a href={`/pass`} target="_blank" className="w-full bg-primary text-on-primary py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                      Generate Pass
                    </a>
                  ) : (
                    <div className="w-full bg-error-container/50 text-error py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">lock</span> Verify Token to Unlock Pass
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History Box (Side mein separate) */}
              <div className="bg-surface-container-low p-5 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">receipt_long</span> Entries History
                </h3>
                {selectedReg.paymentHistory && selectedReg.paymentHistory.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedReg.paymentHistory.map((entry: any, i: number) => (
                      <li key={i} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border-l-4 border-green-500 text-xs">
                        <span className="font-bold text-green-700">₹{Number(entry.amount).toLocaleString()}</span>
                        <span className="text-gray-500">{entry.date}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-gray-400 text-center py-2">No entries yet.</p>}
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD UI ---
  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">श्री जगन्नाथ यात्रा - एडमिन</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">logout</span> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm">
            <div className="flex justify-between"><span className="text-blue-500 font-bold">Total Yatri</span><span className="material-symbols-outlined text-blue-500">group</span></div>
            <h2 className="text-3xl font-bold text-blue-900 mt-2">{totalYatri}</h2>
            <p className="text-xs text-gray-500">Main + Co-Travellers</p>
          </div>
          <div className="bg-green-50 p-5 rounded-2xl border-l-4 border-green-500 shadow-sm">
            <div className="flex justify-between"><span className="text-green-500 font-bold">Verified</span><span className="material-symbols-outlined text-green-500">verified</span></div>
            <h2 className="text-3xl font-bold text-green-900 mt-2">{verifiedRegs.length}</h2>
            <p className="text-xs text-gray-500">Payments Received</p>
          </div>
          <div className="bg-amber-50 p-5 rounded-2xl border-l-4 border-amber-500 shadow-sm">
            <div className="flex justify-between"><span className="text-amber-500 font-bold">Pending</span><span className="material-symbols-outlined text-amber-500">pending</span></div>
            <h2 className="text-3xl font-bold text-amber-900 mt-2">{pendingCount}</h2>
            <p className="text-xs text-gray-500">Verification Due</p>
          </div>
          <div className="bg-purple-50 p-5 rounded-2xl border-l-4 border-purple-500 shadow-sm">
            <div className="flex justify-between"><span className="text-purple-500 font-bold">Collection</span><span className="material-symbols-outlined text-purple-500">payments</span></div>
            <h2 className="text-3xl font-bold text-purple-900 mt-2">₹{totalCollection.toLocaleString()}</h2>
            <p className="text-xs text-gray-500">Total Token Amount</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
          <input type="text" placeholder="नाम या मोबाइल से खोजें..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-3 px-4 font-semibold">Naam / Mobile</th>
                <th className="py-3 px-4 font-semibold">Station / Yatri</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRegs.map((reg) => {
                const isPaid = reg.paymentStatus === "Verified" || reg.paymentStatus === "Fully Paid" || reg.paymentStatus === "Partially Paid";
                return (
                  <tr key={reg._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{reg.name}</p>
                      <p className="text-sm text-gray-500">{reg.mobile}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p>{reg.station}</p>
                      <p className="text-sm text-gray-500">Yatri: {reg.count}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {reg.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <button onClick={() => setSelectedReg(reg)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">Full Details</button>
                      <button onClick={() => handleDelete(reg._id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredRegs.length === 0 && <p className="text-center py-10 text-gray-500">कोई रिजल्ट नहीं मिला।</p>}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/admin')({
  component: AdminPage,
});