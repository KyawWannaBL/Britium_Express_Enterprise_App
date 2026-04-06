import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useEmployeeList() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get("/api/employees");
      return response.data;
    },
  });
}
