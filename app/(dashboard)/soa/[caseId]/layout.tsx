"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useCaseSync } from "@/lib/soa/hooks";
import SoaPreview from "@/components/soa/SoaPreview";
import PageHeader from "@/components/PageHeader";
import type { ReactNode } from "react";

const SUB_TABS = [
  { key: "assets", label: "Assets" },
  { key: "liabilities", label: "Liabilities" },
  { key: "charges", label: "Charges" },
] as const;

export default function CaseLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ caseId: string }>();
  const pathname = usePathname();
  const { data, isLoading, error } = useCaseSync(params?.caseId);

  const isPreviewRoute = pathname?.endsWith("/preview");

  return (
    <>
      <PageHeader
        title={data?.case?.companyName ?? "Loading…"}
        subtitle={
          data?.case
            ? `${data.case.caseNumber} · ${data.case.procedure} · Appointed ${data.case.appointmentDate}`
            : "Statement of Affairs"
        }
        right={
          <Link
            href="/soa"
            style={{
              fontSize: "12px",
              color: "var(--cyan)",
              textDecoration: "none",
              padding: "6px 12px",
              border: "1px solid rgba(6,182,212,0.25)",
              borderRadius: "20px",
            }}
          >
            ← All cases
          </Link>
        }
      />

      {/* Sub-tab bar */}
      {!isPreviewRoute && (
        <nav
          style={{
            display: "flex",
            gap: "4px",
            borderBottom: "1px solid var(--card-border)",
            padding: "0 32px",
            background: "rgba(13,27,46,0.4)",
          }}
          aria-label="Case sections"
        >
          {SUB_TABS.map((t) => {
            const href = `/soa/${params?.caseId}/${t.key}`;
            const isActive = pathname?.includes(`/${t.key}`);
            return (
              <Link
                key={t.key}
                href={href}
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: isActive ? "var(--cyan)" : "#94A3B8",
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: "none",
                  borderBottom: isActive ? "2px solid var(--cyan)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {t.label}
              </Link>
            );
          })}
          <Link
            href={`/soa/${params?.caseId}/preview`}
            style={{
              padding: "12px 16px",
              fontSize: "13px",
              color: "#94A3B8",
              textDecoration: "none",
              marginLeft: "auto",
            }}
          >
            Open full preview →
          </Link>
        </nav>
      )}

      {/* Body */}
      <div style={{ flex: 1, padding: "20px 32px" }}>
        {isLoading && <p style={{ color: "#94A3B8", fontSize: "13px" }}>Pulling case data via bridge…</p>}
        {error && (
          <p style={{ color: "var(--red)", fontSize: "13px" }}>
            Bridge error: {error instanceof Error ? error.message : "unknown"}
          </p>
        )}

        {data && !isPreviewRoute && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 380px",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              {children}
            </div>
            <div style={{ position: "sticky", top: "76px" }}>
              <SoaPreview
                assets={data.assets}
                liabilities={data.liabilities}
                charges={data.charges}
                variant="panel"
              />
            </div>
          </div>
        )}

        {data && isPreviewRoute && children}
      </div>
    </>
  );
}
