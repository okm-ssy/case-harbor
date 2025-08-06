/**
 * 共通型定義
 */

export interface TestCase {
  id: string;
  projectId: string;
  specification: string;
  preconditions: string;
  steps: string;
  verification: string;
  tags: string[];
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string | null;
  details?: any;
}

export interface ExportData {
  projects: Project[];
  testCases: TestCase[];
  exportedAt: string;
  version: string;
}

export type ExportFormat = 'json' | 'csv' | 'xml';

export interface NodeError extends Error {
  code?: string;
}