/**
 * エラーメッセージと応答メッセージの定数
 * 目的: アプリケーション全体で使用されるメッセージを一元管理
 */

// エラーメッセージ
export const ERROR_MESSAGES = {
  // 一般的なエラー
  INTERNAL_ERROR: 'Internal server error',
  INVALID_REQUEST: 'Invalid request data',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  
  // 認証・認可エラー
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INVALID_TOKEN: 'Invalid or expired token',
  
  // リソースエラー
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CONFLICT: 'Resource conflict',
  
  // テストケース関連エラー
  TEST_CASE_NOT_FOUND: 'Test case not found',
  TEST_CASE_CREATION_FAILED: 'Failed to create test case',
  TEST_CASE_UPDATE_FAILED: 'Failed to update test case',
  TEST_CASE_DELETE_FAILED: 'Failed to delete test case',
  
  // プロジェクト関連エラー
  PROJECT_NOT_FOUND: 'Project not found',
  PROJECT_CREATION_FAILED: 'Failed to create project',
  PROJECT_UPDATE_FAILED: 'Failed to update project',
  PROJECT_DELETE_FAILED: 'Failed to delete project',
  PROJECT_HAS_TEST_CASES: 'Cannot delete project with existing test cases',
  
  // ファイル操作エラー
  FILE_READ_ERROR: 'Failed to read file',
  FILE_WRITE_ERROR: 'Failed to write file',
  FILE_DELETE_ERROR: 'Failed to delete file',
  DIRECTORY_CREATE_ERROR: 'Failed to create directory',
  
  // バリデーションエラー
  INVALID_UUID: 'Invalid UUID format',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_DATE: 'Invalid date format',
  STRING_TOO_LONG: 'String exceeds maximum length',
  STRING_TOO_SHORT: 'String is shorter than minimum length',
  
  // エクスポート関連エラー
  EXPORT_FAILED: 'Failed to export data',
  UNSUPPORTED_FORMAT: 'Unsupported export format',
  NO_DATA_TO_EXPORT: 'No data available for export'
} as const;

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  // 一般的な成功
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
  
  // テストケース関連成功
  TEST_CASE_CREATED: 'Test case created successfully',
  TEST_CASE_UPDATED: 'Test case updated successfully',
  TEST_CASE_DELETED: 'Test case deleted successfully',
  
  // プロジェクト関連成功
  PROJECT_CREATED: 'Project created successfully',
  PROJECT_UPDATED: 'Project updated successfully',
  PROJECT_DELETED: 'Project deleted successfully',
  
  // エクスポート関連成功
  EXPORT_COMPLETED: 'Export completed successfully',
  FILE_GENERATED: 'File generated successfully'
} as const;

// ログメッセージ
export const LOG_MESSAGES = {
  // サーバー起動・停止
  SERVER_STARTING: 'Starting server...',
  SERVER_STARTED: 'Server started successfully',
  SERVER_STOPPING: 'Stopping server...',
  SERVER_STOPPED: 'Server stopped',
  
  // リクエスト処理
  REQUEST_RECEIVED: 'Request received',
  REQUEST_PROCESSED: 'Request processed successfully',
  REQUEST_FAILED: 'Request processing failed',
  
  // データベース操作
  DB_CONNECTED: 'Database connected',
  DB_DISCONNECTED: 'Database disconnected',
  DB_QUERY_START: 'Database query started',
  DB_QUERY_SUCCESS: 'Database query successful',
  DB_QUERY_ERROR: 'Database query error',
  
  // ファイル操作
  FILE_OPERATION_START: 'File operation started',
  FILE_OPERATION_SUCCESS: 'File operation successful',
  FILE_OPERATION_ERROR: 'File operation error',
  
  // エクスポート操作
  EXPORT_START: 'Export operation started',
  EXPORT_SUCCESS: 'Export operation successful',
  EXPORT_ERROR: 'Export operation error'
} as const;

// 型定義
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];
export type LogMessage = typeof LOG_MESSAGES[keyof typeof LOG_MESSAGES];