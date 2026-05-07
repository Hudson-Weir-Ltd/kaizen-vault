"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Stage D will replace this with a Sentry capture.
    console.error("[KaizenVault] runtime error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "#F1F5F9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "560px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#94A3B8", marginBottom: "20px", fontSize: "13px" }}>
          {error.message || "An unexpected error occurred."}
          {error.digest && (
            <span style={{ display: "block", color: "#475569", fontSize: "11px", marginTop: "6px" }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            background: "var(--cyan)",
            color: "#08101F",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
