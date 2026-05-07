import { test, expect } from "@playwright/test";

test("dashboard renders with all sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Command Center" })).toBeVisible();
  // Use heading-scoped queries — "Service Health Monitor" / "Pipeline Ideas"
  // also appear inside pipeline-card integration tags.
  await expect(page.getByRole("heading", { name: "Service Health Monitor" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Live Activity" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Maturity Score" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pipeline Ideas", exact: true })).toBeVisible();
});

test("sidebar exposes all six nav items as links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Services/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Pipeline Ideas/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Activity/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Roadmap/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Statement of Affairs/i })).toBeVisible();
});

test("clicking SoA tab navigates to case picker", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Statement of Affairs/i }).click();
  await expect(page).toHaveURL(/\/soa$/);
  await expect(page.getByRole("heading", { name: "Statement of Affairs", exact: true })).toBeVisible();
  await expect(page.getByText(/Acme Industries Ltd/i)).toBeVisible();
});

test("opening a case shows assets table + live SoA preview", async ({ page }) => {
  await page.goto("/soa");
  await page.getByText(/Acme Industries Ltd/i).click();
  await expect(page).toHaveURL(/\/soa\/case-acme-2026-001\/assets$/);
  // Asset row visible
  await expect(page.getByText(/Plant & machinery/i)).toBeVisible();
  // SoA preview panel headline visible
  await expect(page.getByText(/Pool for unsecured/i)).toBeVisible();
});

test("liabilities + charges sub-tabs work", async ({ page }) => {
  await page.goto("/soa/case-acme-2026-001/assets");
  await page.getByRole("link", { name: "Liabilities" }).click();
  await expect(page).toHaveURL(/\/liabilities$/);
  await expect(page.getByText(/HMRC \(VAT\)/i)).toBeVisible();
  await page.getByRole("link", { name: "Charges" }).click();
  await expect(page).toHaveURL(/\/charges$/);
  await expect(page.getByText(/Northbank PLC/i).first()).toBeVisible();
});

test("404 renders for unknown routes", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /Page not found/i })).toBeVisible();
});
