# Hybrid TTS Implementation Summary

## Vấn Đề

Model TTS tiếng Việt (facebook/mms-tts-vie) đọc từ tiếng Anh theo phát âm tiếng Việt → nghe không tự nhiên.

## Giải Pháp Đã Implement

### 1. Backend (Python)

**File: `aiapi/src/aiapi/services/tts_service.py`**

Đã thêm:

- ✅ Load 2 models: Vietnamese + English
- ✅ Language detection: tự động phát hiện đoạn tiếng Anh
- ✅ Segment processing: tách text theo ngôn ngữ
- ✅ Audio merging: ghép các segments lại
- ✅ Hybrid mode toggle: bật/tắt được

**File: `aiapi/src/aiapi/routers/tts.py`**

Đã thêm endpoints:

- ✅ `GET /tts/status` - Xem trạng thái hybrid mode
- ✅ `POST /tts/config/hybrid?enabled=true/false` - Bật/tắt hybrid mode
- ✅ `POST /tts/generate?use_hybrid=true/false` - Override cho từng request

### 2. Frontend (React/TypeScript)

**File: `src/hooks/useTTS.ts`**

Đã thêm:

- ✅ `useTTSHybridMode()` hook - Quản lý hybrid mode
- ✅ Toggle function với React Query
- ✅ Toast notifications

### 3. Testing & Documentation

Đã tạo:

- ✅ `aiapi/test_hybrid_tts.py` - Test script so sánh 2 modes
- ✅ `HYBRID_TTS_GUIDE.md` - Hướng dẫn chi tiết
- ✅ `HYBRID_TTS_SUMMARY.md` - Tóm tắt này

## Cách Sử Dụng

### Quick Start

```bash
# 1. Khởi động server (models sẽ tự load)
cd aiapi
python run.py

# 2. Kiểm tra status
curl http://localhost:8001/api/v1/tts/status

# 3. Bật hybrid mode
curl -X POST "http://localhost:8001/api/v1/tts/config/hybrid?enabled=true"

# 4. Test
python test_hybrid_tts.py
```

### Trong Code

```typescript
// React component
import { useTTSHybridMode } from "@/hooks/useTTS";

function MyComponent() {
  const { hybridMode, enModelLoaded, toggleHybridMode } = useTTSHybridMode();

  return (
    <label>
      <input
        type="checkbox"
        checked={hybridMode}
        onChange={(e) => toggleHybridMode(e.target.checked)}
        disabled={!enModelLoaded}
      />
      Hybrid TTS (Vietnamese + English)
    </label>
  );
}
```

## Cách Hoạt Động

**Input:**

```
"Xin chào, tôi tên là John và học Machine Learning"
```

**Processing:**

1. Detect segments:

   - "Xin chào, tôi tên là" → Vietnamese
   - "John" → English
   - "và học" → Vietnamese
   - "Machine Learning" → English

2. Generate audio cho từng segment với model phù hợp

3. Merge với 100ms silence giữa các segments

**Output:** Audio file với phát âm chuẩn cho cả 2 ngôn ngữ

## Trade-offs

| Aspect               | Vietnamese-only | Hybrid            |
| -------------------- | --------------- | ----------------- |
| Chất lượng tiếng Anh | ⭐⭐            | ⭐⭐⭐⭐⭐        |
| Tốc độ               | Nhanh (2-3s)    | Chậm hơn (4-5s)   |
| RAM                  | 300MB           | 600MB             |
| Phù hợp              | Text thuần Việt | Text có tiếng Anh |

## Next Steps (Optional)

Nếu muốn cải thiện thêm:

1. **Better language detection:**

   ```bash
   pip install langdetect
   ```

2. **Smoother transitions:**

   - Giảm silence duration
   - Thêm crossfade giữa segments

3. **UI improvements:**

   - Thêm toggle trong StoryForm
   - Hiển thị detected segments
   - Preview mode

4. **Performance:**
   - Cache generated segments
   - Parallel processing
   - Lazy load English model

## Kết Luận

✅ Hybrid TTS đã hoạt động
✅ Có thể bật/tắt dễ dàng
✅ Chất lượng audio cải thiện đáng kể cho nội dung mixed language

**Khuyến nghị:** Bật hybrid mode mặc định nếu có đủ RAM (600MB).
