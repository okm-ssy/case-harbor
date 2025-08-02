export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  specification: string;      // 仕様
  preconditions: string;      // 事前条件
  steps: string;              // 手順
  verification: string;       // 確認事項
  tags: string[];
  createdAt: string;
  updatedAt: string;
}