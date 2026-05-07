import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

/**
 * Chrome shared across all "real" pages: sidebar on the left, page content
 * to the right. Each page brings its own header + body.
 *
 * Lives in the (dashboard) route group so it does not apply to error.tsx,
 * loading.tsx, not-found.tsx (which are at the root layout level).
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main
        style={{
          marginLeft: "var(--sidebar-w)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </main>
    </div>
  );
}
