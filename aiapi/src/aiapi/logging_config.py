"""
Logging configuration for the AI Story Word Insertion system.

This module sets up structured logging with different levels for different
components, file and console handlers, and proper formatting.
"""
import logging
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional


# Create logs directory if it doesn't exist
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for console output."""
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def format(self, record):
        # Add color to level name
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{self.COLORS['RESET']}"
        
        # Format the message
        result = super().format(record)
        
        # Reset levelname for other handlers
        record.levelname = levelname
        
        return result


def setup_logging(
    level: str = "INFO",
    log_to_file: bool = True,
    log_to_console: bool = True,
    log_file_prefix: str = "aiapi"
) -> logging.Logger:
    """
    Set up logging configuration for the application.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Whether to log to file
        log_to_console: Whether to log to console
        log_file_prefix: Prefix for log file name
        
    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger("aiapi")
    logger.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Create formatters
    file_formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    console_formatter = ColoredFormatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # File handler
    if log_to_file:
        log_filename = LOGS_DIR / f"{log_file_prefix}_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_filename, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)  # Log everything to file
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)
    
    # Console handler
    if log_to_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(getattr(logging, level.upper()))
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module.
    
    Args:
        name: Logger name (typically __name__ of the module)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(f"aiapi.{name}")


# Create default logger instance
logger = setup_logging()


def log_function_call(func):
    """
    Decorator to log function calls with parameters and execution time.
    
    Usage:
        @log_function_call
        def my_function(arg1, arg2):
            ...
    """
    import functools
    import time
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        func_logger = get_logger(func.__module__)
        func_name = func.__qualname__
        
        # Log function call
        func_logger.debug(f"Calling {func_name} with args={args}, kwargs={kwargs}")
        
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            func_logger.debug(f"{func_name} completed in {execution_time:.3f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            func_logger.error(f"{func_name} failed after {execution_time:.3f}s: {str(e)}")
            raise
    
    return wrapper


def log_api_call(endpoint: str, method: str = "POST"):
    """
    Decorator to log API endpoint calls.
    
    Usage:
        @log_api_call("/api/v1/generate-story", "POST")
        def generate_story_api(req):
            ...
    """
    def decorator(func):
        import functools
        import time
        
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            api_logger = get_logger("api")
            
            # Log API call
            api_logger.info(f"{method} {endpoint} - Request received")
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                api_logger.info(f"{method} {endpoint} - Success ({execution_time:.3f}s)")
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                api_logger.error(f"{method} {endpoint} - Failed ({execution_time:.3f}s): {str(e)}")
                raise
        
        return wrapper
    return decorator


class LogContext:
    """
    Context manager for logging with additional context information.
    
    Usage:
        with LogContext("story_generation", story_id="123"):
            # Your code here
            logger.info("Generating story")
    """
    
    def __init__(self, operation: str, **context):
        self.operation = operation
        self.context = context
        self.logger = get_logger("context")
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.now()
        context_str = ", ".join(f"{k}={v}" for k, v in self.context.items())
        self.logger.info(f"Starting {self.operation} [{context_str}]")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.now() - self.start_time).total_seconds()
        
        if exc_type is None:
            self.logger.info(f"Completed {self.operation} in {duration:.3f}s")
        else:
            self.logger.error(f"Failed {self.operation} after {duration:.3f}s: {exc_val}")
        
        return False  # Don't suppress exceptions


# Performance monitoring
class PerformanceMonitor:
    """Monitor and log performance metrics."""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = get_logger("performance")
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.now()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.now() - self.start_time).total_seconds()
        
        if exc_type is None:
            self.logger.info(f"{self.name}: {duration:.3f}s")
        else:
            self.logger.warning(f"{self.name}: {duration:.3f}s (failed)")
        
        return False
    
    def checkpoint(self, label: str):
        """Log a checkpoint with elapsed time."""
        if self.start_time:
            elapsed = (datetime.now() - self.start_time).total_seconds()
            self.logger.debug(f"{self.name} - {label}: {elapsed:.3f}s")
