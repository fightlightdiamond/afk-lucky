"""
Rate limiting middleware for API endpoints.
"""
import time
from collections import defaultdict, deque
from typing import Dict, Deque
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from ..config import settings


class RateLimiter:
    """
    Token bucket rate limiter implementation.
    
    Tracks requests per client IP and enforces rate limits with burst capacity.
    """
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        burst_size: int = 10
    ):
        """
        Initialize rate limiter.
        
        Args:
            requests_per_minute: Maximum requests allowed per minute
            burst_size: Maximum burst capacity (requests that can be made instantly)
        """
        self.requests_per_minute = requests_per_minute
        self.burst_size = burst_size
        self.refill_rate = requests_per_minute / 60.0  # tokens per second
        
        # Track tokens and timestamps per client
        self.tokens: Dict[str, float] = defaultdict(lambda: burst_size)
        self.last_refill: Dict[str, float] = defaultdict(time.time)
        
        # Track request history for monitoring
        self.request_history: Dict[str, Deque[float]] = defaultdict(lambda: deque(maxlen=100))
    
    def _refill_tokens(self, client_id: str) -> None:
        """
        Refill tokens based on elapsed time.
        
        Args:
            client_id: Client identifier (usually IP address)
        """
        now = time.time()
        elapsed = now - self.last_refill[client_id]
        
        # Add tokens based on elapsed time
        tokens_to_add = elapsed * self.refill_rate
        self.tokens[client_id] = min(
            self.burst_size,
            self.tokens[client_id] + tokens_to_add
        )
        
        self.last_refill[client_id] = now
    
    def allow_request(self, client_id: str) -> bool:
        """
        Check if request should be allowed.
        
        Args:
            client_id: Client identifier
            
        Returns:
            True if request is allowed, False if rate limit exceeded
        """
        self._refill_tokens(client_id)
        
        if self.tokens[client_id] >= 1.0:
            self.tokens[client_id] -= 1.0
            self.request_history[client_id].append(time.time())
            return True
        
        return False
    
    def get_retry_after(self, client_id: str) -> int:
        """
        Get seconds until next request is allowed.
        
        Args:
            client_id: Client identifier
            
        Returns:
            Seconds to wait before retrying
        """
        tokens_needed = 1.0 - self.tokens[client_id]
        seconds = tokens_needed / self.refill_rate
        return int(seconds) + 1


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for rate limiting.
    """
    
    def __init__(self, app, rate_limiter: RateLimiter = None):
        """
        Initialize middleware.
        
        Args:
            app: FastAPI application
            rate_limiter: RateLimiter instance (creates default if None)
        """
        super().__init__(app)
        
        if rate_limiter is None:
            self.rate_limiter = RateLimiter(
                requests_per_minute=settings.rate_limit_requests_per_minute,
                burst_size=settings.rate_limit_burst_size
            )
        else:
            self.rate_limiter = rate_limiter
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process request with rate limiting.
        
        Args:
            request: Incoming request
            call_next: Next middleware/handler
            
        Returns:
            Response
            
        Raises:
            HTTPException: If rate limit exceeded
        """
        # Skip rate limiting if disabled
        if not settings.rate_limit_enabled:
            return await call_next(request)
        
        # Skip rate limiting for health check endpoints
        if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier (IP address)
        client_ip = request.client.host if request.client else "unknown"
        
        # Check rate limit
        if not self.rate_limiter.allow_request(client_ip):
            retry_after = self.rate_limiter.get_retry_after(client_ip)
            
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {retry_after} seconds.",
                    "retry_after": retry_after
                },
                headers={"Retry-After": str(retry_after)}
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(int(self.rate_limiter.tokens[client_ip]))
        
        return response
