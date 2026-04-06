import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSupervisorDashboard(branchId?: string) {
  return useQuery({
    queryKey: ["supervisor", "dashboard", branchId],
    queryFn: async () => {
      const response = await api.get("/api/supervisor/dashboard", {
        params: { branchId },
      });
      return response.data;
    },
  });
}
