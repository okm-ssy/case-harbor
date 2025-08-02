import { promises as fs } from 'fs';
import { join } from 'path';
import { TestCase, CreateTestCaseData, UpdateTestCaseData } from './types.js';

export class TestCaseStorage {
  private dataDir: string;

  constructor() {
    this.dataDir = process.env.CASE_HARBOR_DATA_DIR || join(process.cwd(), 'data', 'testcases');
  }

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }

  private generateId(): string {
    return `tc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFilePath(id: string): string {
    return join(this.dataDir, `${id}.json`);
  }

  async createTestCase(data: CreateTestCaseData): Promise<TestCase> {
    await this.ensureDataDir();

    const testCase: TestCase = {
      id: this.generateId(),
      title: data.title,
      description: data.description || '',
      preconditions: data.preconditions || [],
      steps: data.steps || [],
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const filePath = this.getFilePath(testCase.id);
    await fs.writeFile(filePath, JSON.stringify(testCase, null, 2));

    return testCase;
  }

  async getTestCase(id: string): Promise<TestCase | null> {
    try {
      const filePath = this.getFilePath(id);
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async getAllTestCases(): Promise<TestCase[]> {
    await this.ensureDataDir();

    try {
      const files = await fs.readdir(this.dataDir);
      const testCases: TestCase[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(join(this.dataDir, file), 'utf8');
          testCases.push(JSON.parse(content));
        }
      }

      // Sort by creation date (newest first)
      return testCases.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to read test cases:', error);
      return [];
    }
  }

  async updateTestCase(id: string, updates: UpdateTestCaseData): Promise<TestCase | null> {
    const existing = await this.getTestCase(id);
    if (!existing) {
      return null;
    }

    const updated: TestCase = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    const filePath = this.getFilePath(id);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));

    return updated;
  }

  async deleteTestCase(id: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(id);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }
}