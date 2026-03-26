const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, apikey, Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function computeQuote(input: {
  serviceType?: string
  weightKg?: number
  codAmount?: number
  originCity?: string
  destinationCity?: string
}) {
  const baseRate = input.serviceType === 'same_day' ? 4500 : input.serviceType === 'next_day' ? 3500 : 2500
  const distanceMultiplier = input.originCity && input.destinationCity && input.originCity !== input.destinationCity ? 1.6 : 1
  const weightSurcharge = Math.max(0, (input.weightKg ?? 0) - 1) * 500
  const codFee = (input.codAmount ?? 0) > 0 ? 500 : 0
  const total = Math.round(baseRate * distanceMultiplier + weightSurcharge + codFee)
  return { baseRate, distanceMultiplier, weightSurcharge, codFee, total }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const body = req.method === 'POST' ? await req.json() : {}
    const quote = computeQuote(body ?? {})
    return new Response(JSON.stringify({ success: true, quote }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
