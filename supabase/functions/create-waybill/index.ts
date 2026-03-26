interface WaybillRequest {
  shipmentId: string;
}

interface WaybillResponse {
  shipmentId: string;
  waybillNumber: string;
  qrPayload: string;
}

const randomSuffix = () => crypto.randomUUID().split("-")[0].toUpperCase();

Deno.serve(async (request) => {
  const payload = (await request.json()) as WaybillRequest;

  if (!payload.shipmentId) {
    return new Response(JSON.stringify({ error: "shipmentId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const response: WaybillResponse = {
    shipmentId: payload.shipmentId,
    waybillNumber: `BED-${randomSuffix()}`,
    qrPayload: `britium:${payload.shipmentId}:${randomSuffix()}`
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" }
  });
});
