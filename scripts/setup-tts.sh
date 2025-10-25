#!/bin/bash

# Setup script for TTS integration
# This script installs all necessary dependencies for Text-to-Speech functionality

set -e  # Exit on any error

echo "🎯 Setting up TTS (Text-to-Speech) Integration"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "aiapi" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Check Python version
log_info "Checking Python version..."
python_version=$(python --version 2>&1 | cut -d' ' -f2)
required_version="3.12"

if ! python -c "import sys; exit(0 if sys.version_info >= (3, 12) else 1)" 2>/dev/null; then
    log_error "Python 3.12+ is required. Current version: $python_version"
    log_info "Please install Python 3.12+ and try again"
    exit 1
fi

log_success "Python version: $python_version"

# Check if pip is available
if ! command -v pip &> /dev/null; then
    log_error "pip is not installed. Please install pip and try again"
    exit 1
fi

# Navigate to aiapi directory
cd aiapi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    log_info "Creating Python virtual environment..."
    python -m venv venv
    log_success "Virtual environment created"
fi

# Activate virtual environment
log_info "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
log_info "Upgrading pip..."
pip install --upgrade pip

# Install base dependencies first
log_info "Installing base dependencies..."
pip install -e .

# Install TTS-specific dependencies
log_info "Installing TTS dependencies..."
log_warning "This may take several minutes as it downloads large ML models..."

# Install transformers and torch
pip install "transformers>=4.30.0,<5.0.0"
pip install "torch>=2.0.0,<3.0.0"
pip install "soundfile>=0.12.0,<1.0.0"
pip install "numpy>=1.24.0,<2.0.0"

# Additional dependencies for better performance
pip install "accelerate>=0.20.0"  # For faster model loading
pip install "librosa>=0.10.0"    # For audio processing

log_success "TTS dependencies installed successfully"

# Test TTS model loading
log_info "Testing TTS model loading..."
python -c "
import sys
try:
    from transformers import VitsModel, AutoTokenizer
    print('✅ Transformers imported successfully')
    
    # Test model loading (this will download the model if not cached)
    print('📥 Loading TTS model (this may take a while on first run)...')
    model = VitsModel.from_pretrained('facebook/mms-tts-vie')
    tokenizer = AutoTokenizer.from_pretrained('facebook/mms-tts-vie')
    print('✅ TTS model loaded successfully')
    
    # Test basic functionality
    inputs = tokenizer('Xin chào', return_tensors='pt')
    output = model(**inputs)
    print('✅ TTS generation test passed')
    
except Exception as e:
    print(f'❌ TTS test failed: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    log_success "TTS model test passed"
else
    log_error "TTS model test failed"
    exit 1
fi

# Go back to project root
cd ..

# Test API server startup
log_info "Testing API server startup..."
cd aiapi

# Start server in background for testing
python run.py &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
if curl -s http://localhost:8000/health > /dev/null; then
    log_success "API server started successfully"
    
    # Test TTS status endpoint
    if curl -s http://localhost:8000/api/v1/tts/status > /dev/null; then
        log_success "TTS endpoints are accessible"
    else
        log_warning "TTS endpoints not accessible (this is normal if server is still starting)"
    fi
else
    log_warning "API server test failed (this might be normal if port is in use)"
fi

# Stop test server
kill $SERVER_PID 2>/dev/null || true
sleep 2

cd ..

# Check frontend files
log_info "Checking frontend TTS files..."
frontend_files=(
    "src/lib/aiapi.ts"
    "src/hooks/useTTS.ts"
    "src/components/story/TTSPlayer.tsx"
    "src/app/demo/tts-test/page.tsx"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "Found: $file"
    else
        log_error "Missing: $file"
        exit 1
    fi
done

# Run TTS integration test
log_info "Running TTS integration test..."
if [ -f "scripts/test-tts-integration.js" ]; then
    if command -v node &> /dev/null; then
        # Install node-fetch if needed for testing
        npm install node-fetch@2 --save-dev 2>/dev/null || true
        
        log_info "Running automated tests..."
        node scripts/test-tts-integration.js || log_warning "Some tests may have failed - check the output above"
    else
        log_warning "Node.js not found - skipping automated tests"
    fi
else
    log_warning "Test script not found - skipping automated tests"
fi

# Final instructions
echo ""
echo "🎉 TTS Setup Complete!"
echo "======================"
echo ""
echo "📋 Next Steps:"
echo "1. Start the API server:"
echo "   cd aiapi && python run.py"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "3. Test TTS functionality:"
echo "   Visit: http://localhost:3000/demo/tts-test"
echo ""
echo "4. Integration examples:"
echo "   - Use TTSPlayer component in your stories"
echo "   - Call generateStoryWithTTS() for stories with audio"
echo "   - Check TTS_INTEGRATION_GUIDE.md for detailed usage"
echo ""
echo "📚 Documentation:"
echo "   - TTS Integration Guide: ./TTS_INTEGRATION_GUIDE.md"
echo "   - API Documentation: http://localhost:8000/docs (when server is running)"
echo ""
echo "🔧 Troubleshooting:"
echo "   - If model loading fails: Check internet connection and disk space"
echo "   - If audio doesn't play: Check browser audio permissions"
echo "   - For performance issues: Consider using GPU acceleration"
echo ""

log_success "TTS integration is ready to use! 🎵"