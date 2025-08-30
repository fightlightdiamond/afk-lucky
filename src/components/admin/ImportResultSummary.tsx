"use client";

import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Users,
  UserPlus,
  UserX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportResponse } from "@/types/user";
import { formatImportErrors, formatImportWarnings } from "@/hooks/useImport";

interface ImportResultSummaryProps {
  result: ImportResponse;
}

export function ImportResultSummary({ result }: ImportResultSummaryProps) {
  const { summary, errors, warnings } = result;
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  const getSuccessRate = () => {
    if (summary.totalRows === 0) return 0;
    return Math.round(
      ((summary.created + summary.updated) / summary.totalRows) * 100
    );
  };

  const successRate = getSuccessRate();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{summary.totalRows}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Rows</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {summary.created}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Created</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {summary.updated}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Updated</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-red-600" />
              <div className="text-2xl font-bold text-red-600">
                {summary.skipped + summary.invalidRows}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Import Success Rate
            <Badge
              variant={
                successRate >= 90
                  ? "default"
                  : successRate >= 70
                  ? "secondary"
                  : "destructive"
              }
            >
              {successRate}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                successRate >= 90
                  ? "bg-green-600"
                  : successRate >= 70
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
              style={{ width: `${successRate}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {summary.created + summary.updated} of {summary.totalRows} rows
            processed successfully
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Successfully Created</span>
              </div>
              <Badge variant="default">{summary.created}</Badge>
            </div>

            {summary.updated > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Successfully Updated</span>
                </div>
                <Badge variant="default">{summary.updated}</Badge>
              </div>
            )}

            {summary.skipped > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Skipped (Duplicates)</span>
                </div>
                <Badge variant="secondary">{summary.skipped}</Badge>
              </div>
            )}

            {summary.invalidRows > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Invalid Rows</span>
                </div>
                <Badge variant="destructive">{summary.invalidRows}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Errors and Warnings */}
      {(hasErrors || hasWarnings) && (
        <Card>
          <CardHeader>
            <CardTitle>Issues Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={hasErrors ? "errors" : "warnings"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="errors" className="relative">
                  Errors ({errors.length})
                  {hasErrors && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="warnings" className="relative">
                  Warnings ({warnings.length})
                  {hasWarnings && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="errors" className="space-y-2">
                {!hasErrors ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No errors found
                  </div>
                ) : (
                  <ScrollArea className="h-[200px] w-full">
                    <div className="space-y-2">
                      {formatImportErrors(errors).map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="warnings" className="space-y-2">
                {!hasWarnings ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No warnings found
                  </div>
                ) : (
                  <ScrollArea className="h-[200px] w-full">
                    <div className="space-y-2">
                      {formatImportWarnings(warnings).map((warning, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {!hasErrors && summary.created + summary.updated > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Import completed successfully! {summary.created} users created
            {summary.updated > 0 && ` and ${summary.updated} users updated`}.
            {hasWarnings &&
              ` ${warnings.length} warnings were found but did not prevent the import.`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
