// API-specific types and interfaces

import { UserManagementErrorCodes } from "./user";

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
  metadata?: ApiResponseMetadata;
}

// API response metadata
export interface ApiResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  executionTime?: number;
  cacheHit?: boolean;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetTime: string;
  };
}

// Enhanced API error response
export interface ApiErrorResponse {
  error: string;
  code: UserManagementErrorCodes;
  details?: unknown;
  timestamp: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  correlationId?: string;
  retryable?: boolean;
  retryAfter?: number;
  severity?: ErrorSeverity;
  userMessage?: string;
  technicalMessage?: string;
  recoverySuggestions?: string[];
  relatedErrors?: string[];
  helpUrl?: string;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// API request options
export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

// Pagination request interface
export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

// Sort request interface
export interface SortRequest {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  sortFields?: Array<{
    field: string;
    order: "asc" | "desc";
  }>;
}

// Filter request interface
export interface FilterRequest {
  filters?: Record<string, unknown>;
  search?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

// Combined query request interface
export interface QueryRequest
  extends PaginationRequest,
    SortRequest,
    FilterRequest {
  include?: string[];
  exclude?: string[];
  fields?: string[];
}

// Batch request interface
export interface BatchRequest<T = unknown> {
  operations: Array<{
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    body?: T;
    headers?: Record<string, string>;
  }>;
  atomic?: boolean; // All operations succeed or all fail
  continueOnError?: boolean;
}

// Batch response interface
export interface BatchResponse<T = unknown> {
  results: Array<{
    status: number;
    data?: T;
    error?: ApiErrorResponse;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    errors: ApiErrorResponse[];
  };
}

// File upload request interface
export interface FileUploadRequest {
  file: File;
  filename?: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
  uploadUrl?: string;
  chunkSize?: number;
  resumable?: boolean;
}

// File upload response interface
export interface FileUploadResponse {
  fileId: string;
  filename: string;
  url: string;
  size: number;
  contentType: string;
  checksum?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
}

// Webhook payload interface
export interface WebhookPayload<T = unknown> {
  id: string;
  event: string;
  timestamp: string;
  data: T;
  version: string;
  signature?: string;
  retryCount?: number;
}

// Rate limiting interface
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

// Health check response
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: "healthy" | "unhealthy";
    redis?: "healthy" | "unhealthy";
    external_services?: Record<string, "healthy" | "unhealthy">;
  };
  metrics?: {
    memory_usage: number;
    cpu_usage: number;
    active_connections: number;
    response_time_avg: number;
  };
}

// API versioning
export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  deprecationDate?: string;
  sunsetDate?: string;
  supportedUntil?: string;
  migrationGuide?: string;
}

// Request context interface
export interface RequestContext {
  userId?: string;
  sessionId?: string;
  requestId: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
  permissions?: string[];
  roles?: string[];
  metadata?: Record<string, unknown>;
}

// Response caching interface
export interface CacheOptions {
  key: string;
  ttl: number; // Time to live in seconds
  tags?: string[];
  invalidateOn?: string[];
  staleWhileRevalidate?: boolean;
}

// API metrics interface
export interface ApiMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  errorCode?: string;
  cacheHit?: boolean;
}

// Search request interface
export interface SearchRequest {
  query: string;
  filters?: Record<string, unknown>;
  facets?: string[];
  highlight?: boolean;
  fuzzy?: boolean;
  boost?: Record<string, number>;
  pagination?: PaginationRequest;
  sort?: SortRequest;
}

// Search response interface
export interface SearchResponse<T = unknown> {
  results: T[];
  total: number;
  facets?: Record<
    string,
    Array<{
      value: string;
      count: number;
    }>
  >;
  suggestions?: string[];
  queryTime: number;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Export constants
export const API_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRIES: 3,
  DEFAULT_RETRY_DELAY: 1000,
  MAX_BATCH_SIZE: 100,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
} as const;

// HTTP status codes enum
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// Content types enum
export enum ContentType {
  JSON = "application/json",
  FORM_DATA = "multipart/form-data",
  URL_ENCODED = "application/x-www-form-urlencoded",
  TEXT = "text/plain",
  HTML = "text/html",
  XML = "application/xml",
  CSV = "text/csv",
  PDF = "application/pdf",
  EXCEL = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}
