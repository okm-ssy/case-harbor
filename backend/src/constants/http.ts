/**
 * HTTP関連の定数
 * 目的: HTTPステータスコード、メソッド、ヘッダーなどを一元管理
 */

// HTTPステータスコード
export const HTTP_STATUS = {
  // 成功系
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  
  // クライアントエラー系
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  
  // サーバーエラー系
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// HTTPメソッド
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
} as const;

// Content-Type
export const CONTENT_TYPES = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  HTML: 'text/html',
  CSV: 'text/csv',
  XML: 'application/xml',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART_FORM: 'multipart/form-data'
} as const;

// HTTPヘッダー
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  CONTENT_LENGTH: 'Content-Length',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
  CACHE_CONTROL: 'Cache-Control',
  CORS_ORIGIN: 'Access-Control-Allow-Origin',
  CORS_METHODS: 'Access-Control-Allow-Methods',
  CORS_HEADERS: 'Access-Control-Allow-Headers'
} as const;

// 型定義
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];
export type HttpHeader = typeof HTTP_HEADERS[keyof typeof HTTP_HEADERS];