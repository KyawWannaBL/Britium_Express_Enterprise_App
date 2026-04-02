import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function getFinancialReportData() {
  try {
    // 1. Fetch shipments without complex joins first to prevent "Internal Server Error"
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error.message);
      return { shipments: [], stats: { totalRevenue: 0, totalCOD: 0, count: 0 } };
    }

    // 2. Map data safely
    const stats = {
      totalRevenue: shipments?.reduce((sum, s) => sum + (Number(s.total_charge) || 0), 0) || 0,
      totalCOD: shipments?.reduce((sum, s) => sum + (Number(s.cod_amount) || 0), 0) || 0,
      count: shipments?.length || 0
    };

    return { shipments: shipments || [], stats };
  } catch (err) {
    console.error("Critical Fetch Error:", err);
    return { shipments: [], stats: { totalRevenue: 0, totalCOD: 0, count: 0 } };
  }
}
