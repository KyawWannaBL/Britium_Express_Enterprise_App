import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, apikey, Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const payload = await req.json()
    const record = payload.record ?? payload
    const oldRecord = payload.old_record ?? {}

    if (!record?.tracking_number || record.status === oldRecord?.status) {
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const messageEn = `Your shipment ${record.tracking_number} is now ${String(record.status).replaceAll('_', ' ')}.`
    const messageMy = `သင့်ပစ္စည်း ${record.tracking_number} သည် ယခု ${record.status} အခြေအနေ ဖြစ်ပါသည်။`

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    await supabase.from('scan_events').insert({
      shipment_id: record.id,
      waybill_id: record.waybill_id ?? null,
      scan_type: 'notification_queued',
      scanner_type: 'system',
      notes: { messageEn, messageMy },
    }).select().maybeSingle()

    return new Response(JSON.stringify({ success: true, messageEn, messageMy }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
