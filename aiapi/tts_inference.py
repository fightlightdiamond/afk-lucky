#!/usr/bin/env python3
# tts_inference.py
# Bài tập: Clone và chạy inference với mô hình Text-to-Speech (TTS) từ Hugging Face
# Tác giả: FAI.ABC PrivateGPT
# Yêu cầu: Python, pip install transformers torch soundfile

# 1. Import thư viện cần thiết
from transformers import VitsModel, AutoTokenizer
import torch
import soundfile as sf
import numpy as np

print("🎯 Bắt đầu TTS Inference...")

# 2. Tải mô hình TTS và tokenizer từ Hugging Face (Tiếng Việt)
print("📥 Đang tải mô hình TTS...")
model = VitsModel.from_pretrained("facebook/mms-tts-vie")
tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-vie")
print("✅ Đã tải mô hình thành công!")

# 3. Chuẩn bị văn bản đầu vào
text = "Xin chào anh em đến với bài tập của khoá AI Application Engineer"
print(f"\n📝 Văn bản: {text}")

# 4. Tokenize văn bản cho mô hình
print("🔄 Đang tokenize văn bản...")
inputs = tokenizer(text, return_tensors="pt")

# 5. Chạy inference để tạo waveform âm thanh từ văn bản
print("🎵 Đang tạo audio...")
with torch.no_grad():
    output = model(**inputs).waveform  # output.shape có thể là (1, N)

# 6. Sửa lỗi ghi file: chuyển tensor về numpy, loại bỏ chiều dư thừa, đảm bảo kiểu float32
audio_np = output.cpu().numpy()       # Chuyển về numpy array
audio_np = np.squeeze(audio_np)       # Loại bỏ chiều dư thừa (1, N) -> (N,)
audio_np = audio_np.astype(np.float32)# Đảm bảo kiểu dữ liệu đúng

# 7. Lưu file audio ra 'output.wav'
output_file = 'output.wav'
sf.write(output_file, audio_np, model.config.sampling_rate)

print(f'\n✅ Đã ghi file {output_file} thành công!')

# 8. Kiểm tra shape và sampling rate nếu cần debug
print(f'📊 Shape của audio: {audio_np.shape}')
print(f'🔊 Sampling rate: {model.config.sampling_rate} Hz')
print(f'⏱️  Duration: {len(audio_np) / model.config.sampling_rate:.2f} seconds')
print(f'💾 File size: {len(audio_np) * 4 / 1024:.2f} KB')

print(f'\n🎉 Hoàn thành! Bạn có thể mở file {output_file} bằng bất kỳ phần mềm phát nhạc nào.')
