import { test, expect } from "@playwright/test";

test("dashboard renders with all sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Command Center" })).toBeVisible();
  await expect(page.getByText("Service Health Monitor")).toBeVisible();
  await expect(page.getByText("Live Activity")).toBeVisible();
  await expect(page.getByText("Maturity Score")).toBeVisible();
  await expect(page.getByText(/Pipeline Ideas/i).first()).toBeVisible();
});

test("sidebar exposes Kaizen OS branding and nav items", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Kaizen OS").first()).toBeVisible();
  // Stage B will swap these for <Link> elements + add a "Statement of Affairs" tab.
  // This smoke test asserts only what's true today.
  await expect(page.getByText("Dashboard").first()).toBeVisible();
  await expect(page.getByText("Services").first()).toBeVisible();
});
