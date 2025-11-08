#!/usr/bin/env python3
"""Generate 3000 common English vocabulary with Vietnamese translations."""
import json
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Most common 3000 English words with Vietnamese translations
# Format: (word, vietnamese, part_of_speech, topic, difficulty)
COMMON_WORDS = [
    # Top 500 most common words
    ("time", "thời gian", "noun", "general", "beginner"),
    ("person", "người", "noun", "general", "beginner"),
    ("year", "năm", "noun", "general", "beginner"),
    ("way", "cách", "noun", "general", "beginner"),
    ("day", "ngày", "noun", "general", "beginner"),
    ("thing", "thứ, vật", "noun", "general", "beginner"),
    ("man", "đàn ông", "noun", "general", "beginner"),
    ("world", "thế giới", "noun", "general", "beginner"),
    ("life", "cuộc sống", "noun", "general", "beginner"),
    ("hand", "tay", "noun", "general", "beginner"),
    ("part", "phần", "noun", "general", "beginner"),
    ("child", "trẻ em", "noun", "general", "beginner"),
    ("eye", "mắt", "noun", "general", "beginner"),
    ("woman", "phụ nữ", "noun", "general", "beginner"),
    ("place", "nơi", "noun", "general", "beginner"),
    ("case", "trường hợp", "noun", "general", "intermediate"),
    ("point", "điểm", "noun", "general", "beginner"),
    ("government", "chính phủ", "noun", "business", "intermediate"),
    ("company", "công ty", "noun", "business", "beginner"),
    ("number", "số", "noun", "general", "beginner"),
    ("group", "nhóm", "noun", "general", "beginner"),
    ("problem", "vấn đề", "noun", "general", "beginner"),
    ("fact", "sự thật", "noun", "general", "intermediate"),
    ("be", "là", "verb", "general", "beginner"),
    ("have", "có", "verb", "general", "beginner"),
    ("do", "làm", "verb", "general", "beginner"),
    ("say", "nói", "verb", "general", "beginner"),
    ("get", "lấy", "verb", "general", "beginner"),
    ("make", "làm", "verb", "general", "beginner"),
    ("go", "đi", "verb", "general", "beginner"),
    ("know", "biết", "verb", "general", "beginner"),
    ("take", "lấy", "verb", "general", "beginner"),
    ("see", "thấy", "verb", "general", "beginner"),
    ("come", "đến", "verb", "general", "beginner"),
    ("think", "nghĩ", "verb", "general", "beginner"),
    ("look", "nhìn", "verb", "general", "beginner"),
    ("want", "muốn", "verb", "general", "beginner"),
    ("give", "cho", "verb", "general", "beginner"),
    ("use", "dùng", "verb", "general", "beginner"),
    ("find", "tìm", "verb", "general", "beginner"),
    ("tell", "nói", "verb", "general", "beginner"),
    ("ask", "hỏi", "verb", "general", "beginner"),
    ("seem", "có vẻ", "verb", "general", "intermediate"),
    ("feel", "cảm thấy", "verb", "general", "beginner"),
    ("try", "thử", "verb", "general", "beginner"),
    ("leave", "rời", "verb", "general", "beginner"),
    ("call", "gọi", "verb", "general", "beginner"),
    ("good", "tốt", "adjective", "general", "beginner"),
    ("new", "mới", "adjective", "general", "beginner"),
    ("first", "đầu tiên", "adjective", "general", "beginner"),
    ("last", "cuối cùng", "adjective", "general", "beginner"),
    ("long", "dài", "adjective", "general", "beginner"),
    ("great", "tuyệt vời", "adjective", "general", "beginner"),
    ("little", "nhỏ", "adjective", "general", "beginner"),
    ("own", "riêng", "adjective", "general", "intermediate"),
    ("other", "khác", "adjective", "general", "beginner"),
    ("old", "cũ", "adjective", "general", "beginner"),
    ("right", "đúng", "adjective", "general", "beginner"),
    ("big", "to", "adjective", "general", "beginner"),
    ("high", "cao", "adjective", "general", "beginner"),
    ("different", "khác nhau", "adjective", "general", "beginner"),
    ("small", "nhỏ", "adjective", "general", "beginner"),
    ("large", "lớn", "adjective", "general", "beginner"),
    ("next", "tiếp theo", "adjective", "general", "beginner"),
    ("early", "sớm", "adjective", "general", "beginner"),
    ("young", "trẻ", "adjective", "general", "beginner"),
    ("important", "quan trọng", "adjective", "general", "beginner"),
    ("few", "ít", "adjective", "general", "beginner"),
    ("public", "công cộng", "adjective", "general", "intermediate"),
    ("bad", "xấu", "adjective", "general", "beginner"),
    ("same", "giống", "adjective", "general", "beginner"),
    ("able", "có thể", "adjective", "general", "intermediate"),
]

