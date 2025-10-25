# 🚀 TTS Quick Start

## Khởi động nhanh trong 5 phút

### 1. Start API Server

```bash
cd aiapi
python run.py
```

### 2. Start Frontend

```bash
# Terminal mới
npm run dev
```

### 3. Test TTS

#### Option A: Demo Page

```
http://localhost:3000/demo/tts-test
```

#### Option B: Story with Audio

```
http://localhost:3000/story/with-audio
```

#### Option C: Python Script

```bash
cd aiapi
python tts_inference.py
# File output.wav sẽ được tạo
```

## ✅ Kiểm tra nhanh

### 1. Check API Status

```bash
curl http://localhost:8000/api/v1/tts/status
```

### 2. Generate TTS (Base64)

```bash
curl -X POST http://localhost:8000/api/v1/tts/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Xin chào", "output_format": "base64"}'
```

### 3. Generate TTS (File)

```bash
curl -X POST http://localhost:8000/api/v1/tts/generate-file \
  -H "Content-Type: application/json" \
  -d '{"text": "Xin chào"}'
```

### 4. Access Audio File

```
http://localhost:8000/api/v1/tts/audio/tts_1234567890.wav
```

## 📁 Files được tạo

Audio files: `aiapi/static/audio/*.wav`

## 🎯 Các trang có TTS

| Page          | URL                 | Mô tả                       |
| ------------- | ------------------- | --------------------------- |
| Demo TTS      | `/demo/tts-test`    | Test TTS với text tùy chỉnh |
| Story + Audio | `/story/with-audio` | Tạo truyện với audio        |
| Story Main    | `/story`            | Link đến TTS trong sidebar  |

## 💡 Tips

- **Base64**: Dùng cho audio ngắn, phản hồi nhanh
- **File**: Dùng cho audio dài, có thể cache

## 🐛 Troubleshooting

**API không chạy?**

```bash
cd aiapi
pip install -e .
python run.py
```

**Model không load?**

```bash
pip install transformers torch soundfile numpy
```

**File không tìm thấy?**

```bash
ls -la aiapi/static/audio/
```

## 📚 Docs

- [User Guide](./TTS_USER_GUIDE.md) - Hướng dẫn chi tiết
- [Integration Guide](./TTS_INTEGRATION_GUIDE.md) - Kỹ thuật
- [Summary](./TTS_IMPLEMENTATION_SUMMARY.md) - Tổng quan

---

**That's it! Enjoy TTS! 🎵**
