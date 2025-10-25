# 🔧 Fix CORS Issue

## Vấn đề: OPTIONS request trả về 400

```
INFO: 127.0.0.1:57402 - "OPTIONS /api/v1/tts/generate-file HTTP/1.1" 400 Bad Request
```

## ✅ Đã fix:

### 1. Cập nhật CORS middleware

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # ✅ Explicit OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],  # ✅ Added
    max_age=3600,  # ✅ Cache preflight for 1 hour
)
```

### 2. Thêm OPTIONS handler

```python
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}
```

## 🚀 Restart API server:

```bash
# Stop current server (Ctrl+C)
cd aiapi
python run.py
```

## 🧪 Test lại:

1. Tạo truyện mới
2. Check browser console - không còn CORS error
3. Audio sẽ được tạo thành công

## 📊 Expected logs:

```
INFO: 127.0.0.1:57402 - "OPTIONS /api/v1/tts/generate-file HTTP/1.1" 200 OK
INFO: 127.0.0.1:57403 - "POST /api/v1/tts/generate-file HTTP/1.1" 200 OK
```

---

**Restart API server và test lại! 🎉**
