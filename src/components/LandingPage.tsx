import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Activity, ChevronDown, CheckCircle2, QrCode, Lock, CreditCard, Mail, Phone, MapPin } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<'policy' | 'terms' | null>(null);

  const faqs = [
    {
      q: "What is UPIPay Gateway?",
      a: "UPIPay is a zero-commission payment gateway that allows merchants to accept payments directly into their bank accounts via UPI, bypassing traditional payment aggregator fees."
    },
    {
      q: "Are there any hidden fees?",
      a: "No! Since payments are settled directly via the NPCI UPI network from the customer's bank to your bank, there are absolutely zero transaction fees or hidden charges."
    },
    {
      q: "How does the settlement work?",
      a: "Settlements are instant. Because the customer pays directly to your VPA (UPI ID), the money hits your bank account in real-time, just like a regular P2P or P2M UPI transfer."
    },
    {
      q: "Which apps are supported?",
      a: "It supports all major UPI apps including Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay, and WhatsApp Pay."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">UPI<span className="text-emerald-600">Pay</span></span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">Features</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">FAQ</a>
            <button 
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Admin Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Zero Commission Payments
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-tight">
            Accept UPI Payments <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600">Without Giving Up 2%</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            The ultimate self-hosted UPI gateway for modern businesses. Get money directly in your bank account instantly with zero processing fees.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-lg flex items-center justify-center gap-2"
            >
              Go to Dashboard
            </button>
            <a 
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl shadow-sm border border-slate-200 transition-all text-lg flex items-center justify-center gap-2"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Why choose UPIPay?</h2>
            <p className="mt-4 text-slate-600 font-medium">Everything you need to accept payments securely, without the aggregator middlemen.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Settlements</h3>
              <p className="text-slate-600 text-sm leading-relaxed">No more waiting T+2 days for your money. Payments hit your bank account instantly since it is a direct peer-to-merchant transfer.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bank-Grade Security</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Operates on the official NPCI framework. Your VPA details are secured and we use standard intent links to open UPI apps securely.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dynamic QR Codes</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Generate dynamic QR codes with pre-filled amounts and order IDs. Perfect for both online checkouts and physical stores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all">
                <button 
                  className="w-full text-left px-6 py-4 font-bold flex items-center justify-between focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10 text-white max-w-lg space-y-6">
              <h2 className="text-4xl font-black tracking-tight">Need Enterprise Support?</h2>
              <p className="text-slate-300 font-medium">Get in touch with our team for custom integrations, PhonePe/Paytm PG setups, and dedicated server configurations.</p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="font-medium">support@upipay.example.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="font-medium">1800-123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Tech Hub, Koramangala, Bangalore</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md relative z-10">
              <form className="bg-white p-8 rounded-3xl space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h3>
                <div>
                  <input type="text" required placeholder="Full Name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-slate-50" />
                </div>
                <div>
                  <input type="email" required placeholder="Work Email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-slate-50" />
                </div>
                <div>
                  <textarea required rows={4} placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 bg-slate-50 resize-none"></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-900 tracking-tight">UPIPay</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">© 2026 UPIPay Solutions. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveModal('policy')} className="text-sm font-medium text-slate-600 hover:text-slate-900">Privacy Policy</button>
            <button onClick={() => setActiveModal('terms')} className="text-sm font-medium text-slate-600 hover:text-slate-900">Terms of Service</button>
          </div>
        </div>
      </footer>

      {/* Modals for Policy & Terms */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              ×
            </button>
            {activeModal === 'policy' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900">Privacy Policy</h2>
                <p className="text-sm text-slate-600">Last updated: September 13, 2026</p>
                <div className="prose prose-sm text-slate-700 pt-4 space-y-4">
                  <p>At UPIPay, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by UPIPay and how we use it.</p>
                  <h4 className="font-bold">Information we collect</h4>
                  <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
                  <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>
                  <h4 className="font-bold">How we use your information</h4>
                  <ul className="list-disc pl-5">
                    <li>Provide, operate, and maintain our website</li>
                    <li>Improve, personalize, and expand our website</li>
                    <li>Understand and analyze how you use our website</li>
                    <li>Develop new products, services, features, and functionality</li>
                  </ul>
                </div>
              </div>
            )}
            {activeModal === 'terms' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900">Terms of Service</h2>
                <p className="text-sm text-slate-600">Last updated: September 13, 2026</p>
                <div className="prose prose-sm text-slate-700 pt-4 space-y-4">
                  <p>Welcome to UPIPay!</p>
                  <p>These terms and conditions outline the rules and regulations for the use of UPIPay's Website and Gateway services.</p>
                  <h4 className="font-bold">License</h4>
                  <p>Unless otherwise stated, UPIPay and/or its licensors own the intellectual property rights for all material on UPIPay. All intellectual property rights are reserved. You may access this from UPIPay for your own personal use subjected to restrictions set in these terms and conditions.</p>
                  <h4 className="font-bold">You must not:</h4>
                  <ul className="list-disc pl-5">
                    <li>Republish material from UPIPay</li>
                    <li>Sell, rent or sub-license material from UPIPay</li>
                    <li>Reproduce, duplicate or copy material from UPIPay</li>
                    <li>Redistribute content from UPIPay</li>
                  </ul>
                  <p>This Agreement shall begin on the date hereof.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
