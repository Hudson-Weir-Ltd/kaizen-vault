import PageHeader from "./PageHeader";

/**
 * Generic "coming soon" page used by Services / Pipeline / Activity /
 * Roadmap routes during Stage B. Each will be replaced with a real
 * dashboard-style page in a follow-up.
 */
export default function PlaceholderPage({
  title,
  description,
  scheduledFor,
}: {
  title: string;
  description: string;
  scheduledFor: string;
}) {
  return (
    <>
      <PageHeader title={title} subtitle={description} />
      <div
        style={{
          flex: 1,
          padding: "48px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "560px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "var(--cyan)",
              fontWeight: 600,
              letterSpacing: "1px",
              marginBottom: "8px",
              textTransform: "uppercase",
            }}
          >
            Coming soon
          </p>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#F1F5F9" }}>
            {title} is on the roadmap
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "13px", lineHeight: 1.6 }}>
            {description} Scheduled for{" "}
            <strong style={{ color: "#CBD5E1" }}>{scheduledFor}</strong>.
          </p>
        </div>
      </div>
    </>
  );
}
