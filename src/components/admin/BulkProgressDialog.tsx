"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { BulkOperationProgress } from "@/types/user";

interface BulkProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: BulkOperationProgress | null;
  onCancel?: () => void;
  canCancel?: boolean;
}

export function BulkProgressDialog({
  open,
  onOpenChange,
  progress,
  onCancel,
  canCancel = false,
}: BulkProgressDialogProps) {
  if (!progress) {
    return null;
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case "pending":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case "pending":
        return "secondary";
      case "in_progress":
        return "default";
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "cancelled":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const duration = Math.round((end - start) / 1000);

    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    } else {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const canClose =
    progress.status === "completed" ||
    progress.status === "failed" ||
    progress.status === "cancelled";

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-[500px]" hideCloseButton={!canClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Bulk Operation Progress
          </DialogTitle>
          <DialogDescription>
            {progress.operation
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
            operation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge variant={getStatusColor() as any} className="capitalize">
              {getStatusText()}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Started at {formatTime(progress.startedAt)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {progress.processed} of {progress.total} processed
              </span>
              {progress.estimatedCompletion &&
                progress.status === "in_progress" && (
                  <span>ETA: {formatTime(progress.estimatedCompletion)}</span>
                )}
            </div>
          </div>

          {/* Duration */}
          <div className="text-sm text-muted-foreground">
            Duration: {formatDuration(progress.startedAt)}
          </div>

          {/* Results Summary (if completed) */}
          {progress.result && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="font-medium text-sm">Operation Results</div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{progress.result.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Success:</span>
                  <span className="font-medium text-green-600">
                    {progress.result.success}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-destructive">Failed:</span>
                  <span className="font-medium text-destructive">
                    {progress.result.failed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Skipped:</span>
                  <span className="font-medium text-orange-600">
                    {progress.result.skipped}
                  </span>
                </div>
              </div>

              {/* Errors */}
              {progress.result.errors && progress.result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">
                    Errors:
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {progress.result.errors.slice(0, 5).map((error, index) => (
                      <div
                        key={index}
                        className="text-xs text-destructive bg-destructive/10 p-2 rounded"
                      >
                        {error.userEmail && (
                          <div className="font-medium">{error.userEmail}</div>
                        )}
                        <div>{error.error}</div>
                      </div>
                    ))}
                    {progress.result.errors.length > 5 && (
                      <div className="text-xs text-muted-foreground italic">
                        ... and {progress.result.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {canCancel && progress.status === "in_progress" && onCancel && (
              <Button variant="outline" onClick={onCancel} size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}

            {canClose && (
              <Button onClick={() => onOpenChange(false)} size="sm">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
