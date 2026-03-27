interface ShipmentLookupResponse {
  trackingNumber: string;
  status: string;
  updatedAt: string;
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const trackingNumber = url.searchParams.get("trackingNumber");

  if (!trackingNumber) {
    return new Response(JSON.stringify({ error: "trackingNumber is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const response: ShipmentLookupResponse = {
    trackingNumber,
    status: "in_linehaul",
    updatedAt: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" }
  });
});
