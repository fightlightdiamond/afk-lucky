#!/usr/bin/env python3
"""
Simple script to run the FastAPI application.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import uvicorn

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment variables from {env_path}")
else:
    print(f"⚠️ No .env file found at {env_path}")
    print("   Using default configuration values")

if __name__ == "__main__":
    uvicorn.run(
        "src.aiapi.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )