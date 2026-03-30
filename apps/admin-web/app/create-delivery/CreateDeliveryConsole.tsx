"use client";

import Link from "next/link";
import { useState } from "react";
import QRCode from "react-qr-code"; 
import { Shell } from "../_components/ui";
import { useAppLanguage } from "@/lib/i18n";

// --- Types & Constants ---
type LiveData = { recentShipments?: any[]; [key: string]: any; };
type FormState = { customerName: string; customerPhone: string; senderCity: string; recipientCity: string; [key: string]: any; };

const dict = {
  en: { kicker: "CREATE DELIVERY", title: "Production booking console", copy: "Customer lookup and booking save." },
  my: { kicker: "ပို့ဆောင်မှုဖန်တီးရန်", title: "စာရင်းသွင်းသည့်စနစ်", copy: "ဖောက်သည်ရှာဖွေခြင်းနှင့် ဘေလ်ထုတ်ခြင်း။" }
};

const INITIAL_FORM: FormState = { customerName: "", customerPhone: "", senderCity: "Yangon", recipientCity: "Yangon" };

export function CreateDeliveryConsole({ initialData }: { initialData: LiveData }) {
  const { lang } = useAppLanguage();
  const t = dict[lang as keyof typeof dict];
  
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastWayId, setLastWayId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (result.way_id) {
        setLastWayId(result.way_id);
        setShowSuccess(true);
        setForm(INITIAL_FORM);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ The RETURN is now correctly inside the function body
  return (
    <Shell activeHref="/create-delivery">
      <div style={navHeaderStyle}>
        <div style={brandSection}><div style={logoBadge}>B</div><div>Britium Express Delivery</div></div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setForm(INITIAL_FORM)} style={primaryBtnStyle}>Reset Form</button>
          <Link href="/way-management" style={secondaryBtnStyle}>Way Management</Link>
        </div>
      </div>

      <section className="hero">
        <article className="hero-card">
          <div className="kicker">{lang === 'my' ? t.kicker : `CREATE DELIVERY / ${t.kicker}`}</div>
          <h1 className="hero-title">{t.title}</h1>
          <p className="hero-copy">{t.copy}</p>
        </article>
      </section>

      <form onSubmit={handleSubmit} style={formGridStyle}>
        <button type="submit" disabled={loading} style={primaryBtnStyle}>
          {loading ? "Processing..." : "Create Waybill"}
        </button>
      </form>

      {showSuccess && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={successBadgeStyle}>✓ BOOKING SUCCESSFUL</div>
            <h2 style={idStyle}>{lastWayId}</h2>
            <div style={qrContainerStyle}><QRCode value={lastWayId} size={160} /></div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => window.print()} style={primaryBtnStyle}>Print</button>
              <button onClick={() => setShowSuccess(false)} style={secondaryBtnStyle}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

// --- Styles ---
const navHeaderStyle: React.CSSProperties = { display: 'flex', gap: '12px', marginBottom: '32px', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' };
const brandSection: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '16px', flex: 1 };
const logoBadge: React.CSSProperties = { width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' };
const primaryBtnStyle: React.CSSProperties = { background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '99px', cursor: 'pointer' };
const secondaryBtnStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '99px', textDecoration: 'none' };
const formGridStyle: React.CSSProperties = { marginTop: '24px', display: 'flex', flexDirection: 'column' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { background: '#1e293b', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px' };
const qrContainerStyle: React.CSSProperties = { background: '#fff', padding: '12px', borderRadius: '12px', display: 'inline-block' };
const successBadgeStyle: React.CSSProperties = { color: '#10b981', fontWeight: 800, fontSize: '12px' };
const idStyle: React.CSSProperties = { fontSize: '28px', color: '#0ea5e9', margin: '16px 0' };