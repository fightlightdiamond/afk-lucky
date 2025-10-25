# Text-to-Speech Integration Guide

## Tổng quan

Tích hợp Text-to-Speech (TTS) vào ứng dụng tạo truyện chêm để tự động tạo audio từ văn bản truyện.

## Cài đặt

### 1. Cài đặt dependencies cho Python API

```bash
cd aiapi
pip install transformers torch soundfile numpy
```

Hoặc cập nhật `pyproject.toml` (đã được cập nhật):

```toml
dependencies = [
    # ... existing dependencies
    "transformers (>=4.30.0,<5.0.0)",
    "torch (>=2.0.0,<3.0.0)",
    "soundfile (>=0.12.0,<1.0.0)",
    "numpy (>=1.24.0,<2.0.0)"
]
```

### 2. Khởi động API server

```bash
cd aiapi
python run.py
```

### 3. Test TTS functionality

```bash
cd aiapi
python test_tts.py
```

## Cấu trúc TTS Service

### Backend (Python)

1. **TTS Service** (`aiapi/src/aiapi/services/tts_service.py`)

   - Sử dụng Hugging Face `facebook/mms-tts-vie` model
   - Hỗ trợ multiple output formats (base64, wav, bytes, file)
   - Auto text cleaning và length limiting
   - File-based storage trong `static/audio/`

2. **TTS Router** (`aiapi/src/aiapi/routers/tts.py`)

   - `/api/v1/tts/status` - Kiểm tra trạng thái service
   - `/api/v1/tts/generate` - Tạo TTS audio (base64/file)
   - `/api/v1/tts/generate-wav` - Download WAV file trực tiếp
   - `/api/v1/tts/generate-file` - Tạo và lưu file trên server
   - `/api/v1/tts/audio/{filename}` - Serve audio files

3. **Story with TTS** (`aiapi/src/aiapi/routers/story.py`)
   - `/api/v1/generate-story-with-tts` - Tạo truyện + audio cùng lúc
   - Hỗ trợ cả base64 và file-based approach

### Frontend (React/Next.js)

1. **TTS Client** (`src/lib/aiapi.ts`)

   - `generateTTS()` - Tạo audio từ text
   - `generateStoryWithTTS()` - Tạo truyện + audio
   - `getTTSStatus()` - Kiểm tra trạng thái

2. **TTS Hooks** (`src/hooks/useTTS.ts`)

   - `useTTSStatus()` - Hook kiểm tra trạng thái
   - `useGenerateTTS()` - Hook tạo TTS
   - `useGenerateStoryWithTTS()` - Hook tạo truyện + TTS
   - `useAudioPlayer()` - Hook quản lý audio player

3. **TTS Components** (`src/components/story/TTSPlayer.tsx`)
   - Component player với play/pause/download
   - Auto-generate audio option
   - Error handling

## 2 Approaches: Base64 vs File-based

### Base64 Approach (Mặc định)

**Ưu điểm:**

- Không cần lưu file trên server
- Phản hồi nhanh, tất cả trong 1 request
- Không cần quản lý file storage
- Phù hợp với audio ngắn

**Nhược điểm:**

- JSON response lớn (base64 encoding tăng ~33% size)
- Tốn memory khi encode/decode
- Không cache được audio
- Không phù hợp với audio dài

### File-based Approach (Mới)

**Ưu điểm:**

- File được lưu trên server, có thể cache
- JSON response nhỏ, chỉ chứa URL
- Có thể share URL trực tiếp
- Phù hợp với audio dài
- Có thể stream audio

**Nhược điểm:**

- Cần quản lý file storage
- Cần cleanup files cũ
- Thêm 1 request để lấy audio
- Cần serve static files

### Khi nào dùng approach nào?

**Dùng Base64 khi:**

- Audio ngắn (< 30 giây)
- Cần phản hồi ngay lập tức
- Không muốn lưu file
- Ứng dụng đơn giản

**Dùng File-based khi:**

- Audio dài (> 30 giây)
- Cần cache audio
- Muốn share URL audio
- Cần tối ưu performance
- Có nhiều người dùng

## Sử dụng

### 1. Tạo TTS từ text đơn giản

**Base64 approach:**

```typescript
import { generateTTS } from "@/lib/aiapi";

const audioData = await generateTTS("Xin chào anh em", "base64");
// audioData.audio_base64 chứa audio data
```

**File-based approach:**

