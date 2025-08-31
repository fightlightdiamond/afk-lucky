"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScrollTestPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Test Scroll to Top</h1>
        <p className="text-xl opacity-90">
          Cuộn xuống để thấy nút "Scroll to Top" xuất hiện
        </p>
      </div>

      {/* Content sections */}
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Giới thiệu về TopButton</h2>
          <Card>
            <CardHeader>
              <CardTitle>Tính năng chính</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Xuất hiện tự động khi cuộn xuống</li>
                <li>Thiết kế tròn 38x38px</li>
                <li>Hiệu ứng hover mượt mà</li>
                <li>Hỗ trợ keyboard navigation</li>
                <li>Tích hợp sẵn vào các layout chính</li>
                <li>Tùy chỉnh threshold và styling</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Generate content to make page scrollable */}
        {Array.from({ length: 25 }, (_, i) => (
          <section key={i} className="space-y-4">
            <h3 className="text-xl font-semibold">Phần {i + 1}</h3>
            <Card>
              <CardHeader>
                <CardTitle>Nội dung mẫu {i + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Đây là phần nội dung thứ {i + 1} để tạo ra một trang dài.
                  TopButton sẽ xuất hiện khi bạn cuộn xuống và sẽ giúp bạn quay
                  lại đầu trang một cách nhanh chóng và mượt mà.
                </p>
                <p className="text-gray-600">
                  Nút TopButton được thiết kế với các đặc điểm sau:
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                  <li>Vị trí cố định ở góc dưới bên phải</li>
                  <li>Khoảng cách 24px từ cạnh màn hình</li>
                  <li>Icon thay đổi khi hover</li>
                  <li>Cuộn mượt mà với behavior: 'smooth'</li>
                  <li>Hỗ trợ dark mode</li>
                </ul>
              </CardContent>
            </Card>
          </section>
        ))}

        <section className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-green-800">
            🎉 Bạn đã cuộn đến cuối trang!
          </h3>
          <p className="text-green-700">
            Bây giờ hãy thử click vào nút TopButton ở góc dưới bên phải để quay
            lại đầu trang. Nút này sẽ tự động ẩn khi bạn ở gần đầu trang.
          </p>
        </section>
      </div>
    </div>
  );
}
