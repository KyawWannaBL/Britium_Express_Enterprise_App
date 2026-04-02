import { Shell } from "@/app/_components/ui";
import CreateDeliveryClient from "./CreateDeliveryClient";

export default function CreateDeliveryPage() {
  return (
    <div className="max-w-5xl mx-auto p-6" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
       <h1 className="text-3xl font-black text-[#0d2c54] mb-6 uppercase tracking-tight">
          Intake Console <span className="text-slate-300 font-normal">/</span> ကုန်စည်လက်ခံရန်
       </h1>
       <CreateDeliveryClient />
    </div>
  );
}
