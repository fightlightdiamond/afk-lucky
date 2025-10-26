"""
Text-to-Speech service using Hugging Face transformers.
Supports hybrid Vietnamese-English TTS with language detection.
"""
import os
import io
import base64
import numpy as np
import soundfile as sf
import re
from typing import Optional, Dict, Any, List, Tuple
from transformers import VitsModel, AutoTokenizer
import torch
from pathlib import Path
from langdetect import detect, LangDetectException

from ..config import settings

class TTSService:
    """Text-to-Speech service for converting text to audio with hybrid language support."""
    
    def __init__(self):
        self.vi_model = None
        self.vi_tokenizer = None
        self.en_model = None
        self.en_tokenizer = None
        self.vi_model_name = "facebook/mms-tts-vie"  # Vietnamese TTS model
        self.en_model_name = "facebook/mms-tts-eng"  # English TTS model
        self.hybrid_mode = True  # Enable hybrid mode by default
        self._load_models()
    
    def _load_models(self):
        """Load TTS models and tokenizers for both Vietnamese and English."""
        # Load Vietnamese model (primary)
        try:
            print(f"Loading Vietnamese TTS model: {self.vi_model_name}")
            self.vi_model = VitsModel.from_pretrained(self.vi_model_name)
            self.vi_tokenizer = AutoTokenizer.from_pretrained(self.vi_model_name)
            print("Vietnamese TTS model loaded successfully")
        except Exception as e:
            print(f"Error loading Vietnamese TTS model: {e}")
            self.vi_model = None
            self.vi_tokenizer = None
        
        # Load English model (optional, for hybrid mode)
        if self.hybrid_mode:
            try:
                print(f"Loading English TTS model: {self.en_model_name}")
                self.en_model = VitsModel.from_pretrained(self.en_model_name)
                self.en_tokenizer = AutoTokenizer.from_pretrained(self.en_model_name)
                print("English TTS model loaded successfully")
            except Exception as e:
                print(f"Warning: Could not load English TTS model: {e}")
                print("Falling back to Vietnamese-only mode")
                self.en_model = None
                self.en_tokenizer = None
                self.hybrid_mode = False
    
    def is_available(self) -> bool:
        """Check if TTS service is available."""
        return self.vi_model is not None and self.vi_tokenizer is not None
    
    def _detect_language(self, text: str) -> str:
        """
        Detect language of a text segment using langdetect.
        
        Args:
            text: Text to detect language
            
        Returns:
            'vi' for Vietnamese, 'en' for English, 'vi' as default
        """
        if not text or len(text.strip()) < 3:
            return 'vi'  # Default to Vietnamese for very short text
        
        try:
            detected = detect(text)
            # Map detected language to our supported languages
            if detected == 'en':
                return 'en'
            elif detected == 'vi':
                return 'vi'
            else:
                # For other languages, check if text is mostly Latin characters
                latin_chars = sum(1 for c in text if c.isascii() and c.isalpha())
                total_chars = sum(1 for c in text if c.isalpha())
                if total_chars > 0 and latin_chars / total_chars > 0.7:
                    return 'en'
                return 'vi'
        except LangDetectException:
            # If detection fails, use heuristic
            # Check if text contains Vietnamese characters with diacritics
            vietnamese_chars = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ'
            if any(c in vietnamese_chars for c in text.lower()):
                return 'vi'
            # If mostly ASCII letters, assume English
            if text.replace(' ', '').isascii():
                return 'en'
            return 'vi'
    
    def _detect_language_segments(self, text: str) -> List[Tuple[str, str]]:
        """
        Detect language segments in text and split into Vietnamese and English parts.
        Uses sentence-level detection for better accuracy.
        
        Args:
            text: Input text with mixed languages
            
        Returns:
            List of tuples (segment_text, language) where language is 'vi' or 'en'
        """
        if not self.hybrid_mode or not self.en_model:
            # If hybrid mode disabled or English model not available, treat all as Vietnamese
            return [(text, 'vi')]
        
        # Split by common sentence delimiters
        # This regex splits on: . ! ? , and preserves the delimiter
        parts = re.split(r'([.!?,;])', text)
        
        segments = []
        current_segment = ""
        current_lang = None
        
        for i, part in enumerate(parts):
            if not part.strip():
                continue
            
            # If it's a delimiter, add to current segment
            if part in '.!?,;':
                current_segment += part
                continue
            
            # Detect language of this part
            detected_lang = self._detect_language(part)
            
            # If language changed or first segment
            if current_lang is None:
                current_lang = detected_lang
                current_segment = part
            elif detected_lang != current_lang:
                # Save previous segment
                if current_segment.strip():
                    segments.append((current_segment.strip(), current_lang))
                # Start new segment
                current_segment = part
                current_lang = detected_lang
            else:
                # Same language, continue building segment
                current_segment += part
        
        # Add last segment
        if current_segment.strip():
            segments.append((current_segment.strip(), current_lang))
        
        # If no segments detected, treat entire text as Vietnamese
        if not segments:
            segments.append((text, 'vi'))
        
        # Merge consecutive segments with same language
        merged_segments = []
        for segment_text, lang in segments:
            if merged_segments and merged_segments[-1][1] == lang:
                # Merge with previous segment
                merged_segments[-1] = (merged_segments[-1][0] + ' ' + segment_text, lang)
            else:
                merged_segments.append((segment_text, lang))
        
        return merged_segments
    
    def _generate_audio_segment(self, text: str, language: str) -> Optional[Tuple[np.ndarray, int]]:
        """
        Generate audio for a single language segment.
        
        Args:
            text: Text segment
            language: Language code ('vi' or 'en')
            
        Returns:
            Tuple of (audio_array, sampling_rate) or None if error
        """
        try:
            # Select appropriate model and tokenizer
            if language == 'en' and self.en_model and self.en_tokenizer:
                model = self.en_model
                tokenizer = self.en_tokenizer
            else:
                model = self.vi_model
                tokenizer = self.vi_tokenizer
            
            if not model or not tokenizer:
                return None
            
            # Tokenize and generate
            inputs = tokenizer(text, return_tensors="pt")
            
            with torch.no_grad():
                output = model(**inputs).waveform
            
            # Convert to numpy
            audio_np = output.cpu().numpy()
            audio_np = np.squeeze(audio_np)
            audio_np = audio_np.astype(np.float32)
            
            sampling_rate = model.config.sampling_rate
            
            return (audio_np, sampling_rate)
            
        except Exception as e:
            print(f"Error generating audio segment for '{text}' ({language}): {e}")
            return None
    
    def _merge_audio_segments(self, segments: List[Tuple[np.ndarray, int]], 
                             target_sr: int = 16000) -> np.ndarray:
        """
        Merge multiple audio segments into one, with optional resampling.
        
        Args:
            segments: List of (audio_array, sampling_rate) tuples
            target_sr: Target sampling rate for output
            
        Returns:
            Merged audio array
        """
        if not segments:
            return np.array([])
        
        merged_audio = []
        silence_duration = 0.1  # 100ms silence between segments
        silence_samples = int(target_sr * silence_duration)
        silence = np.zeros(silence_samples, dtype=np.float32)
        
        for i, (audio, sr) in enumerate(segments):
            # Resample if needed
            if sr != target_sr:
                # Simple resampling (for production, use librosa.resample)
                duration = len(audio) / sr
                new_length = int(duration * target_sr)
                audio = np.interp(
                    np.linspace(0, len(audio), new_length),
                    np.arange(len(audio)),
                    audio
                )
            
            merged_audio.append(audio)
            
            # Add silence between segments (except after last segment)
            if i < len(segments) - 1:
                merged_audio.append(silence)
        
        return np.concatenate(merged_audio)
    
    def text_to_speech(self, text: str, output_format: str = "wav", save_file: bool = False, 
                      filename: str = None, use_hybrid: bool = None) -> Optional[Dict[str, Any]]:
        """
        Convert text to speech with hybrid language support.
        
        Args:
            text: Text to convert to speech (can contain mixed Vietnamese and English)
            output_format: Output format ("wav", "base64", "bytes", "file")
            save_file: Whether to save audio as file on server
            filename: Custom filename (without extension)
            use_hybrid: Override hybrid mode setting (None = use default)
            
        Returns:
            Dictionary with audio data and metadata, or None if error
        """
        if not self.is_available():
            return None
        
        try:
            # Clean and prepare text
            cleaned_text = self._clean_text(text)
            if not cleaned_text:
                return None
            
            # Determine if using hybrid mode
            hybrid_enabled = use_hybrid if use_hybrid is not None else self.hybrid_mode
            
            if hybrid_enabled and self.en_model:
                # Hybrid mode: detect language segments and generate separately
                segments = self._detect_language_segments(cleaned_text)
                
                # Generate audio for each segment
                audio_segments = []
                for segment_text, language in segments:
                    result = self._generate_audio_segment(segment_text, language)
                    if result:
                        audio_segments.append(result)
                
                if not audio_segments:
                    return None
                
                # Merge all segments
                sampling_rate = 16000  # Standard rate
                audio_np = self._merge_audio_segments(audio_segments, sampling_rate)
                
            else:
                # Vietnamese-only mode (original behavior)
                inputs = self.vi_tokenizer(cleaned_text, return_tensors="pt")
                
                with torch.no_grad():
                    output = self.vi_model(**inputs).waveform
                
                audio_np = output.cpu().numpy()
                audio_np = np.squeeze(audio_np)
                audio_np = audio_np.astype(np.float32)
                
                sampling_rate = self.vi_model.config.sampling_rate
            
            # Save file if requested or if output_format is "file"
            file_path = None
            if save_file or output_format == "file":
                file_path = self._save_audio_file(audio_np, sampling_rate, filename)
            
            # Return based on format
            if output_format == "base64":
                result = self._audio_to_base64(audio_np, sampling_rate)
            elif output_format == "bytes":
                result = self._audio_to_bytes(audio_np, sampling_rate)
            elif output_format == "file":
                result = self._audio_to_file_response(audio_np, sampling_rate, file_path)
            else:  # wav data
                result = self._audio_to_wav_data(audio_np, sampling_rate)
            
            # Add file path if file was saved
            if file_path:
                result["file_path"] = file_path
                result["file_url"] = f"/api/v1/tts/audio/{Path(file_path).name}"
                
            return result
                
        except Exception as e:
            print(f"TTS generation error: {e}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """
        Clean text for TTS processing.
        
        Args:
            text: Raw text
            
        Returns:
            Cleaned text suitable for TTS
        """
        if not text:
            return ""
        
        # Remove excessive whitespace
        cleaned = " ".join(text.split())
        
        # Limit length (TTS models have token limits)
        max_length = 500  # Adjust based on model capabilities
        if len(cleaned) > max_length:
            cleaned = cleaned[:max_length].rsplit(' ', 1)[0] + "..."
        
        return cleaned
    
    def _audio_to_base64(self, audio_np: np.ndarray, sampling_rate: int) -> Dict[str, Any]:
        """Convert audio to base64 encoded string."""
        buffer = io.BytesIO()
        sf.write(buffer, audio_np, sampling_rate, format='WAV')
        buffer.seek(0)
        
        audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        
        return {
            "audio_base64": audio_base64,
            "format": "wav",
            "sampling_rate": sampling_rate,
            "duration": len(audio_np) / sampling_rate,
            "size_bytes": len(buffer.getvalue())
        }
    
    def _audio_to_bytes(self, audio_np: np.ndarray, sampling_rate: int) -> Dict[str, Any]:
        """Convert audio to bytes."""
        buffer = io.BytesIO()
        sf.write(buffer, audio_np, sampling_rate, format='WAV')
        buffer.seek(0)
        
        return {
            "audio_bytes": buffer.read(),
            "format": "wav", 
            "sampling_rate": sampling_rate,
            "duration": len(audio_np) / sampling_rate,
            "size_bytes": len(buffer.getvalue())
        }
    
    def _audio_to_wav_data(self, audio_np: np.ndarray, sampling_rate: int) -> Dict[str, Any]:
        """Convert audio to wav data with metadata."""
        return {
            "audio_data": audio_np.tolist(),  # Convert to list for JSON serialization
            "format": "wav",
            "sampling_rate": sampling_rate,
            "duration": len(audio_np) / sampling_rate,
            "shape": audio_np.shape
        }
    
    def _save_audio_file(self, audio_np: np.ndarray, sampling_rate: int, 
                        filename: str = None) -> Optional[str]:
        """
        Save audio to file on server.
        
        Args:
            audio_np: Audio data as numpy array
            sampling_rate: Audio sampling rate
            filename: Custom filename (without extension)
            
        Returns:
            File path if successful, None otherwise
        """
        try:
            # Create audio directory if not exists
            audio_dir = Path("static/audio")
            audio_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename
            if not filename:
                import time
                timestamp = int(time.time() * 1000)  # milliseconds
                filename = f"tts_{timestamp}"
            
            # Ensure .wav extension
            if not filename.endswith('.wav'):
                filename += '.wav'
            
            output_path = audio_dir / filename
            
            # Save audio file
            sf.write(str(output_path), audio_np, sampling_rate)
            return str(output_path)
        except Exception as e:
            print(f"Error saving audio file: {e}")
            return None
    
    def _audio_to_file_response(self, audio_np: np.ndarray, sampling_rate: int, 
                               file_path: str) -> Dict[str, Any]:
        """Convert audio to file-based response."""
        return {
            "format": "wav",
            "sampling_rate": sampling_rate,
            "duration": len(audio_np) / sampling_rate,
            "file_path": file_path,
            "file_url": f"/api/v1/tts/audio/{Path(file_path).name}",
            "size_bytes": Path(file_path).stat().st_size if Path(file_path).exists() else 0
        }

    def save_audio_file(self, audio_np: np.ndarray, sampling_rate: int, 
                       output_path: str) -> bool:
        """
        Save audio to file (public method for external use).
        
        Args:
            audio_np: Audio data as numpy array
            sampling_rate: Audio sampling rate
            output_path: Output file path
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Ensure output directory exists
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Save audio file
            sf.write(output_path, audio_np, sampling_rate)
            return True
        except Exception as e:
            print(f"Error saving audio file: {e}")
            return False

# Global TTS service instance
tts_service = TTSService()

def generate_tts_audio(text: str, output_format: str = "base64", save_file: bool = False,
                      filename: str = None) -> Optional[Dict[str, Any]]:
    """
    Generate TTS audio from text.
    
    Args:
        text: Text to convert to speech
        output_format: Output format ("wav", "base64", "bytes", "file")
        save_file: Whether to save audio as file on server
        filename: Custom filename (without extension)
        
    Returns:
        Audio data dictionary or None if error
    """
    return tts_service.text_to_speech(text, output_format, save_file, filename)

def is_tts_available() -> bool:
    """Check if TTS service is available."""
    return tts_service.is_available()