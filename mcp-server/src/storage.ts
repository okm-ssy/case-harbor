import { promises as fs } from 'fs';
import { join } from 'path';
import { TestCase, CreateTestCaseData, UpdateTestCaseData, Project } from './types.js';

export class TestCaseStorage {
  private testCaseDir: string;
  private projectDir: string;

  constructor() {
    const baseDir = process.env.CASE_HARBOR_DATA_DIR || join(process.cwd(), 'data');
    this.testCaseDir = join(baseDir, 'testcases');
    this.projectDir = join(baseDir, 'projects');
  }

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(this.testCaseDir, { recursive: true });
      await fs.mkdir(this.projectDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create data directories:', error);
    }
  }

  private generateId(): string {
    return `tc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTestCaseFilePath(id: string): string {
    return join(this.testCaseDir, `${id}.json`);
  }

  private getProjectFilePath(id: string): string {
    return join(this.projectDir, `${id}.json`);
  }

  async createTestCase(data: CreateTestCaseData): Promise<TestCase> {
    await this.ensureDataDir();

    const testCase: TestCase = {
      id: this.generateId(),
      projectId: data.projectId,
      title: data.title,
      description: data.description || '',
      preconditions: data.preconditions || [],
      steps: data.steps || [],
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const filePath = this.getTestCaseFilePath(testCase.id);
    await fs.writeFile(filePath, JSON.stringify(testCase, null, 2));

    return testCase;
  }

  async getTestCase(id: string): Promise<TestCase | null> {
    try {
      const filePath = this.getTestCaseFilePath(id);
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
      const files = await fs.readdir(this.testCaseDir);
      const testCases: TestCase[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(join(this.testCaseDir, file), 'utf8');
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

    const filePath = this.getTestCaseFilePath(id);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));

    return updated;
  }

  async deleteTestCase(id: string): Promise<boolean> {
    try {
      const filePath = this.getTestCaseFilePath(id);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  // Project management methods
  async getAllProjects(): Promise<Project[]> {
    await this.ensureDataDir();

    try {
      const files = await fs.readdir(this.projectDir);
      const projects: Project[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(join(this.projectDir, file), 'utf8');
          projects.push(JSON.parse(content));
        }
      }

      return projects.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to read projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const filePath = this.getProjectFilePath(id);
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async toggleProject(id: string, name?: string): Promise<{ action: 'created' | 'deleted', project?: Project }> {
    const existing = await this.getProject(id);
    
    if (existing) {
      // Project exists, delete it
      const filePath = this.getProjectFilePath(id);
      await fs.unlink(filePath);
      return { action: 'deleted' };
    } else {
      // Project doesn't exist, create it
      await this.ensureDataDir();
      
      const project: Project = {
        id,
        name: name || `Project ${id}`,
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const filePath = this.getProjectFilePath(id);
      await fs.writeFile(filePath, JSON.stringify(project, null, 2));
      
      return { action: 'created', project };
    }
  }

  async getTestCasesByProject(projectId: string): Promise<TestCase[]> {
    const allTestCases = await this.getAllTestCases();
    return allTestCases.filter(tc => tc.projectId === projectId);
  }

  async getTestCaseByProjectAndId(projectId: string, testCaseId: string): Promise<TestCase | null> {
    const testCase = await this.getTestCase(testCaseId);
    if (testCase && testCase.projectId === projectId) {
      return testCase;
    }
    return null;
  }

  async deleteTestCaseByProjectAndId(projectId: string, testCaseId: string): Promise<boolean> {
    const testCase = await this.getTestCase(testCaseId);
    if (testCase && testCase.projectId === projectId) {
      return await this.deleteTestCase(testCaseId);
    }
    return false;
  }
}