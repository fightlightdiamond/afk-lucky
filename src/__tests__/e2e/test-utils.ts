import { Page, expect } from "@playwright/test";
import { testSelectors, getTestConfig, testTimeouts } from "../test-config";

const config = getTestConfig();

/**
 * Authentication utilities
 */
export class AuthUtils {
  static async loginAsAdmin(page: Page) {
    await page.goto("/login");
    await page.fill(testSelectors.emailInput, config.testData.adminUser.email);
    await page.fill(
      testSelectors.passwordInput,
      config.testData.adminUser.password
    );
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/admin", { timeout: testTimeouts.medium });
  }

  static async logout(page: Page) {
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL("/login", { timeout: testTimeouts.medium });
  }

  static async ensureAuthenticated(page: Page) {
    // Check if already authenticated
    const currentUrl = page.url();
    if (currentUrl.includes("/admin")) {
      return;
    }

    await this.loginAsAdmin(page);
  }
}

/**
 * Navigation utilities
 */
export class NavigationUtils {
  static async goToUserManagement(page: Page) {
    await page.goto("/admin/users");
    await page.waitForSelector(testSelectors.userManagementPage, {
      timeout: testTimeouts.medium,
    });
  }

  static async waitForPageLoad(page: Page) {
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(testSelectors.userManagementPage);
  }
}

/**
 * User management utilities
 */
export class UserUtils {
  static async createUser(
    page: Page,
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role?: string;
    }
  ) {
    await page.click(testSelectors.createUserButton);
    await page.waitForSelector(testSelectors.userDialog);

    await page.fill(testSelectors.firstNameInput, userData.firstName);
    await page.fill(testSelectors.lastNameInput, userData.lastName);
    await page.fill(testSelectors.emailInput, userData.email);
    await page.fill(testSelectors.passwordInput, userData.password);

    if (userData.role) {
      await page.click(testSelectors.roleSelect);
      await page.click(`[data-testid="role-option-${userData.role}"]`);
    }

    await page.click('[data-testid="save-user-button"]');
    await page.waitForSelector(testSelectors.userDialog, { state: "hidden" });

    // Wait for user to appear in table
    await expect(page.locator(testSelectors.userTable)).toContainText(
      userData.email
    );
  }

  static async editUser(
    page: Page,
    email: string,
    updates: {
      firstName?: string;
      lastName?: string;
      role?: string;
    }
  ) {
    const userRow = page.locator(testSelectors.userRow(email));
    await userRow.locator(testSelectors.editUserButton).click();

    await page.waitForSelector(testSelectors.userDialog);

    if (updates.firstName) {
      await page.fill(testSelectors.firstNameInput, updates.firstName);
    }

    if (updates.lastName) {
      await page.fill(testSelectors.lastNameInput, updates.lastName);
    }

    if (updates.role) {
      await page.click(testSelectors.roleSelect);
      await page.click(`[data-testid="role-option-${updates.role}"]`);
    }

    await page.click('[data-testid="save-user-button"]');
    await page.waitForSelector(testSelectors.userDialog, { state: "hidden" });
  }

  static async deleteUser(page: Page, email: string) {
    const userRow = page.locator(testSelectors.userRow(email));
    await userRow.locator(testSelectors.deleteUserButton).click();

    await page.waitForSelector(testSelectors.confirmDialog);
    await page.click('[data-testid="confirm-delete-button"]');

    // Wait for user to be removed from table
    await expect(page.locator(testSelectors.userTable)).not.toContainText(
      email
    );
  }

  static async toggleUserStatus(page: Page, email: string) {
    const userRow = page.locator(testSelectors.userRow(email));
    await userRow.locator(testSelectors.toggleStatusButton).click();

    await page.waitForSelector(testSelectors.confirmDialog);
    await page.click('[data-testid="confirm-button"]');
  }

  static async waitForUserInTable(page: Page, email: string) {
    await expect(page.locator(testSelectors.userTable)).toContainText(email, {
      timeout: testTimeouts.medium,
    });
  }

  static async verifyUserNotInTable(page: Page, email: string) {
    await expect(page.locator(testSelectors.userTable)).not.toContainText(
      email,
      {
        timeout: testTimeouts.medium,
      }
    );
  }
}

/**
 * Bulk operations utilities
 */
export class BulkUtils {
  static async selectUsers(page: Page, emails: string[]) {
    for (const email of emails) {
      await page.check(testSelectors.selectUser(email));
    }

    // Wait for bulk action bar to appear
    await page.waitForSelector(testSelectors.bulkActionBar);
    await expect(page.locator(testSelectors.bulkActionBar)).toContainText(
      `${emails.length} users selected`
    );
  }

  static async selectAllUsers(page: Page) {
    await page.check(testSelectors.selectAllUsers);
    await page.waitForSelector(testSelectors.bulkActionBar);
  }

  static async clearSelection(page: Page) {
    await page.click('[data-testid="clear-selection-button"]');
    await expect(page.locator(testSelectors.bulkActionBar)).not.toBeVisible();
  }

