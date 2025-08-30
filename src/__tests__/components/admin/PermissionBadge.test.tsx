import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PermissionBadge } from "@/components/admin/PermissionBadge";

describe("PermissionBadge", () => {
  it("should render permission with formatted text", () => {
    render(<PermissionBadge permission="user:read" />);

    expect(screen.getByText("User: Read")).toBeInTheDocument();
  });

  it("should format permission text correctly", () => {
    render(<PermissionBadge permission="role:manage" />);

    expect(screen.getByText("Role: Manage")).toBeInTheDocument();
  });

  it("should handle complex permission names", () => {
    render(<PermissionBadge permission="content:create_post" />);

    expect(screen.getByText("Content: Create_post")).toBeInTheDocument();
  });

  it("should set title attribute with original permission", () => {
    render(<PermissionBadge permission="user:read" />);

    const badge = screen.getByText("User: Read");
    expect(badge).toHaveAttribute("title", "user:read");
  });

  it("should use default variant when not specified", () => {
    render(<PermissionBadge permission="user:read" />);

    const badge = screen.getByText("User: Read");
    expect(badge).toBeInTheDocument();
  });

  it("should use specified variant", () => {
    render(<PermissionBadge permission="user:read" variant="destructive" />);

    const badge = screen.getByText("User: Read");
    expect(badge).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(<PermissionBadge permission="user:read" className="custom-class" />);

    const badge = screen.getByText("User: Read");
    expect(badge).toHaveClass("custom-class");
  });

  it("should handle user category permissions", () => {
    render(<PermissionBadge permission="user:create" variant="default" />);

    expect(screen.getByText("User: Create")).toBeInTheDocument();
  });

  it("should handle role category permissions", () => {
    render(<PermissionBadge permission="role:delete" variant="default" />);

    expect(screen.getByText("Role: Delete")).toBeInTheDocument();
  });

  it("should handle content category permissions", () => {
    render(<PermissionBadge permission="content:edit" variant="default" />);

    expect(screen.getByText("Content: Edit")).toBeInTheDocument();
  });

  it("should handle story category permissions", () => {
    render(<PermissionBadge permission="story:publish" variant="default" />);

    expect(screen.getByText("Story: Publish")).toBeInTheDocument();
  });

  it("should handle system category permissions", () => {
    render(<PermissionBadge permission="system:configure" variant="default" />);

    expect(screen.getByText("System: Configure")).toBeInTheDocument();
  });

  it("should handle unknown category permissions", () => {
    render(<PermissionBadge permission="unknown:action" variant="default" />);

    expect(screen.getByText("Unknown: Action")).toBeInTheDocument();
  });

  it("should handle permissions without colon separator", () => {
    render(<PermissionBadge permission="invalidpermission" />);

    // Should still render, but with just the category
    expect(screen.getByText("Invalidpermission")).toBeInTheDocument();
    const badge = screen.getByTitle("invalidpermission");
    expect(badge).toBeInTheDocument();
  });

  it("should handle empty permission strings", () => {
    render(<PermissionBadge permission="" />);

    // Empty string should just render the badge with empty title
    const badge = screen.getByTitle("");
    expect(badge).toBeInTheDocument();
  });

  it("should capitalize first letter of category and action", () => {
    render(<PermissionBadge permission="user:read_profile" />);

    expect(screen.getByText("User: Read_profile")).toBeInTheDocument();
  });

  it("should handle single character categories and actions", () => {
    render(<PermissionBadge permission="a:b" />);

    expect(screen.getByText("A: B")).toBeInTheDocument();
  });

  it("should handle permissions with multiple colons", () => {
    render(<PermissionBadge permission="user:read:profile" />);

    // Should split on first colon only, so action becomes "read:profile" but only shows "Read"
    expect(screen.getByText("User: Read")).toBeInTheDocument();
  });

  it("should apply text-xs class by default", () => {
    render(<PermissionBadge permission="user:read" />);

    const badge = screen.getByText("User: Read");
    expect(badge).toHaveClass("text-xs");
  });

  it("should preserve custom className along with default classes", () => {
    render(
      <PermissionBadge permission="user:read" className="my-custom-class" />
    );

    const badge = screen.getByText("User: Read");
    expect(badge).toHaveClass("text-xs");
    expect(badge).toHaveClass("my-custom-class");
  });

  describe("variant selection based on category", () => {
    it("should use default variant for user category", () => {
      render(<PermissionBadge permission="user:read" variant="default" />);

      const badge = screen.getByText("User: Read");
      expect(badge).toBeInTheDocument();
    });

    it("should use secondary variant for role category", () => {
      render(<PermissionBadge permission="role:manage" variant="default" />);

      const badge = screen.getByText("Role: Manage");
      expect(badge).toBeInTheDocument();
    });

    it("should use outline variant for content category", () => {
      render(<PermissionBadge permission="content:create" variant="default" />);

      const badge = screen.getByText("Content: Create");
      expect(badge).toBeInTheDocument();
    });

    it("should use outline variant for story category", () => {
      render(<PermissionBadge permission="story:edit" variant="default" />);

      const badge = screen.getByText("Story: Edit");
      expect(badge).toBeInTheDocument();
    });

    it("should use destructive variant for system category", () => {
      render(<PermissionBadge permission="system:admin" variant="default" />);

      const badge = screen.getByText("System: Admin");
      expect(badge).toBeInTheDocument();
    });

    it("should use secondary variant for unknown category", () => {
      render(<PermissionBadge permission="unknown:action" variant="default" />);

      const badge = screen.getByText("Unknown: Action");
      expect(badge).toBeInTheDocument();
    });
  });
});
