import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserManagementErrorCodes } from "@/types/user";
import { subject } from "@casl/ability";
import { createAbility } from "@/lib/ability";
import * as XLSX from "xlsx";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Validation schema for import data
const ImportUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role_id: z.string().uuid("Invalid role ID").optional(),
  is_active: z.boolean().optional().default(true),
  sex: z.boolean().optional(),
  birthday: z.string().optional(),
  address: z.string().max(500).optional(),
  locale: z.string().optional(),
  group_id: z.number().optional(),
  slack_webhook_url: z.string().url("Invalid webhook URL").optional(),
});

const ImportOptionsSchema = z
  .object({
    skipDuplicates: z.boolean().optional().default(false),
    updateExisting: z.boolean().optional().default(false),
    validateOnly: z.boolean().optional().default(false),
    skipInvalidRows: z.boolean().optional().default(true),
    defaultRole: z.string().optional().nullable(),
    defaultStatus: z.boolean().optional().default(true),
    sendWelcomeEmail: z.boolean().optional().default(false),
    requirePasswordReset: z.boolean().optional().default(true),
    fieldMapping: z.record(z.string()).optional().default({}),
  })
  .passthrough(); // Allow additional fields

// Helper function to parse CSV data
function parseCSV(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// Helper function to parse Excel data
function parseExcel(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// Helper function to apply field mapping
function applyFieldMapping(
  data: any[],
  mapping: Record<string, string>
): any[] {
  return data.map((row) => {
    const mappedRow: any = {};
    Object.entries(row).forEach(([key, value]) => {
      const mappedKey = mapping[key] || key;
      mappedRow[mappedKey] = value;
    });
    return mappedRow;
  });
}

// Helper function to validate and transform import data
async function validateImportData(
  data: any[],
  options: z.infer<typeof ImportOptionsSchema>
) {
  const results = {
    validRows: 0,
    invalidRows: 0,
    errors: [] as any[],
    warnings: [] as any[],
    processedData: [] as any[],
  };

  // Get existing emails for duplicate checking
  const existingEmails = new Set(
    (await prisma.user.findMany({ select: { email: true } })).map((u) =>
      u.email.toLowerCase()
    )
  );

  // Get available roles
  const roles = await prisma.role.findMany({
    select: { id: true, name: true },
  });
  const roleMap = new Map(roles.map((r) => [r.name.toLowerCase(), r.id]));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // +2 because Excel rows start at 1 and we skip header

    try {
      // Apply default values
      const processedRow = {
        ...row,
        is_active: row.is_active ?? options.defaultStatus,
        role_id: row.role_id || options.defaultRole,
      };

      // Handle role name to ID conversion
      if (processedRow.role && !processedRow.role_id) {
        const roleId = roleMap.get(processedRow.role.toLowerCase());
        if (roleId) {
          processedRow.role_id = roleId;
        } else {
          results.warnings.push({
            row: rowNumber,
            field: "role",
            message: `Unknown role "${processedRow.role}", using default`,
            value: processedRow.role,
          });
        }
      }

      // Generate password if not provided
      if (!processedRow.password) {
        processedRow.password = Math.random().toString(36).slice(-12) + "A1!";
        results.warnings.push({
          row: rowNumber,
          field: "password",
          message: "Generated temporary password",
        });
      }

      // Validate the row
      const validatedRow = ImportUserSchema.parse(processedRow);

      // Check for duplicates
      const emailLower = validatedRow.email.toLowerCase();
      if (existingEmails.has(emailLower)) {
        if (options.skipDuplicates) {
          results.warnings.push({
            row: rowNumber,
            field: "email",
            message: "Email already exists, skipping",
            value: validatedRow.email,
          });
          continue;
        } else if (!options.updateExisting) {
          results.errors.push({
            row: rowNumber,
            field: "email",
            message: "Email already exists",
            code: UserManagementErrorCodes.EMAIL_ALREADY_EXISTS,
            value: validatedRow.email,
          });
          results.invalidRows++;
          continue;
        }
      }

      results.processedData.push({
        ...validatedRow,
        rowNumber,
        isUpdate: existingEmails.has(emailLower),
      });
      results.validRows++;
    } catch (error) {
      results.invalidRows++;
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          results.errors.push({
            row: rowNumber,
            field: err.path.join("."),
            message: err.message,
            code: UserManagementErrorCodes.VALIDATION_ERROR,
            value: err.path.reduce((obj, key) => obj?.[key], row),
          });
        });
      } else {
        results.errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : "Unknown error",
          code: UserManagementErrorCodes.VALIDATION_ERROR,
        });
      }

      if (!options.skipInvalidRows) {
        break;
      }
    }
  }

  return results;
}

