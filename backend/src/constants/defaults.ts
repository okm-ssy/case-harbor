/**
 * デフォルト値の定数
 * 目的: アプリケーション全体で使用されるデフォルト値を一元管理
 */

// サーバー設定のデフォルト値
export const SERVER_DEFAULTS = {
  PORT: 9696,
  HOST: 'localhost',
  CORS_ORIGIN: '*',
  REQUEST_TIMEOUT: 30000, // 30秒
  MAX_REQUEST_SIZE: '10mb'
} as const;

// テストケースのデフォルト値
export const TEST_CASE_DEFAULTS = {
  TITLE: 'Untitled Test Case',
  SPECIFICATION: '',
  PRECONDITIONS: '',
  STEPS: '',
  VERIFICATION: '',
  TAGS: [] as string[],
  STATUS: 'draft'
} as const;

// プロジェクトのデフォルト値
export const PROJECT_DEFAULTS = {
  NAME: 'Untitled Project',
  DESCRIPTION: '',
  STATUS: 'active'
} as const;

// ファイル・ディレクトリ設定
export const FILE_DEFAULTS = {
  DATA_DIR: 'data',
  TESTCASES_DIR: 'testcases',
  PROJECTS_DIR: 'projects',
  EXPORTS_DIR: 'exports',
  FILE_ENCODING: 'utf8',
  BACKUP_RETENTION_DAYS: 30
} as const;

// エクスポート設定のデフォルト値
export const EXPORT_DEFAULTS = {
  FORMAT: 'json',
  INCLUDE_EMPTY_FIELDS: false,
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  CSV_DELIMITER: ',',
  CSV_QUOTE_CHAR: '"',
  MAX_EXPORT_RECORDS: 10000
} as const;

// バリデーション制限値
export const VALIDATION_LIMITS = {
  // 文字列長制限
  PROJECT_NAME_MAX_LENGTH: 255,
  PROJECT_DESCRIPTION_MAX_LENGTH: 2000,
  TEST_CASE_TITLE_MAX_LENGTH: 255,
  TEST_CASE_FIELD_MAX_LENGTH: 10000,
  TAG_MAX_LENGTH: 50,
  TAG_MAX_COUNT: 20,
  
  // 数値制限
  MAX_PROJECTS_PER_USER: 100,
  MAX_TEST_CASES_PER_PROJECT: 10000,
  
  // ファイルサイズ制限
  MAX_EXPORT_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMPORT_FILE_SIZE: 50 * 1024 * 1024   // 50MB
} as const;

// 日時フォーマット
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DISPLAY_DATE: 'YYYY年MM月DD日',
  DISPLAY_DATETIME: 'YYYY年MM月DD日 HH:mm:ss',
  LOG_TIMESTAMP: 'YYYY-MM-DD HH:mm:ss.SSS',
  FILENAME_TIMESTAMP: 'YYYYMMDD_HHmmss'
} as const;

// レスポンス構造のデフォルト
export const RESPONSE_DEFAULTS = {
  SUCCESS: {
    success: true,
    data: null,
    message: ''
  },
  ERROR: {
    success: false,
    error: '',
    code: null,
    details: null
  }
} as const;

// 型定義
export type TestCaseStatus = typeof TEST_CASE_DEFAULTS.STATUS;
export type ProjectStatus = typeof PROJECT_DEFAULTS.STATUS;
export type ExportFormat = typeof EXPORT_DEFAULTS.FORMAT;
export type FileEncoding = typeof FILE_DEFAULTS.FILE_ENCODING;