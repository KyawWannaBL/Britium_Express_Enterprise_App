"use client";

import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Bell,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  Edit3,
  FileText,
  Flag,
  Headphones,
  History,
  Home,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  Package2,
  Phone,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Upload,
  User,
  Wallet,
  XCircle,
} from "lucide-react"; // Import path ကို ပြင်ဆင်ပြီး

// --- Types ---
type Bi = { en: string; my: string };
type TabKey =
  | "dashboard"
  | "profile"
  | "tracking"
  | "history"
  | "calculator"
  | "booking"
  | "support"
  | "addresses"
  | "notifications";

type AsyncState = "ready" | "loading" | "empty" | "error";

type ShipmentStatus =
  | "Pending"
  | "Picked Up"
  | "In Transit"
  | "At Hub"
  | "Out for Delivery"
  | "Delivered"
  | "Delivery Failed"
  | "Returned";

type Shipment = {
  id: string;
  awb: string;
  receiver: string;
  destination: string;
  shipmentType: string;
  status: ShipmentStatus;
  createdAt: string;
  deliveryDate?: string;
  fee: number;
  cod: number;
  eta: string;
  origin: string;
  currentLocation: string;
  milestones: Array<{ label: Bi; time: string; done: boolean }>;
};

type Ticket = {
  id: string;
  subject: Bi;
  category: Bi;
  status: Bi;
  priority: Bi;
  updatedAt: string;
  trackingNo?: string;
};

// --- Constant Data ---
const tabs: Array<{
  id: TabKey;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: Bi;
}> = [
  { id: "dashboard", icon: Home, label: { en: "Dashboard", my: "ပင်မအနှစ်ချုပ်" } },
  { id: "profile", icon: User, label: { en: "Profile", my: "ပရိုဖိုင်" } },
  { id: "tracking", icon: Truck, label: { en: "Cargo Tracking", my: "ကုန်ပစ္စည်းခြေရာခံ" } },
  { id: "history", icon: History, label: { en: "Shipment History", my: "ပို့ဆောင်မှုမှတ်တမ်း" } },
  { id: "calculator", icon: Calculator, label: { en: "Shipping Calculator", my: "ပို့ဆောင်ခတွက်ချက်မှု" } },
  { id: "booking", icon: Package2, label: { en: "Create Shipment", my: "Shipment ဖန်တီးမည်" } },
  { id: "support", icon: Headphones, label: { en: "Support Center", my: "အကူအညီစင်တာ" } },
  { id: "addresses", icon: MapPin, label: { en: "Saved Addresses", my: "သိမ်းထားသောလိပ်စာများ" } },
  { id: "notifications", icon: Bell, label: { en: "Notifications", my: "အသိပေးချက်များ" } },
];

const sampleShipments: Shipment[] = [
  {
    id: "1",
    awb: "BEX-24081231",
    receiver: "Daw Ei Ei",
    destination: "Sanchaung, Yangon",
    shipmentType: "Express",
    status: "Out for Delivery",
    createdAt: "2026-04-03",
    deliveryDate: "2026-04-06",
    fee: 4500,
    cod: 25000,
    eta: "Today, 4:00 PM - 6:00 PM",
    origin: "Kamaryut, Yangon",
    currentLocation: "Sanchaung last-mile hub",
    milestones: [
      { label: { en: "Shipment Created", my: "Shipment ဖန်တီးပြီး" }, time: "Apr 3, 09:12", done: true },
      { label: { en: "Pickup Confirmed", my: "လာယူရန်အတည်ပြုပြီး" }, time: "Apr 3, 10:05", done: true },
      { label: { en: "Picked Up", my: "လာယူပြီး" }, time: "Apr 3, 10:42", done: true },
      { label: { en: "At Hub", my: "Hub သို့ရောက်ရှိပြီး" }, time: "Apr 4, 07:20", done: true },
      { label: { en: "Out for Delivery", my: "ပို့ဆောင်ရန်ထွက်ခွာပြီး" }, time: "Apr 6, 12:10", done: true },
      { label: { en: "Delivered", my: "ပို့ဆောင်ပြီး" }, time: "Pending", done: false },
    ],
  },
];