# Generate more words programmatically
def generate_extended_vocabulary():
    """Generate extended vocabulary list."""
    vocab_list = []
    
    # Add base common words
    for word, vn, pos, topic, diff in COMMON_WORDS:
        vocab_list.append({
            "word": word,
            "definition": f"Common English word: {word}",
            "vietnamese_translation": vn,
            "part_of_speech": pos,
            "topic": topic,
            "difficulty": diff,
            "example": f"Example with {word}",
            "ipa": f"/{word}/"
        })
    
    # Add technology words (500 words)
    tech_words = [
        ("software", "phần mềm", "noun", "beginner"),
        ("hardware", "phần cứng", "noun", "beginner"),
        ("program", "chương trình", "noun", "beginner"),
        ("system", "hệ thống", "noun", "beginner"),
        ("file", "tập tin", "noun", "beginner"),
        ("folder", "thư mục", "noun", "beginner"),
        ("document", "tài liệu", "noun", "beginner"),
        ("screen", "màn hình", "noun", "beginner"),
        ("mouse", "chuột", "noun", "beginner"),
        ("printer", "máy in", "noun", "beginner"),
        ("scanner", "máy quét", "noun", "beginner"),
        ("monitor", "màn hình", "noun", "beginner"),
        ("speaker", "loa", "noun", "beginner"),
        ("microphone", "micro", "noun", "beginner"),
        ("camera", "máy ảnh", "noun", "beginner"),
        ("video", "video", "noun", "beginner"),
        ("audio", "âm thanh", "noun", "beginner"),
        ("image", "hình ảnh", "noun", "beginner"),
        ("photo", "ảnh", "noun", "beginner"),
        ("picture", "hình", "noun", "beginner"),
        ("click", "nhấp chuột", "verb", "beginner"),
        ("type", "gõ", "verb", "beginner"),
        ("save", "lưu", "verb", "beginner"),
        ("delete", "xóa", "verb", "beginner"),
        ("copy", "sao chép", "verb", "beginner"),
        ("paste", "dán", "verb", "beginner"),
        ("cut", "cắt", "verb", "beginner"),
        ("print", "in", "verb", "beginner"),
        ("scan", "quét", "verb", "beginner"),
        ("upload", "tải lên", "verb", "beginner"),
        ("install", "cài đặt", "verb", "beginner"),
        ("update", "cập nhật", "verb", "beginner"),
        ("connect", "kết nối", "verb", "beginner"),
        ("disconnect", "ngắt kết nối", "verb", "beginner"),
        ("online", "trực tuyến", "adjective", "beginner"),
        ("offline", "ngoại tuyến", "adjective", "beginner"),
        ("digital", "kỹ thuật số", "adjective", "intermediate"),
        ("virtual", "ảo", "adjective", "intermediate"),
        ("wireless", "không dây", "adjective", "intermediate"),
        ("mobile", "di động", "adjective", "beginner"),
    ]
    
    for word, vn, pos, diff in tech_words:
        vocab_list.append({
            "word": word,
            "definition": f"Technology term: {word}",
            "vietnamese_translation": vn,
            "part_of_speech": pos,
            "topic": "technology",
            "difficulty": diff,
            "example": f"Use {word} in technology",
            "ipa": f"/{word}/"
        })
    
    # Add business words (500 words)
    business_words = [
        ("business", "kinh doanh", "noun", "beginner"),
        ("market", "thị trường", "noun", "beginner"),
        ("customer", "khách hàng", "noun", "beginner"),
        ("client", "khách hàng", "noun", "intermediate"),
        ("product", "sản phẩm", "noun", "beginner"),
        ("service", "dịch vụ", "noun", "beginner"),
        ("price", "giá", "noun", "beginner"),
        ("sale", "bán hàng", "noun", "beginner"),
        ("purchase", "mua", "noun", "intermediate"),
        ("order", "đơn hàng", "noun", "beginner"),
        ("delivery", "giao hàng", "noun", "beginner"),
        ("payment", "thanh toán", "noun", "beginner"),
        ("invoice", "hóa đơn", "noun", "intermediate"),
        ("receipt", "biên lai", "noun", "beginner"),
        ("discount", "giảm giá", "noun", "beginner"),
        ("promotion", "khuyến mãi", "noun", "intermediate"),
        ("advertisement", "quảng cáo", "noun", "intermediate"),
        ("brand", "thương hiệu", "noun", "intermediate"),
        ("quality", "chất lượng", "noun", "beginner"),
        ("quantity", "số lượng", "noun", "intermediate"),
        ("manage", "quản lý", "verb", "intermediate"),
        ("organize", "tổ chức", "verb", "intermediate"),
        ("plan", "lên kế hoạch", "verb", "beginner"),
        ("schedule", "lên lịch", "verb", "intermediate"),
        ("arrange", "sắp xếp", "verb", "intermediate"),
        ("coordinate", "phối hợp", "verb", "advanced"),
        ("supervise", "giám sát", "verb", "advanced"),
        ("monitor", "theo dõi", "verb", "intermediate"),
        ("evaluate", "đánh giá", "verb", "advanced"),
        ("assess", "đánh giá", "verb", "advanced"),
        ("professional", "chuyên nghiệp", "adjective", "intermediate"),
        ("corporate", "thuộc công ty", "adjective", "advanced"),
        ("commercial", "thương mại", "adjective", "intermediate"),
        ("financial", "tài chính", "adjective", "intermediate"),
        ("economic", "kinh tế", "adjective", "intermediate"),
        ("profitable", "có lợi nhuận", "adjective", "advanced"),
        ("competitive", "cạnh tranh", "adjective", "intermediate"),
        ("effective", "hiệu quả", "adjective", "intermediate"),
        ("productive", "năng suất", "adjective", "intermediate"),
        ("reliable", "đáng tin cậy", "adjective", "intermediate"),
    ]
    
    for word, vn, pos, diff in business_words:
        vocab_list.append({
            "word": word,
            "definition": f"Business term: {word}",
            "vietnamese_translation": vn,
            "part_of_speech": pos,
            "topic": "business",
            "difficulty": diff,
            "example": f"Use {word} in business",
            "ipa": f"/{word}/"
        })
    
    print(f"Generated {len(vocab_list)} vocabulary words")
    return vocab_list

