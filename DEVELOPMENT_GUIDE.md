# 🛠️ Development Guide - Lucky Platform

Hướng dẫn phát triển chi tiết cho Lucky Platform dành cho developers.

## 📋 Mục lục

- [Development Environment](#-development-environment)
- [Code Standards](#-code-standards)
- [Git Workflow](#-git-workflow)
- [Testing Strategy](#-testing-strategy)
- [Debugging](#-debugging)
- [Performance](#-performance)
- [Security](#-security)
- [Deployment](#-deployment)

## 🔧 Development Environment

### IDE Setup

**Khuyến nghị: Visual Studio Code**

Extensions cần thiết:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-python.python",
    "ms-python.black-formatter",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

**VSCode Settings:**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "python.defaultInterpreterPath": "./aiapi/venv/bin/python",
  "python.formatting.provider": "black",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

### Environment Setup

**Development Environment Variables:**

```env
# .env.development
NODE_ENV=development
NEXT_PUBLIC_AI_API_URL=http://localhost:8000/api/v1
DATABASE_URL=postgresql://hero:hero123@localhost:5432/postgres_dev?schema=public
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key

# AI Backend
AIAPI_DEBUG=true
AIAPI_LOG_LEVEL=DEBUG
AIAPI_AZURE_ENDPOINT=https://aiportalapi.stu-platform.live/jpe
AIAPI_AZURE_API_KEY=your-dev-api-key
```

**Production Environment Variables:**

```env
# .env.production
NODE_ENV=production
NEXT_PUBLIC_AI_API_URL=https://api.yourapp.com/api/v1
DATABASE_URL=postgresql://user:pass@prod-db:5432/postgres?schema=public
NEXTAUTH_URL=https://yourapp.com
NEXTAUTH_SECRET=super-secure-production-secret

# AI Backend
AIAPI_DEBUG=false
AIAPI_LOG_LEVEL=INFO
AIAPI_AZURE_ENDPOINT=https://prod-openai-endpoint
AIAPI_AZURE_API_KEY=prod-api-key
```

## 📝 Code Standards

### TypeScript Standards

**tsconfig.json configuration:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

**Naming Conventions:**

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

**Import Organization:**

```typescript
// 1. React imports
import React from "react";
import { useState, useEffect } from "react";

// 2. Third-party libraries
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

// 3. Internal imports (absolute)
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// 4. Relative imports
import "./styles.css";
```

### Python Standards

**Code Style:**

- **Formatter**: Black
- **Linter**: flake8
- **Type Checker**: mypy
- **Import Sorter**: isort

**pyproject.toml configuration:**

```toml
[tool.black]
line-length = 88
target-version = ['py312']

[tool.isort]
profile = "black"
multi_line_output = 3

[tool.mypy]
python_version = "3.12"
strict = true
```

**Naming Conventions:**

- **Files**: snake_case (`story_service.py`)
- **Classes**: PascalCase (`StoryService`)
- **Functions**: snake_case (`generate_story`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Private**: \_leading_underscore (`_internal_method`)

## 🌿 Git Workflow

### Branch Strategy

```
main
├── develop
│   ├── feature/user-authentication
│   ├── feature/story-generation
│   └── feature/ai-chat
├── hotfix/critical-bug-fix
└── release/v1.0.0
```

**Branch Types:**

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `hotfix/*`: Critical bug fixes
- `release/*`: Release preparation

### Commit Convention

**Format:**

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add JWT token refresh mechanism
fix(story): resolve AI API timeout issue
docs(readme): update installation instructions
test(api): add integration tests for story endpoints
```

### Pull Request Process

1. **Create Feature Branch**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/amazing-feature
   ```

2. **Development**

   ```bash
   # Make changes
   git add .
   git commit -m "feat(feature): add amazing functionality"
   ```

3. **Pre-PR Checklist**

   - [ ] Tests pass (`pnpm test`)
   - [ ] Linting passes (`pnpm lint`)
   - [ ] Type checking passes (`npx tsc --noEmit`)
   - [ ] Build succeeds (`pnpm build`)
   - [ ] Documentation updated

4. **Create Pull Request**
   - Clear title and description
   - Link related issues
   - Add screenshots/videos if UI changes
   - Request review from team members

## 🧪 Testing Strategy

### Test Pyramid

```
    /\
   /  \     E2E Tests (Playwright)
  /____\    Integration Tests (Vitest)
 /______\   Unit Tests (Vitest + Testing Library)
```

### Frontend Testing

**Unit Tests:**

```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });
});
```

**Integration Tests:**

```typescript
// __tests__/api/stories.test.ts
import { POST } from "@/app/api/stories/route";
import { NextRequest } from "next/server";

describe("/api/stories", () => {
  it("creates a new story", async () => {
    const request = new NextRequest("http://localhost:3000/api/stories", {
      method: "POST",
      body: JSON.stringify({ prompt: "Test story" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

**E2E Tests:**

```typescript
// __tests__/e2e/story-creation.test.ts
import { test, expect } from "@playwright/test";

test("user can create a story", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="create-story-button"]');
  await page.fill('[data-testid="story-prompt"]', "A brave mouse");
  await page.click('[data-testid="generate-button"]');

  await expect(page.locator('[data-testid="story-content"]')).toBeVisible();
});
```

### Backend Testing

**Unit Tests:**

```python
# tests/test_story_service.py
import pytest
from src.aiapi.services.story_service import generate_simple_story

def test_generate_simple_story():
    result = generate_simple_story("Test prompt")
    assert result.title is not None
    assert result.content is not None
    assert result.error is None
```

**API Tests:**

```python
# tests/test_api.py
from fastapi.testclient import TestClient
from src.aiapi.main import app

client = TestClient(app)

def test_generate_story_endpoint():
    response = client.post(
        "/api/v1/generate-story",
        json={"prompt": "Test story"}
    )
    assert response.status_code == 200
    assert "title" in response.json()
```

### Test Commands

```bash
# Frontend tests
pnpm test                    # Unit tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # Coverage report
pnpm test:e2e               # E2E tests
pnpm test:storybook         # Storybook tests

# Backend tests
cd aiapi
pytest                      # All tests
pytest --cov               # With coverage
pytest -v                  # Verbose
pytest tests/test_api.py   # Specific file
```

## 🐛 Debugging

### Frontend Debugging

**Browser DevTools:**

```typescript
// Debug hooks
import { useEffect } from "react";

function MyComponent() {
  const [state, setState] = useState();

  useEffect(() => {
    console.log("State changed:", state);
    // Set breakpoint here
    debugger;
  }, [state]);
}
```

**React DevTools:**

- Install React DevTools extension
- Use Profiler for performance debugging
- Inspect component props and state

**Next.js Debugging:**

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Next.js: debug server-side",
  "program": "${workspaceFolder}/node_modules/.bin/next",
  "args": ["dev"],
  "console": "integratedTerminal"
}
```

### Backend Debugging

**Python Debugging:**

```python
# Debug with pdb
import pdb; pdb.set_trace()

# Debug with logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("Debug message")
```

**FastAPI Debugging:**

```python
# main.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "src.aiapi.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )
```

**VSCode Python Debugging:**

```json
// .vscode/launch.json
{
  "type": "python",
  "request": "launch",
  "name": "FastAPI",
  "program": "${workspaceFolder}/aiapi/run.py",
  "console": "integratedTerminal",
  "cwd": "${workspaceFolder}/aiapi"
}
```

## ⚡ Performance

### Frontend Performance

**Bundle Analysis:**

```bash
# Analyze bundle size
pnpm build
npx @next/bundle-analyzer

# Check for unused dependencies
npx depcheck
```

**Performance Monitoring:**

```typescript
// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

**Optimization Techniques:**

- Code splitting with dynamic imports
- Image optimization with Next.js Image
- Lazy loading components
- Memoization with React.memo
- Virtual scrolling for large lists

### Backend Performance

**Profiling:**

```python
# Profile with cProfile
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()
# Your code here
profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative').print_stats(10)
```

**Monitoring:**

```python
# Add timing middleware
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## 🔒 Security

### Frontend Security

**Environment Variables:**

```typescript
// Only expose public variables
const publicConfig = {
  apiUrl: process.env.NEXT_PUBLIC_AI_API_URL,
  // Never expose secrets in NEXT_PUBLIC_*
};
```

**Content Security Policy:**

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-eval';",
  },
];
```

### Backend Security

**Input Validation:**

```python
from pydantic import BaseModel, validator

class StoryRequest(BaseModel):
    prompt: str

    @validator('prompt')
    def validate_prompt(cls, v):
        if len(v) > 1000:
            raise ValueError('Prompt too long')
        return v
```

**Rate Limiting:**

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/generate-story")
@limiter.limit("10/minute")
async def generate_story(request: Request, story_request: StoryRequest):
    # Implementation
```

## 🚀 Deployment

### Frontend Deployment

**Vercel (Recommended):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Docker:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Backend Deployment

**Docker:**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "src.aiapi.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Production Configuration:**

```python
# Production settings
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    debug: bool = False
    log_level: str = "INFO"
    workers: int = 4

    class Config:
        env_file = ".env.production"
```

## 📊 Monitoring & Logging

### Application Monitoring

**Frontend:**

```typescript
// Error boundary
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  // Log error to monitoring service
  console.error("Application error:", error);

  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}
```

**Backend:**

```python
import logging
from fastapi import Request
import structlog

# Structured logging
logger = structlog.get_logger()

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        "request_processed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time
    )
    return response
```

## 🔄 CI/CD Pipeline

**GitHub Actions:**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - uses: actions/setup-python@v4
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          npm ci
          cd aiapi && pip install -e .

      - name: Run tests
        run: |
          npm run test
          cd aiapi && pytest

      - name: Build
        run: npm run build
```

---

**Happy Development! 🚀**

Tài liệu này sẽ được cập nhật thường xuyên. Nếu có câu hỏi hoặc đề xuất, hãy tạo issue hoặc PR!