const sampleTickets: Ticket[] = [
  {
    id: "SUP-22014",
    subject: { en: "Need address update", my: "လိပ်စာပြင်ဆင်ရန်လိုသည်" },
    category: { en: "Modification", my: "ပြင်ဆင်ခြင်း" },
    status: { en: "In Review", my: "စစ်ဆေးဆဲ" },
    priority: { en: "Normal", my: "ပုံမှန်" },
    updatedAt: "Today, 11:40 AM",
  },
];

const notificationItems = [
  {
    title: { en: "Cargo Out for Delivery", my: "ကုန်ပစ္စည်းပို့ဆောင်ရန်ထွက်ခွာပြီး" },
    body: { en: "Expected between 4:00 PM and 6:00 PM.", my: "၄ နာရီမှ ၆ နာရီအတွင်း ရောက်ရှိပါမည်။" },
    time: "10 min ago",
  },
];

// --- Helper Functions & Components ---
function tw(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function BiText({ text, className = "", secondaryClassName = "", align = "left" }: { text: Bi; className?: string; secondaryClassName?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <div className={className}>{text.en}</div>
      <div className={secondaryClassName}>{text.my}</div>
    </div>
  );
}

function SurfaceCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={tw("rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl", className)}>
      {children}
    </motion.section>
  );
}

function DarkCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={tw("relative overflow-hidden rounded-[30px] bg-[#0d2c54] p-6 text-white", className)}>
      {children}
    </motion.section>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: Bi; subtitle?: Bi }) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-slate-200/80 pb-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[#0d2c54]">{icon}</div>
      <div>
        <BiText text={title} className="text-lg font-black text-[#0d2c54]" secondaryClassName="text-sm font-semibold text-slate-500" />
      </div>
    </div>
  );
}

function MetricTile({ label, value, icon }: { label: Bi; value: string; icon: React.ReactNode }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-[#0d2c54]">{icon}</div>
      <BiText text={label} className="mt-5 text-[11px] font-black uppercase text-slate-500" secondaryClassName="text-xs font-semibold text-slate-400" />
      <div className="mt-3 text-3xl font-black text-[#0d2c54]">{value}</div>
    </SurfaceCard>
  );
}

function StatusChip({ status }: { status: ShipmentStatus | Bi }) {
  const label = typeof status === "string" ? status : status.en;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase">
      {label}
    </span>
  );
}

function LoadingState({ title }: { title: Bi }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#0d2c54]" size={32} />
      <BiText text={title} align="center" className="font-bold" />
    </div>
  );
}

