import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAbility } from "@/lib/ability";
import { Prisma } from "@prisma/client";
import { Parser } from "json2csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  GetUsersParams,
  UserManagementErrorCodes,
  User,
  ExportFormat,
  ErrorSeverity,
  EnhancedApiErrorResponse,
  EXPORT_LIMITS,
} from "@/types/user";

// Helper function to create error response
function createErrorResponse(
  error: string,
  code: UserManagementErrorCodes,
  status: number,
  details?: unknown,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): NextResponse {
  const errorResponse: EnhancedApiErrorResponse = {
    error,
    code,
    details,
    timestamp: new Date().toISOString(),
    severity,
    userMessage: error,
    technicalMessage: typeof details === "string" ? details : undefined,
  };

  return new NextResponse(JSON.stringify(errorResponse), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Helper function to transform user data for export (exclude sensitive data)
function transformUserForExport(user: any): Record<string, any> {
  const age = user.birthday
    ? Math.floor(
        (Date.now() - new Date(user.birthday).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : undefined;

  // Determine activity status
  let activity_status: "online" | "offline" | "never" = "never";
  if (user.last_login) {
    const lastLoginTime = new Date(user.last_login).getTime();
    const now = Date.now();
    const timeDiff = now - lastLoginTime;
    if (timeDiff < 5 * 60 * 1000) {
      activity_status = "online";
    } else {
      activity_status = "offline";
    }
  }

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    is_active: user.is_active,
    status: user.is_active ? "active" : "inactive",
    activity_status,
    role_name: user.role?.name || "No Role",
    role_description: user.role?.description || "",
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
    last_login: user.last_login?.toISOString() || "Never",
    last_logout: user.last_logout?.toISOString() || "",
    sex: user.sex === true ? "Male" : user.sex === false ? "Female" : "",
    birthday: user.birthday?.toISOString() || "",
    age: age || "",
    address: user.address || "",
    locale: user.locale || "",
    group_id: user.group_id || "",
    coin: user.coin?.toString() || "0",
    has_avatar: user.avatar ? "Yes" : "No",
    // Exclude sensitive fields: password, remember_token, slack_webhook_url
  };
}

// Helper function to generate CSV content using json2csv
function generateCSV(users: Record<string, any>[], fields?: string[]): string {
  if (users.length === 0) {
    return "";
  }

  try {
    const selectedFields = fields || Object.keys(users[0]);

    // Create field configuration with proper headers
    const csvFields = selectedFields.map((field) => ({
      label: field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: field,
    }));

    const parser = new Parser({
      fields: csvFields,
      delimiter: ",",
      quote: '"',
      escapedQuote: '""',
      header: true,
    });

    return parser.parse(users);
  } catch (error) {
    console.error("CSV generation error:", error);
    throw new Error("Failed to generate CSV");
  }
}

// Helper function to generate Excel content using xlsx
function generateExcel(
  users: Record<string, any>[],
  fields?: string[]
): Buffer {
  if (users.length === 0) {
    // Create empty workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["No data available"]]);
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  }

  try {
    const selectedFields = fields || Object.keys(users[0]);

    // Filter data to only include selected fields
    const filteredData = users.map((user) => {
      const filtered: Record<string, any> = {};
      selectedFields.forEach((field) => {
        filtered[
          field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        ] = user[field] || "";
      });
      return filtered;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredData);

    // Auto-size columns
    const colWidths = Object.keys(filteredData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15), // Minimum width of 15 characters
    }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Users");

    return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.error("Excel generation error:", error);
    throw new Error("Failed to generate Excel file");
  }
}

// Helper function to generate PDF content using jsPDF
function generatePDF(users: Record<string, any>[], fields?: string[]): Buffer {
  if (users.length === 0) {
    const doc = new jsPDF();
    doc.text("No data available", 20, 20);
    return Buffer.from(doc.output("arraybuffer"));
  }

  try {
    const selectedFields = fields || Object.keys(users[0]);

    // Create PDF document
    const doc = new jsPDF({
      orientation: selectedFields.length > 6 ? "landscape" : "portrait",
      unit: "mm",
      format: "a4",
    });

    // Add title
    doc.setFontSize(16);
    doc.text("User Export Report", 20, 20);

    // Add export date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Prepare table data
    const headers = selectedFields.map((field) =>
      field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );

    const rows = users.map((user) =>
      selectedFields.map((field) => {
        const value = user[field];
        // Truncate long values for PDF display
        if (typeof value === "string" && value.length > 30) {
          return value.substring(0, 27) + "...";
        }
        return value || "";
      })
    );

    // Add table using autoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 40, right: 10, bottom: 10, left: 10 },
      tableWidth: "auto",
      columnStyles: selectedFields.reduce((acc, field, index) => {
        acc[index] = { cellWidth: "auto" };
        return acc;
      }, {} as any),
    });

    return Buffer.from(doc.output("arraybuffer"));
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error("Failed to generate PDF");
  }
}

// Helper function to build where clause for filtering
function buildWhereClause(params: GetUsersParams): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  const conditions: Prisma.UserWhereInput[] = [];

  // Search across multiple fields
  if (params.search && params.search.trim()) {
    const searchTerm = params.search.trim();
    conditions.push({
      OR: [
        {
          first_name: {
            contains: searchTerm,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          last_name: {
            contains: searchTerm,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          email: { contains: searchTerm, mode: Prisma.QueryMode.insensitive },
        },
      ],
    });
  }

  // Role filter - handle both ID and name
  if (params.role && params.role !== "all") {
    // Check if it's a UUID (role ID) or role name
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        params.role
      );

    if (isUUID) {
      // Use role ID directly
      conditions.push({ role_id: params.role });
    } else {
      // Convert role name to uppercase and find by name
      conditions.push({
        role: {
          name: params.role.toUpperCase() as any,
        },
      });
    }
  }

  // Status filter
  if (params.status && params.status !== "all") {
    conditions.push({ is_active: params.status === "active" });
  }

  // Creation date range filter
  if (params.dateFrom || params.dateTo) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (params.dateFrom) {
      dateFilter.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      const endDate = new Date(params.dateTo);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }
    conditions.push({ created_at: dateFilter });
  }

  // Activity date range filter
  if (params.activityDateFrom || params.activityDateTo) {
    const activityFilter: Prisma.DateTimeNullableFilter = {};
    if (params.activityDateFrom) {
      activityFilter.gte = new Date(params.activityDateFrom);
    }
    if (params.activityDateTo) {
      const endDate = new Date(params.activityDateTo);
      endDate.setHours(23, 59, 59, 999);
      activityFilter.lte = endDate;
    }
    conditions.push({ last_login: activityFilter });
  }

  // Avatar filter
  if (params.hasAvatar !== undefined) {
    if (params.hasAvatar) {
      conditions.push({ avatar: { not: null } });
    } else {
      conditions.push({ avatar: null });
    }
  }

  // Locale filter
  if (params.locale && params.locale !== "all") {
    conditions.push({ locale: params.locale });
  }

  // Group filter
  if (params.group_id !== undefined) {
    conditions.push({ group_id: params.group_id });
  }

  // Activity status filter
  if (params.activity_status) {
    switch (params.activity_status) {
      case "never":
        conditions.push({ last_login: null });
        break;
      case "online":
        conditions.push({
          last_login: {
            gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        });
        break;
      case "offline":
        conditions.push({
          AND: [
            { last_login: { not: null } },
            {
              last_login: {
                lt: new Date(Date.now() - 5 * 60 * 1000),
              },
            },
          ],
        });
        break;
    }
  }

  // Combine all conditions
  if (conditions.length > 0) {
    where.AND = conditions;
  }

  return where;
}

// GET /api/admin/users/export - Enhanced export with multiple formats
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(
        "Authentication required",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        401,
        "No valid session found",
        ErrorSeverity.HIGH
      );
    }

    const ability = createAbility(session);

    // Check if user has permission to export users
    if (ability.cannot("read", "User")) {
      return createErrorResponse(
        "Insufficient permissions to export users",
        UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        403,
        "User lacks 'read' permission for 'User' resource",
        ErrorSeverity.HIGH
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") as ExportFormat) || "csv";
    const fieldsParam = searchParams.get("fields");
    const fields = fieldsParam ? fieldsParam.split(",") : undefined;

    // Parse filter parameters
    const params: GetUsersParams = {
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      status:
        (searchParams.get("status") as "active" | "inactive" | "all") ||
        undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      activityDateFrom: searchParams.get("activityDateFrom") || undefined,
      activityDateTo: searchParams.get("activityDateTo") || undefined,
      hasAvatar:
        searchParams.get("hasAvatar") === "true"
          ? true
          : searchParams.get("hasAvatar") === "false"
          ? false
          : undefined,
      locale: searchParams.get("locale") || undefined,
      group_id: searchParams.get("group_id")
        ? parseInt(searchParams.get("group_id")!)
        : undefined,
      activity_status:
        (searchParams.get("activity_status") as
          | "online"
          | "offline"
          | "never") || undefined,
    };

    // Build where clause
    const where = buildWhereClause(params);

    // Check total count first to prevent large exports
    const totalCount = await prisma.user.count({ where });

    if (totalCount > EXPORT_LIMITS.MAX_RECORDS) {
      return createErrorResponse(
        `Export limit exceeded. Maximum ${EXPORT_LIMITS.MAX_RECORDS} records allowed, found ${totalCount}`,
        UserManagementErrorCodes.EXPORT_LIMIT_EXCEEDED,
        400,
        { totalCount, maxAllowed: EXPORT_LIMITS.MAX_RECORDS },
        ErrorSeverity.MEDIUM
      );
    }

    // Fetch users with all necessary relations
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        last_login: true,
        last_logout: true,
        avatar: true,
        sex: true,
        birthday: true,
        address: true,
        coin: true,
        locale: true,
        group_id: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Transform users for export
    const transformedUsers = users.map(transformUserForExport);

    // Generate export content based on format
    let content: string | Buffer;
    let contentType: string;
    let filename: string;

    const timestamp = new Date().toISOString().split("T")[0];

    switch (format) {
      case "csv":
        content = generateCSV(transformedUsers, fields);
        contentType = "text/csv";
        filename = `users-export-${timestamp}.csv`;
        break;

      case "excel":
        content = generateExcel(transformedUsers, fields);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        filename = `users-export-${timestamp}.xlsx`;
        break;

      case "pdf":
        content = generatePDF(transformedUsers, fields);
        contentType = "application/pdf";
        filename = `users-export-${timestamp}.pdf`;
        break;

      case "json":
        content = JSON.stringify(
          {
            data: transformedUsers,
            metadata: {
              totalRecords: totalCount,
              exportedRecords: transformedUsers.length,
              exportDate: new Date().toISOString(),
              filters: params,
              fields: fields || Object.keys(transformedUsers[0] || {}),
            },
          },
          null,
          2
        );
        contentType = "application/json";
        filename = `users-export-${timestamp}.json`;
        break;

      default:
        return createErrorResponse(
          "Invalid export format",
          UserManagementErrorCodes.INVALID_EXPORT_FORMAT,
          400,
          `Supported formats: csv, excel, pdf, json. Received: ${format}`,
          ErrorSeverity.MEDIUM
        );
    }

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    // Add performance metrics
    const executionTime = Date.now() - startTime;
    headers.set("X-Export-Time", executionTime.toString());
    headers.set("X-Export-Records", transformedUsers.length.toString());

    return new NextResponse(content, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error during export:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse(
        "Database query failed during export",
        UserManagementErrorCodes.DATABASE_ERROR,
        500,
        `Prisma error: ${error.code} - ${error.message}`,
        ErrorSeverity.HIGH
      );
    }

    return createErrorResponse(
      "Failed to export users",
      UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      ErrorSeverity.CRITICAL
    );
  }
}
