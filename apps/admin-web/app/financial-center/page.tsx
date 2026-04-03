"use client";

import { useMemo, useState } from "react";
import { EditableFormCard } from "../../components/EditableFormCard";
import { ReferenceStrip } from "../../components/ReferenceStrip";
import { SectionHeader } from "../../components/SectionHeader";
import { Shell } from "../../components/Shell";
import { StatusTable } from "../../components/StatusTable";

type Language = "en" | "my" | "both";

const financeTabs = [
  {
    en: "Overview",
    my: "အကျဉ်းချုပ်",
  },
  {
    en: "COD on hand / collected",
    my: "လက်ဝယ် COD / ကောက်ခံပြီး",
  },
  {
    en: "COD already transferred",
    my: "လွှဲပြောင်းပြီး COD",
  },
  {
    en: "COD to be collected",
    my: "ကောက်ခံရန် COD",
  },
  {
    en: "Merchant prepaid on hand",
    my: "လက်ဝယ် Merchant prepaid",
  },
  {
    en: "Merchant prepaid transferred",
    my: "လွှဲပြောင်းပြီး Merchant prepaid",
  },
];

const financeModules = [
  {
    enModule: "Deliveryman accounting overview",
    myModule: "Deliveryman accounting အကျဉ်းချုပ်",
    enPurpose: "Track deliveryman cash, transferred COD, pending COD collection, and merchant prepaid balances.",
    myPurpose: "Deliveryman ၏ ငွေသား၊ လွှဲပြောင်းပြီး COD၊ ကောက်ခံရန် COD နှင့် merchant prepaid လက်ကျန်များကို စောင့်ကြည့်ရန်။",
    enScreen: "Financial center / deliveryman accounting",
    myScreen: "Financial center / deliveryman accounting",
    enStatus: "Ready",
    myStatus: "အသင့်ရှိ",
  },
  {
    enModule: "Account balance",
    myModule: "စာရင်းလက်ကျန်",
    enPurpose: "Search account balances by date range, branch, and zone.",
    myPurpose: "ရက်စွဲအကွာအဝေး၊ branch နှင့် zone အလိုက် account balance များရှာဖွေရန်။",
    enScreen: "Accounting > Accounts > Account balance",
    myScreen: "Accounting > Accounts > Account balance",
    enStatus: "Ready",
    myStatus: "အသင့်ရှိ",
  },
  {
    enModule: "Account name / title list",
    myModule: "စာရင်းခေါင်းစဉ်စာရင်း",
    enPurpose: "Maintain chart-of-account codes, types, remarks, and updated dates.",
    myPurpose: "Chart-of-account code များ၊ type များ၊ remark များနှင့် update date များကို စီမံရန်။",
    enScreen: "Accounting > Accounts > Account name/title",
    myScreen: "Accounting > Accounts > Account name/title",
    enStatus: "Ready",
    myStatus: "အသင့်ရှိ",
  },
  {
    enModule: "Simple transaction",
    myModule: "ရိုးရိုး transaction",
    enPurpose: "Record non-accounting journal actions with branch, zone, merchant, amount, and evidence photos.",
    myPurpose: "Branch, zone, merchant, amount နှင့် reference photo များဖြင့် non-accounting journal action များမှတ်တမ်းတင်ရန်။",
    enScreen: "Accounting > Transactions > Simple transaction",
    myScreen: "Accounting > Transactions > Simple transaction",
    enStatus: "Priority",
    myStatus: "ဦးစားပေး",
  },
  {
    enModule: "Journal voucher entry",
    myModule: "Journal voucher ဖြည့်သွင်းခြင်း",
    enPurpose: "Capture debit and credit account lines with customer, merchant, date, and attachments.",
    myPurpose: "Customer, merchant, date နှင့် attachment များနှင့်အတူ debit / credit account line များဖြည့်သွင်းရန်။",
    enScreen: "Accounting > Transactions > Journal voucher entry",
    myScreen: "Accounting > Transactions > Journal voucher entry",
    enStatus: "Priority",
    myStatus: "ဦးစားပေး",
  },
  {
    enModule: "Cash voucher entry",
    myModule: "Cash voucher ဖြည့်သွင်းခြင်း",
    enPurpose: "Record received-in and received-from accounts together with payment evidence.",
    myPurpose: "Received in / received from account များကို payment evidence များနှင့်အတူ မှတ်တမ်းတင်ရန်။",
    enScreen: "Accounting > Transactions > Cash voucher entry",
    myScreen: "Accounting > Transactions > Cash voucher entry",
    enStatus: "Priority",
    myStatus: "ဦးစားပေး",
  },
  {
    enModule: "Journal voucher list",
    myModule: "Journal voucher စာရင်း",
    enPurpose: "Browse voucher references, account titles, debit/credit totals, and supporting images.",
    myPurpose: "Voucher reference များ၊ account title များ၊ debit/credit စုစုပေါင်းနှင့် supporting image များကို ကြည့်ရှုရန်။",
    enScreen: "Accounting > Transactions > Journal voucher list",
    myScreen: "Accounting > Transactions > Journal voucher list",
    enStatus: "Ready",
    myStatus: "အသင့်ရှိ",
  },
  {
    enModule: "Cash voucher list",
    myModule: "Cash voucher စာရင်း",
    enPurpose: "Review opening balance, closing balance, received cash, and bank payments.",
    myPurpose: "Opening balance၊ closing balance၊ received cash နှင့် bank payment များကို ပြန်လည်စစ်ဆေးရန်။",
    enScreen: "Accounting > Transactions > Cash voucher list",
    myScreen: "Accounting > Transactions > Cash voucher list",
    enStatus: "Ready",
    myStatus: "အသင့်ရှိ",
  },
  {
    enModule: "General ledger",
    myModule: "General ledger",
    enPurpose: "Filter ledger entries by date, account, branch, and zone.",
    myPurpose: "Ledger entry များကို date, account, branch, zone အလိုက် filter လုပ်ရန်။",
    enScreen: "Accounting > Transactions > General ledger list",
    myScreen: "Accounting > Transactions > General ledger list",
    enStatus: "Ready",
    myStatus: "အသင့်ရှိ",
  },
  {
    enModule: "Cash book summary",
    myModule: "ငွေစာရင်းအနှစ်ချုပ်",
    enPurpose: "Summarize opening balance, closing balance, received amounts, and payments by account.",
    myPurpose: "Opening balance၊ closing balance၊ received amount နှင့် payment များကို account အလိုက် အနှစ်ချုပ်ရန်။",
    enScreen: "Accounting > Financial reports > Cash book summary",
    myScreen: "Accounting > Financial reports > Cash book summary",
    enStatus: "Ready",
    myStatus: "အသင့်ရှိ",
  },
  {
    enModule: "Financial statement suite",
    myModule: "ဘဏ္ဍာရေးအစီရင်ခံစာအစု",
    enPurpose: "Prepare journal summary, trial balance, income statement, balance sheet, and profit/loss reports.",
    myPurpose: "Journal summary၊ trial balance၊ income statement၊ balance sheet နှင့် profit/loss report များပြုလုပ်ရန်။",
    enScreen: "Accounting > Financial reports",
    myScreen: "Accounting > Financial reports",
    enStatus: "Planned",
    myStatus: "စီစဉ်ထားသည်",
  },
];

