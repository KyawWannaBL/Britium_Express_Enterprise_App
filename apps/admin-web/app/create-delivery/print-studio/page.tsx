import Link from "next/link";
import { Shell } from "@/app/_components/ui";

export default function PrintStudioPage() {
  return (
    <Shell activeHref="/create-delivery">
       <div 
         className="hero-card border-l-4 border-[#ffd700] bg-white p-8 rounded-r-2xl shadow-sm mb-8"
         style={{ fontFamily: "'Pyidaungsu', 'Noto Sans Myanmar', sans-serif" }}
       >
          <h1 className="text-3xl font-black text-[#0d2c54] mb-2">
            Waybill Print Studio <span className="text-slate-400 font-normal">/</span> <span className="font-bold">အညွှန်းပုံနှိပ်စက်ခန်း</span>
          </h1>
          <p className="text-slate-600 mb-8">Generate thermal and A4 waybills for the logistics network. / ကုန်စည်ပို့ဆောင်ရေးအတွက် အညွှန်းစာရွက်များ ထုတ်ယူပါ။</p>
          
          <div className="flex gap-4">
             <Link 
               href="/print/waybill?format=4x6_single" 
               className="bg-[#0d2c54] hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-bold transition shadow-md"
             >
                Preview 4x6 Single (၄x၆ အရွယ်အစား)
             </Link>
             <Link 
               href="/print/waybill?format=a4_batch" 
               className="bg-[#ffd700] hover:bg-yellow-500 text-[#0d2c54] px-6 py-3 rounded-xl font-bold transition shadow-md"
             >
                Print Batch A4 (A4 အရွယ်အစား)
             </Link>
          </div>
       </div>
    </Shell>
  );
}
