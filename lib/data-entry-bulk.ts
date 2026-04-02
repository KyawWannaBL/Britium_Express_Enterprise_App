import * as XLSX from "xlsx";

export type CanonicalRow = {
  way_id: string;
  recipient_name: string;
  recipient_phone: string;
  township: string;
  address: string;
  weight_kg: number;
  item_price: number;
  delivery_charges: number;
  weight_charges: number;
  payment_type: string;
  shop_name: string;
  remark: string;
  total_collectable: number;
};

export type ParsedRow = {
  rowNo: number;
  raw: Record<string, unknown>;
  normalized: CanonicalRow;
  errors: string[];
  valid: boolean;
};

const TEMPLATE_HEADERS = [
  "Way ID / ကုန်စည်အိုင်ဒီ",
  "Recipient Name / လက်ခံသူအမည်",
  "Recipient Phone / လက်ခံသူဖုန်း",
  "Township / မြို့နယ်",
  "Address / လိပ်စာ",
  "Weight (kg) / အလေးချိန်",
  "Item Price / ပစ္စည်းတန်ဖိုး",
  "Delivery Charges / ပို့ဆောင်ခ",
  "Weight Charges / အလေးချိန်ပိုကြေး",
  "Payment Type / ငွေပေးချေမှုအမျိုးအစား",
  "Shop Name / ဆိုင်အမည်",
  "Remark / မှတ်ချက်",
];

