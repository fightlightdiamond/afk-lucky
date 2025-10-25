# 🎵 Hướng dẫn sử dụng Text-to-Speech

## Tính năng mới: Tạo truyện với Audio

Bây giờ bạn có thể tạo truyện và tự động chuyển đổi thành giọng nói tiếng Việt!

## 🚀 Cách sử dụng

### 1. Truy cập trang Story with Audio

```
http://localhost:3000/story/with-audio
```

Hoặc từ trang Story chính, click vào card **"With Audio"** trong sidebar.

### 2. Nhập prompt truyện

Ví dụ:

- "Kể một câu chuyện ngắn về một chú mèo thông minh"
- "Viết truyện về cuộc phiêu lưu của một cậu bé"
- "Câu chuyện về tình bạn giữa hai đứa trẻ"

### 3. Chọn tùy chọn Audio

**✅ Bật "Tạo audio cho truyện"** để tự động tạo audio

**Chọn Audio Format:**

#### 📝 Base64 Mode

- Audio được gửi trực tiếp trong response
- Phản hồi nhanh, chỉ 1 request
- Phù hợp với truyện ngắn (< 30 giây audio)
- Không cần lưu file trên server

#### 📁 File Mode (Khuyến nghị)

- Audio được lưu thành file .wav trên server
- Có thể cache và share URL
- Phù hợp với truyện dài (> 30 giây audio)
- File lưu trong `aiapi/static/audio/`

### 4. Nhấn "Tạo Truyện + Audio"

Hệ thống sẽ:

1. ✅ Tạo nội dung truyện bằng AI
2. ✅ Chuyển đổi truyện thành giọng nói
3. ✅ Hiển thị truyện và audio player

### 5. Nghe và tải audio

- **▶️ Play/Pause** - Phát/Dừng audio
- **⬇️ Download** - Tải file .wav về máy
- **🔗 Open** (File mode) - Mở file trong tab mới

## 🎯 Các trang có TTS

### 1. Demo TTS Test

```
http://localhost:3000/demo/tts-test
```

- Test TTS với text tùy chỉnh
- So sánh Base64 vs File mode
- Sample texts để test nhanh

### 2. Story with Audio

```
http://localhost:3000/story/with-audio
```

- Tạo truyện hoàn chỉnh với audio
- Tùy chọn audio format
- Hiển thị metadata và stats

## 📊 Thông tin kỹ thuật

### Audio Specs

- **Format**: WAV
- **Sampling Rate**: 16,000 Hz
- **Model**: Facebook MMS-TTS Vietnamese
- **Quality**: High quality Vietnamese voice

### Performance

- **Generation Time**: 2-5 giây cho văn bản ngắn
- **File Size**: ~1MB cho 30 giây audio
- **Max Length**: 500 ký tự (có thể điều chỉnh)

## 🔧 API Endpoints

### Tạo TTS từ text

```bash
POST http://localhost:8000/api/v1/tts/generate
{
  "text": "Xin chào",
  "output_format": "base64"  # hoặc "file"
}
```

### Tạo truyện với TTS

```bash
POST http://localhost:8000/api/v1/generate-story-with-tts
{
  "prompt": "Kể câu chuyện về con mèo",
  "generate_audio": true,
  "audio_format": "file",
  "preferences": {
    "length": "short"
  }
}
```

### Lấy file audio

```bash
GET http://localhost:8000/api/v1/tts/audio/{filename}
```

## 💡 Tips & Tricks

### Để có audio tốt nhất:

1. ✅ Viết câu ngắn, rõ ràng
2. ✅ Tránh từ viết tắt phức tạp
3. ✅ Sử dụng dấu câu đúng
4. ✅ Chọn File mode cho truyện dài

### Khi nào dùng Base64:

- Truyện rất ngắn (< 100 từ)
- Cần phản hồi ngay lập tức
- Không muốn lưu file
- Demo hoặc test

### Khi nào dùng File:

- Truyện dài (> 100 từ)
- Muốn cache audio
- Cần share URL audio
- Production environment

## 🐛 Troubleshooting

### Audio không phát được

1. Kiểm tra API server đang chạy: `http://localhost:8000/health`
2. Kiểm tra TTS status: `http://localhost:8000/api/v1/tts/status`
3. Xem console log trong browser (F12)

### File không tìm thấy

1. Kiểm tra thư mục: `aiapi/static/audio/`
2. Kiểm tra file URL trong response
3. Thử access trực tiếp: `http://localhost:8000/static/audio/{filename}`

### Audio bị lỗi

1. Kiểm tra text không quá dài (> 500 ký tự)
2. Kiểm tra model đã load: Xem log API server
3. Restart API server nếu cần

## 📚 Tài liệu thêm

- [TTS Integration Guide](./TTS_INTEGRATION_GUIDE.md) - Chi tiết kỹ thuật
- [API Documentation](http://localhost:8000/docs) - FastAPI docs
- [Demo Page](http://localhost:3000/demo/tts-test) - Test TTS

## 🎉 Tính năng sắp tới

- [ ] Multiple voices (nam/nữ, giọng khác nhau)
- [ ] Speed control (tốc độ đọc)
- [ ] Emotion control (cảm xúc)
- [ ] English TTS support
- [ ] Audio streaming
- [ ] Voice cloning

---

**Enjoy creating stories with audio! 🎵📚**
