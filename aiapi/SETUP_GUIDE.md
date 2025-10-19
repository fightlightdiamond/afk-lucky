# AI Backend Setup Guide

Hướng dẫn chi tiết cài đặt và cấu hình AI Backend (Python FastAPI) cho Lucky Platform.

## 📋 Yêu cầu hệ thống

### Bắt buộc

- **Python**: 3.12 hoặc cao hơn
- **pip**: 23.0 hoặc cao hơn
- **Git**: 2.30.0 hoặc cao hơn

### Khuyến nghị

- **Poetry**: 1.6.0+ (cho dependency management)
- **pyenv**: Để quản lý Python versions
- **Virtual Environment**: venv hoặc conda

## 🚀 Cài đặt nhanh

### Bước 1: Kiểm tra Python version

```bash
python3 --version
# Phải >= 3.12.0
```

Nếu chưa có Python 3.12+:

**macOS (Homebrew):**

```bash
brew install python@3.12
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install python3.12 python3.12-pip python3.12-venv
```

**Windows:**

- Tải từ [python.org](https://www.python.org/downloads/)

### Bước 2: Tạo Virtual Environment (Khuyến nghị)

```bash
# Di chuyển vào thư mục aiapi
cd aiapi

# Tạo virtual environment
python3 -m venv venv

# Kích hoạt virtual environment
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# Kiểm tra virtual environment
which python
# Phải trỏ đến venv/bin/python
```

### Bước 3: Cài đặt Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Cài đặt project dependencies
pip install -e .

# Hoặc cài đặt từ requirements (nếu có)
pip install -r requirements.txt
```

### Bước 4: Cấu hình Environment Variables

Tạo file `.env` trong thư mục `aiapi/`:

```bash
# aiapi/.env
AIAPI_AZURE_ENDPOINT=https://aiportalapi.stu-platform.live/jpe
AIAPI_AZURE_API_KEY=sk-uX_Ax09Iv6XY-28-M_uYVg
AIAPI_AZURE_DEPLOYMENT_NAME=GPT-4o

# Optional: Logging level
AIAPI_LOG_LEVEL=INFO

# Optional: Custom port
AIAPI_PORT=8000
```

### Bước 5: Khởi chạy Server

```bash
# Sử dụng run script
python run.py

# Hoặc sử dụng uvicorn trực tiếp
uvicorn src.aiapi.main:app --reload --host 0.0.0.0 --port 8000

# Hoặc với custom settings
uvicorn src.aiapi.main:app --reload --port 8002
```

### Bước 6: Kiểm tra cài đặt

```bash
# Test API endpoints
python test_api.py

# Hoặc kiểm tra manual
curl http://localhost:8000/health
```

## 🔧 Cấu hình nâng cao

### Poetry Setup (Khuyến nghị cho development)

```bash
# Cài đặt Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Hoặc với pip
pip install poetry

# Cài đặt dependencies với Poetry
poetry install

# Kích hoạt Poetry shell
poetry shell

# Chạy server với Poetry
poetry run python run.py
```

### Development Dependencies

```bash
# Cài đặt dev dependencies
pip install -e ".[dev]"

# Hoặc với Poetry
poetry install --with dev
```

### Environment Configuration

Tạo file `aiapi/.env.local` cho development:

```env
# Development settings
AIAPI_DEBUG=true
AIAPI_LOG_LEVEL=DEBUG
AIAPI_RELOAD=true

# Azure OpenAI settings
AIAPI_AZURE_ENDPOINT=https://aiportalapi.stu-platform.live/jpe
AIAPI_AZURE_API_KEY=your_api_key_here
AIAPI_AZURE_DEPLOYMENT_NAME=GPT-4o

# Server settings
AIAPI_HOST=0.0.0.0
AIAPI_PORT=8000
AIAPI_WORKERS=1
```

## 📁 Cấu trúc Project

```
aiapi/
├── src/aiapi/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration settings
│   ├── models.py               # Pydantic models
│   │
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── story.py            # Story generation endpoints
│   │   ├── chat.py             # Chat endpoints
│   │   └── itinerary.py        # Travel itinerary endpoints
│   │
│   └── services/               # Business logic
│       ├── __init__.py
│       ├── story_service.py    # Story generation logic
│       ├── chat_service.py     # Chat functionality
│       └── openai_service.py   # OpenAI API integration
│
├── tests/                      # Test files
├── run.py                      # Development server script
├── test_api.py                 # API testing script
├── pyproject.toml              # Project configuration
├── requirements.txt            # Dependencies (generated)
├── .env                        # Environment variables
├── .env.example                # Environment template
└── README.md                   # Project documentation
```

## 🧪 Testing

### Chạy Tests

```bash
# Unit tests
pytest

# Với coverage
pytest --cov=src/aiapi

# Test specific file
pytest tests/test_story_service.py

# Verbose output
pytest -v
```

### API Testing

```bash
# Test all endpoints
python test_api.py

# Test specific endpoint
curl -X POST http://localhost:8000/api/v1/generate-story \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a short story about a brave mouse"}'
```

### Load Testing

```bash
# Cài đặt locust
pip install locust

# Chạy load test
locust -f tests/load_test.py --host=http://localhost:8000
```

## 🔍 API Documentation

### Automatic Documentation

Khi server đang chạy, truy cập:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Available Endpoints

#### Health Check

```http
GET /health
```

#### Story Generation

```http
POST /api/v1/generate-story
Content-Type: application/json

{
  "prompt": "Write a story about friendship"
}
```

#### Advanced Story Generation

```http
POST /api/v1/generate-advanced-story
Content-Type: application/json

{
  "prompt": "Write a story about friendship",
  "preferences": {
    "length": "medium",
    "language_mix": {
      "ratio": 70,
      "base_language": "vi",
      "target_language": "en"
    },
    "style": {
      "storytelling": "narrative",
      "tone": "friendly",
      "readability_level": "intermediate"
    }
  }
}
```

#### Chat

```http
POST /api/v1/chat
Content-Type: application/json

{
  "content": "Hello, can you help me write a story?",
  "context": "You are a helpful writing assistant"
}
```

## 🐛 Troubleshooting

### Lỗi thường gặp

#### 1. ModuleNotFoundError: No module named 'pydantic_settings'

```bash
# Cài đặt lại dependencies
pip install --upgrade pydantic-settings

# Hoặc cài đặt lại toàn bộ
pip install -e .
```

#### 2. Port already in use

```bash
# Tìm process đang sử dụng port
lsof -ti:8000

# Kill process
kill -9 $(lsof -ti:8000)

# Hoặc sử dụng port khác
uvicorn src.aiapi.main:app --port 8002
```

#### 3. OpenAI API Error

```bash
# Kiểm tra API key
echo $AIAPI_AZURE_API_KEY

# Kiểm tra endpoint
curl -H "api-key: $AIAPI_AZURE_API_KEY" \
  "$AIAPI_AZURE_ENDPOINT/openai/deployments/GPT-4o/chat/completions?api-version=2023-05-15"
```

#### 4. Virtual Environment Issues

```bash
# Deactivate và tạo lại
deactivate
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

### Debug Mode

```bash
# Chạy với debug mode
AIAPI_DEBUG=true python run.py

# Hoặc với uvicorn
uvicorn src.aiapi.main:app --reload --log-level debug
```

### Logging

```bash
# Xem logs chi tiết
tail -f logs/aiapi.log

# Hoặc với custom log level
AIAPI_LOG_LEVEL=DEBUG python run.py
```

## 🔧 Development Tools

### Code Quality

```bash
# Linting với flake8
flake8 src/

# Formatting với black
black src/

# Type checking với mypy
mypy src/
```

### Pre-commit Hooks

```bash
# Cài đặt pre-commit
pip install pre-commit

# Setup hooks
pre-commit install

# Chạy manual
pre-commit run --all-files
```

## 🚀 Production Deployment

### Docker

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY . .
RUN pip install -e .

EXPOSE 8000
CMD ["uvicorn", "src.aiapi.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build image
docker build -t aiapi .

# Run container
docker run -p 8000:8000 --env-file .env aiapi
```

### Systemd Service

```ini
# /etc/systemd/system/aiapi.service
[Unit]
Description=AI API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/aiapi
Environment=PATH=/path/to/aiapi/venv/bin
ExecStart=/path/to/aiapi/venv/bin/uvicorn src.aiapi.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable và start service
sudo systemctl enable aiapi
sudo systemctl start aiapi
sudo systemctl status aiapi
```

## 📊 Monitoring

### Health Checks

```bash
# Basic health check
curl http://localhost:8000/health

# Detailed health check
curl http://localhost:8000/health/detailed
```

### Metrics

```bash
# Prometheus metrics (nếu enabled)
curl http://localhost:8000/metrics
```

### Logging

```python
# Custom logging configuration
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/aiapi.log'),
        logging.StreamHandler()
    ]
)
```

## 🔐 Security

### API Key Management

```bash
# Sử dụng environment variables
export AIAPI_AZURE_API_KEY="your-secret-key"

# Hoặc sử dụng secrets management
# AWS Secrets Manager, Azure Key Vault, etc.
```

### CORS Configuration

```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Chỉ cho phép frontend
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 📚 Tài liệu tham khảo

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

---

**Nếu gặp vấn đề, hãy tạo issue trên GitHub hoặc liên hệ team để được hỗ trợ!**
