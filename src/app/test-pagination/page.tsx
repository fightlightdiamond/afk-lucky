"use client";

import { useState } from "react";
import { UserPagination } from "@/components/admin/UserPagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationParams } from "@/types/user";

export default function TestPaginationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Mock pagination data
  const totalUsers = 150;
  const totalPages = Math.ceil(totalUsers / pageSize);

  const mockPagination: PaginationParams = {
    page: currentPage,
    pageSize: pageSize,
    total: totalUsers,
    totalPages: totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startIndex: totalUsers > 0 ? (currentPage - 1) * pageSize + 1 : 0,
    endIndex: Math.min(currentPage * pageSize, totalUsers),
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage >= totalPages,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Pagination Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Current State:</h3>
              <p>Current Page: {currentPage}</p>
              <p>Page Size: {pageSize}</p>
              <p>Total Users: {totalUsers}</p>
              <p>Total Pages: {totalPages}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Pagination Info:</h3>
              <p>Start Index: {mockPagination.startIndex}</p>
              <p>End Index: {mockPagination.endIndex}</p>
              <p>Has Next: {mockPagination.hasNextPage ? "Yes" : "No"}</p>
              <p>
                Has Previous: {mockPagination.hasPreviousPage ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Pagination Component:</h3>
            <UserPagination
              pagination={mockPagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={false}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
