import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await api.get("/api/auth/me");
      return response.data;
    },
  });
}