// --- Main Page Component ---
export default function CustomerPortal() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [screenState, setScreenState] = useState<AsyncState>("ready");
  
  const [profile, setProfile] = useState({
    businessName: "Britium Ventures Company Limited",
    contactName: "Daw Thiri Mon",
    phone: "09 421 556 221",
    email: "thirimon@britiumexpress.com",
    address: "No. 28, Alan Pya Pagoda Road, 5th Floor",
    township: "Dagon",
    city: "Yangon",
    accountStatus: "Verified Business",
    memberSince: "Jan 2024",
  });

  const dashboardView = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricTile label={{ en: "Active", my: "လက်ရှိ" }} value="12" icon={<Truck size={18} />} />
        <MetricTile label={{ en: "Delivered", my: "ပို့ဆောင်ပြီး" }} value="84" icon={<CheckCircle2 size={18} />} />
        <MetricTile label={{ en: "Pending", my: "စောင့်ဆိုင်းဆဲ" }} value="07" icon={<Clock3 size={18} />} />
        <MetricTile label={{ en: "Support", my: "အကူအညီ" }} value="02" icon={<Headphones size={18} />} />
        <MetricTile label={{ en: "Total", my: "စုစုပေါင်း" }} value="318" icon={<Package2 size={18} />} />
        <MetricTile label={{ en: "COD", my: "COD" }} value="48K Ks" icon={<Wallet size={18} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <SurfaceCard>
            <SectionTitle icon={<Sparkles size={18} />} title={{ en: "Quick Actions", my: "အမြန်လုပ်ဆောင်ရန်" }} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tabs.slice(2, 8).map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className="flex flex-col p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition items-start">
                   <t.icon size={20} className="text-[#0d2c54] mb-3" />
                   <div className="text-sm font-bold text-[#0d2c54]">{t.label.en}</div>
                   <div className="text-xs text-slate-500 font-semibold">{t.label.my}</div>
                </button>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionTitle icon={<History size={18} />} title={{ en: "Recent Shipments", my: "နောက်ဆုံးပို့ဆောင်မှုများ" }} />
            <div className="space-y-4">
              {sampleShipments.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50">
                  <div>
                    <div className="font-black text-[#0d2c54]">{s.awb}</div>
                    <div className="text-xs font-semibold text-slate-500">{s.destination}</div>
                  </div>
                  <StatusChip status={s.status} />
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <DarkCard>
             <div className="flex justify-between items-start mb-6">
                <BiText text={{ en: "Account Overview", my: "အကောင့်အနှစ်ချုပ်" }} className="text-lg font-black" />
                <ShieldCheck className="text-yellow-400" size={24} />
             </div>
             <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                   <div className="text-sm font-black">{profile.businessName}</div>
                   <div className="text-xs opacity-60 font-semibold mt-1">{profile.accountStatus}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 rounded-2xl bg-white/10 text-center">
                      <div className="text-[10px] uppercase opacity-50 font-bold">Tier</div>
                      <div className="text-lg font-black text-yellow-400">Gold</div>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/10 text-center">
                      <div className="text-[10px] uppercase opacity-50 font-bold">Joined</div>
                      <div className="text-lg font-black">2024</div>
                   </div>
                </div>
             </div>
          </DarkCard>
        </div>
      </div>
    </div>
  );

  const profileView = (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-8">
        <SurfaceCard>
          <SectionTitle icon={<User size={18} />} title={{ en: "Profile Information", my: "ကိုယ်ရေးအချက်အလက်" }} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Business Name</label>
                <div className="text-base font-bold text-[#0d2c54] mt-1">{profile.businessName}</div>
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contact Person</label>
                <div className="text-base font-bold text-[#0d2c54] mt-1">{profile.contactName}</div>
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</label>
                <div className="text-base font-bold text-[#0d2c54] mt-1">{profile.email}</div>
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone Number</label>
                <div className="text-base font-bold text-[#0d2c54] mt-1">{profile.phone}</div>
             </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 pb-32">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <BiText text={{ en: "Customer Portal", my: "ဖောက်သည်ပေါ်တယ်" }} className="text-4xl font-black text-[#0d2c54]" secondaryClassName="text-xl font-semibold text-slate-400" />
           <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {tabs.slice(0, 2).map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={tw("px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap", tab === t.id ? "bg-[#0d2c54] text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50")}>
                   {t.label.en}
                </button>
              ))}
           </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {screenState === "loading" ? (
              <LoadingState title={{ en: "Loading data...", my: "အချက်အလက်များ တင်နေသည်..." }} />
            ) : (
              <>
                {tab === "dashboard" && dashboardView}
                {tab === "profile" && profileView}
                {!["dashboard", "profile"].includes(tab) && (
                  <SurfaceCard className="py-24 text-center">
                    <Activity className="mx-auto mb-4 text-slate-300" size={48} />
                    <BiText align="center" text={{ en: "Section Under Development", my: "ဤအပိုင်းကို ပြင်ဆင်နေဆဲဖြစ်သည်" }} className="text-xl font-black text-slate-400" />
                  </SurfaceCard>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile/Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/80 border border-white/40 shadow-2xl backdrop-blur-2xl rounded-3xl p-2 flex justify-around items-center lg:hidden">
         {tabs.slice(0, 5).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={tw("p-4 rounded-2xl transition", tab === t.id ? "bg-[#0d2c54] text-white" : "text-slate-400")}>
               <t.icon size={20} />
            </button>
         ))}
      </div>
    </div>
  );
}