```typescript
import { generateTTSFile } from "@/lib/aiapi";

const fileData = await generateTTSFile("Xin chào anh em");
// fileData.file_url chứa URL để access file
// Ví dụ: /api/v1/tts/audio/tts_1698765432123.wav
```

### 2. Tạo truyện với TTS

```typescript
import { generateStoryWithTTS } from "@/lib/aiapi";

const result = await generateStoryWithTTS({
  prompt: "Kể câu chuyện về con mèo",
  generate_audio: true,
  audio_format: "base64",
  preferences: {
    length: "short",
    language_mix: {
      ratio: 80,
      base_language: "vi",
      target_language: "en",
    },
  },
});
```

### 3. Sử dụng TTSPlayer component

```tsx
import { TTSPlayer } from "@/components/story/TTSPlayer";

<TTSPlayer text="Văn bản cần chuyển thành giọng nói" autoGenerate={true} />;
```

### 4. Sử dụng hooks

```tsx
import { useTTSStatus, useGenerateTTS } from "@/hooks/useTTS";

function MyComponent() {
  const { data: status } = useTTSStatus();
  const { mutate: generateTTS } = useGenerateTTS();

  return (
    <div>
      <p>TTS Available: {status?.available ? "Yes" : "No"}</p>
      <button onClick={() => generateTTS({ text: "Hello" })}>
        Generate Audio
      </button>
    </div>
  );
}
```

## Demo Page

Truy cập `/demo/tts-test` để test đầy đủ các tính năng TTS:

- Kiểm tra trạng thái service
- Test TTS với text tùy chỉnh
- Tạo truyện với audio tự động
- Sample texts để test nhanh

## API Endpoints

### TTS Status

```
GET /api/v1/tts/status
Response: {
  "available": boolean,
  "model": "facebook/mms-tts-vie",
  "supported_formats": ["wav", "base64", "bytes"]
}
```

### Generate TTS

```
POST /api/v1/tts/generate
Body: {
  "text": "Văn bản cần chuyển đổi",
  "output_format": "base64"
}
Response: {
  "audio_base64": "...",
  "format": "wav",
  "sampling_rate": 22050,
  "duration": 3.5,
  "size_bytes": 154000
}
```

### Generate Story with TTS

```
POST /api/v1/generate-story-with-tts
Body: {
  "prompt": "Story prompt",
  "generate_audio": true,
  "audio_format": "base64",
  "preferences": { ... }
}
Response: {
  "title": "Story Title",
  "content": "Story content...",
  "audio": {
    "audio_base64": "...",
    "duration": 15.2
  }
}
```

## Lưu ý kỹ thuật

### Model Loading

- Model `facebook/mms-tts-vie` sẽ được tải tự động lần đầu
- Cần khoảng 1-2GB RAM để load model
- Thời gian tải model lần đầu: 30-60 giây

### Performance

- Thời gian tạo audio: 2-5 giây cho văn bản ngắn
- Giới hạn độ dài text: 500 ký tự (có thể điều chỉnh)
- Sampling rate: 22050 Hz

### Error Handling

- Service không available: Trả về error message
- Text quá dài: Tự động cắt ngắn
- Model load failed: Graceful degradation

## Tích hợp vào Story Generation

Để tích hợp TTS vào flow tạo truyện hiện tại:

1. **Cập nhật Story Service** - Thêm option `generate_audio`
2. **Cập nhật UI** - Thêm checkbox "Generate Audio"
3. **Cập nhật Story Display** - Hiển thị audio player khi có
4. **Cập nhật Database** - Lưu audio URL/path (optional)

## Troubleshooting

### Model không load được

```bash
# Kiểm tra dependencies
pip list | grep transformers
pip list | grep torch

# Test model loading
python -c "from transformers import VitsModel; VitsModel.from_pretrained('facebook/mms-tts-vie')"
```

### Audio không phát được

- Kiểm tra browser support cho audio/wav
- Kiểm tra base64 encoding
- Kiểm tra CORS settings

### Performance issues

- Giảm max_length trong text cleaning
- Sử dụng GPU nếu có (CUDA)
- Cache model trong memory

## Mở rộng

### Hỗ trợ nhiều ngôn ngữ

```python
# Thêm models khác
models = {
    "vi": "facebook/mms-tts-vie",
    "en": "facebook/mms-tts-eng",
    "zh": "facebook/mms-tts-cmn"
}
```

### Voice cloning

- Sử dụng models như Coqui TTS
- Training custom voice models
- Real-time voice conversion

### Streaming audio

- Implement streaming TTS
- WebSocket for real-time audio
- Progressive audio loading
