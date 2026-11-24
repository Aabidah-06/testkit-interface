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

    await page.getByRole("button", { name: "limits" }).click();
    await expect(commands).toHaveScreenshot("commands-limits.png");

    await page.getByRole("button", { name: "audit" }).click();
    await expect(commands).toHaveScreenshot("commands-audit.png");
  });

  test("full page matches the baseline", async ({ page }) => {
    await page.goto("/");
    // The very tall page can differ slightly while fonts and sections settle.
    // Component snapshots above remain pixel-exact; limit full-page tolerance
    // to half a percent, while giving Chromium time to capture stable frames.
    await expect(page).toHaveScreenshot("full-page.png", {
      fullPage: true,
      timeout: 20_000,
      maxDiffPixelRatio: 0.005,
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

  test("large-text hero links keep 44px tap targets at 1200px+ (#258)", async ({ page }) => {
    for (const width of [1200, 1400]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const links = page.locator("#top a[href]");
      expect(await links.count()).toBeGreaterThanOrEqual(3);
      for (let i = 0; i < await links.count(); i += 1) {
        const box = await links.nth(i).boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      }
    }
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
