"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export type BiTextValue = {
  en: string;
  my: string;
};

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export function BilingualText({
  text,
  className = "",
  secondaryClassName = "",
  align = "left",
}: {
  text: BiTextValue;
  className?: string;
  secondaryClassName?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <div className={className}>{text.en}</div>
      <div className={secondaryClassName}>{text.my}</div>
    </div>
  );
}

export function EnterprisePage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(13,44,84,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_54%,#f8fafc_100%)] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] space-y-6">{children}</div>
    </div>
  );
}

export function HeroShell({ children }: { children: ReactNode }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/76 p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
      <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-[#ffd700]/10 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

export function PremiumCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={{ y: -2 }}
      className={[
        "rounded-[28px] border border-white/70 bg-white/78 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {children}
    </motion.section>
  );
}

export function DarkPremiumCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={[
        "relative overflow-hidden rounded-[30px] border border-[#17375f] bg-[linear-gradient(180deg,#0d2c54_0%,#0a2343_100%)] p-6 text-white shadow-[0_24px_64px_rgba(13,44,84,0.38)]",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#ffd700]/10 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

export function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: BiTextValue;
  subtitle?: BiTextValue;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[#0d2c54] shadow-inner">
          {icon}
        </div>
        <div>
          <BilingualText
            text={title}
            className="text-lg font-black tracking-tight text-[#0d2c54]"
            secondaryClassName="mt-1 text-sm font-semibold text-slate-500"
          />
          {subtitle ? (
            <BilingualText
              text={subtitle}
              className="mt-3 text-sm font-medium leading-6 text-slate-500"
              secondaryClassName="mt-1 text-sm font-medium leading-6 text-slate-500"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FieldLabel({
  label,
  helper,
  tone = "default",
}: {
  label: BiTextValue;
  helper?: BiTextValue;
  tone?: "default" | "light";
}) {
  return (
    <div className="mb-2">
      <BilingualText
        text={label}
        className={
          tone === "light"
            ? "text-[11px] font-black uppercase tracking-[0.18em] text-white/60"
            : "text-[11px] font-black uppercase tracking-[0.18em] text-slate-500"
        }
        secondaryClassName={
          tone === "light"
            ? "mt-1 text-xs font-semibold text-white/45"
            : "mt-1 text-xs font-semibold text-slate-400"
        }
      />
      {helper ? (
        <BilingualText
          text={helper}
          className={
            tone === "light"
              ? "mt-2 text-xs font-medium text-white/45"
              : "mt-2 text-xs font-medium text-slate-400"
          }
          secondaryClassName={
            tone === "light"
              ? "mt-0.5 text-xs font-medium text-white/45"
              : "mt-0.5 text-xs font-medium text-slate-400"
          }
        />
      ) : null}
    </div>
  );
}

export function InputShell({
  children,
  icon,
  dark = false,
}: {
  children: ReactNode;
  icon?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        "group relative rounded-2xl border transition",
        dark
          ? "border-white/12 bg-white/8 hover:border-white/22 focus-within:border-[#ffd700]/70 focus-within:bg-white/10 focus-within:shadow-[0_0_0_4px_rgba(255,215,0,0.08)]"
          : "border-slate-200/90 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] focus-within:border-[#0d2c54]/35 focus-within:shadow-[0_0_0_4px_rgba(13,44,84,0.08)]",
      ].join(" ")}
    >
      {icon ? (
        <div className={dark ? "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45" : "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"}>
          {icon}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function PremiumInput({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  dark = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: ReactNode;
  type?: string;
  dark?: boolean;
}) {
  return (
    <InputShell icon={icon} dark={dark}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm font-semibold outline-none placeholder:font-medium",
          icon ? "pl-11" : "",
          dark ? "text-white placeholder:text-white/32" : "text-[#0d2c54] placeholder:text-slate-300",
        ].join(" ")}
      />
    </InputShell>
  );
}

export function PremiumTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <InputShell>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 text-sm font-semibold text-[#0d2c54] outline-none placeholder:font-medium placeholder:text-slate-300"
      />
    </InputShell>
  );
}

export function PremiumSelect({
  value,
  onChange,
  options,
  dark = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  dark?: boolean;
}) {
  return (
    <InputShell dark={dark}>
      <ChevronRight
        size={16}
        className={[
          "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90",
          dark ? "text-white/35" : "text-slate-400",
        ].join(" ")}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full appearance-none rounded-2xl bg-transparent px-4 py-3.5 pr-10 text-sm font-semibold outline-none",
          dark ? "text-white" : "text-[#0d2c54]",
        ].join(" ")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </InputShell>
  );
}

export function ActionButton({
  children,
  tone = "primary",
  onClick,
}: {
  children: ReactNode;
  tone?: "primary" | "secondary";
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] outline-none",
        tone === "primary"
          ? "bg-[#0d2c54] text-white shadow-[0_18px_36px_rgba(13,44,84,0.2)]"
          : "border border-slate-200 bg-white text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.05)]",
      ].join(" ")}
    >
      {children}
    </motion.button>
  );
}

export function MetricCard({
  label,
  value,
}: {
  label: BiTextValue;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm">
      <BilingualText
        text={label}
        className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400"
        secondaryClassName="mt-1 text-xs font-semibold text-slate-400"
      />
      <p className="mt-3 text-2xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}

export function StatusBadge({
  text,
  tone = "blue",
}: {
  text: BiTextValue;
  tone?: "blue" | "amber" | "green" | "rose" | "violet";
}) {
  const palette = {
    blue: "bg-sky-50 text-sky-700 border-sky-100 before:bg-sky-500",
    amber: "bg-amber-50 text-amber-700 border-amber-100 before:bg-amber-500",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100 before:bg-emerald-500",
    rose: "bg-rose-50 text-rose-700 border-rose-100 before:bg-rose-500",
    violet: "bg-violet-50 text-violet-700 border-violet-100 before:bg-violet-500",
  }[tone];

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 before:h-2 before:w-2 before:rounded-full before:content-['']",
        palette,
      ].join(" ")}
    >
      <span className="text-xs font-black uppercase tracking-[0.16em]">{text.en}</span>
      <span className="text-xs font-semibold">{text.my}</span>
    </span>
  );
}
