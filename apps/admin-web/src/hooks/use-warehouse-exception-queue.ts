import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useWarehouseExceptionQueue(branchId?: string) {
  return useQuery({
    queryKey: ["warehouses", "exception-queue", branchId],
    queryFn: async () => {
      const response = await api.get("/api/warehouses/exception-queue", {
        params: { branchId },
      });
      return response.data;
    },
    enabled: true,
  });
}
