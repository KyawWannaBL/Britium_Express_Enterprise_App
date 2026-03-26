import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, apikey, Content-Type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const action = new URL(req.url).searchParams.get('action') ?? 'metrics'

    if (action === 'metrics') {
      const [{ count: branchCount }, { count: userCount }, { count: taskCount }] = await Promise.all([
        supabase.from('branches').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      ])
      return json({
        activeBranches: branchCount ?? 0,
        totalUsers: userCount ?? 0,
        pendingTasks: taskCount ?? 0,
        healthScore: '98.7%',
      })
    }

    if (action === 'regional_loads') {
      const { data, error } = await supabase
        .from('way_management_summary_2026')
        .select('name, load, status')
        .order('load', { ascending: false })
        .limit(10)
      if (error) return json({ error: error.message }, 500)
      return json({ items: data ?? [] })
    }

    if (action === 'pending_tasks') {
      const { data, error } = await supabase
        .from('tasks')
        .select('title, priority, status, due_at')
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) return json({ error: error.message }, 500)
      return json({
        items: (data ?? []).map((item) => ({
          title: item.title,
          priority: item.priority,
          time: item.due_at ?? 'unscheduled',
          status: item.status,
        })),
      })
    }

    if (action === 'activity_feed') {
      const { data, error } = await supabase
        .from('shipments')
        .select('tracking_number, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(10)
      if (error) return json({ error: error.message }, 500)
      return json({
        items: (data ?? []).map((item) => ({
          title: `Shipment ${item.tracking_number}`,
          desc: `Current state: ${String(item.status).replaceAll('_', ' ')}`,
          time: item.updated_at,
          status: item.status,
        })),
      })
    }

    return json({ error: 'Invalid action' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 500)
  }
})
