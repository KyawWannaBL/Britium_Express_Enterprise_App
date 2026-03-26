import type { Dictionary, LanguageCode } from "./types";

export const dictionaries: Record<LanguageCode, Dictionary> = {
  en: {
    common: {
      appName: "Britium Express Delivery",
      language: "Language",
      trackShipment: "Track Shipment",
      createShipment: "Create Shipment",
      logout: "Log out"
    },
    customer: {
      heroTitle: "Fast, trackable parcel delivery",
      heroSubtitle: "Book, track, and manage deliveries across Myanmar.",
      enterTracking: "Enter tracking number"
    },
    courier: {
      myJobs: "My Jobs",
      scanWaybill: "Scan Waybill",
      completeDelivery: "Complete Delivery"
    },
    admin: {
      dashboard: "Dashboard",
      dispatchBoard: "Dispatch Board",
      printWaybill: "Print Waybill"
    }
  },
  my: {
    common: {
      appName: "Britium Express Delivery",
      language: "ဘာသာစကား",
      trackShipment: "ပစ္စည်းခြေရာခံရန်",
      createShipment: "ပစ္စည်းပို့ရန် ဖန်တီးမည်",
      logout: "ထွက်မည်"
    },
    customer: {
      heroTitle: "လျင်မြန်ပြီး ခြေရာခံနိုင်သော ပစ္စည်းပို့ဆောင်မှု",
      heroSubtitle: "မြန်မာနိုင်ငံအနှံ့ ပစ္စည်းပို့ခြင်းကို စာရင်းသွင်း၊ ခြေရာခံ၊ စီမံနိုင်သည်။",
      enterTracking: "ခြေရာခံနံပါတ် ထည့်ပါ"
    },
    courier: {
      myJobs: "ကျွန်ုပ်၏အလုပ်များ",
      scanWaybill: "Waybill စကန်ဖတ်မည်",
      completeDelivery: "ပို့ဆောင်မှုပြီးစီး"
    },
    admin: {
      dashboard: "ဒက်ရှ်ဘုတ်",
      dispatchBoard: "Dispatch Board",
      printWaybill: "Waybill ပရင့်ထုတ်မည်"
    }
  }
};

export const getDictionary = (language: LanguageCode): Dictionary => {
  return dictionaries[language];
};