const exportFormats = [
  ["CSV", "ဒေတာအချက်အလက် export"],
  ["XLSX", "စာရင်းကိုင်အဖွဲ့သုံး spreadsheet export"],
  ["PDF", "စစ်ဆေးရေးနှင့်လက်မှတ်တင်သိမ်းဆည်းရန် export"],
];

const backendViews = [
  "finance_deliveryman_accounting_v",
  "finance_account_balances_v",
  "finance_chart_of_accounts_v",
  "finance_simple_transactions_v",
  "finance_journal_vouchers_v",
  "finance_cash_vouchers_v",
  "finance_general_ledger_v",
  "finance_cash_book_summary_v",
  "finance_financial_statements_v",
];

function bi(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
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
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <span className="muted" style={{ fontWeight: 700 }}>
        {bi(language, "Language", "ဘာသာစကား")}
      </span>
      {items.map((item) => {
        const active = item.key === language;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            style={{
              border: "1px solid var(--border, #d7dce5)",
              background: active ? "#0d2c54" : "white",
              color: active ? "white" : "#334155",
              borderRadius: 999,
              padding: "8px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default function FinancialCenterPage() {
  const [language, setLanguage] = useState<Language>("both");

  const reportRows = useMemo(
    () =>
      financeModules.map((item) => [
        bi(language, item.enModule, item.myModule),
        bi(language, item.enPurpose, item.myPurpose),
        bi(language, item.enScreen, item.myScreen),
        bi(language, item.enStatus, item.myStatus),
      ]),
    [language],
  );

  const exportRows = useMemo(
    () => exportFormats.map(([en, my]) => [en, bi(language, "Format use", "Format အသုံးပြုပုံ"), bi(language, my === en ? en : my, my)]),
    [language],
  );

  return (
    <Shell
      title={bi(language, "Financial center and accounting workspace", "ငွေကြေးစီမံခန့်ခွဲမှုနှင့် စာရင်းကိုင်လုပ်ငန်းခွင်")}
      subtitle={bi(
        language,
        "This page consolidates the BE finance and accounting screens into a cleaner bilingual operator hub for deliveryman accounting, account balances, vouchers, ledgers, cashbook summaries, and exports.",
        "ဤစာမျက်နှာသည် BE finance နှင့် accounting screen များကို deliveryman accounting၊ account balance၊ voucher၊ ledger၊ cash book summary နှင့် export များအတွက် ပိုမိုရှင်းလင်းသော ဘာသာနှစ်မျိုး operator hub အဖြစ် စုစည်းထားသည်။",
      )}
    >
      <LanguageToggle language={language} onChange={setLanguage} />

      <div className="listGrid" style={{ marginBottom: 24 }}>
        <SectionHeader
          eyebrow={bi(language, "Finance suite", "ငွေကြေးလုပ်ငန်းအစု")}
          title={bi(language, "Bilingual accounting control center", "ဘာသာနှစ်မျိုး စာရင်းကိုင်ထိန်းချုပ်မှုစင်တာ")}
          subtitle={bi(
            language,
            "Built from the uploaded financial center, accounts, transactions, and financial report screens.",
            "Upload ပြုလုပ်ထားသော financial center, accounts, transactions နှင့် financial report screen များကို အခြေခံ၍ တည်ဆောက်ထားသည်။",
          )}
        />

        <div
          className="card"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          {financeTabs.map((tab) => (
            <span
              key={tab.en}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid var(--border, #d7dce5)",
                background: "#f8fafc",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {bi(language, tab.en, tab.my)}
            </span>
          ))}
        </div>
      </div>

      <div className="twoCol">
        <div className="listGrid">
          <EditableFormCard
            title={bi(language, "Unified finance run filter", "တစ်စုတစ်စည်းတည်း ငွေကြေး filter")}
            description={bi(
              language,
              "Single control surface for deliveryman accounting, account balance checks, voucher lists, ledger lookups, cashbook summaries, and exports.",
              "Deliveryman accounting၊ account balance စစ်ဆေးမှု၊ voucher list၊ ledger ရှာဖွေမှု၊ cash book summary နှင့် export များအတွက် တစ်နေရာတည်းမှ ထိန်းချုပ်နိုင်သော filter ဖြစ်သည်။",
            )}
            fields={[
              {
                label: bi(language, "Workspace", "လုပ်ငန်းအမျိုးအစား"),
                placeholder: bi(language, "Deliveryman / accounts / transactions / reports", "Deliveryman / accounts / transactions / reports"),
              },
              {
                label: bi(language, "Date range", "ရက်စွဲအကွာအဝေး"),
                placeholder: "YYYY-MM-DD → YYYY-MM-DD",
              },
              {
                label: bi(language, "Branch and zone", "Branch နှင့် zone"),
                placeholder: bi(language, "All branches / all zones or specific selection", "Branch အားလုံး / zone အားလုံး သို့မဟုတ် သီးသန့်ရွေးချယ်ရန်"),
              },
              {
                label: bi(language, "Merchant or customer", "Merchant သို့မဟုတ် customer"),
                placeholder: bi(language, "Optional party filter", "လိုအပ်ပါက ပါတီ filter"),
              },
              {
                label: bi(language, "Account or voucher reference", "Account သို့မဟုတ် voucher reference"),
                placeholder: bi(language, "Account name, code, voucher no., or additional reference", "Account name၊ code၊ voucher no. သို့မဟုတ် additional reference"),
              },
              {
                label: bi(language, "Export format", "Export format"),
                placeholder: "CSV / XLSX / PDF",
              },
            ]}
          />

          <StatusTable
            headers={[
              bi(language, "Module", "Module"),
              bi(language, "Purpose", "ရည်ရွယ်ချက်"),
              bi(language, "Source screen", "မူလ screen"),
              bi(language, "Status", "အခြေအနေ"),
            ]}
            rows={reportRows}
          />
        </div>

        <div className="listGrid">
          <ReferenceStrip pages={[16, 21, 22, 23, 24, 25, 26, 29, 30]} />

          <div className="card">
            <h3>{bi(language, "Operational sections from the uploaded BE screens", "Upload ပြုလုပ်ထားသော BE screen များမှ လုပ်ငန်းကဏ္ဍများ")}</h3>
            <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
              <li>{bi(language, "Deliveryman accounting with COD and merchant prepaid tracking tabs", "COD နှင့် merchant prepaid tracking tab များပါဝင်သော deliveryman accounting")}</li>
              <li>{bi(language, "Accounts workspace for balance lookup and chart-of-account maintenance", "Balance ရှာဖွေခြင်းနှင့် chart-of-account စီမံခန့်ခွဲမှုအတွက် accounts workspace")}</li>
              <li>{bi(language, "Transaction entry screens for simple transaction, journal voucher, and cash voucher", "Simple transaction၊ journal voucher နှင့် cash voucher များထည့်သွင်းရန် transaction screen များ")}</li>
              <li>{bi(language, "Voucher list and general ledger search screens", "Voucher list နှင့် general ledger search screen များ")}</li>
              <li>{bi(language, "Financial reports including cash book summary and statement outputs", "Cash book summary နှင့် statement output များပါဝင်သော financial report များ")}</li>
            </ul>
          </div>

          <div className="card">
            <h3>{bi(language, "Suggested data views / API contracts", "အကြံပြု data view / API contract များ")}</h3>
            <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
              {backendViews.map((view) => (
                <li key={view}>{view}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="twoCol" style={{ marginTop: 24 }}>
        <div className="listGrid">
          <div className="card">
            <h3>{bi(language, "Voucher-entry capability matrix", "Voucher ဖြည့်သွင်းမှု capability matrix")}</h3>
            <StatusTable
              headers={[
                bi(language, "Feature", "Feature"),
                bi(language, "Simple transaction", "Simple transaction"),
                bi(language, "Journal voucher", "Journal voucher"),
                bi(language, "Cash voucher", "Cash voucher"),
              ]}
              rows={[
                [
                  bi(language, "Branch and zone filters", "Branch နှင့် zone filter"),
                  bi(language, "Yes", "ရှိသည်"),
                  bi(language, "Yes", "ရှိသည်"),
                  bi(language, "Yes", "ရှိသည်"),
                ],
                [
                  bi(language, "Merchant / customer selector", "Merchant / customer ရွေးချယ်ခြင်း"),
                  bi(language, "Merchant", "Merchant"),
                  bi(language, "Merchant + Customer", "Merchant + Customer"),
                  bi(language, "Merchant + Customer", "Merchant + Customer"),
                ],
                [
                  bi(language, "Account line builder", "Account line builder"),
                  bi(language, "Single account", "Single account"),
                  bi(language, "Debit and credit lines", "Debit နှင့် credit line များ"),
                  bi(language, "Received in / from lines", "Received in / from line များ"),
                ],
                [
                  bi(language, "Reference photos", "Reference photo များ"),
                  bi(language, "Up to 3", "၃ ပုံထိ"),
                  bi(language, "Up to 3", "၃ ပုံထိ"),
                  bi(language, "Up to 3", "၃ ပုံထိ"),
                ],
              ]}
            />
          </div>

          <div className="card">
            <h3>{bi(language, "Recommended export formats", "အကြံပြု export format များ")}</h3>
            <StatusTable
              headers={[
                bi(language, "Format", "Format"),
                bi(language, "Use", "အသုံးပြုမှု"),
                bi(language, "Description", "ဖော်ပြချက်"),
              ]}
              rows={exportRows}
            />
          </div>
        </div>

        <div className="listGrid">
          <div className="card">
            <h3>{bi(language, "Production notes", "Production မှတ်ချက်များ")}</h3>
            <ul className="muted" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
              <li>{bi(language, "Keep deliveryman accounting as a tabbed summary with search and transfer-focused columns.", "Deliveryman accounting ကို search ပါဝင်ပြီး transfer ကိုအဓိကထားသည့် column များနှင့် tabbed summary အဖြစ်ထားရှိပါ။")}</li>
              <li>{bi(language, "Use date, branch, and zone filters consistently across account balance, general ledger, and cash book screens.", "Account balance၊ general ledger နှင့် cash book screen များတွင် date, branch, zone filter များကို တူညီစွာအသုံးပြုပါ။")}</li>
              <li>{bi(language, "Support image evidence upload on all voucher-entry flows, matching the three-reference-photo pattern in the uploaded screens.", "Upload screen များတွင်မြင်ရသည့် reference photo သုံးပုံ pattern အတိုင်း voucher-entry flow အားလုံးတွင် image evidence upload ကိုပံ့ပိုးပါ။")}</li>
              <li>{bi(language, "Prepare list outputs with pagination, export, and keyword search for journal and cash voucher histories.", "Journal နှင့် cash voucher history များအတွက် pagination၊ export နှင့် keyword search ပါဝင်သော list output များပြုလုပ်ပါ။")}</li>
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
