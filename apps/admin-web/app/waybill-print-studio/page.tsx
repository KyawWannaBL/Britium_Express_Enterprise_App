"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Printer, Search, QrCode, Download } from "lucide-react";

export default function PrintStudio() {
  const [tracking, setTracking] = useState("");

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } } };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans pb-24">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-6xl mx-auto space-y-10">
        
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-slate-600 mb-4 border border-slate-300/50">
            <Printer size={14} className="stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logistics Tools</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#0d2c54]">
            Print <span className="font-light italic text-blue-500">Studio</span>
          </h1>
          <p className="mt-3 text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
            Generate and print operational manifests, standard A6 thermal labels, and A4 batch sheets for hub routing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <motion.div variants={fadeUp} className="lg:col-span-5">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm">
              <h3 className="font-black text-[#0d2c54] text-xs uppercase tracking-[0.2em] border-b border-slate-100 pb-4 mb-6">Job Configuration</h3>
              
              <div className="space-y-5">
                <div className="relative shadow-sm rounded-2xl">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    value={tracking} onChange={(e) => setTracking(e.target.value)}
                    placeholder="Scan Tracking ID..." 
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Format</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm text-[#0d2c54] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                    <option>Standard A6 Thermal Label</option>
                    <option>A4 Batch Print (4 per page)</option>
                    <option>Hub Dispatch Manifest</option>
                  </select>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-[#0d2c54] to-blue-900 text-[#ffd700] py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(13,44,84,0.3)] flex items-center justify-center gap-3 mt-4">
                  <Printer size={20}/> Execute Print Job
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div variants={fadeUp} className="lg:col-span-7 bg-slate-200/50 p-8 rounded-[3rem] border-4 border-dashed border-slate-300/50 flex items-center justify-center overflow-hidden relative">
            
            {/* The Physical Label Mockup */}
            <motion.div 
              initial={{ rotate: -2, y: 20, opacity: 0 }}
              animate={{ rotate: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              className="w-[380px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8 border-2 border-slate-900 flex flex-col relative"
            >
              {/* Fake Tape on top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-white/40 backdrop-blur-sm border border-slate-200/50 transform rotate-1"></div>

              <div className="flex justify-between items-center border-b-[3px] border-slate-900 pb-5 mb-5">
                <h2 className="text-3xl font-black italic tracking-tighter text-slate-900">BEX</h2>
                <div className="px-4 py-1.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">Priority</div>
              </div>
              
              <div className="flex justify-center py-6">
                <QrCode size={140} className="text-slate-900" />
              </div>
              
              <div className="text-center mb-6">
                <p className="font-mono font-black text-2xl tracking-[0.2em] text-slate-900">{tracking || "BEX-99201-YGN"}</p>
              </div>
              
              <div className="border-t-[3px] border-slate-900 pt-5 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-1">To:</p>
                  <p className="font-bold text-sm text-slate-900 leading-snug">U Hlaing Min<br/>Yangon, Myanmar</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-1">COD Amount:</p>
                  <p className="font-black text-2xl text-slate-900 tracking-tighter">25,000</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">MMK</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
