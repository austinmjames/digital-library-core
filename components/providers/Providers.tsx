"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

/**
 * Providers Component
 * Filepath: components/providers/Providers.tsx
 * Role: Centralized client-side orchestrator for context providers.
 * Alignment: PRD Section 3.1 (Performance & Resilience) and Technical Manifest (State Management).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // We use useState to instantiate the QueryClient to ensure it is
  // stable across re-renders in this Client Component.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // PRD Standard: 5-minute stale time to reduce API pressure while maintaining freshness.
            staleTime: 5 * 60 * 1000,
            // Retry logic to handle intermittent network gaps during scholarly study.
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
