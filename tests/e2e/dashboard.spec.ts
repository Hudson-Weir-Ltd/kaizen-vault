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

test("clicking SoA tab navigates to placeholder", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Statement of Affairs/i }).click();
  await expect(page).toHaveURL(/\/soa$/);
  await expect(page.getByRole("heading", { name: "Statement of Affairs", exact: true })).toBeVisible();
  await expect(page.getByText(/Coming soon/i)).toBeVisible();
});

test("404 renders for unknown routes", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /Page not found/i })).toBeVisible();
});
