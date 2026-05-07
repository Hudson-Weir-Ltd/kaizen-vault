"use client";

import { useEffect, useState } from "react";
import { formatDateGB } from "@/lib/utils";

/**
 * Renders today's date in en-GB. Client-side only to avoid Next's static-
 * generation freezing the date at build time (the bug where the dashboard
 * header would forever say "Tuesday, March 31, 2026").
 *
 * SSR renders an empty span (with suppressHydrationWarning), then the
 * effect populates it after hydration. The space is reserved server-side
 * to avoid layout shift.
 */
export default function TodayDate() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(formatDateGB());
  }, []);

  return (
    <span suppressHydrationWarning style={{ minHeight: "1em", display: "inline-block" }}>
      {date}
    </span>
  );
}
