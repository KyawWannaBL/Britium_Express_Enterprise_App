
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/admin-supabase";
import { batchWaybills, type WaybillFormat, type WaybillRecord, waybillReference } from "../../_lib/waybill";

function formatMmks(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

async function RealQr({ token }: { token: string }) {
  const dataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 156,
    color: { dark: "#000000", light: "#ffffff" }
  });
  return <img className="wb-qr-image" src={dataUrl} alt={`QR ${token}`} />;
}

async function toWaybillRecordByShipmentId(shipmentId: string): Promise<WaybillRecord | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        id,
        tracking_number,
        service_type,
        cod_amount_mmks,
        quoted_fee_mmks,
        declared_value_mmks,
        weight_grams,
        recipient_name,
        recipient_phone_e164,
        sender_address:sender_address_id (
          contact_name,
          phone_e164,
          address_line_1,
          township,
          city,
          state_region
        ),
        recipient_address:recipient_address_id (
          contact_name,
          phone_e164,
          address_line_1,
          township,
          city,
          state_region
        ),
        waybills (
          waybill_number,
          qr_payload,
          last_printed_at
        )
      `)
      .eq("id", shipmentId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const sender = Array.isArray(data.sender_address) ? data.sender_address[0] : data.sender_address;
    const recipient = Array.isArray(data.recipient_address) ? data.recipient_address[0] : data.recipient_address;
    const waybill = Array.isArray(data.waybills) ? data.waybills[0] : data.waybills;

    return {
      shipmentId: data.id,
      trackingNumber: data.tracking_number ?? shipmentId,
      waybillNumber: waybill?.waybill_number ?? data.tracking_number ?? shipmentId,
      merchantName: sender?.contact_name ?? "Britium Customer",
      merchantPhone: sender?.phone_e164 ?? "-",
      merchantAddress: [sender?.address_line_1, sender?.township, sender?.city].filter(Boolean).join(", "),
      recipientName: data.recipient_name ?? recipient?.contact_name ?? "Recipient",
      recipientPhonePrimary: data.recipient_phone_e164 ?? recipient?.phone_e164 ?? "-",
      recipientPhoneSecondary: recipient?.phone_e164 ?? data.recipient_phone_e164 ?? "-",
      recipientAddress: [recipient?.address_line_1, recipient?.township, recipient?.city].filter(Boolean).join(", "),
      serviceLabelEn: String(data.service_type ?? "standard").replaceAll("_", " ").toUpperCase(),
      serviceLabelMy: "အမြန်ပို့ဆောင်မှု",
      deliveryTypeLabelEn: (Number(data.cod_amount_mmks ?? 0) > 0 ? "COD" : "Prepaid"),
      deliveryTypeLabelMy: (Number(data.cod_amount_mmks ?? 0) > 0 ? "အရောက်ငွေချေ" : "ကြိုတင်ပေးချေ"),
      cbm: "1",
      itemPriceMmks: Number(data.declared_value_mmks ?? 0),
      weightKg: (Number(data.weight_grams ?? 0) / 1000 || 0.5).toFixed(2),
      deliveryFeeMmks: Number(data.quoted_fee_mmks ?? 0),
      prepaidToOsMmks: Math.max(0, Number(data.declared_value_mmks ?? 0) - Number(data.cod_amount_mmks ?? 0)),
      codAmountMmks: Number(data.cod_amount_mmks ?? 0),
      remarks: "Handle with care",
      qrToken: waybill?.qr_payload ?? data.tracking_number ?? shipmentId,
      printedAt: waybill?.last_printed_at ?? new Date().toISOString().slice(0, 19).replace("T", " ")
    };
  } catch {
    return null;
  }
}

async function loadWaybills(ids: string[]): Promise<WaybillRecord[]> {
  if (!ids.length) return batchWaybills;
  const items = await Promise.all(ids.map((id) => toWaybillRecordByShipmentId(id)));
  const filtered = items.filter(Boolean) as WaybillRecord[];
  return filtered.length ? filtered : batchWaybills;
}

async function WaybillCard({ data, dense = false }: { data: WaybillRecord; dense?: boolean }) {
  return (
    <article className={`wb-card${dense ? " dense" : ""}`}>
      <header className="wb-header">
        <div className="wb-brandbox">
          <div className="wb-logo">B</div>
          <div>
            <div className="wb-brand">BRITIUM EXPRESS</div>
            <div className="wb-brand-sub">DELIVERY SERVICE</div>
            <div className="wb-hotline">HotLine: 09 - 897 44 77 44</div>
          </div>
        </div>
        <div className="wb-head-right">
          <div className="wb-time">{data.printedAt}</div>
          <div className="wb-qr-wrap">
            <RealQr token={data.qrToken} />
          </div>
          <div className="wb-track">{data.trackingNumber}</div>
        </div>
      </header>

      <section className="wb-block wb-block-sender">
        <div className="wb-row"><span className="wb-label">Merchant :</span> <strong>{data.merchantName}</strong></div>
        <div className="wb-line">{data.merchantPhone}</div>
        <div className="wb-line">{data.merchantAddress}</div>
      </section>

      <section className="wb-block wb-block-recipient">
        <div className="wb-row"><span className="wb-label">Recipient :</span> <strong>{data.recipientName}</strong></div>
        <div className="wb-phone">{data.recipientPhonePrimary}, {data.recipientPhoneSecondary ?? data.recipientPhonePrimary}</div>
        <div className="wb-line">{data.recipientAddress}</div>
        <div className="wb-service-row">
          <div><strong>** {data.serviceLabelMy} **</strong></div>
          <div><strong>** {data.deliveryTypeLabelMy} ({data.deliveryTypeLabelEn}) **</strong></div>
        </div>
      </section>

      <section className="wb-pricing">
        <div className="wb-price-meta">
          <div className="wb-two-col"><span>CBM :</span><strong>{data.cbm}</strong></div>
          <div className="wb-two-col"><span>Item Price :</span><strong>{formatMmks(data.itemPriceMmks)}</strong></div>
          <div className="wb-two-col"><span>Weight (kg):</span><strong>{data.weightKg}</strong></div>
          <div className="wb-two-col"><span>Delivery Fees :</span><strong>{formatMmks(data.deliveryFeeMmks)}</strong></div>
          <div className="wb-two-col"><span>Delivery :</span><strong>{data.serviceLabelEn}</strong></div>
          <div className="wb-two-col"><span>Prepaid to OS :</span><strong>{formatMmks(data.prepaidToOsMmks)}</strong></div>
        </div>
        <div className="wb-cod-box">
          <div className="wb-cod-title">စုစုပေါင်း ကျသင့်ငွေ</div>
          <div className="wb-cod-value">{formatMmks(data.codAmountMmks)}</div>
        </div>
      </section>

      <section className="wb-footer">
        <div className="wb-waybill">{data.waybillNumber}</div>
        <div className="wb-remarks">Remarks: {data.remarks}</div>
      </section>
    </article>
  );
}

export default async function PrintWaybillPage({
  searchParams
}: {
  searchParams?: Promise<{ format?: WaybillFormat; ids?: string; shipmentId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const format = (params.format ?? "4x6_single") as WaybillFormat;
  const ids = [params.shipmentId, params.ids]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const data = await loadWaybills(ids);
  const records = data.length ? data : [waybillReference];

  const wrapperClass =
    format === "4x3_two_up_on_4x6"
      ? "wb-page wb-page-two-up"
      : format.startsWith("a4")
        ? "wb-page wb-page-a4"
        : format.startsWith("a5")
          ? "wb-page wb-page-a5"
          : "wb-page wb-page-4x6";

  const renderBatch = format.endsWith("batch") || ids.length > 1;

  return (
    <main className={wrapperClass}>
      {format === "4x3_two_up_on_4x6" ? (
        <section className="wb-sheet-two-up">
          <WaybillCard data={records[0]} dense />
          <WaybillCard data={records[1] ?? records[0]} dense />
        </section>
      ) : renderBatch ? (
        records.map((item) => <WaybillCard key={item.shipmentId} data={item} dense={format.startsWith("a5")} />)
      ) : (
        <WaybillCard data={records[0]} dense={format.startsWith("a5")} />
      )}
    </main>
  );
}
