# Hướng Dẫn Sử Dụng Export Functionality

## Cách Sử Dụng Export

### 1. Truy Cập Trang Admin Users

- Đăng nhập với tài khoản admin
- Truy cập `/admin/users`

### 2. Sử Dụng Export

Có 2 cách để export dữ liệu:

#### Cách 1: Export Đơn Giản (từ UserActions)

- Ở phần header, click nút **"Export"** (chỉ hiển thị khi không có user nào được chọn)
- Sẽ hiển thị thông báo hướng dẫn sử dụng export nâng cao

#### Cách 2: Export Nâng Cao (từ UserFilters) - **KHUYẾN NGHỊ**

- Ở phần filters, click nút **"Export"** (bên cạnh nút "Filters")
- Sẽ mở dialog export với nhiều tùy chọn

### 3. Export Dialog Options

#### Chọn Format:

- **CSV**: Định dạng comma-separated values, tương thích với Excel
- **Excel**: Định dạng Excel-compatible
- **JSON**: Định dạng JSON với đầy đủ dữ liệu

#### Chọn Fields (chỉ cho CSV/Excel):

- Tick/untick các field muốn export
- Có thể "Select All" hoặc "Clear All"
- JSON format sẽ export tất cả fields

#### Export Summary:

- Hiển thị tổng số records
- Hiển thị số filters đang active
- Cảnh báo nếu vượt quá giới hạn (10,000 records)

### 4. Security & Privacy

- **Tự động loại bỏ**: passwords, tokens, private keys
- **Chỉ export**: dữ liệu an toàn, không nhạy cảm
- **Yêu cầu quyền**: Cần quyền 'read' trên User resource

## Test Export Functionality

### Trang Test

- Truy cập `/test-export` để test export dialog
- Có mock data và filters để test

### Các Trường Hợp Test:

1. **Export CSV với fields tùy chọn**
2. **Export Excel với tất cả fields**
3. **Export JSON (full data)**
4. **Test với filters khác nhau**
5. **Test giới hạn records (>10,000)**

## Troubleshooting

### Nút Export Không Hiển Thị

1. Kiểm tra đăng nhập admin
2. Kiểm tra quyền 'read' trên User
3. Refresh trang

### Export Thất Bại

1. Kiểm tra network connection
2. Kiểm tra console errors
3. Thử giảm số records (áp dụng filters)

### File Không Download

1. Kiểm tra browser popup blocker
2. Kiểm tra download permissions
3. Thử browser khác

## API Endpoints

### Export API

```
GET /api/admin/users/export
```

**Parameters:**

- `format`: csv | excel | json
- `fields`: comma-separated field names (optional)
- `search`, `role`, `status`: filter parameters
- `dateFrom`, `dateTo`: date range filters

**Example:**

```
/api/admin/users/export?format=csv&fields=email,first_name,last_name&status=active
```

## Code Examples

### Sử dụng useExport Hook

```typescript
import { useExport } from "@/hooks/useExport";

const { exportUsers, isExporting, error } = useExport();

const handleExport = async () => {
  try {
    await exportUsers(filters, "csv", ["email", "first_name", "last_name"]);
    // Success notification
  } catch (error) {
    // Error handling
  }
};
```

### Tích hợp vào Component

```typescript
<UserFilters
  filters={filters}
  onFiltersChange={setFilters}
  roles={roles}
  totalRecords={totalUsers}
  onExport={handleExport} // Truyền export handler
/>
```

## Giới Hạn & Quy Định

- **Max Records**: 10,000 records per export
- **Supported Formats**: CSV, Excel, JSON
- **File Size**: Tự động giới hạn qua record limit
- **Rate Limiting**: Có thể implement sau

## Tính Năng Tương Lai

- [ ] Export Excel thật (.xlsx) với ExcelJS
- [ ] Streaming export cho datasets lớn
- [ ] Scheduled exports
- [ ] Export history tracking
- [ ] Email delivery cho files lớn
- [ ] Custom export templates
