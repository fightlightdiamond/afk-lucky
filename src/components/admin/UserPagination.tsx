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
import { ariaLabels } from "@/lib/accessibility";

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
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4"
      role="navigation"
      aria-label="Pagination navigation"
    >
      {/* Results info and page size selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
        <div
          role="status"
          aria-live="polite"
          className="text-center sm:text-left"
        >
          Showing {startIndex} to {endIndex} of {total} results
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="pageSize" className="text-sm whitespace-nowrap">
            Show:
          </Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger
              id="pageSize"
              className="w-20 h-9 min-h-[44px] sm:min-h-0 sm:h-8"
              aria-label={`Page size, currently ${pageSize} items per page`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent role="listbox" aria-label="Page size options">
              {PAGINATION_LIMITS.DEFAULT_PAGINATION_CONFIG?.pageSizeOptions?.map(
                (size) => (
                  <SelectItem key={size} value={size.toString()} role="option">
                    {size}
                  </SelectItem>
                )
              ) ||
                [10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()} role="option">
                    {size}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination controls */}
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Pagination controls"
      >
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage || isLoading}
          className="hidden sm:flex"
          aria-label={ariaLabels.pagination.first(
            !hasPreviousPage || isLoading
          )}
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage || isLoading}
          className="min-h-[44px] sm:min-h-0"
          aria-label={ariaLabels.pagination.previous(
            !hasPreviousPage || isLoading
          )}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>

        {/* Page numbers */}
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Page numbers"
        >
          {getVisiblePages().map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <div key={`dots-${index}`} className="px-2" aria-hidden="true">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            const isCurrentPage = pageNum === page;
            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                disabled={isLoading}
                className="w-10 min-h-[44px] sm:min-h-0"
                aria-label={ariaLabels.pagination.page(
                  pageNum as number,
                  isCurrentPage
                )}
                aria-current={isCurrentPage ? "page" : undefined}
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
          className="min-h-[44px] sm:min-h-0"
          aria-label={ariaLabels.pagination.next(!hasNextPage || isLoading)}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          className="hidden sm:flex"
          aria-label={ariaLabels.pagination.last(!hasNextPage || isLoading)}
        >
          <ChevronsRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Jump to page */}
      {totalPages > 10 && (
        <div
          className="flex items-center gap-2 text-sm"
          role="group"
          aria-label="Jump to page"
        >
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
            className="w-16 h-9 min-h-[44px] sm:min-h-0 sm:h-8"
            placeholder="Page"
            disabled={isLoading}
            aria-label={`Jump to page number (1 to ${totalPages})`}
            aria-describedby="jump-to-page-description"
          />
          <div id="jump-to-page-description" className="sr-only">
            Enter a page number between 1 and {totalPages} to jump directly to
            that page
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToPage}
            disabled={isLoading || !jumpToPage}
            className="min-h-[44px] sm:min-h-0"
            aria-label={
              jumpToPage
                ? `Go to page ${jumpToPage}`
                : "Go to page (enter page number first)"
            }
          >
            Go
          </Button>
        </div>
      )}
    </nav>
  );
}
