"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImportError, ImportWarning } from "@/types/user";

interface ImportPreviewTableProps {
  headers: string[];
  rows: Record<string, unknown>[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

export function ImportPreviewTable({
  headers,
  rows,
  errors,
  warnings,
}: ImportPreviewTableProps) {
  const [selectedTab, setSelectedTab] = useState("preview");

  // Create a map of row numbers to errors and warnings
  const errorsByRow = new Map<number, ImportError[]>();
  const warningsByRow = new Map<number, ImportWarning[]>();

  errors.forEach((error) => {
    if (!errorsByRow.has(error.row)) {
      errorsByRow.set(error.row, []);
    }
    errorsByRow.get(error.row)!.push(error);
  });

  warnings.forEach((warning) => {
    if (!warningsByRow.has(warning.row)) {
      warningsByRow.set(warning.row, []);
    }
    warningsByRow.get(warning.row)!.push(warning);
  });

  const getRowStatus = (rowNumber: number) => {
    if (errorsByRow.has(rowNumber)) return "error";
    if (warningsByRow.has(rowNumber)) return "warning";
    return "valid";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "warning":
        return <Badge variant="secondary">Warning</Badge>;
      case "valid":
        return <Badge variant="default">Valid</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">
              Data Preview ({rows.length} rows)
            </TabsTrigger>
            <TabsTrigger value="errors" className="relative">
              Errors ({errors.length})
              {errors.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="warnings" className="relative">
              Warnings ({warnings.length})
              {warnings.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Row</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    {headers.map((header) => (
                      <TableHead key={header} className="min-w-[120px]">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => {
                    const rowNumber = row._rowNumber || index + 2;
                    const status = getRowStatus(rowNumber);

                    return (
                      <TableRow
                        key={index}
                        className={
                          status === "error"
                            ? "bg-red-50 hover:bg-red-100"
                            : status === "warning"
                            ? "bg-yellow-50 hover:bg-yellow-100"
                            : ""
                        }
                      >
                        <TableCell className="font-medium">
                          {rowNumber}
                        </TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                        {headers.map((header) => (
                          <TableCell
                            key={header}
                            className="max-w-[200px] truncate"
                          >
                            {row[header]?.toString() || ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            {errors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No validation errors found
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Row {error.row}</strong>
                        {error.field && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({error.field})
                          </span>
                        )}
                        : {error.message}
                        {error.value && (
                          <div className="mt-1 text-sm">
                            Value:{" "}
                            <code className="bg-muted px-1 rounded">
                              {String(error.value)}
                            </code>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4">
            {warnings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No warnings found
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {warnings.map((warning, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Row {warning.row}</strong>
                        {warning.field && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({warning.field})
                          </span>
                        )}
                        : {warning.message}
                        {warning.value && (
                          <div className="mt-1 text-sm">
                            Value:{" "}
                            <code className="bg-muted px-1 rounded">
                              {String(warning.value)}
                            </code>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
