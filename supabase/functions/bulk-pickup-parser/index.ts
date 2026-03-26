// deno-lint-ignore-file no-explicit-any
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BUCKET = "bulk-imports";

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json"
    }
  });
}

function requiredColumnIndexes(header: string[]) {
  const normalized = header.map((item) => item.trim().toLowerCase());
  const required = {
    sender_name: normalized.indexOf("sender_name"),
    recipient_name: normalized.indexOf("recipient_name"),
    recipient_phone: normalized.indexOf("recipient_phone"),
    delivery_address: normalized.indexOf("delivery_address"),
    parcel_count: normalized.indexOf("parcel_count")
  };

  return required;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const { jobId } = await request.json().catch(() => ({ jobId: null }));

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Supabase environment is missing." }, 500);
  }

  if (!jobId) {
    return json({ error: "jobId is required" }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: job, error: jobError } = await supabase
    .from("bulk_upload_jobs")
    .select("id, storage_object_path, filename, customer_id")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return json({ error: jobError?.message ?? "Bulk upload job not found." }, 404);
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(job.storage_object_path);

  if (downloadError || !fileBlob) {
    await supabase.from("bulk_upload_jobs").update({
      status: "failed",
      parser_status: "failed",
      error_summary: [{ code: "storage_download_failed", message: downloadError?.message ?? "Unable to download uploaded file." }]
    }).eq("id", jobId);

    return json({ error: downloadError?.message ?? "Unable to download uploaded file." }, 500);
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    blankrows: false,
    raw: false
  });

  const header = (rows[0] ?? []).map((value) => String(value ?? ""));
  const indexes = requiredColumnIndexes(header);

  const missingColumns = Object.entries(indexes)
    .filter(([, index]) => index < 0)
    .map(([column]) => column);

  if (missingColumns.length > 0) {
    await supabase.from("bulk_upload_jobs").update({
      status: "failed",
      parser_status: "failed",
      error_summary: [{ code: "missing_columns", columns: missingColumns }]
    }).eq("id", jobId);

    return json({ error: "Bulk upload template is missing required columns.", missingColumns }, 400);
  }

  const bodyRows = rows.slice(1);
  const parsedRows = bodyRows.map((row, rowIndex) => {
    const senderName = String(row[indexes.sender_name] ?? "").trim();
    const recipientName = String(row[indexes.recipient_name] ?? "").trim();
    const recipientPhone = String(row[indexes.recipient_phone] ?? "").trim();
    const deliveryAddress = String(row[indexes.delivery_address] ?? "").trim();
    const parcelCount = Number(row[indexes.parcel_count] ?? 0);

    const errors: string[] = [];
    if (!senderName) errors.push("sender_name is required");
    if (!recipientName) errors.push("recipient_name is required");
    if (!recipientPhone) errors.push("recipient_phone is required");
    if (!deliveryAddress) errors.push("delivery_address is required");
    if (!parcelCount || Number.isNaN(parcelCount)) errors.push("parcel_count must be numeric");

    return {
      job_id: jobId,
      row_number: rowIndex + 2,
      raw_data: {
        sender_name: senderName,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        delivery_address: deliveryAddress,
        parcel_count: parcelCount
      },
      validation_status: errors.length ? "rejected" : "accepted",
      validation_errors: errors
    };
  });

  const acceptedRows = parsedRows.filter((row) => row.validation_status === "accepted").length;
  const rejectedRows = parsedRows.length - acceptedRows;

  if (parsedRows.length > 0) {
    const { error: rowsError } = await supabase.from("bulk_upload_job_rows").insert(parsedRows);
    if (rowsError) {
      await supabase.from("bulk_upload_jobs").update({
        status: "failed",
        parser_status: "failed",
        error_summary: [{ code: "row_insert_failed", message: rowsError.message }]
      }).eq("id", jobId);

      return json({ error: rowsError.message }, 500);
    }
  }

  await supabase.from("bulk_upload_jobs").update({
    status: rejectedRows > 0 ? "partially_accepted" : "accepted",
    parser_status: "processed",
    total_rows: parsedRows.length,
    accepted_rows: acceptedRows,
    rejected_rows: rejectedRows,
    error_summary: rejectedRows
      ? [{ code: "row_validation_failed", rejectedRows }]
      : []
  }).eq("id", jobId);

  return json({
    ok: true,
    jobId,
    totalRows: parsedRows.length,
    acceptedRows,
    rejectedRows
  });
});
