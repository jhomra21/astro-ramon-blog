'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

// Create a client outside of the component to avoid recreation
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 5000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function QueryProvider({ children }: Props) {
  // Use the pre-created client instead of creating it in useState
  const [queryClient] = useState(() => defaultQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 