import Link from "next/link";

export default function NotFound() {
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
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: "var(--cyan)",
            fontWeight: 600,
            letterSpacing: "1px",
            marginBottom: "8px",
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
          Page not found
        </h1>
        <p style={{ color: "#94A3B8", marginBottom: "20px", fontSize: "13px" }}>
          We couldn&apos;t find what you were looking for.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "var(--cyan)",
            color: "#08101F",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
