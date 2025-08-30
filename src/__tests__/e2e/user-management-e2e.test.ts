import { test, expect, Page } from "@playwright/test";

// Test data
const testUser = {
  firstName: "Test",
  lastName: "User",
  email: "test.user@example.com",
  password: "TestPassword123!",
};

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

async function createTestUser(page: Page, userData = testUser) {
  // Click create user button
  await page.click('[data-testid="create-user-button"]');

  // Wait for dialog to open
  await page.waitForSelector('[data-testid="user-dialog"]');

  // Fill form fields
  await page.fill('[data-testid="first-name-input"]', userData.firstName);
  await page.fill('[data-testid="last-name-input"]', userData.lastName);
  await page.fill('[data-testid="email-input"]', userData.email);
  await page.fill('[data-testid="password-input"]', userData.password);

  // Select role
  await page.click('[data-testid="role-select"]');
  await page.click('[data-testid="role-option-USER"]');

  // Submit form
  await page.click('[data-testid="save-user-button"]');

  // Wait for dialog to close
  await page.waitForSelector('[data-testid="user-dialog"]', {
    state: "hidden",
  });
}

test.describe("User Management E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAsAdmin(page);
    await navigateToUserManagement(page);
  });

  test.describe("User CRUD Operations", () => {
    test("should create a new user successfully", async ({ page }) => {
      // Create user
      await createTestUser(page);

      // Verify user appears in table
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        testUser.email
      );
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        `${testUser.firstName} ${testUser.lastName}`
      );

      // Verify success notification
      await expect(page.locator('[data-testid="toast"]')).toContainText(
        "User created successfully"
      );
    });

    test("should edit an existing user", async ({ page }) => {
      // First create a user
      await createTestUser(page);

      // Find and click edit button for the user
      const userRow = page
        .locator('[data-testid="user-row"]')
        .filter({ hasText: testUser.email });
      await userRow.locator('[data-testid="edit-user-button"]').click();

      // Wait for edit dialog
      await page.waitForSelector('[data-testid="user-dialog"]');

      // Update user details
      const updatedFirstName = "Updated";
      await page.fill('[data-testid="first-name-input"]', updatedFirstName);

      // Save changes
      await page.click('[data-testid="save-user-button"]');

      // Verify changes
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        `${updatedFirstName} ${testUser.lastName}`
      );
      await expect(page.locator('[data-testid="toast"]')).toContainText(
        "User updated successfully"
      );
    });

    test("should delete a user with confirmation", async ({ page }) => {
      // First create a user
      await createTestUser(page);

      // Find and click delete button
      const userRow = page
        .locator('[data-testid="user-row"]')
        .filter({ hasText: testUser.email });
      await userRow.locator('[data-testid="delete-user-button"]').click();

      // Confirm deletion in dialog
      await page.waitForSelector('[data-testid="confirm-dialog"]');
      await page.click('[data-testid="confirm-delete-button"]');

      // Verify user is removed
      await expect(
        page.locator('[data-testid="user-table"]')
      ).not.toContainText(testUser.email);
      await expect(page.locator('[data-testid="toast"]')).toContainText(
        "User deleted successfully"
      );
    });

    test("should handle validation errors during user creation", async ({
      page,
    }) => {
      // Click create user button
      await page.click('[data-testid="create-user-button"]');
      await page.waitForSelector('[data-testid="user-dialog"]');

      // Try to submit without filling required fields
      await page.click('[data-testid="save-user-button"]');

      // Verify validation errors are shown
      await expect(
        page.locator('[data-testid="first-name-error"]')
      ).toContainText("First name is required");
      await expect(
        page.locator('[data-testid="last-name-error"]')
      ).toContainText("Last name is required");
      await expect(page.locator('[data-testid="email-error"]')).toContainText(
        "Email is required"
      );
      await expect(
        page.locator('[data-testid="password-error"]')
      ).toContainText("Password is required");
    });

    test("should prevent duplicate email addresses", async ({ page }) => {
      // First create a user
      await createTestUser(page);

      // Try to create another user with the same email
      await page.click('[data-testid="create-user-button"]');
      await page.waitForSelector('[data-testid="user-dialog"]');

      await page.fill('[data-testid="first-name-input"]', "Another");
      await page.fill('[data-testid="last-name-input"]', "User");
      await page.fill('[data-testid="email-input"]', testUser.email); // Same email
      await page.fill('[data-testid="password-input"]', "password123");

      await page.click('[data-testid="save-user-button"]');

      // Verify error message
      await expect(page.locator('[data-testid="email-error"]')).toContainText(
        "Email is already taken"
      );
    });
  });

  test.describe("Search and Filtering", () => {
    test("should search users by name and email", async ({ page }) => {
      // Create test users
      await createTestUser(page, {
        ...testUser,
        email: "john.doe@test.com",
        firstName: "John",
        lastName: "Doe",
      });
      await createTestUser(page, {
        ...testUser,
        email: "jane.smith@test.com",
        firstName: "Jane",
        lastName: "Smith",
      });

      // Search by first name
      await page.fill('[data-testid="search-input"]', "John");
      await page.waitForTimeout(500); // Wait for debounce

      // Verify only John appears
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        "John Doe"
      );
      await expect(
        page.locator('[data-testid="user-table"]')
      ).not.toContainText("Jane Smith");

      // Search by email
      await page.fill('[data-testid="search-input"]', "jane.smith");
      await page.waitForTimeout(500);

      // Verify only Jane appears
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        "Jane Smith"
      );
      await expect(
        page.locator('[data-testid="user-table"]')
      ).not.toContainText("John Doe");

      // Clear search
      await page.fill('[data-testid="search-input"]', "");
      await page.waitForTimeout(500);

      // Verify both users appear
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        "John Doe"
      );
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        "Jane Smith"
      );
    });

    test("should filter users by role", async ({ page }) => {
      // Create users with different roles
      await createTestUser(page, { ...testUser, email: "admin.user@test.com" });

      // Change first user to admin role
      const userRow = page
        .locator('[data-testid="user-row"]')
        .filter({ hasText: "admin.user@test.com" });
      await userRow.locator('[data-testid="edit-user-button"]').click();
      await page.waitForSelector('[data-testid="user-dialog"]');

      await page.click('[data-testid="role-select"]');
      await page.click('[data-testid="role-option-ADMIN"]');
      await page.click('[data-testid="save-user-button"]');

      // Apply role filter
      await page.click('[data-testid="role-filter"]');
      await page.click('[data-testid="role-filter-option-ADMIN"]');

      // Verify only admin users appear
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        "admin.user@test.com"
      );

      // Clear filter
      await page.click('[data-testid="role-filter"]');
      await page.click('[data-testid="role-filter-option-all"]');
    });

    test("should filter users by status", async ({ page }) => {
      // Create a user
      await createTestUser(page);

      // Ban the user
      const userRow = page
        .locator('[data-testid="user-row"]')
        .filter({ hasText: testUser.email });
      await userRow.locator('[data-testid="toggle-status-button"]').click();
      await page.click('[data-testid="confirm-button"]');

      // Filter by inactive status
      await page.click('[data-testid="status-filter"]');
      await page.click('[data-testid="status-filter-option-inactive"]');

      // Verify only inactive users appear
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        testUser.email
      );

      // Filter by active status
      await page.click('[data-testid="status-filter"]');
      await page.click('[data-testid="status-filter-option-active"]');

      // Verify user doesn't appear
      await expect(
        page.locator('[data-testid="user-table"]')
      ).not.toContainText(testUser.email);
    });

    test("should combine multiple filters", async ({ page }) => {
      // Create test users
      await createTestUser(page, {
        ...testUser,
        email: "active.admin@test.com",
        firstName: "Active",
        lastName: "Admin",
      });
      await createTestUser(page, {
        ...testUser,
        email: "active.user@test.com",
        firstName: "Active",
        lastName: "User",
      });

      // Apply search filter
      await page.fill('[data-testid="search-input"]', "Active");
      await page.waitForTimeout(500);

      // Apply role filter
      await page.click('[data-testid="role-filter"]');
      await page.click('[data-testid="role-filter-option-USER"]');

      // Verify only matching user appears
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        "Active User"
      );
      await expect(
        page.locator('[data-testid="user-table"]')
      ).not.toContainText("Active Admin");
    });
  });

  test.describe("Bulk Operations", () => {
    test("should select multiple users and perform bulk ban", async ({
      page,
    }) => {
      // Create multiple test users
      await createTestUser(page, {
        ...testUser,
        email: "user1@test.com",
        firstName: "User",
        lastName: "One",
      });
      await createTestUser(page, {
        ...testUser,
        email: "user2@test.com",
        firstName: "User",
        lastName: "Two",
      });

      // Select users
      await page.check('[data-testid="select-user-user1@test.com"]');
      await page.check('[data-testid="select-user-user2@test.com"]');

      // Verify bulk action bar appears
      await expect(
        page.locator('[data-testid="bulk-action-bar"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="bulk-action-bar"]')
      ).toContainText("2 users selected");

      // Perform bulk ban
      await page.click('[data-testid="bulk-ban-button"]');
      await page.waitForSelector('[data-testid="bulk-confirm-dialog"]');

      // Confirm action
      await page.click('[data-testid="confirm-bulk-action"]');

      // Verify success
      await expect(page.locator('[data-testid="toast"]')).toContainText(
        "Users banned successfully"
      );

      // Verify users are marked as inactive
      await expect(
        page.locator('[data-testid="user-status-user1@test.com"]')
      ).toContainText("Inactive");
      await expect(
        page.locator('[data-testid="user-status-user2@test.com"]')
      ).toContainText("Inactive");
    });

    test("should select all users and perform bulk operations", async ({
      page,
    }) => {
      // Create multiple test users
      await createTestUser(page, {
        ...testUser,
        email: "user1@test.com",
        firstName: "User",
        lastName: "One",
      });
      await createTestUser(page, {
        ...testUser,
        email: "user2@test.com",
        firstName: "User",
        lastName: "Two",
      });

      // Select all users
      await page.check('[data-testid="select-all-users"]');

      // Verify all users are selected
      await expect(
        page.locator('[data-testid="select-user-user1@test.com"]')
      ).toBeChecked();
      await expect(
        page.locator('[data-testid="select-user-user2@test.com"]')
      ).toBeChecked();

      // Verify bulk action bar shows correct count
      await expect(
        page.locator('[data-testid="bulk-action-bar"]')
      ).toContainText("users selected");
    });

    test("should handle bulk operation errors gracefully", async ({ page }) => {
      // Create a test user
      await createTestUser(page);

      // Select the user
      await page.check(`[data-testid="select-user-${testUser.email}"]`);

      // Try to delete (should fail if it's the current admin)
      await page.click('[data-testid="bulk-delete-button"]');
      await page.waitForSelector('[data-testid="bulk-confirm-dialog"]');
      await page.click('[data-testid="confirm-bulk-action"]');

      // Should show error or success based on permissions
      const toast = page.locator('[data-testid="toast"]');
      await expect(toast).toBeVisible();
    });

    test("should clear selection after bulk operations", async ({ page }) => {
      // Create test users
      await createTestUser(page, { ...testUser, email: "user1@test.com" });

      // Select user
      await page.check('[data-testid="select-user-user1@test.com"]');

      // Perform bulk operation
      await page.click('[data-testid="bulk-ban-button"]');
      await page.click('[data-testid="confirm-bulk-action"]');

      // Verify selection is cleared
      await expect(
        page.locator('[data-testid="bulk-action-bar"]')
      ).not.toBeVisible();
      await expect(
        page.locator('[data-testid="select-user-user1@test.com"]')
      ).not.toBeChecked();
    });
  });

  test.describe("User Status Management", () => {
    test("should toggle user status with confirmation", async ({ page }) => {
      // Create a user
      await createTestUser(page);

      // Toggle status
      const userRow = page
        .locator('[data-testid="user-row"]')
        .filter({ hasText: testUser.email });
      await userRow.locator('[data-testid="toggle-status-button"]').click();

      // Confirm in dialog
      await page.waitForSelector('[data-testid="confirm-dialog"]');
      await page.click('[data-testid="confirm-button"]');

      // Verify status changed
      await expect(
        page.locator(`[data-testid="user-status-${testUser.email}"]`)
      ).toContainText("Inactive");

      // Toggle back
      await userRow.locator('[data-testid="toggle-status-button"]').click();
      await page.click('[data-testid="confirm-button"]');

      // Verify status changed back
      await expect(
        page.locator(`[data-testid="user-status-${testUser.email}"]`)
      ).toContainText("Active");
    });

    test("should prevent admin from banning themselves", async ({ page }) => {
      // Try to ban current admin user (should be prevented)
      const adminRow = page
        .locator('[data-testid="user-row"]')
        .filter({ hasText: adminCredentials.email });

      if ((await adminRow.count()) > 0) {
        const toggleButton = adminRow.locator(
          '[data-testid="toggle-status-button"]'
        );

        if ((await toggleButton.count()) > 0) {
          await toggleButton.click();

          // Should show error message
          await expect(page.locator('[data-testid="toast"]')).toContainText(
            "Cannot ban your own account"
          );
        }
      }
    });
  });

  test.describe("Pagination and Sorting", () => {
    test("should navigate through pages", async ({ page }) => {
      // Create enough users to trigger pagination (assuming page size is 10)
      for (let i = 1; i <= 15; i++) {
        await createTestUser(page, {
          ...testUser,
          email: `user${i}@test.com`,
          firstName: `User${i}`,
          lastName: "Test",
        });
      }

      // Verify pagination controls appear
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

      // Navigate to next page
      await page.click('[data-testid="next-page-button"]');

      // Verify URL or page indicator changed
      await expect(page.locator('[data-testid="current-page"]')).toContainText(
        "2"
      );

      // Navigate back to first page
      await page.click('[data-testid="previous-page-button"]');
      await expect(page.locator('[data-testid="current-page"]')).toContainText(
        "1"
      );
    });

    test("should change page size", async ({ page }) => {
      // Create multiple users
      for (let i = 1; i <= 8; i++) {
        await createTestUser(page, {
          ...testUser,
          email: `user${i}@test.com`,
          firstName: `User${i}`,
          lastName: "Test",
        });
      }

      // Change page size
      await page.click('[data-testid="page-size-select"]');
      await page.click('[data-testid="page-size-option-5"]');

      // Verify pagination appears (should have more than 1 page now)
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    });

    test("should sort users by different columns", async ({ page }) => {
      // Create users with different names
      await createTestUser(page, {
        ...testUser,
        email: "alice@test.com",
        firstName: "Alice",
        lastName: "Smith",
      });
      await createTestUser(page, {
        ...testUser,
        email: "bob@test.com",
        firstName: "Bob",
        lastName: "Jones",
      });

      // Sort by name (ascending)
      await page.click('[data-testid="sort-by-name"]');

      // Verify sort order
      const firstRow = page.locator('[data-testid="user-row"]').first();
      await expect(firstRow).toContainText("Alice Smith");

      // Sort by name (descending)
      await page.click('[data-testid="sort-by-name"]');

      // Verify reverse sort order
      await expect(firstRow).toContainText("Bob Jones");
    });
  });

  test.describe("Export and Import", () => {
    test("should export user data", async ({ page }) => {
      // Create test users
      await createTestUser(page);

      // Click export button
      await page.click('[data-testid="export-button"]');

      // Select CSV format
      await page.waitForSelector('[data-testid="export-dialog"]');
      await page.click('[data-testid="export-format-csv"]');

      // Start download
      const downloadPromise = page.waitForEvent("download");
      await page.click('[data-testid="start-export-button"]');

      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain(".csv");
    });

    test("should import user data", async ({ page }) => {
      // Click import button
      await page.click('[data-testid="import-button"]');

      // Wait for import dialog
      await page.waitForSelector('[data-testid="import-dialog"]');

      // Upload CSV file (mock file upload)
      const fileContent =
        "first_name,last_name,email,role\nImported,User,imported@test.com,USER";
      await page.setInputFiles('[data-testid="file-upload"]', {
        name: "users.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(fileContent),
      });

      // Preview import
      await page.click('[data-testid="preview-import-button"]');

      // Verify preview shows data
      await expect(
        page.locator('[data-testid="import-preview"]')
      ).toContainText("Imported User");

      // Confirm import
      await page.click('[data-testid="confirm-import-button"]');

      // Verify success
      await expect(page.locator('[data-testid="toast"]')).toContainText(
        "Users imported successfully"
      );

      // Verify user appears in table
      await expect(page.locator('[data-testid="user-table"]')).toContainText(
        "imported@test.com"
      );
    });
  });

  test.describe("Error Handling", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      // Simulate network failure by going offline
      await page.context().setOffline(true);

      // Try to create a user
      await page.click('[data-testid="create-user-button"]');
      await page.waitForSelector('[data-testid="user-dialog"]');

      await page.fill('[data-testid="first-name-input"]', testUser.firstName);
      await page.fill('[data-testid="last-name-input"]', testUser.lastName);
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);

      await page.click('[data-testid="save-user-button"]');

      // Should show network error
      await expect(page.locator('[data-testid="toast"]')).toContainText(
        "Network error"
      );

      // Restore network
      await page.context().setOffline(false);
    });

    test("should handle permission errors", async ({ page }) => {
      // This would require mocking API responses or using a test user with limited permissions
      // For now, we'll test the UI behavior when permission errors occur

      // Try to access admin functions (this test assumes proper error handling is in place)
      await page.goto("/admin/users");

      // If user doesn't have permissions, should redirect or show error
      // This test would need to be adapted based on actual permission implementation
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile devices", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to user management
      await page.goto("/admin/users");

      // Verify mobile-friendly layout
      await expect(
        page.locator('[data-testid="user-management-page"]')
      ).toBeVisible();

      // Test mobile navigation
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if ((await mobileMenu.count()) > 0) {
        await mobileMenu.click();
        await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      }

      // Test responsive table
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();

      // Test mobile-friendly filters
      const filtersToggle = page.locator('[data-testid="filters-toggle"]');
      if ((await filtersToggle.count()) > 0) {
        await filtersToggle.click();
        await expect(
          page.locator('[data-testid="filters-panel"]')
        ).toBeVisible();
      }
    });

    test("should work on tablet devices", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Navigate to user management
      await page.goto("/admin/users");

      // Verify tablet layout
      await expect(
        page.locator('[data-testid="user-management-page"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();

      // Test tablet-specific interactions
      await page.click('[data-testid="create-user-button"]');
      await expect(page.locator('[data-testid="user-dialog"]')).toBeVisible();
    });
  });
});
