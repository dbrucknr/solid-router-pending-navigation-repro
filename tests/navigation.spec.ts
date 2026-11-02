import { expect, test, type Page } from "@playwright/test";

async function beginPendingSwitch(page: Page) {
  await page.goto("/start");
  await expect(page.getByRole("heading", { name: "Start page", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Go to A", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Page A", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Go to B (2 seconds)", exact: true }).click();
  await expect(page.getByTestId("routing")).toHaveText("pending");
  await expect(page.getByRole("heading", { name: "Page A", exact: true })).toBeVisible();
}

// These tests deliberately assert the observed BUGS, so passing means the
// reproduction succeeded. After an upstream fix these assertions should fail.
test("reproduces a later ordinary A link being dropped", async ({ page }) => {
  await beginPendingSwitch(page);
  await page.getByRole("link", { name: "Go to A", exact: true }).click();
  await expect(page.getByTestId("routing")).toHaveText("idle");
  await expect(page).toHaveURL(/\/b$/);
  await expect(page.getByRole("heading", { name: "Page B", exact: true })).toBeVisible();
});

test("reproduces duplicate A history with the fresh-state workaround", async ({ page }) => {
  await beginPendingSwitch(page);
  await page.getByRole("button", { name: "Go to A with fresh state", exact: true }).click();
  await expect(page.getByTestId("routing")).toHaveText("idle");
  await expect(page).toHaveURL(/\/a$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/a$/);
  await expect(page.getByRole("heading", { name: "Page A", exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/start$/);
  await expect(page.getByRole("heading", { name: "Start page", exact: true })).toBeVisible();
});
