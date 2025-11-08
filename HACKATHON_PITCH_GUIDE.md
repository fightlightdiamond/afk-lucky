# 🎯 Hướng Dẫn Sử Dụng Slide Hackathon

## 📋 Tổng Quan

File `HACKATHON_PITCH.md` là bộ slide presentation hoàn chỉnh cho hackathon, được thiết kế với:

- **40+ slides** bao phủm đầy đủ dự án
- **Cấu trúc logic** từ problem → solution → demo → impact
- **Visual elements** với diagrams, code snippets, metrics
- **Professional design** phù hợp với hackathon

## 🛠️ Cách Sử Dụng

### Option 1: Marp (Khuyến nghị)

**Marp** là công cụ tạo slide từ Markdown, rất phổ biến và dễ dùng.

#### Cài đặt Marp CLI

```bash
# Cài đặt Marp CLI
npm install -g @marp-team/marp-cli

# Hoặc với yarn
yarn global add @marp-team/marp-cli
```

#### Tạo slide HTML

```bash
# Tạo file HTML
marp HACKATHON_PITCH.md -o hackathon-pitch.html

# Tạo PDF
marp HACKATHON_PITCH.md -o hackathon-pitch.pdf --allow-local-files

# Tạo PowerPoint
marp HACKATHON_PITCH.md -o hackathon-pitch.pptx
```

#### Present trực tiếp

```bash
# Mở browser để present
marp HACKATHON_PITCH.md --preview

# Hoặc với watch mode (auto-reload khi edit)
marp HACKATHON_PITCH.md --watch --preview
```

#### Marp for VS Code

1. Cài extension **Marp for VS Code**
2. Mở file `HACKATHON_PITCH.md`
3. Click icon "Open Preview" (Ctrl+K V)
4. Present mode: Click "Toggle Slide View"

### Option 2: Slidev

**Slidev** là framework presentation hiện đại với nhiều tính năng.

#### Cài đặt

```bash
# Tạo project Slidev mới
npm init slidev@latest

# Copy nội dung HACKATHON_PITCH.md vào slides.md
```

#### Chạy

```bash
npm run dev      # Development mode
npm run build    # Build static site
npm run export   # Export PDF
```

### Option 3: Reveal.js

**Reveal.js** là framework presentation mạnh mẽ với nhiều effects.

#### Setup

```bash
# Clone reveal.js
git clone https://github.com/hakimel/reveal.js.git
cd reveal.js

# Install dependencies
npm install

# Copy và convert markdown
# (Cần convert format một chút)
```

### Option 4: Google Slides / PowerPoint

Nếu muốn dùng Google Slides hoặc PowerPoint:

1. Export PDF từ Marp: `marp HACKATHON_PITCH.md -o pitch.pdf`
2. Import PDF vào Google Slides hoặc PowerPoint
3. Customize thêm nếu cần

## 🎨 Customization

### Thay đổi theme

Trong file `HACKATHON_PITCH.md`, sửa phần header:

```yaml
---
theme: default # Đổi thành: gaia, uncover, hoặc custom theme
---
```

### Thêm logo/images

```markdown
![width:200px](path/to/logo.png)
```

### Thay đổi màu sắc

Sửa phần `style:` trong header:

```css
style: | h1 {
  color: #your-color;
}
```

### Thêm animations

Với Marp, thêm class:

```markdown
<!-- _class: lead -->

# Animated Slide
```

## 📊 Cấu Trúc Slide

### Part 1: Introduction (Slides 1-5)

- Title slide
- Problem statement
- Solution overview
- Architecture
- Tech stack

### Part 2: Features (Slides 6-15)

- Core features
- Word insertion demo
- Vector search
- Hybrid TTS
- Vocabulary management

### Part 3: Technical Deep Dive (Slides 16-25)

- Quality assurance
- Performance metrics
- Code highlights
- Testing strategy
- Security

### Part 4: Business & Impact (Slides 26-35)

- Use cases
- Demo flow
- Future roadmap
- Business model
- Impact & vision

### Part 5: Closing (Slides 36-40)

- Call to action
- Why we'll win
- Thank you
- Q&A
- Appendix

## 🎤 Presentation Tips

### Timing (15 phút presentation)

| Section           | Time  | Slides |
| ----------------- | ----- | ------ |
| Intro & Problem   | 2 min | 1-5    |
| Solution & Demo   | 5 min | 6-15   |
| Technical Details | 4 min | 16-25  |
| Business & Impact | 3 min | 26-35  |
| Closing           | 1 min | 36-40  |

### Key Messages

1. **Problem:** Học từ vựng nhàm chán, không context
2. **Solution:** AI tạo truyện + chèn từ thông minh
3. **Innovation:** Hybrid TTS + Semantic search
4. **Impact:** Giúp 1 triệu người học hiệu quả hơn

### Demo Script