  static async performBulkBan(page: Page) {
    await page.click(testSelectors.bulkBanButton);
    await page.waitForSelector(testSelectors.bulkConfirmDialog);
    await page.click('[data-testid="confirm-bulk-action"]');

    // Wait for operation to complete
    await page.waitForSelector(testSelectors.bulkResultDialog, {
      timeout: testTimeouts.long,
    });
  }

  static async performBulkUnban(page: Page) {
    await page.click(testSelectors.bulkUnbanButton);
    await page.waitForSelector(testSelectors.bulkConfirmDialog);
    await page.click('[data-testid="confirm-bulk-action"]');

    await page.waitForSelector(testSelectors.bulkResultDialog, {
      timeout: testTimeouts.long,
    });
  }

  static async performBulkDelete(page: Page) {
    await page.click(testSelectors.bulkDeleteButton);
    await page.waitForSelector(testSelectors.bulkConfirmDialog);
    await page.click('[data-testid="confirm-bulk-action"]');

    await page.waitForSelector(testSelectors.bulkResultDialog, {
      timeout: testTimeouts.long,
    });
  }

  static async performBulkRoleAssignment(page: Page, role: string) {
    await page.click(testSelectors.bulkAssignRoleButton);
    await page.waitForSelector('[data-testid="bulk-role-dialog"]');

    await page.click('[data-testid="bulk-role-select"]');
    await page.click(`[data-testid="bulk-role-option-${role}"]`);

    await page.click('[data-testid="confirm-role-assignment"]');
    await page.waitForSelector(testSelectors.bulkResultDialog, {
      timeout: testTimeouts.long,
    });
  }

  static async closeBulkResultDialog(page: Page) {
    await page.click('[data-testid="close-result-dialog"]');
    await expect(
      page.locator(testSelectors.bulkResultDialog)
    ).not.toBeVisible();
  }
}

/**
 * Filter and search utilities
 */
export class FilterUtils {
  static async searchUsers(page: Page, searchTerm: string) {
    await page.fill(testSelectors.searchInput, searchTerm);
    // Wait for debounce
    await page.waitForTimeout(600);
  }

  static async filterByRole(page: Page, role: string) {
    await page.click(testSelectors.roleFilter);
    await page.click(`[data-testid="role-filter-option-${role}"]`);
  }

  static async filterByStatus(
    page: Page,
    status: "active" | "inactive" | "all"
  ) {
    await page.click(testSelectors.statusFilter);
    await page.click(`[data-testid="status-filter-option-${status}"]`);
  }

  static async clearAllFilters(page: Page) {
    await page.click(testSelectors.clearFiltersButton);
  }

  static async applyDateRangeFilter(
    page: Page,
    fromDate: string,
    toDate: string
  ) {
    await page.click(testSelectors.dateRangeFilter);
    await page.fill('[data-testid="date-from-input"]', fromDate);
    await page.fill('[data-testid="date-to-input"]', toDate);
    await page.click('[data-testid="apply-date-filter"]');
  }
}

/**
 * Pagination utilities
 */
export class PaginationUtils {
  static async goToNextPage(page: Page) {
    await page.click(testSelectors.nextPageButton);
    await page.waitForLoadState("networkidle");
  }

  static async goToPreviousPage(page: Page) {
    await page.click(testSelectors.previousPageButton);
    await page.waitForLoadState("networkidle");
  }

  static async changePageSize(page: Page, pageSize: number) {
    await page.click(testSelectors.pageSizeSelect);
    await page.click(`[data-testid="page-size-option-${pageSize}"]`);
    await page.waitForLoadState("networkidle");
  }

  static async goToPage(page: Page, pageNumber: number) {
    await page.click(`[data-testid="page-${pageNumber}"]`);
    await page.waitForLoadState("networkidle");
  }
}

/**
 * Export/Import utilities
 */
export class ExportImportUtils {
  static async exportUsers(page: Page, format: "csv" | "excel" = "csv") {
    await page.click(testSelectors.exportButton);
    await page.waitForSelector(testSelectors.exportDialog);

    await page.click(`[data-testid="export-format-${format}"]`);

    const downloadPromise = page.waitForEvent("download");
    await page.click('[data-testid="start-export-button"]');

    return await downloadPromise;
  }

