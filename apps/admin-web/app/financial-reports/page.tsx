"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  DollarSign,
  FileSpreadsheet,
  HeartHandshake,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  formatMMK,
  getItems,
  toNumber,
  toText,
  tryGet,
} from "@/lib/productionApi";

type Language = "en" | "my" | "both";
type ReportTab =
  | "cashBookSummary"
  | "journalSummary"
  | "trialBalance"
  | "incomeStatement"
  | "balanceSheet"
  | "profitAndLoss";

type CommonRow = {
  id: string;
  branch: string;
  zone: string;
  reportDate: string;
};

type CashBookRow = CommonRow & {
  accountDescription: string;
  received: number;
  payment: number;
  openingBalance: number;
  closingBalance: number;
};

type JournalSummaryRow = CommonRow & {
  accountDescription: string;
  debit: number;
  credit: number;
};

type TrialBalanceRow = CommonRow & {
  codeNo: string;
  accountHead: string;
  accountDescription: string;
  openingDebit: number;
  openingCredit: number;
  duringDebit: number;
  duringCredit: number;
  closingDebit: number;
  closingCredit: number;
};

type IncomeStatementRow = CommonRow & {
  codeNo: string;
  description: string;
  category: "income" | "expense" | "summary";
  amount: number;
};

type BalanceSheetRow = CommonRow & {
  codeNo: string;
  description: string;
  section: "asset" | "equity" | "liability" | "total";
  amount: number;
};

type ProfitLossRow = CommonRow & {
  codeNo: string;
  description: string;
  amount: number;
  cumulativeYearToDate: number;
  category: "income" | "expense" | "summary";
};

const REPORT_ENDPOINTS = {
  cashBookSummary: "/api/v1/reports/cash-book-summary",
  journalSummary: "/api/v1/reports/journal-summary",
  trialBalance: "/api/v1/reports/trial-balance",
  incomeStatement: "/api/v1/reports/income-statement",
  balanceSheet: "/api/v1/reports/balance-sheet",
  profitAndLoss: "/api/v1/reports/profit-loss",
};

const defaultDateRange = {
  startDate: "2026-01-01",
  endDate: "2026-01-31",
};

