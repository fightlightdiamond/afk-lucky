"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  X,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useImportPreview,
  useImportValidation,
  useImportUsers,
  validateImportFile,
  downloadSampleCSV,
  createDefaultImportOptions,
} from "@/hooks/useImport";
import { ImportOptions, Role } from "@/types/user";
import { ImportOptionsForm } from "./ImportOptionsForm";
import { ImportPreviewTable } from "./ImportPreviewTable";
import { ImportResultSummary } from "./ImportResultSummary";
import { FieldMappingForm } from "./FieldMappingForm";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  roles: Role[];
}

type ImportStep = "upload" | "preview" | "options" | "confirm" | "result";

export function ImportDialog({ open, onClose, roles }: ImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>(
    createDefaultImportOptions()
  );
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewMutation = useImportPreview();
  const validationMutation = useImportValidation();
  const importMutation = useImportUsers();

  const handleClose = useCallback(() => {
    setCurrentStep("upload");
    setSelectedFile(null);
    setImportOptions(createDefaultImportOptions());
    setFieldMapping({});
    previewMutation.reset();
    validationMutation.reset();
    importMutation.reset();
    onClose();
  }, [onClose, previewMutation, validationMutation, importMutation]);

  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = validateImportFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setSelectedFile(file);
      setCurrentStep("preview");

      // Start preview
      previewMutation.mutate({ file });
    },
    [previewMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handlePreviewNext = useCallback(() => {
    if (previewMutation.data?.suggestedMapping) {
      setFieldMapping(previewMutation.data.suggestedMapping);
    }
    setCurrentStep("options");
  }, [previewMutation.data]);

  const handleOptionsNext = useCallback(() => {
    setCurrentStep("confirm");

    // Run validation with final options
    if (selectedFile) {
      validationMutation.mutate({
        file: selectedFile,
        options: {
          ...importOptions,
          fieldMapping,
          validateOnly: true,
        },
      });
    }
  }, [selectedFile, importOptions, fieldMapping, validationMutation]);

  const handleConfirmImport = useCallback(() => {
    if (selectedFile) {
      setCurrentStep("result");
      importMutation.mutate({
        file: selectedFile,
        options: {
          ...importOptions,
          fieldMapping,
        },
      });
    }
  }, [selectedFile, importOptions, fieldMapping, importMutation]);

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload Import File</h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your CSV or Excel file here, or click to browse
        </p>
        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Choose File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">File Requirements:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Supported formats: CSV, Excel (.xls, .xlsx)</li>
          <li>• Maximum file size: 10MB</li>
          <li>• Maximum records: 5,000</li>
          <li>• Required columns: email, first_name, last_name</li>
        </ul>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Need a template?</h4>
          <p className="text-sm text-muted-foreground">
            Download a sample CSV file with the correct format
          </p>
        </div>
        <Button variant="outline" onClick={downloadSampleCSV}>
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    if (previewMutation.isPending) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Analyzing file...</p>
          </div>
        </div>
      );
    }

    if (previewMutation.error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{previewMutation.error.message}</AlertDescription>
        </Alert>
      );
    }

    if (!previewMutation.data) {
      return null;
    }

    const { preview, validation } = previewMutation.data;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{preview.totalRows}</div>
              <p className="text-xs text-muted-foreground">Total Rows</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {validation.validRows}
              </div>
              <p className="text-xs text-muted-foreground">Valid Rows</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {validation.invalidRows}
              </div>
              <p className="text-xs text-muted-foreground">Invalid Rows</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {validation.warnings.length}
              </div>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </CardContent>
          </Card>
        </div>

        {validation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Found {validation.errors.length} validation errors. Please fix
              these issues before importing.
            </AlertDescription>
          </Alert>
        )}

        <ImportPreviewTable
          headers={preview.headers}
          rows={preview.rows}
          errors={validation.errors}
          warnings={validation.warnings}
        />

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep("upload")}>
            Back
          </Button>
          <Button
            onClick={handlePreviewNext}
            disabled={validation.validRows === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderOptionsStep = () => (
    <div className="space-y-6">
      <Tabs defaultValue="options" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="options">Import Options</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="options" className="space-y-4">
          <ImportOptionsForm
            options={importOptions}
            onChange={setImportOptions}
            roles={roles}
          />
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <FieldMappingForm
            headers={previewMutation.data?.preview.headers || []}
            mapping={fieldMapping}
            onChange={setFieldMapping}
            suggestedMapping={previewMutation.data?.suggestedMapping || {}}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("preview")}>
          Back
        </Button>
        <Button onClick={handleOptionsNext}>Continue</Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => {
    if (validationMutation.isPending) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Validating import data...</p>
          </div>
        </div>
      );
    }

    if (validationMutation.error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationMutation.error.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (!validationMutation.data) {
      return null;
    }

    const { summary, errors, warnings } = validationMutation.data;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Confirm Import</h3>
          <p className="text-muted-foreground">
            Review the import summary and confirm to proceed
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{summary.totalRows}</div>
              <p className="text-xs text-muted-foreground">Total Rows</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {summary.validRows}
              </div>
              <p className="text-xs text-muted-foreground">Will Import</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">
                {summary.invalidRows}
              </div>
              <p className="text-xs text-muted-foreground">Will Skip</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">
                {warnings.length}
              </div>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </CardContent>
          </Card>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errors.length} rows will be skipped due to validation errors.
            </AlertDescription>
          </Alert>
        )}

        {warnings.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {warnings.length} warnings found. Import will continue with
              default values.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep("options")}>
            Back
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={summary.validRows === 0}
          >
            Import Users
          </Button>
        </div>
      </div>
    );
  };

  const renderResultStep = () => {
    if (importMutation.isPending) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Importing Users</h3>
            <p className="text-muted-foreground">
              Please wait while we import your users...
            </p>
          </div>
          <Progress value={50} className="w-full" />
        </div>
      );
    }

    if (importMutation.error) {
      return (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{importMutation.error.message}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      );
    }

    if (!importMutation.data) {
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">Import Completed</h3>
        </div>

        <ImportResultSummary result={importMutation.data} />

        <div className="flex justify-center">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    switch (currentStep) {
      case "upload":
        return renderUploadStep();
      case "preview":
        return renderPreviewStep();
      case "options":
        return renderOptionsStep();
      case "confirm":
        return renderConfirmStep();
      case "result":
        return renderResultStep();
      default:
        return renderUploadStep();
    }
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case "upload":
        return "Import Users";
      case "preview":
        return "Preview Import Data";
      case "options":
        return "Configure Import Options";
      case "confirm":
        return "Confirm Import";
      case "result":
        return "Import Results";
      default:
        return "Import Users";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            Import users from CSV or Excel files with validation and error
            handling
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 py-4">
          {["upload", "preview", "options", "confirm", "result"].map(
            (step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : index <
                        [
                          "upload",
                          "preview",
                          "options",
                          "confirm",
                          "result",
                        ].indexOf(currentStep)
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      index <
                      [
                        "upload",
                        "preview",
                        "options",
                        "confirm",
                        "result",
                      ].indexOf(currentStep)
                        ? "bg-green-600"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>

        {getStepContent()}
      </DialogContent>
    </Dialog>
  );
}