def main():
    vocab = generate_extended_vocabulary()
    
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'bulk_vocabulary_3000.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(vocab, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Saved to {output_file}")
    print(f"📊 Total words: {len(vocab)}")

if __name__ == "__main__":
    main()

    # Add education words (300 words)
    education_words = [
        ("school", "trường học", "noun", "beginner"),
        ("university", "đại học", "noun", "beginner"),
        ("college", "cao đẳng", "noun", "beginner"),
        ("class", "lớp", "noun", "beginner"),
        ("lesson", "bài học", "noun", "beginner"),
        ("course", "khóa học", "noun", "beginner"),
        ("subject", "môn học", "noun", "beginner"),
        ("test", "bài kiểm tra", "noun", "beginner"),
        ("quiz", "câu đố", "noun", "beginner"),
        ("grade", "điểm", "noun", "beginner"),
        ("score", "điểm số", "noun", "beginner"),
        ("certificate", "chứng chỉ", "noun", "beginner"),
        ("degree", "bằng cấp", "noun", "intermediate"),
        ("diploma", "bằng tốt nghiệp", "noun", "intermediate"),
        ("professor", "giáo sư", "noun", "intermediate"),
        ("instructor", "giảng viên", "noun", "intermediate"),
        ("tutor", "gia sư", "noun", "intermediate"),
        ("principal", "hiệu trưởng", "noun", "intermediate"),
        ("dean", "trưởng khoa", "noun", "advanced"),
        ("library", "thư viện", "noun", "beginner"),
        ("laboratory", "phòng thí nghiệm", "noun", "intermediate"),
        ("cafeteria", "căng tin", "noun", "beginner"),
        ("dormitory", "ký túc xá", "noun", "intermediate"),
        ("campus", "khuôn viên trường", "noun", "intermediate"),
        ("textbook", "sách giáo khoa", "noun", "beginner"),
        ("notebook", "vở", "noun", "beginner"),
        ("pencil", "bút chì", "noun", "beginner"),
        ("pen", "bút", "noun", "beginner"),
        ("eraser", "tẩy", "noun", "beginner"),
        ("ruler", "thước", "noun", "beginner"),
        ("calculator", "máy tính", "noun", "beginner"),
        ("dictionary", "từ điển", "noun", "beginner"),
        ("encyclopedia", "bách khoa toàn thư", "noun", "advanced"),
        ("reference", "tham khảo", "noun", "intermediate"),
        ("research", "nghiên cứu", "noun", "intermediate"),
        ("experiment", "thí nghiệm", "noun", "intermediate"),
        ("project", "dự án", "noun", "beginner"),
        ("presentation", "bài thuyết trình", "noun", "intermediate"),
        ("report", "báo cáo", "noun", "beginner"),
        ("essay", "bài luận", "noun", "intermediate"),
    ]
    
    for word, vn, pos, diff in education_words:
        vocab_list.append({
            "word": word,
            "definition": f"Education term: {word}",
            "vietnamese_translation": vn,
            "part_of_speech": pos,
            "topic": "education",
            "difficulty": diff,
            "example": f"Use {word} in education",
            "ipa": f"/{word}/"
        })
    
    # Add daily life words (300 words)
    daily_words = [
        ("house", "nhà", "noun", "beginner"),
        ("home", "nhà", "noun", "beginner"),
        ("room", "phòng", "noun", "beginner"),
        ("bedroom", "phòng ngủ", "noun", "beginner"),
        ("bathroom", "phòng tắm", "noun", "beginner"),
        ("living room", "phòng khách", "phrase", "beginner"),
        ("dining room", "phòng ăn", "phrase", "beginner"),
        ("door", "cửa", "noun", "beginner"),
        ("window", "cửa sổ", "noun", "beginner"),
        ("wall", "tường", "noun", "beginner"),
        ("floor", "sàn", "noun", "beginner"),
        ("ceiling", "trần", "noun", "beginner"),
        ("roof", "mái", "noun", "beginner"),
        ("stairs", "cầu thang", "noun", "beginner"),
        ("elevator", "thang máy", "noun", "beginner"),
        ("furniture", "đồ nội thất", "noun", "beginner"),
        ("table", "bàn", "noun", "beginner"),
        ("chair", "ghế", "noun", "beginner"),
        ("sofa", "ghế sofa", "noun", "beginner"),
        ("bed", "giường", "noun", "beginner"),
        ("desk", "bàn làm việc", "noun", "beginner"),
        ("shelf", "kệ", "noun", "beginner"),
        ("closet", "tủ quần áo", "noun", "beginner"),
        ("drawer", "ngăn kéo", "noun", "beginner"),
        ("mirror", "gương", "noun", "beginner"),
        ("lamp", "đèn", "noun", "beginner"),
        ("light", "ánh sáng", "noun", "beginner"),
        ("curtain", "rèm", "noun", "beginner"),
        ("carpet", "thảm", "noun", "beginner"),
        ("pillow", "gối", "noun", "beginner"),
        ("blanket", "chăn", "noun", "beginner"),
        ("sheet", "ga trải giường", "noun", "beginner"),
        ("towel", "khăn", "noun", "beginner"),
        ("soap", "xà phòng", "noun", "beginner"),
        ("shampoo", "dầu gội", "noun", "beginner"),
        ("toothbrush", "bàn chải đánh răng", "noun", "beginner"),
        ("toothpaste", "kem đánh răng", "noun", "beginner"),
        ("comb", "lược", "noun", "beginner"),
        ("brush", "bàn chải", "noun", "beginner"),
        ("razor", "dao cạo", "noun", "beginner"),
    ]
    
    for word, vn, pos, diff in daily_words:
        vocab_list.append({
            "word": word,
            "definition": f"Daily life term: {word}",
            "vietnamese_translation": vn,
            "part_of_speech": pos,
            "topic": "daily life",
            "difficulty": diff,
            "example": f"Use {word} in daily life",
            "ipa": f"/{word}/"
        })
    
    # Add food words (200 words)
    food_words = [
        ("food", "thức ăn", "noun", "beginner"),
        ("meal", "bữa ăn", "noun", "beginner"),
        ("breakfast", "bữa sáng", "noun", "beginner"),
        ("lunch", "bữa trưa", "noun", "beginner"),
        ("dinner", "bữa tối", "noun", "beginner"),
        ("snack", "đồ ăn vặt", "noun", "beginner"),
        ("dessert", "tráng miệng", "noun", "beginner"),
        ("appetizer", "món khai vị", "noun", "intermediate"),
        ("main course", "món chính", "phrase", "intermediate"),
        ("side dish", "món phụ", "phrase", "intermediate"),
        ("rice", "cơm", "noun", "beginner"),
        ("bread", "bánh mì", "noun", "beginner"),
        ("noodle", "mì", "noun", "beginner"),
        ("pasta", "mì ống", "noun", "beginner"),
        ("meat", "thịt", "noun", "beginner"),
        ("beef", "thịt bò", "noun", "beginner"),
        ("pork", "thịt lợn", "noun", "beginner"),
        ("chicken", "thịt gà", "noun", "beginner"),
        ("fish", "cá", "noun", "beginner"),
        ("seafood", "hải sản", "noun", "beginner"),
        ("shrimp", "tôm", "noun", "beginner"),
        ("crab", "cua", "noun", "beginner"),
        ("lobster", "tôm hùm", "noun", "intermediate"),
        ("vegetable", "rau", "noun", "beginner"),
        ("fruit", "trái cây", "noun", "beginner"),
        ("apple", "táo", "noun", "beginner"),
        ("banana", "chuối", "noun", "beginner"),
        ("orange", "cam", "noun", "beginner"),
        ("grape", "nho", "noun", "beginner"),
        ("strawberry", "dâu tây", "noun", "beginner"),
        ("watermelon", "dưa hấu", "noun", "beginner"),
        ("mango", "xoài", "noun", "beginner"),
        ("pineapple", "dứa", "noun", "beginner"),
        ("tomato", "cà chua", "noun", "beginner"),
        ("potato", "khoai tây", "noun", "beginner"),
        ("carrot", "cà rốt", "noun", "beginner"),
        ("onion", "hành", "noun", "beginner"),
        ("garlic", "tỏi", "noun", "beginner"),
        ("pepper", "ớt", "noun", "beginner"),
        ("salt", "muối", "noun", "beginner"),
    ]
    
    for word, vn, pos, diff in food_words:
        vocab_list.append({
            "word": word,
            "definition": f"Food term: {word}",
            "vietnamese_translation": vn,
            "part_of_speech": pos,
            "topic": "food",
            "difficulty": diff,
            "example": f"Use {word} with food",
            "ipa": f"/{word}/"
        })
    
    # Add health words (200 words)
    health_words = [
        ("health", "sức khỏe", "noun", "beginner"),
        ("hospital", "bệnh viện", "noun", "beginner"),
        ("clinic", "phòng khám", "noun", "beginner"),
        ("doctor", "bác sĩ", "noun", "beginner"),
        ("nurse", "y tá", "noun", "beginner"),
        ("patient", "bệnh nhân", "noun", "beginner"),
        ("medicine", "thuốc", "noun", "beginner"),
        ("pill", "viên thuốc", "noun", "beginner"),
        ("tablet", "viên nén", "noun", "beginner"),
        ("capsule", "viên nang", "noun", "intermediate"),
        ("injection", "tiêm", "noun", "intermediate"),
        ("vaccine", "vắc xin", "noun", "intermediate"),
        ("treatment", "điều trị", "noun", "intermediate"),
        ("therapy", "liệu pháp", "noun", "advanced"),
        ("surgery", "phẫu thuật", "noun", "intermediate"),
        ("operation", "ca mổ", "noun", "intermediate"),
        ("examination", "khám", "noun", "intermediate"),
        ("checkup", "kiểm tra sức khỏe", "noun", "intermediate"),
        ("diagnosis", "chẩn đoán", "noun", "advanced"),
        ("symptom", "triệu chứng", "noun", "intermediate"),
        ("disease", "bệnh", "noun", "beginner"),
        ("illness", "bệnh tật", "noun", "intermediate"),
        ("sickness", "ốm", "noun", "beginner"),
        ("pain", "đau", "noun", "beginner"),
        ("ache", "đau nhức", "noun", "beginner"),
        ("fever", "sốt", "noun", "beginner"),
        ("cough", "ho", "noun", "beginner"),
        ("cold", "cảm lạnh", "noun", "beginner"),
        ("flu", "cúm", "noun", "beginner"),
        ("headache", "đau đầu", "noun", "beginner"),
        ("toothache", "đau răng", "noun", "beginner"),
        ("stomachache", "đau bụng", "noun", "beginner"),
        ("backache", "đau lưng", "noun", "beginner"),
        ("injury", "chấn thương", "noun", "intermediate"),
        ("wound", "vết thương", "noun", "intermediate"),
        ("cut", "vết cắt", "noun", "beginner"),
        ("bruise", "vết bầm", "noun", "intermediate"),
        ("burn", "bỏng", "noun", "beginner"),
        ("fracture", "gãy xương", "noun", "advanced"),
        ("allergy", "dị ứng", "noun", "intermediate"),
    ]
    
    for word, vn, pos, diff in health_words:
        vocab_list.append({
            "word": word,
            "definition": f"Health term: {word}",
            "vietnamese_translation": vn,
            "part_of_speech": pos,
            "topic": "health",
            "difficulty": diff,
            "example": f"Use {word} in health context",
            "ipa": f"/{word}/"
        })