// Helper function to create/update users
async function processUsers(
  validatedData: any[],
  options: z.infer<typeof ImportOptionsSchema>
) {
  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [] as any[],
  };

  for (const userData of validatedData) {
    try {
      const { rowNumber, isUpdate, password, ...userFields } = userData;

      if (isUpdate && options.updateExisting) {
        // Update existing user
        const updateData: unknown = { ...userFields };
        if (password) {
          updateData.password = await bcrypt.hash(password, 12);
        }

        await prisma.user.update({
          where: { email: userFields.email },
          data: updateData,
        });
        results.updated++;
      } else if (!isUpdate) {
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.create({
          data: {
            ...userFields,
            password: hashedPassword,
          },
        });
        results.created++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      results.errors.push({
        row: userData.rowNumber,
        message:
          error instanceof Error ? error.message : "Failed to process user",
        code: UserManagementErrorCodes.DATABASE_ERROR,
      });
    }
  }

  return results;
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
            error: "Insufficient permissions to import users",
            code: UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const optionsJson = formData.get("options") as string;

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

    // Parse options
    let options;
    try {
      const parsedOptions = optionsJson ? JSON.parse(optionsJson) : {};
      console.log("Parsed options:", JSON.stringify(parsedOptions, null, 2)); // Debug log
      // Use safeParse for better error handling
      const result = ImportOptionsSchema.safeParse(parsedOptions);
      if (!result.success) {
        console.error("Validation errors:", result.error.errors);
        const errorDetails = result.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return NextResponse.json(
          {
            success: false,
            error: {
              error: `Invalid import options: ${errorDetails}`,
              code: UserManagementErrorCodes.VALIDATION_ERROR,
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }
      options = result.data;
    } catch (error) {
      console.error("JSON parsing error:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "Invalid JSON in import options",
            code: UserManagementErrorCodes.VALIDATION_ERROR,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      );
    }

    // Parse file data
    const buffer = Buffer.from(await file.arrayBuffer());
    let data: unknown[];

    try {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        data = parseCSV(buffer);
      } else {
        data = parseExcel(buffer);
      }
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

    // Apply field mapping if provided
    if (options.fieldMapping) {
      data = applyFieldMapping(data, options.fieldMapping);
    }

    // Validate data
    const validation = await validateImportData(data, options);

    // If validation only, return validation results
    if (options.validateOnly) {
      return NextResponse.json({
        success: true,
        summary: {
          totalRows: data.length,
          validRows: validation.validRows,
          invalidRows: validation.invalidRows,
          created: 0,
          updated: 0,
          skipped: 0,
          errors: validation.errors.length,
        },
        errors: validation.errors,
        warnings: validation.warnings,
        previewData: validation.processedData
          .slice(0, 5)
          .map(({ rowNumber, isUpdate, ...user }) => ({
            ...user,
            password: "[GENERATED]", // Don't expose actual passwords
          })),
      });
    }

    // Process users if validation passed
    if (validation.validRows === 0) {
      return NextResponse.json({
        success: false,
        summary: {
          totalRows: data.length,
          validRows: validation.validRows,
          invalidRows: validation.invalidRows,
          created: 0,
          updated: 0,
          skipped: 0,
          errors: validation.errors.length,
        },
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    const processResults = await processUsers(
      validation.processedData,
      options
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: data.length,
        validRows: validation.validRows,
        invalidRows: validation.invalidRows,
        created: processResults.created,
        updated: processResults.updated,
        skipped: processResults.skipped,
        errors: validation.errors.length + processResults.errors.length,
      },
      errors: [...validation.errors, ...processResults.errors],
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error("Import error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Internal server error during import";
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
