import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TestCase, NodeError, Project } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variable or default to repository root data directory
const repositoryRoot: string = process.env.REPOSITORY_ROOT || join(__dirname, '../../..');
const STORAGE_DIR: string = join(repositoryRoot, 'storage');
const TEST_CASES_DIR: string = join(STORAGE_DIR, 'test-cases');
const PROJECTS_FILE: string = join(STORAGE_DIR, 'projects.json');

// Project data structure with test cases
export interface ProjectData {
  projectId: string;
  projectName: string;
  testCases: { [key: string]: TestCase };
  metadata: {
    count: number;
    lastUpdated: string;
    version: string;
  };
}

// Projects index structure
export interface ProjectsIndex {
  projects: {
    [key: string]: {
      id: string;
      name: string;
      testCaseCount: number;
      lastModified: string;
      createdAt: string;
      description: string;
      tags: string[];
      status: 'active' | 'archived' | 'deleted';
    };
  };
  metadata: {
    version: string;
    totalProjects: number;
    lastUpdated: string;
  };
}

// Ensure storage directories exist
export async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    await fs.mkdir(TEST_CASES_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create storage directories:', err);
  }
}

// Read or create project file
export async function readOrCreateProjectFile(projectId: string): Promise<ProjectData> {
  await ensureStorageDir();
  const filePath = join(TEST_CASES_DIR, `${projectId}.json`);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as ProjectData;
  } catch (err) {
    const nodeError = err as NodeError;
    if (nodeError.code === 'ENOENT') {
      // Create new project data structure
      return {
        projectId: projectId,
        projectName: projectId,
        testCases: {},
        metadata: {
          count: 0,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      };
    }
    throw err;
  }
}

// Save project file
export async function saveProjectFile(projectId: string, projectData: ProjectData): Promise<void> {
  await ensureStorageDir();
  const filePath = join(TEST_CASES_DIR, `${projectId}.json`);
  const tempPath = `${filePath}.tmp`;
  
  // Write to temporary file first for atomic update
  await fs.writeFile(tempPath, JSON.stringify(projectData, null, 2));
  await fs.rename(tempPath, filePath);
}

// Read projects index
export async function readProjectsIndex(): Promise<ProjectsIndex> {
  await ensureStorageDir();
  
  try {
    const content = await fs.readFile(PROJECTS_FILE, 'utf8');
    return JSON.parse(content) as ProjectsIndex;
  } catch (err) {
    const nodeError = err as NodeError;
    if (nodeError.code === 'ENOENT') {
      // Create empty projects index
      return {
        projects: {},
        metadata: {
          version: '1.0.0',
          totalProjects: 0,
          lastUpdated: new Date().toISOString()
        }
      };
    }
    throw err;
  }
}

// Save projects index
export async function saveProjectsIndex(projectsIndex: ProjectsIndex): Promise<void> {
  await ensureStorageDir();
  const tempPath = `${PROJECTS_FILE}.tmp`;
  
  // Update metadata
  projectsIndex.metadata.totalProjects = Object.keys(projectsIndex.projects).length;
  projectsIndex.metadata.lastUpdated = new Date().toISOString();
  
  // Write to temporary file first for atomic update
  await fs.writeFile(tempPath, JSON.stringify(projectsIndex, null, 2));
  await fs.rename(tempPath, PROJECTS_FILE);
}

// Update projects index with project data
export async function updateProjectsIndex(projectId: string): Promise<void> {
  const projectsIndex = await readProjectsIndex();
  const projectData = await readOrCreateProjectFile(projectId);
  
  // Extract all unique tags from test cases
  const allTags = new Set<string>();
  Object.values(projectData.testCases).forEach(tc => {
    tc.tags?.forEach(tag => allTags.add(tag));
  });
  
  // Update or create project entry
  projectsIndex.projects[projectId] = {
    id: projectId,
    name: projectData.projectName,
    testCaseCount: projectData.metadata.count,
    lastModified: projectData.metadata.lastUpdated,
    createdAt: projectsIndex.projects[projectId]?.createdAt || new Date().toISOString(),
    description: projectsIndex.projects[projectId]?.description || '',
    tags: Array.from(allTags),
    status: 'active'
  };
  
  await saveProjectsIndex(projectsIndex);
}

// Read all test cases for a project
export async function readProjectTestCases(projectId: string): Promise<TestCase[]> {
  const projectData = await readOrCreateProjectFile(projectId);
  return Object.values(projectData.testCases);
}

// Read all test cases across all projects
export async function readAllTestCases(): Promise<TestCase[]> {
  const projectsIndex = await readProjectsIndex();
  const allTestCases: TestCase[] = [];
  
  for (const projectId of Object.keys(projectsIndex.projects)) {
    const projectData = await readOrCreateProjectFile(projectId);
    allTestCases.push(...Object.values(projectData.testCases));
  }
  
  return allTestCases;
}

// Read single test case
export async function readTestCase(testCaseId: string): Promise<TestCase | null> {
  const projectsIndex = await readProjectsIndex();
  
  for (const projectId of Object.keys(projectsIndex.projects)) {
    const projectData = await readOrCreateProjectFile(projectId);
    if (projectData.testCases[testCaseId]) {
      return projectData.testCases[testCaseId];
    }
  }
  
  return null;
}

// Write test case
export async function writeTestCase(testCase: TestCase): Promise<TestCase> {
  const projectData = await readOrCreateProjectFile(testCase.projectId);
  
  // Add or update test case
  const isNew = !projectData.testCases[testCase.id];
  projectData.testCases[testCase.id] = testCase;
  
  // Update metadata
  if (isNew) {
    projectData.metadata.count++;
  }
  projectData.metadata.lastUpdated = new Date().toISOString();
  
  // Save project file
  await saveProjectFile(testCase.projectId, projectData);
  
  // Update projects index
  await updateProjectsIndex(testCase.projectId);
  
  return testCase;
}

// Delete test case
export async function deleteTestCase(testCaseId: string): Promise<boolean> {
  const projectsIndex = await readProjectsIndex();
  
  for (const projectId of Object.keys(projectsIndex.projects)) {
    const projectData = await readOrCreateProjectFile(projectId);
    if (projectData.testCases[testCaseId]) {
      delete projectData.testCases[testCaseId];
      
      // Update metadata
      projectData.metadata.count--;
      projectData.metadata.lastUpdated = new Date().toISOString();
      
      // Save project file
      await saveProjectFile(projectId, projectData);
      
      // Update projects index
      await updateProjectsIndex(projectId);
      
      return true;
    }
  }
  
  return false;
}

// Update multiple test cases order
export async function updateTestCasesOrder(updates: { id: string; order: number }[]): Promise<void> {
  // Group updates by project for efficiency
  const projectUpdates = new Map<string, { id: string; order: number }[]>();
  
  for (const update of updates) {
    const testCase = await readTestCase(update.id);
    if (testCase) {
      if (!projectUpdates.has(testCase.projectId)) {
        projectUpdates.set(testCase.projectId, []);
      }
      projectUpdates.get(testCase.projectId)!.push(update);
    }
  }
  
  // Apply updates per project
  for (const [projectId, projectUpdateList] of projectUpdates) {
    const projectData = await readOrCreateProjectFile(projectId);
    
    for (const update of projectUpdateList) {
      if (projectData.testCases[update.id]) {
        projectData.testCases[update.id].order = update.order;
        projectData.testCases[update.id].updatedAt = new Date().toISOString();
      }
    }
    
    projectData.metadata.lastUpdated = new Date().toISOString();
    await saveProjectFile(projectId, projectData);
  }
}