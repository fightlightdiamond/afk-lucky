# Hybrid TTS - Quick Reference

## 🎯 Vấn Đề

Từ tiếng Anh trong text tiếng Việt bị đọc sai → Hybrid TTS fix vấn đề này

## ⚡ Quick Commands

```bash
# Check status
curl http://localhost:8001/api/v1/tts/status

# Enable hybrid mode
curl -X POST "http://localhost:8001/api/v1/tts/config/hybrid?enabled=true"

# Disable hybrid mode
curl -X POST "http://localhost:8001/api/v1/tts/config/hybrid?enabled=false"

# Generate with hybrid
curl -X POST "http://localhost:8001/api/v1/tts/generate-file?use_hybrid=true" \
  -H "Content-Type: application/json" \
  -d '{"text": "Xin chào, I am John", "output_format": "file"}'

# Test script
cd aiapi && python test_hybrid_tts.py
```

## 📝 React Usage

```typescript
import { useTTSHybridMode } from "@/hooks/useTTS";

function MyComponent() {
  const { hybridMode, enModelLoaded, toggleHybridMode, isToggling } =
    useTTSHybridMode();

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={hybridMode}
          onChange={(e) => toggleHybridMode(e.target.checked)}
          disabled={!enModelLoaded || isToggling}
        />
        Hybrid TTS Mode
      </label>
      {!enModelLoaded && <span>⚠️ English model not loaded</span>}
    </div>
  );
}
```

## 🔧 API Endpoints

| Endpoint                             | Method | Purpose                     |
| ------------------------------------ | ------ | --------------------------- |
| `/tts/status`                        | GET    | Check status & config       |
| `/tts/config/hybrid?enabled=bool`    | POST   | Toggle hybrid mode          |
| `/tts/generate?use_hybrid=bool`      | POST   | Generate with override      |
| `/tts/generate-file?use_hybrid=bool` | POST   | Generate file with override |

## 📊 Comparison

| Feature               | Vietnamese-only | Hybrid           |
| --------------------- | --------------- | ---------------- |
| English pronunciation | ❌ Poor         | ✅ Good          |
| Speed                 | ⚡ Fast (2-3s)  | 🐢 Slower (4-5s) |
| RAM                   | 💾 300MB        | 💾 600MB         |
| Best for              | Pure Vietnamese | Mixed content    |

## 🎬 Example Texts

```python
# Good for hybrid mode
"Xin chào, tôi tên là John và học Machine Learning"
"Hôm nay tôi ăn pizza ở restaurant"
"Hello, my name is Minh from Hanoi"

# Vietnamese-only is fine
"Xin chào, tôi tên là Minh"
"Hôm nay trời đẹp quá"
```

## 🐛 Troubleshooting

**English model not loading?**

- Check internet connection (downloads from Hugging Face)
- Check RAM (needs ~300MB)
- See logs: `cd aiapi && python run.py`

**Audio has gaps?**

- Adjust `silence_duration` in `tts_service.py` (line ~120)
- Default: 0.1s → Try: 0.05s

**Wrong language detection?**

- Check text has proper spacing
- English words need vowels (a,e,i,o,u)
- Single letters ignored

## 📚 Full Docs

- Detailed guide: `HYBRID_TTS_GUIDE.md`
- Implementation: `HYBRID_TTS_SUMMARY.md`
- Test script: `aiapi/test_hybrid_tts.py`
