import { expect, test } from "@playwright/test";

test.describe("landing page visual regression", () => {
  test("hero section matches the baseline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#top")).toHaveScreenshot("hero.png");
  });

  test("modules section matches the baseline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#modules")).toHaveScreenshot("modules.png");
  });

  test("command workbench matches the baseline for each tab", async ({
    page,
  }) => {
    await page.goto("/");
    const commands = page.locator("#commands");

    await expect(commands).toHaveScreenshot("commands-coverage.png");

    await page.getByRole("tab", { name: "limits" }).click();
    await expect(commands).toHaveScreenshot("commands-limits.png");

    await page.getByRole("tab", { name: "audit" }).click();
    await expect(commands).toHaveScreenshot("commands-audit.png");
  });

  test("full page matches the baseline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveScreenshot("full-page.png", {
      fullPage: true,
    });
  });
});

test.describe("responsive layout enhancements", () => {
  test("large-text hero layout renders correctly at 1200px+ (#184)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");
    const hero = page.locator("#top");
    await expect(hero).toHaveScreenshot("hero-large-text.png");
  });

  test("navigation links do not wrap awkwardly on small screens (#180)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toHaveScreenshot("nav-small-screen.png");
  });

  test("two-column module layout displays correctly on tablet (#182)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    const modules = page.locator("#modules");
    await expect(modules).toHaveScreenshot("modules-tablet.png");
  });

  test("landscape phone command form layout is optimized (#183)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 480 });
    await page.goto("/");
    const commands = page.locator("#commands");
    await expect(commands).toHaveScreenshot("commands-landscape-phone.png");
  });
});

test.describe("large-text hero overflow (#325)", () => {
  for (const width of [1200, 1280, 1400, 1920]) {
    test(`hero remains within its bounds at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const report = await page.locator("#top").evaluate((hero) => {
        const heading = hero.querySelector("h1");
        const terminal = hero.querySelector(".terminal");
        if (!heading || !terminal) throw new Error("Hero elements missing");
        const container = hero.getBoundingClientRect();
        const panel = terminal.getBoundingClientRect();
        return {
          textWidth: heading.scrollWidth,
          availableWidth: heading.clientWidth,
          left: panel.left, right: panel.right,
          boundaryLeft: container.left, boundaryRight: container.right,
          pageWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        };
      });
      expect(report.textWidth).toBeLessThanOrEqual(report.availableWidth + 2);
      expect(report.left).toBeGreaterThanOrEqual(report.boundaryLeft - 1);
      expect(report.right).toBeLessThanOrEqual(report.boundaryRight + 1);
      expect(report.pageWidth).toBeLessThanOrEqual(report.viewportWidth);
    });
  }
});