  static async importUsers(page: Page, csvContent: string) {
    await page.click(testSelectors.importButton);
    await page.waitForSelector(testSelectors.importDialog);

    // Create and upload file
    await page.setInputFiles('[data-testid="file-upload"]', {
      name: "users.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    // Preview import
    await page.click('[data-testid="preview-import-button"]');
    await page.waitForSelector('[data-testid="import-preview"]');

    // Confirm import
    await page.click('[data-testid="confirm-import-button"]');
    await page.waitForSelector('[data-testid="import-result"]', {
      timeout: testTimeouts.long,
    });
  }
}

/**
 * Accessibility utilities
 */
export class AccessibilityUtils {
  static async checkKeyboardNavigation(page: Page) {
    // Start from the top of the page
    await page.keyboard.press("Tab");

    const focusedElements: string[] = [];
    let previousElement = "";

    // Tab through first 20 elements to avoid infinite loops
    for (let i = 0; i < 20; i++) {
      const focusedElement =
        (await page.locator(":focus").getAttribute("data-testid")) ||
        (await page.locator(":focus").getAttribute("aria-label")) ||
        (await page.locator(":focus").textContent()) ||
        "unknown";

      if (focusedElement === previousElement) {
        break; // Avoid infinite loop
      }

      focusedElements.push(focusedElement);
      previousElement = focusedElement;

      await page.keyboard.press("Tab");
    }

    return focusedElements;
  }

  static async checkAriaLabels(page: Page) {
    const interactiveElements = await page
      .locator("button, input, select, textarea, a[href]")
      .all();
    const missingLabels: string[] = [];

    for (const element of interactiveElements) {
      const ariaLabel = await element.getAttribute("aria-label");
      const ariaLabelledBy = await element.getAttribute("aria-labelledby");
      const textContent = await element.textContent();
      const id = await element.getAttribute("id");

      let hasLabel = false;

      if (ariaLabel || ariaLabelledBy || textContent?.trim()) {
        hasLabel = true;
      }

      // Check for associated label
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        if ((await label.count()) > 0) {
          hasLabel = true;
        }
      }

      if (!hasLabel) {
        const elementInfo =
          (await element.getAttribute("data-testid")) ||
          (await element.getAttribute("class")) ||
          "unknown element";
        missingLabels.push(elementInfo);
      }
    }

    return missingLabels;
  }

  static async checkColorContrast(page: Page) {
    // This would require additional tools like axe-core
    // For now, we'll check that status indicators have text, not just colors
    const statusElements = await page
      .locator('[data-testid^="user-status-"]')
      .all();
    const statusesWithoutText: string[] = [];

    for (const element of statusElements) {
      const textContent = await element.textContent();
      if (!textContent?.trim()) {
        const testId = await element.getAttribute("data-testid");
        statusesWithoutText.push(testId || "unknown status");
      }
    }

    return statusesWithoutText;
  }
}

/**
 * Wait utilities
 */
export class WaitUtils {
  static async waitForToast(page: Page, expectedText?: string) {
    await page.waitForSelector(testSelectors.toast, {
      timeout: testTimeouts.medium,
    });

    if (expectedText) {
      await expect(page.locator(testSelectors.toast)).toContainText(
        expectedText
      );
    }
  }

  static async waitForLoadingToComplete(page: Page) {
    // Wait for any loading spinners to disappear
    await page.waitForSelector(testSelectors.loadingSpinner, {
      state: "hidden",
      timeout: testTimeouts.medium,
    });
  }

  static async waitForTableUpdate(page: Page) {
    await page.waitForLoadState("networkidle");
    await this.waitForLoadingToComplete(page);
  }
}

/**
 * Assertion utilities
 */
export class AssertionUtils {
  static async verifyUserExists(page: Page, email: string) {
    await expect(page.locator(testSelectors.userTable)).toContainText(email);
  }

  static async verifyUserNotExists(page: Page, email: string) {
    await expect(page.locator(testSelectors.userTable)).not.toContainText(
      email
    );
  }

  static async verifyUserStatus(
    page: Page,
    email: string,
    expectedStatus: "Active" | "Inactive"
  ) {
    await expect(page.locator(testSelectors.userStatus(email))).toContainText(
      expectedStatus
    );
  }

  static async verifyUserRole(page: Page, email: string, expectedRole: string) {
    await expect(page.locator(testSelectors.userRole(email))).toContainText(
      expectedRole
    );
  }

  static async verifyBulkActionBarVisible(page: Page, expectedCount: number) {
    await expect(page.locator(testSelectors.bulkActionBar)).toBeVisible();
    await expect(page.locator(testSelectors.bulkActionBar)).toContainText(
      `${expectedCount} users selected`
    );
  }

  static async verifyBulkActionBarHidden(page: Page) {
    await expect(page.locator(testSelectors.bulkActionBar)).not.toBeVisible();
  }
}

/**
 * Test data utilities
 */
export class TestDataUtils {
  static generateRandomUser() {
    const timestamp = Date.now();
    return {
      firstName: `Test${timestamp}`,
      lastName: "User",
      email: `test.user.${timestamp}@example.com`,
      password: "TestPassword123!",
      role: "USER",
    };
  }

  static generateMultipleUsers(count: number) {
    return Array.from({ length: count }, (_, index) => ({
      firstName: `Test${index + 1}`,
      lastName: "User",
      email: `test.user.${index + 1}.${Date.now()}@example.com`,
      password: "TestPassword123!",
      role: "USER",
    }));
  }

  static generateCsvContent(
    users: Array<{
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    }>
  ) {
    const header = "first_name,last_name,email,role\n";
    const rows = users
      .map(
        (user) =>
          `${user.firstName},${user.lastName},${user.email},${user.role}`
      )
      .join("\n");

    return header + rows;
  }
}
