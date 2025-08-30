import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserManagementErrorCodes } from "@/types/user";
import { subject } from "@casl/ability";
import { createAbility } from "@/lib/ability";
import * as XLSX from "xlsx";

// Helper function to parse file data
function parseFile(buffer: Buffer, filename: string): any[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// Helper function to suggest field mapping
function suggestFieldMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const fieldMappings = {
    // Email variations
    email: ["email", "e-mail", "email_address", "emailaddress", "mail"],
    // Name variations
    first_name: ["first_name", "firstname", "first", "fname", "given_name"],
    last_name: [
      "last_name",
      "lastname",
      "last",
      "lname",
      "surname",
      "family_name",
    ],
    // Other common fields
    password: ["password", "pwd", "pass"],
    role: ["role", "user_role", "role_name", "user_type"],
    is_active: ["is_active", "active", "status", "enabled"],
    birthday: ["birthday", "birth_date", "date_of_birth", "dob"],
    address: ["address", "location", "street_address"],
    locale: ["locale", "language", "lang"],
    sex: ["sex", "gender"],
  };

  headers.forEach((header) => {
    const normalizedHeader = header.toLowerCase().trim();

    for (const [targetField, variations] of Object.entries(fieldMappings)) {
      if (variations.includes(normalizedHeader)) {
        mapping[header] = targetField;
        break;
      }
    }
  });

  return mapping;
}

// Helper function to validate preview data
function validatePreviewData(data: any[], maxRows: number = 10) {
  const errors: any[] = [];
  const warnings: any[] = [];
  let validRows = 0;
  let invalidRows = 0;

  const previewData = data.slice(0, maxRows);

  previewData.forEach((row, index) => {
    const rowNumber = index + 2; // +2 for Excel row numbering (1-based + header)
    let hasErrors = false;

    // Check required fields
    if (!row.email || typeof row.email !== "string") {
      errors.push({
        row: rowNumber,
        field: "email",
        message: "Email is required",
        code: UserManagementErrorCodes.REQUIRED_FIELD_MISSING,
        value: row.email,
      });
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({
        row: rowNumber,
        field: "email",
        message: "Invalid email format",
        code: UserManagementErrorCodes.INVALID_EMAIL_FORMAT,
        value: row.email,
      });
      hasErrors = true;
    }

    if (!row.first_name || typeof row.first_name !== "string") {
      errors.push({
        row: rowNumber,
        field: "first_name",
        message: "First name is required",
        code: UserManagementErrorCodes.REQUIRED_FIELD_MISSING,
        value: row.first_name,
      });
      hasErrors = true;
    }

    if (!row.last_name || typeof row.last_name !== "string") {
      errors.push({
        row: rowNumber,
        field: "last_name",
        message: "Last name is required",
        code: UserManagementErrorCodes.REQUIRED_FIELD_MISSING,
        value: row.last_name,
      });
      hasErrors = true;
    }

    // Check optional fields
    if (row.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(row.birthday)) {
      warnings.push({
        row: rowNumber,
        field: "birthday",
        message: "Birthday should be in YYYY-MM-DD format",
        value: row.birthday,
      });
    }

    if (
      row.slack_webhook_url &&
      !row.slack_webhook_url.startsWith("https://hooks.slack.com/")
    ) {
      warnings.push({
        row: rowNumber,
        field: "slack_webhook_url",
        message: "Invalid Slack webhook URL format",
        value: row.slack_webhook_url,
      });
    }

    if (hasErrors) {
      invalidRows++;
    } else {
      validRows++;
    }
  });

  return {
    validRows: validRows + Math.max(0, data.length - maxRows), // Assume remaining rows are valid for count
    invalidRows,
    errors,
    warnings,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "Authentication required",
            code: UserManagementErrorCodes.UNAUTHORIZED,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }

    // Check permissions
    const ability = createAbility(session);
    if (!ability.can("create", subject("User", {}))) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "Insufficient permissions to preview import",
            code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fieldMappingJson = formData.get("fieldMapping") as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "No file provided",
            code: UserManagementErrorCodes.VALIDATION_ERROR,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "File size exceeds 10MB limit",
            code: UserManagementErrorCodes.FILE_TOO_LARGE,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "Unsupported file format. Please use CSV or Excel files.",
            code: UserManagementErrorCodes.UNSUPPORTED_FILE_FORMAT,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Parse field mapping if provided
    let fieldMapping: Record<string, string> = {};
    if (fieldMappingJson) {
      try {
        fieldMapping = JSON.parse(fieldMappingJson);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              error: "Invalid field mapping JSON",
              code: UserManagementErrorCodes.VALIDATION_ERROR,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }
    }

    // Parse file data
    const buffer = Buffer.from(await file.arrayBuffer());
    let data: any[];

    try {
      data = parseFile(buffer, file.name);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "Failed to parse file",
            code: UserManagementErrorCodes.IMPORT_FILE_INVALID,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "File contains no data",
            code: UserManagementErrorCodes.IMPORT_DATA_INVALID,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Get headers from first row
    const headers = Object.keys(data[0]);

    // Apply field mapping if provided
    let mappedData = data;
    if (Object.keys(fieldMapping).length > 0) {
      mappedData = data.map((row) => {
        const mappedRow: any = {};
        Object.entries(row).forEach(([key, value]) => {
          const mappedKey = fieldMapping[key] || key;
          mappedRow[mappedKey] = value;
        });
        return mappedRow;
      });
    }

    // Suggest field mapping if not provided
    const suggestedMapping =
      Object.keys(fieldMapping).length === 0
        ? suggestFieldMapping(headers)
        : fieldMapping;

    // Validate preview data
    const validation = validatePreviewData(mappedData, 10);

    // Prepare preview response
    const previewRows = mappedData.slice(0, 10).map((row, index) => ({
      ...row,
      _rowNumber: index + 2, // Excel row numbering
    }));

    return NextResponse.json({
      success: true,
      preview: {
        headers,
        rows: previewRows,
        totalRows: data.length,
        previewRows: previewRows.length,
      },
      validation,
      suggestedMapping,
    });
  } catch (error) {
    console.error("Import preview error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Internal server error during preview";
    return NextResponse.json(
      {
        success: false,
        error: {
          error: errorMessage,
          code: UserManagementErrorCodes.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
