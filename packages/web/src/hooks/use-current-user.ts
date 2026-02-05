import { useQuery } from "@tanstack/react-query";
import { createApiClient, type ApiClient } from "@/lib/api";

type CurrentUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string;
};

export function useCurrentUser(apiClient?: Pick<ApiClient, "getCurrentUser">) {
  const api = apiClient ?? createApiClient();
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await api.getCurrentUser();
      return response.user as CurrentUser | undefined;
    }
  });
}
