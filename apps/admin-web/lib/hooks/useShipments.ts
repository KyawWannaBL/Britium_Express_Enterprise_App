import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useShipments(queryOptions = {}) {
  const supabase = createClient();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      let query = supabase.from('shipments').select('*, branches(name_en), profiles(full_name)');
      
      // Dynamic filters (e.g., filter by status or branch)
      if (queryOptions.status) query = query.eq('status', queryOptions.status);
      if (queryOptions.limit) query = query.limit(queryOptions.limit);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error) setShipments(data || []);
      setLoading(false);
    };

    fetchShipments();

    // REAL-TIME SUBSCRIPTION: Auto-update UI when a shipment changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, fetchShipments)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [JSON.stringify(queryOptions)]);

  return { shipments, loading };
}
