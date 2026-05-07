"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * Root providers wrapper. Currently only TanStack Query.
 *
 * Stage C will add SupabaseProvider here once the Kaizen project URL +
 * anon key land. Keeping the provider tree centralised so future additions
 * don't ripple through layout.tsx.
 *
 * QueryClient is created via useState so each browser session gets its
 * own instance and we don't share cache across SSR requests.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stage C: tweak per-query as Realtime subscriptions take over.
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
