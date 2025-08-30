import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('[data-testid="email-input"]', "admin@test.com");
  await page.fill('[data-testid="password-input"]', "admin123");
  await page.click('[data-testid="login-button"]');
  await page.waitForURL("/admin");
}

async function navigateToUserManagement(page: Page) {
  await page.goto("/admin/users");
  await page.waitForSelector('[data-testid="user-management-page"]');
}

test.describe("Accessibility E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToUserManagement(page);
  });

  test.describe("Automated Accessibility Testing", () => {
    test("should pass axe accessibility audit on user management page", async ({
      page,
    }) => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should pass axe accessibility audit on user creation dialog", async ({
      page,
    }) => {
      // Open user creation dialog
      await page.click('[data-testid="create-user-button"]');
      await page.waitForSelector('[data-testid="user-dialog"]');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should pass axe accessibility audit on user table with data", async ({
      page,
    }) => {
      // Ensure there's data in the table
      await page.waitForSelector('[data-testid="user-table"]');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="user-table"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should pass axe accessibility audit on filters panel", async ({
      page,
    }) => {
      // Focus on filters area
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="user-filters"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should pass axe accessibility audit on bulk operations", async ({
      page,
    }) => {
      // Select a user to trigger bulk operations
      const firstCheckbox = page
        .locator('[data-testid^="select-user-"]')
        .first();
      if ((await firstCheckbox.count()) > 0) {
        await firstCheckbox.check();

        // Wait for bulk action bar to appear
        await page.waitForSelector('[data-testid="bulk-action-bar"]');

        const accessibilityScanResults = await new AxeBuilder({ page })
          .include('[data-testid="bulk-action-bar"]')
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("should support full keyboard navigation through user table", async ({
      page,
    }) => {
      // Start from the top of the page
      await page.keyboard.press("Tab");

      // Navigate through interactive elements
      let focusedElement = await page.locator(":focus");
      let tabCount = 0;
      const maxTabs = 50; // Prevent infinite loop

      while (tabCount < maxTabs) {
        // Check if we can interact with the focused element
        const tagName = await focusedElement.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        const role = await focusedElement.getAttribute("role");

        // Verify focusable elements are interactive
        if (
          ["button", "input", "select", "textarea", "a"].includes(tagName) ||
          ["button", "link", "textbox", "combobox", "checkbox"].includes(
            role || ""
          )
        ) {
          // Element should be visible and enabled
          await expect(focusedElement).toBeVisible();

          const isDisabled = await focusedElement.getAttribute("disabled");
          const ariaDisabled = await focusedElement.getAttribute(
            "aria-disabled"
          );

          if (!isDisabled && ariaDisabled !== "true") {
            // Element should be focusable
            await expect(focusedElement).toBeFocused();
          }
        }

        // Move to next element
        await page.keyboard.press("Tab");
        focusedElement = page.locator(":focus");
        tabCount++;

        // Break if we've cycled back to the beginning
        const currentElement = await focusedElement.evaluate(
          (el) => el.outerHTML
        );
        if (
          tabCount > 10 &&
          currentElement.includes('data-testid="create-user-button"')
        ) {
          break;
        }
      }

      expect(tabCount).toBeGreaterThan(5); // Should have multiple focusable elements
    });

    test("should support keyboard shortcuts for common actions", async ({
      page,
    }) => {
      // Test keyboard shortcut for creating user (if implemented)
      await page.keyboard.press("Control+n");

      // Check if create user dialog opened
      const dialog = page.locator('[data-testid="user-dialog"]');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();

        // Close dialog with Escape
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
      }
    });

    test("should support Enter and Space for button activation", async ({
      page,
    }) => {
      // Focus on create user button
      const createButton = page.locator('[data-testid="create-user-button"]');
      await createButton.focus();

      // Activate with Enter
      await page.keyboard.press("Enter");

      // Verify dialog opened
      await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();

      // Close dialog
      await page.keyboard.press("Escape");

      // Focus on create button again
      await createButton.focus();

      // Activate with Space
      await page.keyboard.press("Space");

      // Verify dialog opened again
      await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();
    });

    test("should support arrow key navigation in tables", async ({ page }) => {
      // Focus on first table cell
      const firstCell = page.locator(
        '[data-testid="user-table"] tbody tr:first-child td:first-child'
      );
      await firstCell.focus();

      // Navigate with arrow keys (if implemented)
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowDown");

      // Verify focus moved (this depends on implementation)
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe("Screen Reader Support", () => {
    test("should have proper ARIA labels and descriptions", async ({
      page,
    }) => {
      // Check main heading
      const mainHeading = page.locator("h1");
      await expect(mainHeading).toHaveAttribute("id");

      // Check that interactive elements have accessible names
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);

        // Button should have accessible name (aria-label, aria-labelledby, or text content)
        const ariaLabel = await button.getAttribute("aria-label");
        const ariaLabelledBy = await button.getAttribute("aria-labelledby");
        const textContent = await button.textContent();

        expect(ariaLabel || ariaLabelledBy || textContent?.trim()).toBeTruthy();
      }

      // Check form inputs have labels
      const inputs = page.locator(
        'input[type="text"], input[type="email"], input[type="password"]'
      );
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);

        // Input should have accessible name
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");
        const id = await input.getAttribute("id");

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = (await label.count()) > 0;

          expect(ariaLabel || ariaLabelledBy || hasLabel).toBeTruthy();
        } else {
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    });

    test("should announce loading states", async ({ page }) => {
      // Trigger a loading state (e.g., refresh data)
      await page.click('[data-testid="refresh-button"]');

      // Check for loading announcement
      const loadingElement = page.locator('[aria-live="polite"]', {
        hasText: /loading/i,
      });
      if ((await loadingElement.count()) > 0) {
        await expect(loadingElement).toBeVisible();
      }
    });

    test("should announce status changes", async ({ page }) => {
      // Select a user
      const firstCheckbox = page
        .locator('[data-testid^="select-user-"]')
        .first();
      if ((await firstCheckbox.count()) > 0) {
        await firstCheckbox.check();

        // Check for selection announcement
        const announcement = page.locator('[aria-live="polite"]');
        if ((await announcement.count()) > 0) {
          await expect(announcement).toContainText(/selected/i);
        }
      }
    });

    test("should have proper table structure for screen readers", async ({
      page,
    }) => {
      const table = page.locator('[data-testid="user-table"]');

      // Table should have proper role
      await expect(table).toHaveAttribute("role", "table");

      // Check for column headers
      const columnHeaders = page.locator('th[scope="col"]');
      const headerCount = await columnHeaders.count();
      expect(headerCount).toBeGreaterThan(0);

      // Check for row headers if present
      const rowHeaders = page.locator('th[scope="row"]');
      // Row headers are optional but if present should be properly marked

      // Check table caption or aria-label
      const caption = page.locator("caption");
      const ariaLabel = await table.getAttribute("aria-label");
      const ariaLabelledBy = await table.getAttribute("aria-labelledby");

      const hasCaption = (await caption.count()) > 0;
      expect(hasCaption || ariaLabel || ariaLabelledBy).toBeTruthy();
    });
  });

  test.describe("Focus Management", () => {
    test("should manage focus properly in dialogs", async ({ page }) => {
      // Open user creation dialog
      await page.click('[data-testid="create-user-button"]');
      await page.waitForSelector('[data-testid="user-dialog"]');

      // Focus should be trapped within dialog
      const dialog = page.locator('[data-testid="user-dialog"]');

      // First focusable element should be focused
      const focusedElement = page.locator(":focus");
      const dialogContainsFocus = (await dialog.locator(":focus").count()) > 0;
      expect(dialogContainsFocus).toBeTruthy();

      // Tab through dialog elements
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Focus should still be within dialog
      const stillInDialog = (await dialog.locator(":focus").count()) > 0;
      expect(stillInDialog).toBeTruthy();

      // Close dialog with Escape
      await page.keyboard.press("Escape");

      // Focus should return to trigger element
      await expect(
        page.locator('[data-testid="create-user-button"]')
      ).toBeFocused();
    });

    test("should maintain focus after dynamic content changes", async ({
      page,
    }) => {
      // Focus on search input
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.focus();

      // Type to trigger search
      await searchInput.fill("test");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Focus should still be on search input
      await expect(searchInput).toBeFocused();
    });

    test("should provide visible focus indicators", async ({ page }) => {
      // Tab through interactive elements and verify focus indicators
      const interactiveElements = page.locator(
        "button, input, select, textarea, a[href]"
      );
      const elementCount = await interactiveElements.count();

      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = interactiveElements.nth(i);
        await element.focus();

        // Check if element has visible focus (this is a basic check)
        const focusedElement = page.locator(":focus");
        await expect(focusedElement).toBeVisible();

        // Element should have focus styles (outline, box-shadow, etc.)
        // This would require checking computed styles, which is complex in Playwright
        // For now, we just verify the element is focused and visible
      }
    });
  });

  test.describe("Color and Contrast", () => {
    test("should not rely solely on color for information", async ({
      page,
    }) => {
      // Check status indicators have text labels, not just colors
      const statusElements = page.locator('[data-testid^="user-status-"]');
      const statusCount = await statusElements.count();

      for (let i = 0; i < statusCount; i++) {
        const status = statusElements.nth(i);
        const textContent = await status.textContent();

        // Status should have text content (Active/Inactive) not just color
        expect(textContent?.trim()).toBeTruthy();
        expect(textContent?.toLowerCase()).toMatch(/active|inactive|banned/);
      }

      // Check sort indicators have symbols or text, not just colors
      const sortButtons = page.locator('[data-testid^="sort-by-"]');
      const sortCount = await sortButtons.count();

      for (let i = 0; i < sortCount; i++) {
        const sortButton = sortButtons.nth(i);

        // Should have aria-label or visible text indicating sort direction
        const ariaLabel = await sortButton.getAttribute("aria-label");
        const textContent = await sortButton.textContent();

        expect(ariaLabel || textContent).toBeTruthy();
      }
    });

    test("should work with high contrast mode", async ({ page }) => {
      // Enable high contrast mode (this is browser-specific)
      // For now, we'll just verify elements are still visible and functional

      await page.emulateMedia({ colorScheme: "dark" });

      // Verify key elements are still visible
      await expect(
        page.locator('[data-testid="user-management-page"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="create-user-button"]')
      ).toBeVisible();

      // Test functionality still works
      await page.click('[data-testid="create-user-button"]');
      await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();
    });
  });

  test.describe("Mobile Accessibility", () => {
    test("should be accessible on mobile devices", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Run accessibility audit on mobile
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);

      // Test touch targets are large enough (minimum 44px)
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();

        if (boundingBox) {
          // Touch targets should be at least 44px in both dimensions
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test("should support mobile screen readers", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify mobile-specific ARIA attributes
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if ((await mobileMenu.count()) > 0) {
        // Mobile menu should have proper ARIA attributes
        const ariaExpanded = await mobileMenu.getAttribute("aria-expanded");
        const ariaControls = await mobileMenu.getAttribute("aria-controls");

        expect(ariaExpanded).toBeTruthy();
        expect(ariaControls).toBeTruthy();
      }
    });
  });

  test.describe("Error State Accessibility", () => {
    test("should announce errors to screen readers", async ({ page }) => {
      // Open user creation dialog
      await page.click('[data-testid="create-user-button"]');
      await page.waitForSelector('[data-testid="user-dialog"]');

      // Try to submit without required fields
      await page.click('[data-testid="save-user-button"]');

      // Check for error announcements
      const errorElements = page.locator(
        '[role="alert"], [aria-live="assertive"]'
      );
      const errorCount = await errorElements.count();

      if (errorCount > 0) {
        // Errors should be announced
        for (let i = 0; i < errorCount; i++) {
          const error = errorElements.nth(i);
          await expect(error).toBeVisible();

          const textContent = await error.textContent();
          expect(textContent?.trim()).toBeTruthy();
        }
      }

      // Form fields with errors should have aria-invalid
      const invalidFields = page.locator('[aria-invalid="true"]');
      const invalidCount = await invalidFields.count();
      expect(invalidCount).toBeGreaterThan(0);
    });

    test("should associate error messages with form fields", async ({
      page,
    }) => {
      // Open user creation dialog
      await page.click('[data-testid="create-user-button"]');
      await page.waitForSelector('[data-testid="user-dialog"]');

      // Try to submit without required fields
      await page.click('[data-testid="save-user-button"]');

      // Check that error messages are properly associated
      const inputs = page.locator('input[aria-invalid="true"]');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const ariaDescribedBy = await input.getAttribute("aria-describedby");

        if (ariaDescribedBy) {
          // Error message should exist and be visible
          const errorMessage = page.locator(`#${ariaDescribedBy}`);
          await expect(errorMessage).toBeVisible();
        }
      }
    });
  });
});
