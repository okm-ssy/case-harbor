import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TestCase, CreateTestCaseData, UpdateTestCaseData, Project } from './types.js';

export class TestCaseStorage {
  private testCaseDir: string;
  private projectDir: string;

  constructor() {
    let baseDir: string;
    
    // Priority 1: Direct data directory override
    if (process.env.CASE_HARBOR_DATA_DIR) {
      baseDir = process.env.CASE_HARBOR_DATA_DIR;
    }
    // Priority 2: Case Harbor project root environment variable
    else if (process.env.CASE_HARBOR_ROOT) {
      baseDir = join(process.env.CASE_HARBOR_ROOT, 'data');
    }
    // Priority 3: Auto-detect Case Harbor project
    else {
      const caseHarborRoot = this.findCaseHarborProject();
      baseDir = join(caseHarborRoot, 'data');
    }
    
    this.testCaseDir = join(baseDir, 'testcases');
    this.projectDir = join(baseDir, 'projects');
  }

  private findCaseHarborProject(): string {
    // First, try from MCP server location (when running from case-harbor repo)
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFile);
    const mcpServerRoot = join(currentDir, '../..');
    
    if (this.isCaseHarborProject(mcpServerRoot)) {
      return mcpServerRoot;
    }
    
    // Search upward from current working directory
    let searchDir = process.cwd();
    for (let i = 0; i < 10; i++) { // Limit search depth
      if (this.isCaseHarborProject(searchDir)) {
        return searchDir;
      }
      
      const parentDir = dirname(searchDir);
      if (parentDir === searchDir) break; // Reached root
      searchDir = parentDir;
    }
    
    // Search common project locations
    const commonPaths = [
      join(process.env.HOME || '~', 'case-harbor'),
      join(process.env.HOME || '~', 'projects', 'case-harbor'),
      join(process.env.HOME || '~', 'dev', 'case-harbor'),
      '/workspace', // devcontainer path
    ];
    
    for (const path of commonPaths) {
      if (this.isCaseHarborProject(path)) {
        return path;
      }
    }
    
    // Fallback to MCP server location
    return mcpServerRoot;
  }

  private isCaseHarborProject(dir: string): boolean {
    try {
      // Check for characteristic files that indicate this is the case-harbor project
      const packageJsonPath = join(dir, 'package.json');
      const claudeMdPath = join(dir, 'CLAUDE.md');
      const cliPath = join(dir, 'cli', 'ch.sh');
      const mcpServerPath = join(dir, 'mcp-server', 'package.json');
      
      // Synchronous check for performance
      const fs = require('fs');
      
      // Must have CLAUDE.md (project-specific file)
      if (!fs.existsSync(claudeMdPath)) return false;
      
      // Must have cli/ch.sh (case-harbor specific)
      if (!fs.existsSync(cliPath)) return false;
      
      // Must have mcp-server directory
      if (!fs.existsSync(mcpServerPath)) return false;
      
      // Check package.json content if it exists
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          // Look for case-harbor specific indicators
          if (packageContent.name && packageContent.name.includes('case-harbor')) {
            return true;
          }
        } catch (e) {
          // Continue with other checks
        }
      }
      
      // Check CLAUDE.md content
      try {
        const claudeContent = fs.readFileSync(claudeMdPath, 'utf8');
        if (claudeContent.includes('Case Harbor') || claudeContent.includes('case-harbor')) {
          return true;
        }
      } catch (e) {
        // Continue with other checks
      }
      
      return true; // If we have the required files, assume it's case-harbor
    } catch (e) {
      return false;
    }
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

  private async resolveProjectId(projectIdOrName: string): Promise<string> {
    // If it looks like a UUID, return as-is
    if (projectIdOrName.match(/^[a-f0-9-]{36}$/i)) {
      return projectIdOrName;
    }
    
    // Search for project by name
    const projects = await this.getAllProjects();
    const project = projects.find(p => p.name === projectIdOrName);
    
    if (project) {
      return project.id;
    }
    
    // If not found, return the original value (might be a project ID)
    return projectIdOrName;
  }

  async createTestCase(data: CreateTestCaseData): Promise<TestCase> {
    await this.ensureDataDir();

    // Resolve project name to project ID if needed
    const projectId = await this.resolveProjectId(data.projectId);

    const testCase: TestCase = {
      id: this.generateId(),
      projectId: projectId,
      specification: data.specification || '',
      preconditions: data.preconditions || '',
      steps: data.steps || '',
      verification: data.verification || '',
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