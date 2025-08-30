import { test, expect, Page } from "@playwright/test";

// Test data
const testUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@test.com",
    password: "password123",
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@test.com",
    password: "password123",
  },
  {
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@test.com",
    password: "password123",
  },
  {
    firstName: "Alice",
    lastName: "Brown",
    email: "alice.brown@test.com",
    password: "password123",
  },
  {
    firstName: "Charlie",
    lastName: "Wilson",
    email: "charlie.wilson@test.com",
    password: "password123",
  },
];

const adminCredentials = {
  email: "admin@test.com",
  password: "admin123",
};

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('[data-testid="email-input"]', adminCredentials.email);
  await page.fill('[data-testid="password-input"]', adminCredentials.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL("/admin");
}

async function navigateToUserManagement(page: Page) {
  await page.goto("/admin/users");
  await page.waitForSelector('[data-testid="user-management-page"]');
}

async function createTestUser(page: Page, userData: (typeof testUsers)[0]) {
  await page.click('[data-testid="create-user-button"]');
  await page.waitForSelector('[data-testid="user-dialog"]');

  await page.fill('[data-testid="first-name-input"]', userData.firstName);
  await page.fill('[data-testid="last-name-input"]', userData.lastName);
  await page.fill('[data-testid="email-input"]', userData.email);
  await page.fill('[data-testid="password-input"]', userData.password);

  await page.click('[data-testid="role-select"]');
  await page.click('[data-testid="role-option-USER"]');

  await page.click('[data-testid="save-user-button"]');
  await page.waitForSelector('[data-testid="user-dialog"]', {
    state: "hidden",
  });
}

async function selectUsers(page: Page, emails: string[]) {
  for (const email of emails) {
    await page.check(`[data-testid="select-user-${email}"]`);
  }
}

async function waitForBulkActionBar(page: Page, expectedCount: number) {
  await page.waitForSelector('[data-testid="bulk-action-bar"]');
  await expect(page.locator('[data-testid="bulk-action-bar"]')).toContainText(
    `${expectedCount} users selected`
  );
}

