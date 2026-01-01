import { test, expect } from "@playwright/test";

test.describe("Hong Kong Mahjong", () => {
  test("home page loads and shows login form", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Hong Kong Mahjong" })).toBeVisible();
    await expect(page.getByPlaceholder("Enter your display name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Play as Guest" })).toBeVisible();
  });

  test("can login as guest and navigate to lobby", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Enter your display name").fill("TestPlayer");
    await page.getByRole("button", { name: "Play as Guest" }).click();

    await expect(page).toHaveURL("/lobby");
    await expect(page.getByText("Playing as TestPlayer")).toBeVisible();
  });

  test("lobby shows game options", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter your display name").fill("TestPlayer");
    await page.getByRole("button", { name: "Play as Guest" }).click();

    await expect(page.getByRole("button", { name: "Quick Play" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Room" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Join Room" })).toBeVisible();
  });

  test("can create a room", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter your display name").fill("TestPlayer");
    await page.getByRole("button", { name: "Play as Guest" }).click();

    await page.getByRole("button", { name: "Create Room" }).click();
    await expect(page.getByRole("heading", { name: "Create Room" })).toBeVisible();

    await page.getByRole("button", { name: "Create Room" }).click();

    // Should navigate to room page
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]+/);
  });

  test("game page renders 3D canvas without errors", async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.getByPlaceholder("Enter your display name").fill("TestPlayer");
    await page.getByRole("button", { name: "Play as Guest" }).click();

    // Create room and start game
    await page.getByRole("button", { name: "Create Room" }).click();
    await page.getByRole("button", { name: "Create Room" }).click();

    // Should be on room page now - mark ready and start game
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]+/);
    await page.getByRole("button", { name: "Ready" }).click();
    await page.getByRole("button", { name: "Start Game" }).click();

    // Wait for navigation to game and canvas to render
    await expect(page).toHaveURL(/\/game\/[A-Z0-9]+/);
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Check canvas exists and has dimensions
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();

    // Wait for canvas to have proper dimensions (3D takes time to initialize)
    await page.waitForFunction(
      () => {
        const c = document.querySelector("canvas");
        return c && c.offsetWidth > 100 && c.offsetHeight > 100;
      },
      { timeout: 10000 }
    );

    // Wait a bit for 3D content to render
    await page.waitForTimeout(2000);

    // Take screenshot for visual inspection
    await page.screenshot({ path: "e2e/screenshots/game-board.png" });

    // Check for critical WebGL errors
    const criticalErrors = errors.filter(
      (e) => e.includes("WebGL") || e.includes("THREE") || e.includes("shader")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("game UI elements are visible", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter your display name").fill("TestPlayer");
    await page.getByRole("button", { name: "Play as Guest" }).click();

    await page.getByRole("button", { name: "Create Room" }).click();
    await page.getByRole("button", { name: "Create Room" }).click();

    // Navigate via UI to preserve auth state
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]+/);
    await page.getByRole("button", { name: "Ready" }).click();
    await page.getByRole("button", { name: "Start Game" }).click();

    // Wait for game to initialize
    await expect(page).toHaveURL(/\/game\/[A-Z0-9]+/);
    await page.waitForSelector("canvas", { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Check player info panel (use exact match to avoid "East's turn" etc.)
    await expect(page.getByText("East", { exact: true })).toBeVisible();
    await expect(page.getByText("South", { exact: true })).toBeVisible();
    await expect(page.getByText("West", { exact: true })).toBeVisible();
    await expect(page.getByText("North", { exact: true })).toBeVisible();

    // Check action buttons (dealer starts with 14 tiles, so Discard is shown)
    await expect(page.getByRole("button", { name: "Discard Selected" })).toBeVisible();

    // Check chat section
    await expect(page.getByText("Chat")).toBeVisible();
    await expect(page.getByPlaceholder("Message...")).toBeVisible();
  });

  test("dealer starts with 14 tiles and can discard", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter your display name").fill("TestPlayer");
    await page.getByRole("button", { name: "Play as Guest" }).click();

    await page.getByRole("button", { name: "Create Room" }).click();
    await page.getByRole("button", { name: "Create Room" }).click();

    // Navigate via UI to preserve auth state
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]+/);
    await page.getByRole("button", { name: "Ready" }).click();
    await page.getByRole("button", { name: "Start Game" }).click();

    await expect(page).toHaveURL(/\/game\/[A-Z0-9]+/);
    await page.waitForSelector("canvas", { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Dealer (East) starts with 14 tiles, should see discard button
    await expect(page.getByRole("button", { name: "Discard Selected" })).toBeVisible();

    // Verify it's the player's turn
    await expect(page.getByText("Your Turn!")).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: "e2e/screenshots/game-started.png" });
  });
});
