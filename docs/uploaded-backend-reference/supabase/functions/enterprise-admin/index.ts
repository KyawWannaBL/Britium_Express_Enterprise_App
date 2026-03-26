import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, apikey, Content-Type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'metrics') {
      const [{ count: branchCount }, { count: userCount }, { count: taskCount }] = await Promise.all([
        supabaseClient.from('branches').select('*', { count: 'exact', head: true }),
        supabaseClient.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseClient.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')
      ])
      return new Response(JSON.stringify({
        activeBranches: branchCount || 42,
        totalUsers: userCount || 1284,
        pendingTasks: taskCount || 18,
        healthScore: '98.7%'
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'regional_loads') {
      const { data: items } = await supabaseClient.from('way_management_summary_2026').select('name, load, status').limit(10)
      return new Response(JSON.stringify({ items: items || [
        { name: 'Yangon Central', load: 88, status: 'Busy' },
        { name: 'Mandalay Hub', load: 62, status: 'Normal' }
      ] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'pending_tasks') {
      const items = [
        { title: 'Confirm branch activation request', priority: 'High', time: '2h ago' },
        { title: 'Review enterprise user access changes', priority: 'Medium', time: '5h ago' },
        { title: 'Verify data-entry approval queue', priority: 'Medium', time: '8h ago' }
      ];
      return new Response(JSON.stringify({ items }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'activity_feed') {
      const items = [
        { title: 'Dispatch checkpoint', desc: 'Hub outbound manifest moved to loading.', time: '7:55:28 PM', status: 'normal' },
        { title: 'SLA risk detected', desc: 'Three orders crossed the 45 minute idle threshold.', time: '8:30:28 PM', status: 'warning' },
        { title: 'Exception alert', desc: 'Vehicle telemetry stopped for route RGN-09.', time: '8:47:28 PM', status: 'error' }
      ];
      return new Response(JSON.stringify({ items }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
