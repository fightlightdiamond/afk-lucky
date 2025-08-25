"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationParams, PAGINATION_LIMITS } from "@/types/user";
import { useState } from "react";

interface UserPaginationProps {
  pagination: PaginationParams;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export function UserPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: UserPaginationProps) {
  const [jumpToPage, setJumpToPage] = useState("");

  const {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
  } = pagination || {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    startIndex: 0,
    endIndex: 0,
  };

  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
      setJumpToPage("");
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      {/* Results info and page size selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
        <div>
          Showing {startIndex} to {endIndex} of {total} results
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="pageSize" className="text-sm">
            Show:
          </Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger id="pageSize" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGINATION_LIMITS.DEFAULT_PAGINATION_CONFIG?.pageSizeOptions?.map(
                (size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                )
              ) ||
                [10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage || isLoading}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <div key={`dots-${index}`} className="px-2">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                disabled={isLoading}
                className="w-10"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Jump to page */}
      {totalPages > 10 && (
        <div className="flex items-center gap-2 text-sm">
          <Label htmlFor="jumpToPage">Go to:</Label>
          <Input
            id="jumpToPage"
            type="number"
            min="1"
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleJumpToPage();
              }
            }}
            className="w-16"
            placeholder="Page"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToPage}
            disabled={isLoading || !jumpToPage}
          >
            Go
          </Button>
        </div>
      )}
    </div>
  );
}
