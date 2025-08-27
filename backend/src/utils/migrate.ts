#!/usr/bin/env node
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TestCase, Project } from '../types/index.js';
import { 
  ProjectData, 
  ProjectsIndex, 
  ensureStorageDir, 
  saveProjectFile, 
  saveProjectsIndex 
} from './projectFileStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repositoryRoot: string = process.env.REPOSITORY_ROOT || join(__dirname, '../../..');
const OLD_DATA_DIR: string = join(repositoryRoot, 'data');
const OLD_TEST_CASES_DIR: string = join(OLD_DATA_DIR, 'testcases');
const OLD_PROJECTS_DIR: string = join(OLD_DATA_DIR, 'projects');
const BACKUP_DIR: string = join(repositoryRoot, 'data-backup');

async function backupOldData(): Promise<void> {
  console.log('Creating backup of old data...');
  
  try {
    // Create backup directory
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Copy old data directory to backup
    await fs.cp(OLD_DATA_DIR, BACKUP_DIR, { recursive: true });
    
    console.log(`✓ Backup created at: ${BACKUP_DIR}`);
  } catch (err) {
    console.error('Failed to create backup:', err);
    throw err;
  }
}

async function readOldTestCases(): Promise<TestCase[]> {
  try {
    const files = await fs.readdir(OLD_TEST_CASES_DIR);
    const testCases: TestCase[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== '.gitkeep') {
        const content = await fs.readFile(join(OLD_TEST_CASES_DIR, file), 'utf8');
        testCases.push(JSON.parse(content) as TestCase);
      }
    }
    
    console.log(`✓ Read ${testCases.length} test cases from old format`);
    return testCases;
  } catch (err) {
    console.error('Failed to read old test cases:', err);
    return [];
  }
}

async function readOldProjects(): Promise<Project[]> {
  try {
    const files = await fs.readdir(OLD_PROJECTS_DIR);
    const projects: Project[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== '.gitkeep') {
        const content = await fs.readFile(join(OLD_PROJECTS_DIR, file), 'utf8');
        projects.push(JSON.parse(content) as Project);
      }
    }
    
    console.log(`✓ Read ${projects.length} projects from old format`);
    return projects;
  } catch (err) {
    console.error('Failed to read old projects:', err);
    return [];
  }
}

export async function migrateToNewStructure(): Promise<void> {
  console.log('Starting migration to new file structure...');
  
  try {
    // Create backup first
    await backupOldData();
    
    // Ensure storage directories exist
    await ensureStorageDir();
    
    // Read old data
    const oldTestCases = await readOldTestCases();
    const oldProjects = await readOldProjects();
    
    // Group test cases by project
    const projectMap = new Map<string, TestCase[]>();
    
    for (const testCase of oldTestCases) {
      const projectId = testCase.projectId || 'default';
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, []);
      }
      projectMap.get(projectId)!.push(testCase);
    }
    
    console.log(`✓ Grouped test cases into ${projectMap.size} projects`);
    
    // Create project data files
    for (const [projectId, testCases] of projectMap) {
      const projectData: ProjectData = {
        projectId: projectId,
        projectName: projectId,
        testCases: {},
        metadata: {
          count: testCases.length,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      
      // Add all test cases
      for (const testCase of testCases) {
        projectData.testCases[testCase.id] = testCase;
      }
      
      // Save project file
      await saveProjectFile(projectId, projectData);
      console.log(`✓ Created project file: ${projectId}.json with ${testCases.length} test cases`);
    }
    
    // Create projects index
    const projectsIndex: ProjectsIndex = {
      projects: {},
      metadata: {
        version: '1.0.0',
        totalProjects: 0,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Add existing projects
    for (const project of oldProjects) {
      const testCases = projectMap.get(project.id) || [];
      const allTags = new Set<string>();
      testCases.forEach(tc => tc.tags?.forEach(tag => allTags.add(tag)));
      
      projectsIndex.projects[project.id] = {
        id: project.id,
        name: project.id,
        testCaseCount: testCases.length,
        lastModified: project.updatedAt,
        createdAt: project.createdAt,
        description: project.description || '',
        tags: Array.from(allTags),
        status: 'active'
      };
    }
    
    // Add projects that have test cases but no project file
    for (const projectId of projectMap.keys()) {
      if (!projectsIndex.projects[projectId]) {
        const testCases = projectMap.get(projectId)!;
        const allTags = new Set<string>();
        testCases.forEach(tc => tc.tags?.forEach(tag => allTags.add(tag)));
        
        const oldestDate = testCases
          .map(tc => new Date(tc.createdAt).getTime())
          .reduce((min, date) => Math.min(min, date), Date.now());
        
        const newestDate = testCases
          .map(tc => new Date(tc.updatedAt).getTime())
          .reduce((max, date) => Math.max(max, date), 0);
        
        projectsIndex.projects[projectId] = {
          id: projectId,
          name: projectId,
          testCaseCount: testCases.length,
          lastModified: new Date(newestDate).toISOString(),
          createdAt: new Date(oldestDate).toISOString(),
          description: '',
          tags: Array.from(allTags),
          status: 'active'
        };
      }
    }
    
    // Save projects index
    await saveProjectsIndex(projectsIndex);
    console.log(`✓ Created projects index with ${Object.keys(projectsIndex.projects).length} projects`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`Backup of old data saved at: ${BACKUP_DIR}`);
    console.log('You can safely delete the old data directory after verifying the migration.');
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    console.error('Please restore from backup if needed:', BACKUP_DIR);
    throw err;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToNewStructure()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Migration script failed:', err);
      process.exit(1);
    });
}