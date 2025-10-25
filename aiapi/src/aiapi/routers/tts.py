"""
Text-to-Speech API routes.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from ..models import TTSRequest, TTSResponse
from ..services.tts_service import generate_tts_audio, is_tts_available

router = APIRouter()

@router.get("/tts/status")
def tts_status():
    """
    Check TTS service status.
    
    Returns:
        Status information about TTS service
    """
    return {
        "available": is_tts_available(),
        "model": "facebook/mms-tts-vie",
        "supported_formats": ["wav", "base64", "bytes"]
    }

@router.post("/tts/generate", response_model=TTSResponse)
def generate_tts(req: TTSRequest):
    """
    Generate TTS audio from text.
    
    Args:
        req: TTS request with text and format
        
    Returns:
        TTSResponse with audio data
    """
    if not is_tts_available():
        raise HTTPException(
            status_code=503, 
            detail="TTS service is not available. Please check if the model is loaded correctly."
        )
    
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    # Determine if we should save file
    save_file = req.output_format == "file"
    
    result = generate_tts_audio(req.text, req.output_format, save_file)
    
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to generate TTS audio")
    
    return TTSResponse(**result)

@router.post("/tts/generate-wav")
def generate_tts_wav(req: TTSRequest):
    """
    Generate TTS audio and return as WAV file.
    
    Args:
        req: TTS request with text
        
    Returns:
        WAV audio file as response
    """
    if not is_tts_available():
        raise HTTPException(
            status_code=503, 
            detail="TTS service is not available. Please check if the model is loaded correctly."
        )
    
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    result = generate_tts_audio(req.text, "bytes")
    
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to generate TTS audio")
    
    return Response(
        content=result["audio_bytes"],
        media_type="audio/wav",
        headers={
            "Content-Disposition": "attachment; filename=tts_output.wav",
            "Content-Length": str(result["size_bytes"])
        }
    )

@router.post("/tts/generate-file")
def generate_tts_file(req: TTSRequest):
    """
    Generate TTS audio and save as file on server.
    
    Args:
        req: TTS request with text
        
    Returns:
        File information with URL to access the audio
    """
    if not is_tts_available():
        raise HTTPException(
            status_code=503, 
            detail="TTS service is not available. Please check if the model is loaded correctly."
        )
    
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    result = generate_tts_audio(req.text, "file", save_file=True)
    
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to generate TTS audio")
    
    return {
        "message": "Audio file generated successfully",
        "file_url": result["file_url"],
        "file_path": result["file_path"],
        "duration": result["duration"],
        "sampling_rate": result["sampling_rate"],
        "size_bytes": result["size_bytes"]
    }

@router.get("/tts/audio/{filename}")
def serve_audio_file(filename: str):
    """
    Serve audio files.
    
    Args:
        filename: Audio filename
        
    Returns:
        Audio file response
    """
    audio_dir = Path("static/audio")
    file_path = audio_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    if not file_path.suffix.lower() in ['.wav', '.mp3', '.ogg']:
        raise HTTPException(status_code=400, detail="Invalid audio file format")
    
    return FileResponse(
        path=str(file_path),
        media_type="audio/wav",
        filename=filename
    )