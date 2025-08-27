"use client";

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangeFilterProps {
  value: DateRange | null;
  onChange: (dateRange: DateRange | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  presets?: Array<{
    label: string;
    value: DateRange;
  }>;
}

export function DateRangeFilter({
  value,
  onChange,
  label = "Date Range",
  placeholder = "Pick a date range",
  disabled = false,
  icon = <Calendar className="mr-2 h-4 w-4" />,
  presets = [],
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (range: any) => {
    const newRange: DateRange = {
      from: range?.from || null,
      to: range?.to || null,
    };
    onChange(newRange);

    // Close popover if both dates are selected
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  const handlePresetSelect = (preset: DateRange) => {
    onChange(preset);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!value || (!value.from && !value.to)) {
      return placeholder;
    }

    if (value.from && value.to) {
      return `${format(value.from, "LLL dd, y")} - ${format(
        value.to,
        "LLL dd, y"
      )}`;
    }

    if (value.from) {
      return `From ${format(value.from, "LLL dd, y")}`;
    }

    if (value.to) {
      return `Until ${format(value.to, "LLL dd, y")}`;
    }

    return placeholder;
  };

  const hasValue = value && (value.from || value.to);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {hasValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto p-1"
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled={disabled}
          >
            {icon}
            <span className="truncate">{getDisplayText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            {/* Presets */}
            {presets.length > 0 && (
              <div className="mb-3 pb-3 border-b">
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Quick Select
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(preset.value)}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar */}
            <CalendarComponent
              mode="range"
              defaultMonth={value?.from || undefined}
              selected={{
                from: value?.from || undefined,
                to: value?.to || undefined,
              }}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              disabled={disabled}
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected range display */}
      {hasValue && (
        <div className="flex flex-wrap gap-1">
          {value?.from && (
            <Badge variant="secondary" className="text-xs">
              From: {format(value.from, "MMM dd, yyyy")}
            </Badge>
          )}
          {value?.to && (
            <Badge variant="secondary" className="text-xs">
              To: {format(value.to, "MMM dd, yyyy")}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
