import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useRiderTasks() {
  return useQuery({
    queryKey: ["tasks", "me"],
    queryFn: async () => {
      const response = await api.get("/api/tasks/me");
      return response.data;
    },
  });
}
