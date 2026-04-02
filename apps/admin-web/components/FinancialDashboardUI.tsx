"use client";

type ShipmentRecord = {
  id?: string;
  tracking_no?: string;
  customer_name?: string | null;
  recipient_name?: string | null;
  merchant_id?: string | null;
  cod_amount?: number | null;
  total_charge?: number | null;
  delivery_fee?: number | null;
  current_status?: string | null;
  payment_term?: string | null;
  created_at?: string | null;
};

type FinancialDashboardUIProps = {
  data: unknown;
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: unknown): string {
  const d = toDate(value);
  if (!d) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function normalizeShipments(data: unknown): ShipmentRecord[] {
  if (Array.isArray(data)) return data as ShipmentRecord[];

  if (data && typeof data === "object") {
    const maybeObject = data as Record<string, unknown>;

    if (Array.isArray(maybeObject.shipments)) {
      return maybeObject.shipments as ShipmentRecord[];
    }

    if (Array.isArray(maybeObject.items)) {
      return maybeObject.items as ShipmentRecord[];
    }

    if (
      maybeObject.data &&
      typeof maybeObject.data === "object" &&
      Array.isArray((maybeObject.data as Record<string, unknown>).shipments)
    ) {
      return (maybeObject.data as Record<string, unknown>)
        .shipments as ShipmentRecord[];
    }
  }

  return [];
}

function getStatusLabel(status?: string | null): string {
  if (!status) return "UNKNOWN";
  return status.replace(/_/g, " ").toUpperCase();
}

function getStatusBadgeClass(status?: string | null): string {
  const s = (status || "").toLowerCase();

  if (["delivered", "settled", "paid", "completed"].includes(s)) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (["pending_pickup", "pending", "processing", "in_transit", "out_for_delivery"].includes(s)) {
    return "bg-amber-100 text-amber-700";
  }

  if (["cancelled", "failed", "returned", "rejected"].includes(s)) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function FinancialDashboardUI({
  data,
}: FinancialDashboardUIProps) {
  const shipments = normalizeShipments(data);

  const totalShipments = shipments.length;
  const totalRevenue = shipments.reduce(
    (sum, s) => sum + toNumber(s.total_charge),
    0
  );
  const totalCOD = shipments.reduce(
    (sum, s) => sum + toNumber(s.cod_amount),
    0
  );
  const totalDeliveryFees = shipments.reduce(
    (sum, s) => sum + toNumber(s.delivery_fee),
    0
  );

  const codShipments = shipments.filter((s) => {
    const paymentTerm = (s.payment_term || "").toLowerCase();
    return paymentTerm === "cod" || toNumber(s.cod_amount) > 0;
  }).length;

  const recentShipments = [...shipments]
    .sort((a, b) => {
      const aTime = toDate(a.created_at)?.getTime() ?? 0;
      const bTime = toDate(b.created_at)?.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Finance Portal
        </h1>
        <p className="text-sm text-slate-500">
          Revenue, COD, charges, and recent shipment financial activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Shipments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatMoney(totalShipments)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatMoney(totalRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">COD Amount</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatMoney(totalCOD)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Delivery Fees</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatMoney(totalDeliveryFees)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Financial Summary
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                COD Shipments
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatMoney(codShipments)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Avg Revenue / Shipment
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatMoney(
                  totalShipments > 0 ? totalRevenue / totalShipments : 0
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Avg COD / Shipment
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatMoney(totalShipments > 0 ? totalCOD / totalShipments : 0)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Avg Delivery Fee
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatMoney(
                  totalShipments > 0 ? totalDeliveryFees / totalShipments : 0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Current Dataset
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Loaded records</dt>
              <dd className="font-medium text-slate-900">{totalShipments}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">COD records</dt>
              <dd className="font-medium text-slate-900">{codShipments}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Revenue total</dt>
              <dd className="font-medium text-slate-900">
                {formatMoney(totalRevenue)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Charges total</dt>
              <dd className="font-medium text-slate-900">
                {formatMoney(totalDeliveryFees)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Financial Shipments
          </h2>
          <span className="text-sm text-slate-500">
            Showing {recentShipments.length} of {totalShipments}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3 font-medium">
                  Tracking No
                </th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">
                  Customer
                </th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">
                  Status
                </th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">
                  COD
                </th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">
                  Revenue
                </th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">
                  Delivery Fee
                </th>
                <th className="border-b border-slate-200 px-4 py-3 font-medium">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {recentShipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No financial shipment data found.
                  </td>
                </tr>
              ) : (
                recentShipments.map((shipment, index) => (
                  <tr key={shipment.id ?? `${shipment.tracking_no}-${index}`}>
                    <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-900">
                      {shipment.tracking_no || "-"}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {shipment.customer_name ||
                        shipment.recipient_name ||
                        "-"}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
                          shipment.current_status
                        )}`}
                      >
                        {getStatusLabel(shipment.current_status)}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatMoney(toNumber(shipment.cod_amount))}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatMoney(toNumber(shipment.total_charge))}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatMoney(toNumber(shipment.delivery_fee))}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                      {formatDate(shipment.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
