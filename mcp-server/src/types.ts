export interface TestStep {
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: TestStep[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestCaseData {
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