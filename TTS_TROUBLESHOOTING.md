# 🐛 TTS Troubleshooting Guide

## Vấn đề: "Nội dung không được tạo"

### Nguyên nhân có thể:

1. **API Python không chạy**
2. **Response không có content**
3. **TTS generation block quá lâu**
4. **Database connection issue**

## ✅ Giải pháp đã áp dụng

### 1. Async Audio Generation

Audio giờ được tạo ở background, không block story creation:

```typescript
// Story được lưu ngay lập tức
const story = await prisma.story.create({
  data: { prompt, content, audioUrl: null },
});

// Audio được tạo async (fire and forget)
(async () => {
  const audioResult = await generateTTSFile(content);
  await prisma.story.update({
    where: { id: story.id },
    data: { audioUrl: audioResult.file_url },
  });
})();
```

### 2. Better Error Handling

Thêm validation và logging:

```typescript
if (!content || content.trim() === "") {
  throw new Error("Story content is empty");
}
```

### 3. User Experience

- Story hiển thị ngay lập tức
- Audio player hiển thị "Đang tạo audio..."
- User có thể refresh để nghe audio

## 🧪 Debug Steps

### 1. Check API Health

```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### 2. Test Story Generation

```bash
curl -X POST http://localhost:8000/api/v1/generate-story \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test"}' | jq .
```

### 3. Check Database

```bash
# Check if story was saved
psql -d postgres -c "SELECT id, prompt, LENGTH(content) as content_length, audioUrl FROM stories ORDER BY \"createdAt\" DESC LIMIT 5;"
```

### 4. Check Audio Files

```bash
ls -lh aiapi/static/audio/
```

### 5. Check Logs

```bash
# API logs
cd aiapi && python run.py

# Frontend logs
npm run dev
# Check browser console (F12)
```

## 🔍 Common Issues

### Issue 1: Story content is empty

**Symptom**: Story được tạo nhưng không có nội dung

**Check**:

```bash
# Test Python API directly
curl -X POST http://localhost:8000/api/v1/generate-story \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test story"}' | jq '.content'
```

**Solution**:

- Kiểm tra Azure OpenAI API key
- Kiểm tra API logs
- Verify `generateStory()` function

### Issue 2: Audio not generated

**Symptom**: Story có content nhưng không có audio

**Check**:

```bash
# Check if TTS service is available
curl http://localhost:8000/api/v1/tts/status | jq .

# Test TTS directly
curl -X POST http://localhost:8000/api/v1/tts/generate-file \
  -H "Content-Type: application/json" \
  -d '{"text": "Test"}' | jq .
```

**Solution**:

- Kiểm tra TTS model đã load chưa
- Check `aiapi/static/audio/` folder exists
- Verify permissions

### Issue 3: Audio player not showing

**Symptom**: Story hiển thị nhưng không có audio player

**Check**:

- Browser console for errors
- Component props: `<StoryAudioPlayer storyContent={story} autoGenerate={true} />`
- Network tab: Check if TTS API is called

**Solution**:

- Refresh page sau vài giây
- Check if `autoGenerate` prop is true
- Verify API URL in component

## 📊 Expected Flow

```
1. User submits prompt
   ↓
2. POST /api/story
   ↓
3. generateStory() → content
   ↓
4. Save to DB (without audio)
   ↓
5. Return story immediately ✅
   ↓
6. Background: Generate TTS
   ↓
7. Update DB with audioUrl
   ↓
8. User refreshes → Audio available
```

## 🎯 Quick Test Script

Run the test script:

```bash
./test-story-creation.sh
```

This will:

1. Check API health
2. Generate a test story
3. Generate TTS audio
4. Verify audio file exists

## 💡 Tips

### For Development:

1. **Keep API running**: `cd aiapi && python run.py`
2. **Watch logs**: Check both API and frontend console
3. **Test incrementally**: Test each step separately

### For Production:

1. **Use CDN**: Store audio files on CDN
2. **Cleanup old files**: Implement cron job
3. **Rate limiting**: Limit TTS requests per user
4. **Caching**: Cache audio files

## 🔧 Manual Fix

If audio is stuck "generating":

1. **Check story in DB**:

```sql
SELECT id, audioUrl FROM stories WHERE id = 'YOUR_STORY_ID';
```

2. **Manually generate audio**:

```bash
cd aiapi
python -c "
from src.aiapi.services.tts_service import generate_tts_audio
result = generate_tts_audio('Your story content', 'file', save_file=True)
print(result['file_url'])
"
```

3. **Update DB**:

```sql
UPDATE stories SET \"audioUrl\" = '/api/v1/tts/audio/tts_xxx.wav' WHERE id = 'YOUR_STORY_ID';
```

## 📞 Still Having Issues?

1. Check all services are running:

   - ✅ PostgreSQL
   - ✅ Python API (port 8000)
   - ✅ Next.js (port 3000)

2. Check environment variables:

   - `DATABASE_URL`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_ENDPOINT`

3. Check file permissions:

   - `aiapi/static/audio/` should be writable

4. Check network:
   - Frontend can reach `http://localhost:8000`
   - No CORS issues

---

**Need more help?** Check the logs and error messages carefully. Most issues are related to API connectivity or missing environment variables.