function bi(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function toId(prefix: string, value: unknown, index: number) {
  const text = toText(value, "").trim();
  return text || `${prefix}-${index + 1}`;
}

function normalizeCashBook(input: unknown): CashBookRow[] {
  return getItems(input).map((row, index) => ({
    id: toId("cash-book", row.id, index),
    branch: toText(row.branch_name, row.branch, "All branches"),
    zone: toText(row.zone_name, row.zone, "All zones"),
    reportDate: toText(row.date, row.report_date, row.created_at, ""),
    accountDescription: toText(row.account_description, row.description, row.account_name, "-"),
    received: toNumber(row.received, row.received_amount, row.cash_received),
    payment: toNumber(row.payment, row.payment_amount, row.cash_payment),
    openingBalance: toNumber(row.opening_balance, row.openingBalance),
    closingBalance: toNumber(row.closing_balance, row.closingBalance),
  }));
}

function normalizeJournalSummary(input: unknown): JournalSummaryRow[] {
  return getItems(input).map((row, index) => ({
    id: toId("journal-summary", row.id, index),
    branch: toText(row.branch_name, row.branch, "All branches"),
    zone: toText(row.zone_name, row.zone, "All zones"),
    reportDate: toText(row.date, row.report_date, row.created_at, ""),
    accountDescription: toText(row.account_description, row.description, row.account_name, "-"),
    debit: toNumber(row.debit, row.debit_amount),
    credit: toNumber(row.credit, row.credit_amount),
  }));
}

function normalizeTrialBalance(input: unknown): TrialBalanceRow[] {
  return getItems(input).map((row, index) => ({
    id: toId("trial-balance", row.id, index),
    branch: toText(row.branch_name, row.branch, "All branches"),
    zone: toText(row.zone_name, row.zone, "All zones"),
    reportDate: toText(row.date, row.report_date, row.created_at, ""),
    codeNo: toText(row.code_no, row.code, "-"),
    accountHead: toText(row.account_head, row.head, "-"),
    accountDescription: toText(row.account_description, row.description, row.account_name, "-"),
    openingDebit: toNumber(row.opening_debit, row.opening_balance_debit),
    openingCredit: toNumber(row.opening_credit, row.opening_balance_credit),
    duringDebit: toNumber(row.during_debit, row.debit),
    duringCredit: toNumber(row.during_credit, row.credit),
    closingDebit: toNumber(row.closing_debit, row.closing_balance_debit),
    closingCredit: toNumber(row.closing_credit, row.closing_balance_credit),
  }));
}

function normalizeIncomeStatement(input: unknown): IncomeStatementRow[] {
  return getItems(input).map((row, index) => {
    const rawCategory = toText(row.category, row.section, "income").toLowerCase();
    const category: IncomeStatementRow["category"] = rawCategory.includes("expense")
      ? "expense"
      : rawCategory.includes("summary") || rawCategory.includes("profit")
        ? "summary"
        : "income";

    return {
      id: toId("income-statement", row.id, index),
      branch: toText(row.branch_name, row.branch, "All branches"),
      zone: toText(row.zone_name, row.zone, "All zones"),
      reportDate: toText(row.date, row.report_date, row.created_at, ""),
      codeNo: toText(row.code_no, row.code, "-"),
      description: toText(row.description, row.account_description, "-"),
      category,
      amount: toNumber(row.amount, row.total_amount),
    };
  });
}

function normalizeBalanceSheet(input: unknown): BalanceSheetRow[] {
  return getItems(input).map((row, index) => {
    const rawSection = toText(row.section, row.category, "asset").toLowerCase();
    const section: BalanceSheetRow["section"] = rawSection.includes("equity")
      ? "equity"
      : rawSection.includes("liabil")
        ? "liability"
        : rawSection.includes("total")
          ? "total"
          : "asset";

    return {
      id: toId("balance-sheet", row.id, index),
      branch: toText(row.branch_name, row.branch, "All branches"),
      zone: toText(row.zone_name, row.zone, "All zones"),
      reportDate: toText(row.date, row.report_date, row.created_at, ""),
      codeNo: toText(row.code_no, row.code, "-"),
      description: toText(row.description, row.account_description, "-"),
      section,
      amount: toNumber(row.amount, row.total_amount, row.balance),
    };
  });
}

function normalizeProfitLoss(input: unknown): ProfitLossRow[] {
  return getItems(input).map((row, index) => {
    const rawCategory = toText(row.category, row.section, "income").toLowerCase();
    const category: ProfitLossRow["category"] = rawCategory.includes("expense")
      ? "expense"
      : rawCategory.includes("summary") || rawCategory.includes("profit")
        ? "summary"
        : "income";

    return {
      id: toId("profit-loss", row.id, index),
      branch: toText(row.branch_name, row.branch, "All branches"),
      zone: toText(row.zone_name, row.zone, "All zones"),
      reportDate: toText(row.date, row.report_date, row.created_at, ""),
      codeNo: toText(row.code_no, row.code, "-"),
      description: toText(row.description, row.account_description, "-"),
      amount: toNumber(row.amount, row.total_amount),
      cumulativeYearToDate: toNumber(row.cumulative_year_to_date, row.ytd, row.year_to_date),
      category,
    };
  });
}

function matchesDate(dateText: string, startDate: string, endDate: string) {
  if (!dateText) return true;
  const plainDate = dateText.slice(0, 10);
  if (startDate && plainDate < startDate) return false;
  if (endDate && plainDate > endDate) return false;
  return true;
}

function matchesCommonFilters<T extends CommonRow>(
  rows: T[],
  branch: string,
  zone: string,
  startDate: string,
  endDate: string,
  search: string,
  projector: (row: T) => string,
) {
  const needle = search.trim().toLowerCase();

  return rows.filter((row) => {
    if (branch !== "all" && row.branch !== branch) return false;
    if (zone !== "all" && row.zone !== zone) return false;
    if (!matchesDate(row.reportDate, startDate, endDate)) return false;
    if (!needle) return true;
    return projector(row).toLowerCase().includes(needle);
  });
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function LanguageToggle({
  language,
  onChange,
}: {
  language: Language;
  onChange: (value: Language) => void;
}) {
  const items: Array<{ key: Language; label: string }> = [
    { key: "en", label: "EN" },
    { key: "my", label: "မြန်မာ" },
    { key: "both", label: "EN + မြန်မာ" },
  ];

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {items.map((item) => {
        const active = item.key === language;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              active ? "bg-[#0d2c54] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function reportTabLabel(language: Language, tab: ReportTab) {
  const map: Record<ReportTab, { en: string; my: string }> = {
    cashBookSummary: { en: "Cash book summary", my: "ငွေစာရင်းအနှစ်ချုပ်" },
    journalSummary: { en: "Journal summary", my: "ဂျာနယ်အနှစ်ချုပ်" },
    trialBalance: { en: "Trial balance", my: "Trial balance" },
    incomeStatement: { en: "Income statement", my: "ဝင်ငွေဖော်ပြချက်" },
    balanceSheet: { en: "Balance sheet", my: "လက်ကျန်ရှင်းတမ်း" },
    profitAndLoss: { en: "Profit and loss", my: "အမြတ်နှင့်အရှုံး" },
  };
  return bi(language, map[tab].en, map[tab].my);
}

function ReportTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-2 text-sm font-bold transition",
        active ? "bg-[#0d2c54] text-white shadow" : "bg-slate-50 text-slate-600 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function FilterBar({
  language,
  startDate,
  endDate,
  branch,
  zone,
  search,
  branches,
  zones,
  onStartDateChange,
  onEndDateChange,
  onBranchChange,
  onZoneChange,
  onSearchChange,
  searchPlaceholder,
}: {
  language: Language;
  startDate: string;
  endDate: string;
  branch: string;
  zone: string;
  search: string;
  branches: string[];
  zones: string[];
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onZoneChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <label className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          {bi(language, "Start Date", "စတင်ရက်")}
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          {bi(language, "End Date", "ပြီးဆုံးရက်")}
        </span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          {bi(language, "Branch", "ဘဏ်ခွဲ")}
        </span>
        <select
          value={branch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
        >
          <option value="all">{bi(language, "Select the branch", "ဘဏ်ခွဲရွေးပါ")}</option>
          {branches.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          {bi(language, "Zone", "ဇုန်")}
        </span>
        <select
          value={zone}
          onChange={(e) => onZoneChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
        >
          <option value="all">{bi(language, "Select the zone", "ဇုန်ရွေးပါ")}</option>
          {zones.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          {bi(language, "Search", "ရှာဖွေရန်")}
        </span>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </label>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <Icon size={24} className="text-[#0d2c54]" />
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-black text-[#0d2c54]">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-[#0d2c54]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function DataTable({
  headers,
  rows,
  emptyText,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyText: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-black">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="border-t border-slate-100 align-top">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FinancialReportsPage() {
  const [language, setLanguage] = useState<Language>("both");
  const [activeTab, setActiveTab] = useState<ReportTab>("cashBookSummary");
  const [cashBookRows, setCashBookRows] = useState<CashBookRow[]>([]);
  const [journalSummaryRows, setJournalSummaryRows] = useState<JournalSummaryRow[]>([]);
  const [trialBalanceRows, setTrialBalanceRows] = useState<TrialBalanceRow[]>([]);
  const [incomeStatementRows, setIncomeStatementRows] = useState<IncomeStatementRow[]>([]);
  const [balanceSheetRows, setBalanceSheetRows] = useState<BalanceSheetRow[]>([]);
  const [profitLossRows, setProfitLossRows] = useState<ProfitLossRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [branch, setBranch] = useState("all");
  const [zone, setZone] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      tryGet<unknown>(REPORT_ENDPOINTS.cashBookSummary),
      tryGet<unknown>(REPORT_ENDPOINTS.journalSummary),
      tryGet<unknown>(REPORT_ENDPOINTS.trialBalance),
      tryGet<unknown>(REPORT_ENDPOINTS.incomeStatement),
      tryGet<unknown>(REPORT_ENDPOINTS.balanceSheet),
      tryGet<unknown>(REPORT_ENDPOINTS.profitAndLoss),
    ]);

    const [cashBookRes, journalRes, trialRes, incomeRes, balanceRes, profitRes] = results;

    if (cashBookRes.status === "fulfilled") setCashBookRows(normalizeCashBook(cashBookRes.value));
    else setCashBookRows([]);

    if (journalRes.status === "fulfilled") setJournalSummaryRows(normalizeJournalSummary(journalRes.value));
    else setJournalSummaryRows([]);

    if (trialRes.status === "fulfilled") setTrialBalanceRows(normalizeTrialBalance(trialRes.value));
    else setTrialBalanceRows([]);

    if (incomeRes.status === "fulfilled") setIncomeStatementRows(normalizeIncomeStatement(incomeRes.value));
    else setIncomeStatementRows([]);

    if (balanceRes.status === "fulfilled") setBalanceSheetRows(normalizeBalanceSheet(balanceRes.value));
    else setBalanceSheetRows([]);

    if (profitRes.status === "fulfilled") setProfitLossRows(normalizeProfitLoss(profitRes.value));
    else setProfitLossRows([]);

    const allFailed = results.every((item) => item.status === "rejected");
    if (allFailed) {
      setError(
        bi(
          language,
          "Financial reporting APIs are unreachable. Check the reporting endpoints and base URL.",
          "Financial reporting API များကို မချိတ်ဆက်နိုင်ပါ။ Reporting endpoint များနှင့် base URL ကို စစ်ဆေးပါ။",
        ),
      );
    }

    setLoading(false);
  }

  const allCommonRows = useMemo(
    () => [
      ...cashBookRows,
      ...journalSummaryRows,
      ...trialBalanceRows,
      ...incomeStatementRows,
      ...balanceSheetRows,
      ...profitLossRows,
    ],
    [cashBookRows, journalSummaryRows, trialBalanceRows, incomeStatementRows, balanceSheetRows, profitLossRows],
  );

  const branches = useMemo(() => uniqueOptions(allCommonRows.map((row) => row.branch)), [allCommonRows]);
  const zones = useMemo(() => uniqueOptions(allCommonRows.map((row) => row.zone)), [allCommonRows]);

  const filteredCashBookRows = useMemo(
    () =>
      matchesCommonFilters(
        cashBookRows,
        branch,
        zone,
        startDate,
        endDate,
        search,
        (row) => `${row.accountDescription} ${row.branch} ${row.zone}`,
      ),
    [cashBookRows, branch, zone, startDate, endDate, search],
  );

  const filteredJournalSummaryRows = useMemo(
    () =>
      matchesCommonFilters(
        journalSummaryRows,
        branch,
        zone,
        startDate,
        endDate,
        search,
        (row) => `${row.accountDescription} ${row.branch} ${row.zone}`,
      ),
    [journalSummaryRows, branch, zone, startDate, endDate, search],
  );

  const filteredTrialBalanceRows = useMemo(
    () =>
      matchesCommonFilters(
        trialBalanceRows,
        branch,
        zone,
        startDate,
        endDate,
        search,
        (row) => `${row.codeNo} ${row.accountHead} ${row.accountDescription} ${row.branch} ${row.zone}`,
      ),
    [trialBalanceRows, branch, zone, startDate, endDate, search],
  );

  const filteredIncomeStatementRows = useMemo(
    () =>
      matchesCommonFilters(
        incomeStatementRows,
        branch,
        zone,
        startDate,
        endDate,
        search,
        (row) => `${row.codeNo} ${row.description} ${row.branch} ${row.zone}`,
      ),
    [incomeStatementRows, branch, zone, startDate, endDate, search],
  );

  const filteredBalanceSheetRows = useMemo(
    () =>
      matchesCommonFilters(
        balanceSheetRows,
        branch,
        zone,
        startDate,
        endDate,
        search,
        (row) => `${row.codeNo} ${row.description} ${row.branch} ${row.zone}`,
      ),
    [balanceSheetRows, branch, zone, startDate, endDate, search],
  );

  const filteredProfitLossRows = useMemo(
    () =>
      matchesCommonFilters(
        profitLossRows,
        branch,
        zone,
        startDate,
        endDate,
        search,
        (row) => `${row.codeNo} ${row.description} ${row.branch} ${row.zone}`,
      ),
    [profitLossRows, branch, zone, startDate, endDate, search],
  );

  const headlineTotals = useMemo(() => {
    const totalIncome = filteredIncomeStatementRows
      .filter((row) => row.category === "income")
      .reduce((sum, row) => sum + row.amount, 0);
    const totalExpenses = filteredIncomeStatementRows
      .filter((row) => row.category === "expense")
      .reduce((sum, row) => sum + row.amount, 0);
    const totalProfit = totalIncome - totalExpenses;
    const cashBookReceived = filteredCashBookRows.reduce((sum, row) => sum + row.received, 0);
    const cashBookPayment = filteredCashBookRows.reduce((sum, row) => sum + row.payment, 0);

    return {
      totalIncome,
      totalExpenses,
      totalProfit,
      cashBookReceived,
      cashBookPayment,
    };
  }, [filteredCashBookRows, filteredIncomeStatementRows]);

  const activePanelSubtitle = (() => {
    switch (activeTab) {
      case "cashBookSummary":
        return bi(language, "The transactions total amounts grouped by account.", "စာရင်းအမည်အလိုက် စုစုပေါင်းငွေဝင်ငွေထွက်ကိုပြသသည်။");
      case "journalSummary":
        return bi(language, "The transactions total amounts grouped by account.", "စာရင်းအမည်အလိုက် debit / credit စုစုပေါင်းကိုပြသသည်။");
      case "trialBalance":
        return bi(language, "The balance of all ledgers is compiled into debit and credit account totals that must be equal.", "Ledger အားလုံး၏ balance ကို debit နှင့် credit စုစုပေါင်းအဖြစ် တူညီရမည်ဟု စုစည်းပြသသည်။");
      case "incomeStatement":
        return bi(language, "The income statement for the selected date criteria.", "ရွေးချယ်ထားသော ရက်စွဲအလိုက် ဝင်ငွေဖော်ပြချက်ကို ပြသသည်။");
      case "balanceSheet":
        return bi(language, "The balance sheet for the selected date criteria.", "ရွေးချယ်ထားသော ရက်စွဲအလိုက် လက်ကျန်ရှင်းတမ်းကို ပြသသည်။");
      case "profitAndLoss":
      default:
        return bi(language, "The profit and loss for the selected date criteria.", "ရွေးချယ်ထားသော ရက်စွဲအလိုက် အမြတ်နှင့်အရှုံးကို ပြသသည်။");
    }
  })();

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            {bi(language, "Administration", "စီမံခန့်ခွဲမှု")}
          </p>
          <h1 className="text-4xl font-black text-[#0d2c54]">
            {bi(language, "Financial Reports", "ငွေကြေးအစီရင်ခံစာများ")}
          </h1>
          <p className="max-w-4xl text-slate-500">
            {bi(
              language,
              "Cash book summary, journal summary, trial balance, income statement, balance sheet, and profit & loss reporting in a bilingual production layout.",
              "Cash book summary၊ journal summary၊ trial balance၊ income statement၊ balance sheet နှင့် profit & loss report များကို ဘာသာနှစ်မျိုးဖြင့် ထုတ်လုပ်ရေးအသုံးပြုနိုင်သော layout တစ်ခုအဖြစ် စုစည်းထားသည်။",
            )}
          </p>
        </div>

        <LanguageToggle language={language} onChange={setLanguage} />
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          title={bi(language, "Total Income", "စုစုပေါင်းဝင်ငွေ")}
          value={formatMMK(headlineTotals.totalIncome)}
          subtitle={bi(language, "Income statement total", "ဝင်ငွေဖော်ပြချက်စုစုပေါင်း")}
        />
        <StatCard
          icon={TrendingDown}
          title={bi(language, "Total Expenses", "စုစုပေါင်းကုန်ကျစရိတ်")}
          value={formatMMK(headlineTotals.totalExpenses)}
          subtitle={bi(language, "Expense statement total", "ကုန်ကျစရိတ်ဖော်ပြချက်စုစုပေါင်း")}
        />
        <StatCard
          icon={DollarSign}
          title={bi(language, "Total Profit", "စုစုပေါင်းအမြတ်")}
          value={formatMMK(headlineTotals.totalProfit)}
          subtitle={bi(language, "Income minus expenses", "ဝင်ငွေမှ ကုန်ကျစရိတ်နုတ်ပြီး")}
        />
        <StatCard
          icon={HeartHandshake}
          title={bi(language, "Cash Position", "ငွေသားအခြေအနေ")}
          value={formatMMK(headlineTotals.cashBookReceived - headlineTotals.cashBookPayment)}
          subtitle={bi(language, "Received minus payment", "လက်ခံငွေမှ ပေးငွေကိုနုတ်ပြီး")}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-95"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? bi(language, "Refreshing...", "ပြန်လည်ရယူနေသည်...") : bi(language, "Refresh", "ပြန်လည်ရယူမည်")}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            "cashBookSummary",
            "journalSummary",
            "trialBalance",
            "incomeStatement",
            "balanceSheet",
            "profitAndLoss",
          ] as ReportTab[]
        ).map((tab) => (
          <ReportTabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
            {reportTabLabel(language, tab)}
          </ReportTabButton>
        ))}
      </div>

      <div className="mt-8">
        <Panel title={reportTabLabel(language, activeTab)} subtitle={activePanelSubtitle}>
          <FilterBar
            language={language}
            startDate={startDate}
            endDate={endDate}
            branch={branch}
            zone={zone}
            search={search}
            branches={branches}
            zones={zones}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onBranchChange={setBranch}
            onZoneChange={setZone}
            onSearchChange={setSearch}
            searchPlaceholder={bi(language, "Search with keyword", "စကားလုံးဖြင့်ရှာပါ")}
          />

          <div className="mt-6">
            {activeTab === "cashBookSummary" ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={WalletMini}
                    title={bi(language, "Opening balance", "ဖွင့်လှစ်လက်ကျန်")}
                    value={formatMMK(filteredCashBookRows[0]?.openingBalance || 0)}
                    subtitle={bi(language, "From filtered result", "ရွေးချယ်ထားသောရလဒ်မှ")}
                  />
                  <StatCard
                    icon={WalletMini}
                    title={bi(language, "Closing balance", "ပိတ်သိမ်းလက်ကျန်")}
                    value={formatMMK(filteredCashBookRows[0]?.closingBalance || 0)}
                    subtitle={bi(language, "From filtered result", "ရွေးချယ်ထားသောရလဒ်မှ")}
                  />
                  <StatCard
                    icon={TrendingUp}
                    title={bi(language, "Received", "လက်ခံငွေ")}
                    value={formatMMK(headlineTotals.cashBookReceived)}
                    subtitle={bi(language, "Total received", "စုစုပေါင်းလက်ခံငွေ")}
                  />
                  <StatCard
                    icon={TrendingDown}
                    title={bi(language, "Payment", "ပေးငွေ")}
                    value={formatMMK(headlineTotals.cashBookPayment)}
                    subtitle={bi(language, "Total payment", "စုစုပေါင်းပေးငွေ")}
                  />
                </div>

                <DataTable
                  headers={[
                    bi(language, "No.", "စဉ်"),
                    bi(language, "Account Description", "စာရင်းဖော်ပြချက်"),
                    bi(language, "Received", "လက်ခံငွေ"),
                    bi(language, "Payment", "ပေးငွေ"),
                  ]}
                  rows={filteredCashBookRows.map((row, index) => [
                    String(index + 1),
                    row.accountDescription,
                    formatMMK(row.received),
                    formatMMK(row.payment),
                  ])}
                  emptyText={bi(language, "No cash book summary found.", "Cash book summary မတွေ့ပါ။")}
                />
              </div>
            ) : null}

            {activeTab === "journalSummary" ? (
              <DataTable
                headers={[
                  bi(language, "No.", "စဉ်"),
                  bi(language, "Account Description", "စာရင်းဖော်ပြချက်"),
                  bi(language, "Debit", "Debit"),
                  bi(language, "Credit", "Credit"),
                ]}
                rows={filteredJournalSummaryRows.map((row, index) => [
                  String(index + 1),
                  row.accountDescription,
                  formatMMK(row.debit),
                  formatMMK(row.credit),
                ])}
                emptyText={bi(language, "No journal summary found.", "Journal summary မတွေ့ပါ။")}
              />
            ) : null}

            {activeTab === "trialBalance" ? (
              <DataTable
                headers={[
                  bi(language, "No.", "စဉ်"),
                  bi(language, "Code No.", "Code No."),
                  bi(language, "Account Head", "စာရင်းခေါင်းစဉ်"),
                  bi(language, "Chart of Account / Description", "Chart of account / ဖော်ပြချက်"),
                  bi(language, "Opening Dr", "ဖွင့်လှစ် Dr"),
                  bi(language, "Opening Cr", "ဖွင့်လှစ် Cr"),
                  bi(language, "During Dr", "ကာလအတွင်း Dr"),
                  bi(language, "During Cr", "ကာလအတွင်း Cr"),
                  bi(language, "Closing Dr", "ပိတ်သိမ်း Dr"),
                  bi(language, "Closing Cr", "ပိတ်သိမ်း Cr"),
                ]}
                rows={filteredTrialBalanceRows.map((row, index) => [
                  String(index + 1),
                  row.codeNo,
                  row.accountHead,
                  row.accountDescription,
                  formatMMK(row.openingDebit),
                  formatMMK(row.openingCredit),
                  formatMMK(row.duringDebit),
                  formatMMK(row.duringCredit),
                  formatMMK(row.closingDebit),
                  formatMMK(row.closingCredit),
                ])}
                emptyText={bi(language, "No trial balance found.", "Trial balance မတွေ့ပါ။")}
              />
            ) : null}

            {activeTab === "incomeStatement" ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard
                    icon={DollarSign}
                    title={bi(language, "Total Income", "စုစုပေါင်းဝင်ငွေ")}
                    value={formatMMK(headlineTotals.totalIncome)}
                    subtitle={bi(language, "Income list total", "ဝင်ငွေစာရင်းစုစုပေါင်း")}
                  />
                  <StatCard
                    icon={TrendingDown}
                    title={bi(language, "Total Expenses", "စုစုပေါင်းကုန်ကျစရိတ်")}
                    value={formatMMK(headlineTotals.totalExpenses)}
                    subtitle={bi(language, "Expense list total", "ကုန်ကျစရိတ်စာရင်းစုစုပေါင်း")}
                  />
                  <StatCard
                    icon={TrendingUp}
                    title={bi(language, "Total Profit", "စုစုပေါင်းအမြတ်")}
                    value={formatMMK(headlineTotals.totalProfit)}
                    subtitle={bi(language, "Result for selected range", "ရွေးချယ်ထားသောကာလ၏ရလဒ်")}
                  />
                </div>

                <DataTable
                  headers={[
                    bi(language, "No.", "စဉ်"),
                    bi(language, "Description", "ဖော်ပြချက်"),
                    bi(language, "Amount", "ငွေပမာဏ"),
                  ]}
                  rows={filteredIncomeStatementRows.map((row, index) => [
                    String(index + 1),
                    <div key={`${row.id}-desc`}>
                      <p className="font-semibold text-slate-700">{row.description}</p>
                      <p className="mt-1 text-xs text-slate-400">{bi(language, "Category", "အမျိုးအစား")}: {bi(language, row.category, row.category === "income" ? "ဝင်ငွေ" : row.category === "expense" ? "ကုန်ကျစရိတ်" : "အနှစ်ချုပ်")}</p>
                    </div>,
                    formatMMK(row.amount),
                  ])}
                  emptyText={bi(language, "No income statement rows found.", "Income statement row မတွေ့ပါ။")}
                />
              </div>
            ) : null}

            {activeTab === "balanceSheet" ? (
              <DataTable
                headers={[
                  bi(language, "No.", "စဉ်"),
                  bi(language, "Code No.", "Code No."),
                  bi(language, "Account Description", "စာရင်းဖော်ပြချက်"),
                  bi(language, "Section", "အပိုင်း"),
                  bi(language, "Amount", "ငွေပမာဏ"),
                ]}
                rows={filteredBalanceSheetRows.map((row, index) => [
                  String(index + 1),
                  row.codeNo,
                  row.description,
                  bi(
                    language,
                    row.section,
                    row.section === "asset"
                      ? "ပိုင်ဆိုင်မှု"
                      : row.section === "equity"
                        ? "မူပိုင်ငွေ"
                        : row.section === "liability"
                          ? "ပေးဆပ်ရန်"
                          : "စုစုပေါင်း"
                  ),
                  formatMMK(row.amount),
                ])}
                emptyText={bi(language, "No balance sheet rows found.", "Balance sheet row မတွေ့ပါ။")}
              />
            ) : null}

            {activeTab === "profitAndLoss" ? (
              <DataTable
                headers={[
                  bi(language, "Code No.", "Code No."),
                  bi(language, "Description", "ဖော်ပြချက်"),
                  bi(language, "Amount", "ငွေပမာဏ"),
                  bi(language, "Cumulative year to date", "နှစ်အစမှယနေ့ထိစုစုပေါင်း"),
                ]}
                rows={filteredProfitLossRows.map((row) => [
                  row.codeNo,
                  <div key={`${row.id}-profit-desc`}>
                    <p className="font-semibold text-slate-700">{row.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{bi(language, "Category", "အမျိုးအစား")}: {bi(language, row.category, row.category === "income" ? "ဝင်ငွေ" : row.category === "expense" ? "ကုန်ကျစရိတ်" : "အနှစ်ချုပ်")}</p>
                  </div>,
                  formatMMK(row.amount),
                  formatMMK(row.cumulativeYearToDate),
                ])}
                emptyText={bi(language, "No profit and loss rows found.", "Profit and loss row မတွေ့ပါ။")}
              />
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function WalletMini({ size = 24, className = "" }: { size?: number; className?: string }) {
  return <Building2 size={size} className={className} />;
}
