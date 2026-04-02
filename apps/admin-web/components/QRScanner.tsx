"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    scanner.render((decodedText) => {
      scanner.clear();
      onScan(decodedText);
    }, (error) => { /* handle error */ });
    return () => { scanner.clear(); };
  }, []);

  return (
    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl">
      <div id="reader"></div>
      <p className="text-center p-4 text-[10px] font-black text-white/50 uppercase tracking-widest bg-[#0d2c54]">
        Point Camera at Waybill QR Code
      </p>
    </div>
  );
}
