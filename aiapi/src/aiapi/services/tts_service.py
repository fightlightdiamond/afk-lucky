"""
Text-to-Speech service using Hugging Face transformers.
"""
import os
import io
import base64
import numpy as np
import soundfile as sf
from typing import Optional, Dict, Any
from transformers import VitsModel, AutoTokenizer
import torch
from pathlib import Path

from ..config import settings

class TTSService:
    """Text-to-Speech service for converting text to audio."""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_name = "facebook/mms-tts-vie"  # Vietnamese TTS model
        self._load_model()
    
    def _load_model(self):
        """Load TTS model and tokenizer."""
        try:
            print(f"Loading TTS model: {self.model_name}")
            self.model = VitsModel.from_pretrained(self.model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            print("TTS model loaded successfully")
        except Exception as e:
            print(f"Error loading TTS model: {e}")
            self.model = None
            self.tokenizer = None
    
    def is_available(self) -> bool:
        """Check if TTS service is available."""
        return self.model is not None and self.tokenizer is not None
    
    def text_to_speech(self, text: str, output_format: str = "wav", save_file: bool = False, 
                      filename: str = None) -> Optional[Dict[str, Any]]:
        """
        Convert text to speech.
        
        Args:
            text: Text to convert to speech
            output_format: Output format ("wav", "base64", "bytes", "file")
            save_file: Whether to save audio as file on server
            filename: Custom filename (without extension)
            
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
            
            # Tokenize text
            inputs = self.tokenizer(cleaned_text, return_tensors="pt")
            
            # Generate audio
            with torch.no_grad():
                output = self.model(**inputs).waveform
            
            # Convert to numpy and process
            audio_np = output.cpu().numpy()
            audio_np = np.squeeze(audio_np)  # Remove extra dimensions
            audio_np = audio_np.astype(np.float32)
            
            # Get sampling rate
            sampling_rate = self.model.config.sampling_rate
            
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