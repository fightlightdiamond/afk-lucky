"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Copy,
} from "lucide-react";
import { BulkOperationResult, BulkOperationType } from "@/types/user";
import { toast } from "sonner";

interface BulkResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: BulkOperationResult | null;
  operation: BulkOperationType | null;
  onRetry?: () => void;
  onDownloadReport?: () => void;
}

export function BulkResultDialog({
  open,
  onOpenChange,
  result,
  operation,
  onRetry,
  onDownloadReport,
}: BulkResultDialogProps) {
  if (!result || !operation) {
    return null;
  }

  const isSuccess = result.failed === 0;
  const isPartialSuccess = result.success > 0 && result.failed > 0;
  const isFailure = result.success === 0 && result.failed > 0;

  const getStatusIcon = () => {
    if (isSuccess) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (isPartialSuccess)
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  const getStatusTitle = () => {
    if (isSuccess) return "Operation Completed Successfully";
    if (isPartialSuccess) return "Operation Partially Completed";
    return "Operation Failed";
  };

  const getStatusDescription = () => {
    const operationName = operation
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    if (isSuccess) {
      return `All ${
        result.total
      } users were successfully processed for ${operationName.toLowerCase()}.`;
    }
    if (isPartialSuccess) {
      return `${result.success} of ${result.total} users were successfully processed. ${result.failed} operations failed.`;
    }
    return `Failed to process ${result.failed} of ${
      result.total
    } users for ${operationName.toLowerCase()}.`;
  };

  const copyErrorsToClipboard = async () => {
    if (!result.errors || result.errors.length === 0) return;

    const errorText = result.errors
      .map((error) => `${error.userEmail || error.userId}: ${error.error}`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(errorText);
      toast.success("Errors copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy errors to clipboard");
    }
  };

  const formatDuration = () => {
    if (!result.duration) return "Unknown";

    const seconds = Math.round(result.duration / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusTitle()}
          </DialogTitle>
          <DialogDescription>{getStatusDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{result.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {result.success}
              </div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-2xl font-bold text-destructive">
                {result.failed}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {result.skipped}
              </div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>

          {/* Operation Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Operation:</span>
              <Badge variant="outline">
                {operation
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="text-sm font-medium">{formatDuration()}</span>
            </div>
            {result.startedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Started:</span>
                <span className="text-sm font-medium">
                  {new Date(result.startedAt).toLocaleString()}
                </span>
              </div>
            )}
            {result.completedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Completed:
                </span>
                <span className="text-sm font-medium">
                  {new Date(result.completedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Errors Section */}
          {result.errors && result.errors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-destructive">
                  Errors ({result.errors.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyErrorsToClipboard}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>

              <ScrollArea className="h-48 w-full border rounded-md">
                <div className="p-4 space-y-3">
                  {result.errors.map((error, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {error.userEmail && (
                            <div className="text-sm font-medium truncate">
                              {error.userName || error.userEmail}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {error.error}
                          </div>
                          {error.code && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {error.code}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {index < result.errors.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Warnings Section */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-orange-600">
                Warnings ({result.warnings.length})
              </h4>

              <ScrollArea className="h-32 w-full border rounded-md">
                <div className="p-4 space-y-2">
                  {result.warnings.map((warning, index) => (
                    <div key={index} className="text-sm">
                      {warning.userEmail && (
                        <span className="font-medium">
                          {warning.userEmail}:{" "}
                        </span>
                      )}
                      <span className="text-orange-600">{warning.warning}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Export URL */}
          {result.exportUrl && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Export Ready</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your export file is ready for download.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open(result.exportUrl, "_blank")}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            {onDownloadReport && (
              <Button variant="outline" onClick={onDownloadReport}>
                <Download className="h-4 w-4 mr-1" />
                Download Report
              </Button>
            )}

            {onRetry && result.failed > 0 && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry Failed
              </Button>
            )}
          </div>

          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
