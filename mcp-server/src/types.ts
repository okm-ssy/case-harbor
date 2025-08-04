export interface TestStep {
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: TestStep[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseData {
  projectId?: string;
  title: string;
  description?: string;
  preconditions?: string[];
  steps?: TestStep[];
  tags?: string[];
}

export interface UpdateTestCaseData {
  title?: string;
  description?: string;
  preconditions?: string[];
  steps?: TestStep[];
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}