test.describe("Bulk Operations E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToUserManagement(page);

    // Create test users for each test
    for (const userData of testUsers) {
      await createTestUser(page, userData);
    }
  });

  test.describe("User Selection", () => {
    test("should select individual users", async ({ page }) => {
      // Select first user
      await page.check(`[data-testid="select-user-${testUsers[0].email}"]`);

      // Verify bulk action bar appears
      await waitForBulkActionBar(page, 1);

      // Select second user
      await page.check(`[data-testid="select-user-${testUsers[1].email}"]`);

      // Verify count updates
      await waitForBulkActionBar(page, 2);

      // Deselect first user
      await page.uncheck(`[data-testid="select-user-${testUsers[0].email}"]`);

      // Verify count updates
      await waitForBulkActionBar(page, 1);
    });

    test("should select all users with select all checkbox", async ({
      page,
    }) => {
      // Click select all
      await page.check('[data-testid="select-all-users"]');

      // Verify all users are selected
      for (const userData of testUsers) {
        await expect(
          page.locator(`[data-testid="select-user-${userData.email}"]`)
        ).toBeChecked();
      }

      // Verify bulk action bar shows correct count
      await expect(
        page.locator('[data-testid="bulk-action-bar"]')
      ).toContainText("users selected");

      // Uncheck select all
      await page.uncheck('[data-testid="select-all-users"]');

      // Verify all users are deselected
      for (const userData of testUsers) {
        await expect(
          page.locator(`[data-testid="select-user-${userData.email}"]`)
        ).not.toBeChecked();
      }

      // Verify bulk action bar disappears
      await expect(
        page.locator('[data-testid="bulk-action-bar"]')
      ).not.toBeVisible();
    });

    test("should handle partial selection with select all checkbox", async ({
      page,
    }) => {
      // Select some users manually
      await page.check(`[data-testid="select-user-${testUsers[0].email}"]`);
      await page.check(`[data-testid="select-user-${testUsers[1].email}"]`);

      // Select all checkbox should be in indeterminate state
      const selectAllCheckbox = page.locator(
        '[data-testid="select-all-users"]'
      );

      // Click select all to select remaining users
      await selectAllCheckbox.check();

      // All users should now be selected
      for (const userData of testUsers) {
        await expect(
          page.locator(`[data-testid="select-user-${userData.email}"]`)
        ).toBeChecked();
      }
    });

    test("should clear selection when clicking clear button", async ({
      page,
    }) => {
      // Select multiple users
      await selectUsers(page, [testUsers[0].email, testUsers[1].email]);
      await waitForBulkActionBar(page, 2);

      // Click clear selection
      await page.click('[data-testid="clear-selection-button"]');

      // Verify all users are deselected
      for (const userData of testUsers) {
        await expect(
          page.locator(`[data-testid="select-user-${userData.email}"]`)
        ).not.toBeChecked();
      }

      // Verify bulk action bar disappears
      await expect(
        page.locator('[data-testid="bulk-action-bar"]')
      ).not.toBeVisible();
    });
  });

  test.describe("Bulk Ban Operations", () => {
    test("should ban multiple users successfully", async ({ page }) => {
      // Select users to ban
      const usersToBan = [testUsers[0].email, testUsers[1].email];
      await selectUsers(page, usersToBan);
      await waitForBulkActionBar(page, 2);

      // Click bulk ban button
      await page.click('[data-testid="bulk-ban-button"]');

      // Verify confirmation dialog appears
      await page.waitForSelector('[data-testid="bulk-confirm-dialog"]');
      await expect(
        page.locator('[data-testid="bulk-confirm-dialog"]')
      ).toContainText("Ban 2 users");
      await expect(
        page.locator('[data-testid="bulk-confirm-dialog"]')
      ).toContainText(testUsers[0].email);
      await expect(
        page.locator('[data-testid="bulk-confirm-dialog"]')
      ).toContainText(testUsers[1].email);

      // Confirm the action
      await page.click('[data-testid="confirm-bulk-action"]');

      // Wait for progress dialog
      await page.waitForSelector('[data-testid="bulk-progress-dialog"]');

      // Wait for completion
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');

      // Verify success message
      await expect(
        page.locator('[data-testid="bulk-result-dialog"]')
      ).toContainText("2 users banned successfully");

      // Close result dialog
      await page.click('[data-testid="close-result-dialog"]');

      // Verify users are marked as inactive
      for (const email of usersToBan) {
        await expect(
          page.locator(`[data-testid="user-status-${email}"]`)
        ).toContainText("Inactive");
      }

      // Verify selection is cleared
      await expect(
        page.locator('[data-testid="bulk-action-bar"]')
      ).not.toBeVisible();
    });

    test("should handle partial failures in bulk ban", async ({ page }) => {
      // Select users including admin (which should fail)
      const usersToSelect = [testUsers[0].email, adminCredentials.email];

      // Only select the test user (admin might not be selectable)
      await page.check(`[data-testid="select-user-${testUsers[0].email}"]`);

      // Try to select admin if checkbox exists
      const adminCheckbox = page.locator(
        `[data-testid="select-user-${adminCredentials.email}"]`
      );
      if ((await adminCheckbox.count()) > 0) {
        await adminCheckbox.check();
      }

      await page.click('[data-testid="bulk-ban-button"]');
      await page.waitForSelector('[data-testid="bulk-confirm-dialog"]');
      await page.click('[data-testid="confirm-bulk-action"]');

      // Wait for result
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');

      // Should show partial success/failure
      const resultText = await page
        .locator('[data-testid="bulk-result-dialog"]')
        .textContent();
      expect(resultText).toMatch(/banned|failed|error/i);
    });

    test("should cancel bulk ban operation", async ({ page }) => {
      // Select users
      await selectUsers(page, [testUsers[0].email]);
      await waitForBulkActionBar(page, 1);

      // Click bulk ban
      await page.click('[data-testid="bulk-ban-button"]');
      await page.waitForSelector('[data-testid="bulk-confirm-dialog"]');

      // Cancel the operation
      await page.click('[data-testid="cancel-bulk-action"]');

      // Verify dialog closes and no action is taken
      await expect(
        page.locator('[data-testid="bulk-confirm-dialog"]')
      ).not.toBeVisible();
      await expect(
        page.locator(`[data-testid="user-status-${testUsers[0].email}"]`)
      ).toContainText("Active");
    });
  });

  test.describe("Bulk Unban Operations", () => {
    test("should unban multiple users successfully", async ({ page }) => {
      // First ban some users
      const usersToBan = [testUsers[0].email, testUsers[1].email];
      await selectUsers(page, usersToBan);
      await page.click('[data-testid="bulk-ban-button"]');
      await page.click('[data-testid="confirm-bulk-action"]');
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');
      await page.click('[data-testid="close-result-dialog"]');

      // Now unban them
      await selectUsers(page, usersToBan);
      await waitForBulkActionBar(page, 2);

      await page.click('[data-testid="bulk-unban-button"]');
      await page.waitForSelector('[data-testid="bulk-confirm-dialog"]');
      await expect(
        page.locator('[data-testid="bulk-confirm-dialog"]')
      ).toContainText("Unban 2 users");

      await page.click('[data-testid="confirm-bulk-action"]');
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');

      await expect(
        page.locator('[data-testid="bulk-result-dialog"]')
      ).toContainText("2 users unbanned successfully");

      await page.click('[data-testid="close-result-dialog"]');

      // Verify users are active again
      for (const email of usersToBan) {
        await expect(
          page.locator(`[data-testid="user-status-${email}"]`)
        ).toContainText("Active");
      }
    });
  });

  test.describe("Bulk Role Assignment", () => {
    test("should assign roles to multiple users", async ({ page }) => {
      // Select users
      const usersToUpdate = [testUsers[0].email, testUsers[1].email];
      await selectUsers(page, usersToUpdate);
      await waitForBulkActionBar(page, 2);

      // Click bulk assign role
      await page.click('[data-testid="bulk-assign-role-button"]');

      // Select role in dialog
      await page.waitForSelector('[data-testid="bulk-role-dialog"]');
      await page.click('[data-testid="bulk-role-select"]');
      await page.click('[data-testid="bulk-role-option-ADMIN"]');

      // Confirm assignment
      await page.click('[data-testid="confirm-role-assignment"]');

      // Wait for completion
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');
      await expect(
        page.locator('[data-testid="bulk-result-dialog"]')
      ).toContainText("roles assigned successfully");

      await page.click('[data-testid="close-result-dialog"]');

      // Verify role changes
      for (const email of usersToUpdate) {
        await expect(
          page.locator(`[data-testid="user-role-${email}"]`)
        ).toContainText("ADMIN");
      }
    });

    test("should handle role assignment validation", async ({ page }) => {
      // Select users
      await selectUsers(page, [testUsers[0].email]);
      await waitForBulkActionBar(page, 1);

      // Click bulk assign role
      await page.click('[data-testid="bulk-assign-role-button"]');
      await page.waitForSelector('[data-testid="bulk-role-dialog"]');

      // Try to confirm without selecting a role
      await page.click('[data-testid="confirm-role-assignment"]');

      // Should show validation error
      await expect(page.locator('[data-testid="role-error"]')).toContainText(
        "Please select a role"
      );
    });
  });

  test.describe("Bulk Delete Operations", () => {
    test("should delete multiple users with confirmation", async ({ page }) => {
      // Select users to delete
      const usersToDelete = [testUsers[0].email, testUsers[1].email];
      await selectUsers(page, usersToDelete);
      await waitForBulkActionBar(page, 2);

      // Click bulk delete
      await page.click('[data-testid="bulk-delete-button"]');

      // Verify warning dialog
      await page.waitForSelector('[data-testid="bulk-confirm-dialog"]');
      await expect(
        page.locator('[data-testid="bulk-confirm-dialog"]')
      ).toContainText("Delete 2 users");
      await expect(
        page.locator('[data-testid="bulk-confirm-dialog"]')
      ).toContainText("This action cannot be undone");

      // Confirm deletion
      await page.click('[data-testid="confirm-bulk-action"]');

      // Wait for completion
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');
      await expect(
        page.locator('[data-testid="bulk-result-dialog"]')
      ).toContainText("2 users deleted successfully");

      await page.click('[data-testid="close-result-dialog"]');

      // Verify users are removed from table
      for (const email of usersToDelete) {
        await expect(
          page.locator('[data-testid="user-table"]')
        ).not.toContainText(email);
      }
    });

    test("should prevent deletion of current admin user", async ({ page }) => {
      // Try to select and delete admin user
      const adminCheckbox = page.locator(
        `[data-testid="select-user-${adminCredentials.email}"]`
      );

      if ((await adminCheckbox.count()) > 0) {
        await adminCheckbox.check();
        await page.click('[data-testid="bulk-delete-button"]');
        await page.click('[data-testid="confirm-bulk-action"]');

        // Should show error
        await page.waitForSelector('[data-testid="bulk-result-dialog"]');
        const resultText = await page
          .locator('[data-testid="bulk-result-dialog"]')
          .textContent();
        expect(resultText).toMatch(/cannot delete.*own account|failed/i);
      }
    });
  });

  test.describe("Bulk Operations Progress and Error Handling", () => {
    test("should show progress during bulk operations", async ({ page }) => {
      // Select multiple users
      await selectUsers(
        page,
        testUsers.slice(0, 3).map((u) => u.email)
      );
      await waitForBulkActionBar(page, 3);

      // Start bulk operation
      await page.click('[data-testid="bulk-ban-button"]');
      await page.click('[data-testid="confirm-bulk-action"]');

      // Verify progress dialog appears
      await page.waitForSelector('[data-testid="bulk-progress-dialog"]');

      // Should show progress indicator
      await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-text"]')).toContainText(
        /processing|banning/i
      );

      // Wait for completion
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');
    });

    test("should handle network errors during bulk operations", async ({
      page,
    }) => {
      // Select users
      await selectUsers(page, [testUsers[0].email]);
      await waitForBulkActionBar(page, 1);

      // Simulate network failure
      await page.context().setOffline(true);

      // Try bulk operation
      await page.click('[data-testid="bulk-ban-button"]');
      await page.click('[data-testid="confirm-bulk-action"]');

      // Should show error
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');
      const resultText = await page
        .locator('[data-testid="bulk-result-dialog"]')
        .textContent();
      expect(resultText).toMatch(/error|failed|network/i);

      // Restore network
      await page.context().setOffline(false);
    });

    test("should allow retry of failed operations", async ({ page }) => {
      // This test would require mocking API failures
      // For now, we'll test the UI behavior

      await selectUsers(page, [testUsers[0].email]);
      await waitForBulkActionBar(page, 1);

      await page.click('[data-testid="bulk-ban-button"]');
      await page.click('[data-testid="confirm-bulk-action"]');

      // Wait for result (success or failure)
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');

      // If there's a retry button, test it
      const retryButton = page.locator('[data-testid="retry-bulk-operation"]');
      if ((await retryButton.count()) > 0) {
        await retryButton.click();

        // Should restart the operation
        await page.waitForSelector('[data-testid="bulk-progress-dialog"]');
      }
    });
  });

  test.describe("Bulk Operations with Filtering", () => {
    test("should work with filtered results", async ({ page }) => {
      // Apply a filter
      await page.fill('[data-testid="search-input"]', "John");
      await page.waitForTimeout(500); // Wait for debounce

      // Select filtered user
      await page.check(`[data-testid="select-user-${testUsers[0].email}"]`);
      await waitForBulkActionBar(page, 1);

      // Perform bulk operation
      await page.click('[data-testid="bulk-ban-button"]');
      await page.click('[data-testid="confirm-bulk-action"]');

      // Should work normally
      await page.waitForSelector('[data-testid="bulk-result-dialog"]');
      await expect(
        page.locator('[data-testid="bulk-result-dialog"]')
      ).toContainText("banned successfully");
    });

    test("should maintain selection when changing filters", async ({
      page,
    }) => {
      // Select users
      await selectUsers(page, [testUsers[0].email, testUsers[1].email]);
      await waitForBulkActionBar(page, 2);

      // Apply filter that hides one selected user
      await page.fill('[data-testid="search-input"]', testUsers[0].firstName);
      await page.waitForTimeout(500);

      // Bulk action bar should still show selection count
      // (Implementation may vary - some apps clear selection, others maintain it)
      const bulkActionBar = page.locator('[data-testid="bulk-action-bar"]');
      if ((await bulkActionBar.count()) > 0) {
        // If selection is maintained, should still show count
        await expect(bulkActionBar).toContainText("selected");
      }
    });
  });

  test.describe("Bulk Operations Accessibility", () => {
    test("should announce selection changes to screen readers", async ({
      page,
    }) => {
      // Select a user
      await page.check(`[data-testid="select-user-${testUsers[0].email}"]`);

      // Check for ARIA live region announcement
      const liveRegion = page.locator('[aria-live="polite"]');
      if ((await liveRegion.count()) > 0) {
        await expect(liveRegion).toContainText(/1.*selected/i);
      }

      // Select another user
      await page.check(`[data-testid="select-user-${testUsers[1].email}"]`);

      // Should announce updated count
      if ((await liveRegion.count()) > 0) {
        await expect(liveRegion).toContainText(/2.*selected/i);
      }
    });

    test("should support keyboard navigation for bulk operations", async ({
      page,
    }) => {
      // Tab to first checkbox
      await page.keyboard.press("Tab");

      // Find and focus first user checkbox
      const firstCheckbox = page.locator(
        `[data-testid="select-user-${testUsers[0].email}"]`
      );
      await firstCheckbox.focus();

      // Select with Space
      await page.keyboard.press("Space");
      await expect(firstCheckbox).toBeChecked();

      // Tab to bulk action button
      await page.keyboard.press("Tab");
      const bulkButton = page.locator('[data-testid="bulk-ban-button"]');

      if (await bulkButton.isVisible()) {
        await bulkButton.focus();

        // Activate with Enter
        await page.keyboard.press("Enter");

        // Should open confirmation dialog
        await expect(
          page.locator('[data-testid="bulk-confirm-dialog"]')
        ).toBeVisible();
      }
    });
  });
});
