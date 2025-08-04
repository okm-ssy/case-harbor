export interface TestCase {
  id: string;
  projectId: string;
  specification: string;      // 仕様
  preconditions: string;      // 事前条件
  steps: string;              // 手順
  verification: string;       // 確認事項
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseData {
  projectId: string;
  specification?: string;
  preconditions?: string;
  steps?: string;
  verification?: string;
  tags?: string[];
}

export interface UpdateTestCaseData {
  specification?: string;
  preconditions?: string;
  steps?: string;
  verification?: string;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}