import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useFinanceSummary() {
  const supabase = createClient();
  const [stats, setStats] = useState({ totalRevenue: 0, pendingCOD: 0, unreconciled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      const { data, error } = await supabase.from('shipments').select('total_collectable_amount, status');
      if (!error && data) {
        const summary = data.reduce((acc, curr) => {
          acc.totalRevenue += curr.total_collectable_amount || 0;
          if (curr.status === 'out_for_delivery') acc.pendingCOD += curr.total_collectable_amount || 0;
          return acc;
        }, { totalRevenue: 0, pendingCOD: 0, unreconciled: 0 });
        setStats(summary);
      }
      setLoading(false);
    };
    fetchFinance();
  }, []);

  return { stats, loading };
}
