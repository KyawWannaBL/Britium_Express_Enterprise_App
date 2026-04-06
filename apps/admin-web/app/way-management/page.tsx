"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { 
  Search, RefreshCw, Route, AlertTriangle, RotateCcw, ShieldAlert,
  FileScan, Eye, CheckCircle2, Truck, Clock3, XCircle, Loader2,
  PackageCheck, MapPin, Phone, MessageSquare, X, Map as MapIcon,
  ChevronRight, Building2, Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// --- Types ---
type WayRow = { id: string; trackingNo: string; customerName: string; phone: string; status: string; collectable: number; riderRemark: string; lastLocation: string; createdAt: string; };
type LiveUnit = { id: string; code: string; driverName: string; status: string; latitude: number | null; longitude: number | null; };
type ModalType = "status" | "reassign" | "hold" | "return" | "escalate" | null;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function WayManagementPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<WayRow[]>([]);
  const [liveUnits, setLiveUnits] = useState<LiveUnit[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<WayRow | null>(null);
  const [listLoading, setListLoading] = useState(false);
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  const fetchShipments = async () => {
    setListLoading(true);
    const { data } = await supabase.from("way_records").select("*").order('created_at', { ascending: false });
    if (data) {
      setRows(data.map((item: any) => ({
        id: item.id,
        trackingNo: item.way_id || "-",
        customerName: item.customer_name || "-",
        phone: item.customer_phone || "-",
        status: (item.status || "processing").toLowerCase(),
        collectable: Number(item.cod_amount || 0),
        riderRemark: item.failed_reason || "No comments",
        lastLocation: item.township || "HQ",
        createdAt: item.created_at
      })));
    }
    setListLoading(false);
  };

useEffect(() => {
    fetchShipments();
    
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    let map: mapboxgl.Map | null = null;

    if (mapRef.current && token && !mapInstance.current) {
      mapboxgl.accessToken = token;
      try {
        map = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [96.1735, 16.8409],
          zoom: 11,
          pitch: 45
        });
        mapInstance.current = map;
        map.addControl(new mapboxgl.NavigationControl(), "top-right");
      } catch (e) {
        console.error("Mapbox init failed", e);
      }
    }

    return () => { 
      // Safe cleanup: only call remove if mapInstance.current is actually a valid object
      if (mapInstance.current) {
        const instance = mapInstance.current;
        mapInstance.current = null; // Unset the ref immediately
        instance.remove(); 
      }
    };
  }, []);

  const filteredRows = useMemo(() => rows.filter(r => {
    const q = query.toLowerCase();
    const match = !q || r.trackingNo.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q);
    const statusMatch = statusFilter === "all" || r.status === statusFilter;
    return match && statusMatch;
  }), [rows, query, statusFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans pb-32">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 w-fit border border-blue-100 tracking-widest">Operations Hub</div>
          <h1 className="text-5xl font-black text-[#0d2c54] uppercase tracking-tighter">Way Management</h1>
        </div>
        <button onClick={fetchShipments} className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-sm hover:bg-slate-50 transition">
          <RefreshCw size={16} className={listLoading ? "animate-spin" : ""} /> Sync Data
        </button>
      </header>

      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl mb-12 h-[450px]">
         <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Tracking / Customer..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#0d2c54] transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-100">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 font-black uppercase text-[10px] tracking-widest text-slate-400">
              <tr><th className="p-5">Tracking</th><th className="p-5">Customer</th><th className="p-5 text-center">Status</th><th className="p-5 text-right">Collectable</th><th className="p-5 text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 font-black text-[#0d2c54]">{row.trackingNo}</td>
                  <td className="p-5 font-bold text-slate-700">{row.customerName}</td>
                  <td className="p-5 text-center"><span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider">{row.status}</span></td>
                  <td className="p-5 text-right font-black text-emerald-600">{row.collectable.toLocaleString()} MMK</td>
                  <td className="p-5 text-center"><button className="text-[#0d2c54] font-black text-[10px] uppercase hover:underline">Lifecycle</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}