const ALIASES: Record<string, keyof CanonicalRow> = {
  "way id / ကုန်စည်အိုင်ဒီ": "way_id",
  "way id": "way_id",
  "way_id": "way_id",

  "recipient name / လက်ခံသူအမည်": "recipient_name",
  "recipient name": "recipient_name",
  "recipient_name": "recipient_name",

  "recipient phone / လက်ခံသူဖုန်း": "recipient_phone",
  "recipient phone": "recipient_phone",
  "recipient_phone": "recipient_phone",

  "township / မြို့နယ်": "township",
  "township": "township",

  "address / လိပ်စာ": "address",
  "address": "address",

  "weight (kg) / အလေးချိန်": "weight_kg",
  "weight (kg)": "weight_kg",
  "weight_kg": "weight_kg",

  "item price / ပစ္စည်းတန်ဖိုး": "item_price",
  "item price": "item_price",
  "item_price": "item_price",

  "delivery charges / ပို့ဆောင်ခ": "delivery_charges",
  "delivery charges": "delivery_charges",
  "delivery_charges": "delivery_charges",

  "weight charges / အလေးချိန်ပိုကြေး": "weight_charges",
  "weight charges": "weight_charges",
  "weight_charges": "weight_charges",

  "payment type / ငွေပေးချေမှုအမျိုးအစား": "payment_type",
  "payment type": "payment_type",
  "payment_type": "payment_type",

  "shop name / ဆိုင်အမည်": "shop_name",
  "shop name": "shop_name",
  "shop_name": "shop_name",

  "remark / မှတ်ချက်": "remark",
  "remark": "remark",
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function toNumber(value: unknown): number {
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function isBlankRow(values: unknown[]): boolean {
  return values.every((v) => String(v ?? "").trim() === "");
}

export function downloadSampleTemplate() {
  const workbook = XLSX.utils.book_new();
  const rows = [
    TEMPLATE_HEADERS,
    [
      "WAY-000001",
      "Kyaw Zayar",
      "09 44111 001",
      "Tamwe",
      "No. 12 Example Street, Yangon",
      1.5,
      25000,
      2500,
      0,
      "COD",
      "Britium Express Store",
      "Handle with care",
    ],
    [
      "WAY-000002",
      "Su Mon",
      "09 44111 002",
      "Hlaing",
      "No. 8 Sample Road, Yangon",
      2,
      18000,
      2200,
      300,
      "Prepaid",
      "Britium Express Store",
      "",
    ],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Bulk Upload Template");
  XLSX.writeFile(workbook, "Britium_Bulk_Upload_Template.xlsx");
}

export function downloadRejectRows(rows: ParsedRow[]) {
  const rejectRows = rows
    .filter((row) => !row.valid)
    .map((row) => ({
      row_no: row.rowNo,
      way_id: row.normalized.way_id,
      recipient_name: row.normalized.recipient_name,
      recipient_phone: row.normalized.recipient_phone,
      township: row.normalized.township,
      address: row.normalized.address,
      errors: row.errors.join(" | "),
    }));

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rejectRows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Reject Rows");
  XLSX.writeFile(workbook, "Britium_Bulk_Upload_Rejects.xlsx");
}

export async function parseUpload(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (!matrix.length) return [];

  const headerRow = matrix[0] ?? [];
  const keys = headerRow.map((header) => ALIASES[normalizeHeader(header)] ?? null);

  const seen = new Set<string>();
  const output: ParsedRow[] = [];

  for (let i = 1; i < matrix.length; i++) {
    const rowValues = matrix[i] ?? [];
    if (isBlankRow(rowValues)) continue;

    const raw: Record<string, unknown> = {};
    keys.forEach((key, idx) => {
      if (key) raw[key] = rowValues[idx];
    });

    const normalized: CanonicalRow = {
      way_id: toText(raw.way_id),
      recipient_name: toText(raw.recipient_name),
      recipient_phone: toText(raw.recipient_phone),
      township: toText(raw.township),
      address: toText(raw.address),
      weight_kg: toNumber(raw.weight_kg),
      item_price: toNumber(raw.item_price),
      delivery_charges: toNumber(raw.delivery_charges),
      weight_charges: toNumber(raw.weight_charges),
      payment_type: toText(raw.payment_type),
      shop_name: toText(raw.shop_name),
      remark: toText(raw.remark),
      total_collectable:
        toNumber(raw.item_price) +
        toNumber(raw.delivery_charges) +
        toNumber(raw.weight_charges),
    };

    const errors: string[] = [];

    if (!normalized.way_id) errors.push("Way ID is required");
    if (!normalized.recipient_name) errors.push("Recipient Name is required");
    if (!normalized.recipient_phone) errors.push("Recipient Phone is required");
    if (!normalized.township) errors.push("Township is required");
    if (!normalized.address) errors.push("Address is required");

    if (normalized.weight_kg < 0) errors.push("Weight must be non-negative");
    if (normalized.item_price < 0) errors.push("Item Price must be non-negative");
    if (normalized.delivery_charges < 0) errors.push("Delivery Charges must be non-negative");
    if (normalized.weight_charges < 0) errors.push("Weight Charges must be non-negative");

    if (normalized.way_id) {
      if (seen.has(normalized.way_id)) {
        errors.push("Duplicate Way ID inside file");
      } else {
        seen.add(normalized.way_id);
      }
    }

    output.push({
      rowNo: i + 1,
      raw,
      normalized,
      errors,
      valid: errors.length === 0,
    });
  }

  return output;
}

export function toBulkPayload(rows: ParsedRow[]) {
  return rows
    .filter((row) => row.valid)
    .map((row) => ({
      reference_no: row.normalized.way_id,
      external_order_no: row.normalized.way_id,
      service_type: "regular",
      delivery_type: "pickup_to_address",
      is_cod: row.normalized.payment_type.toLowerCase() === "cod",
      cod_amount:
        row.normalized.payment_type.toLowerCase() === "cod"
          ? row.normalized.total_collectable
          : 0,
      sender: {
        contact_name: row.normalized.shop_name || "Britium Merchant",
        phone_primary: "09 000000000",
        address_line_1: "Origin Branch",
        city: "Yangon",
        country_code: "MM",
      },
      receiver: {
        contact_name: row.normalized.recipient_name,
        phone_primary: row.normalized.recipient_phone,
        address_line_1: row.normalized.address,
        city: row.normalized.township,
        country_code: "MM",
      },
      packages: [
        {
          package_no: row.normalized.way_id,
          quantity: 1,
          weight_kg: row.normalized.weight_kg,
          declared_value: row.normalized.item_price,
          notes: row.normalized.remark,
        },
      ],
      notes: row.normalized.remark,
      metadata: {
        township: row.normalized.township,
        delivery_charges: row.normalized.delivery_charges,
        weight_charges: row.normalized.weight_charges,
        shop_name: row.normalized.shop_name,
        source: "data-entry-bulk-upload",
      },
    }));
}