```
1. "Để tôi demo nhanh cách hoạt động..."
2. Mở app → Tạo story mới
3. Chọn topic "Technology", difficulty "Intermediate"
4. Click "Generate" → Show kết quả
5. Play audio → Highlight hybrid TTS
6. Show glossary → Explain learning flow
```

### Q&A Preparation

**Câu hỏi thường gặp:**

1. **"Làm sao đảm bảo từ được chèn tự nhiên?"**
   → Grammar analysis + Readability validation + Context relevance check

2. **"Scalability như thế nào?"**
   → ChromaDB scales to millions, PostgreSQL với connection pooling, Rate limiting

3. **"Cost của Azure OpenAI?"**
   → ~$0.0001/1K tokens, batch processing để optimize

4. **"Tại sao không dùng Google Translate?"**
   → Cần context-aware insertion, không chỉ translation

5. **"Roadmap tiếp theo?"**
   → Mobile app, gamification, multi-language support

## 🎯 Slide Highlights

### Slides quan trọng nhất

1. **Slide 2 (Problem)** - Hook audience
2. **Slide 3 (Solution)** - Clear value proposition
3. **Slide 7 (Word Insertion)** - Core innovation
4. **Slide 8 (Vector Search)** - Technical depth
5. **Slide 9 (Hybrid TTS)** - Unique feature
6. **Slide 20 (Demo Flow)** - User experience
7. **Slide 28 (Impact)** - Vision & mission

### Slides có thể skip nếu thiếu thời gian

- Slide 15 (Vocabulary Management) - Merge vào slide khác
- Slide 22-24 (Code Highlights) - Chỉ show nếu có câu hỏi technical
- Slide 38-40 (Appendix) - Reference only

## 📱 Backup Plans

### Nếu demo live fail

1. **Video backup:** Record demo trước
2. **Screenshots:** Prepare key screens
3. **Explain flow:** Walk through slides 20-21

### Nếu thiếu thời gian

**5-minute version:**

- Slides: 1, 2, 3, 7, 8, 9, 20, 28, 36

**10-minute version:**

- Slides: 1-5, 7-9, 11, 14, 20, 23, 28, 36

## 🎨 Visual Enhancements

### Thêm screenshots

Chụp screenshots của:

1. Story creation form
2. Generated story với từ được chèn
3. Audio player interface
4. Glossary view
5. Admin dashboard

Thêm vào slides:

```markdown
![Story Creation](./screenshots/story-creation.png)
```

### Thêm diagrams

Dùng Mermaid hoặc draw.io để tạo:

1. System architecture diagram
2. Data flow diagram
3. Embedding pipeline
4. User journey map

### Thêm animations

Với Slidev, có thể thêm:

```markdown
<v-clicks>

- Point 1
- Point 2
- Point 3

</v-clicks>
```

## 🚀 Quick Start

### Cách nhanh nhất để present

```bash
# 1. Cài Marp CLI
npm install -g @marp-team/marp-cli

# 2. Preview slide
marp HACKATHON_PITCH.md --preview

# 3. Present!
# Dùng arrow keys để navigate
# Press F để fullscreen
```

### Keyboard shortcuts (Marp)

- `→` / `Space` - Next slide
- `←` - Previous slide
- `F` - Fullscreen
- `Esc` - Exit fullscreen
- `P` - Presenter mode (nếu có)

## 📝 Checklist Trước Khi Present

### Technical Setup

- [ ] Laptop charged đầy
- [ ] Backup slides trên USB/cloud
- [ ] Test projector/screen connection
- [ ] Browser tabs đã mở sẵn (demo, docs)
- [ ] Internet connection stable

### Content Preparation

- [ ] Đọc qua slides 2-3 lần
- [ ] Practice demo flow
- [ ] Prepare Q&A answers
- [ ] Time presentation (< 15 min)
- [ ] Backup video demo ready

### Presentation Skills

- [ ] Eye contact với judges
- [ ] Speak clearly và confident
- [ ] Highlight key innovations
- [ ] Show passion for project
- [ ] End with strong call-to-action

## 🏆 Winning Tips

### Điểm cộng với judges

1. **Clear problem statement** - Judges hiểu ngay pain point
2. **Working demo** - Show, don't just tell
3. **Technical depth** - Explain architecture & innovations
4. **Business viability** - Show market fit & monetization
5. **Team passion** - Enthusiasm is contagious

### Điểm trừ cần tránh

1. ❌ Quá nhiều text trên slide
2. ❌ Demo fail không có backup
3. ❌ Nói quá nhanh/chậm
4. ❌ Không trả lời được câu hỏi technical
5. ❌ Vượt quá thời gian

## 📞 Support

Nếu cần hỗ trợ:

1. **Marp issues:** https://github.com/marp-team/marp-cli/issues
2. **Slidev docs:** https://sli.dev/
3. **Reveal.js docs:** https://revealjs.com/

## 🎉 Good Luck!

Remember:

- **Be confident** - You built something amazing
- **Be clear** - Simple explanations win
- **Be passionate** - Show you care about the problem
- **Be prepared** - Practice makes perfect

**You got this! 🚀**
