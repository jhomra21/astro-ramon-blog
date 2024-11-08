import { QueryClient } from "@tanstack/query-core";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 5000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
}); 