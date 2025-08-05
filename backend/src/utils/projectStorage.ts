import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Project, NodeError } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variable or default to repository root data directory
const repositoryRoot: string = process.env.REPOSITORY_ROOT || join(__dirname, '../../..');
const DATA_DIR: string = join(repositoryRoot, 'data/projects');

// Ensure data directory exists
export async function ensureProjectDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create project directory:', err);
  }
}

// Read all projects
export async function readAllProjects(): Promise<Project[]> {
  await ensureProjectDir();
  
  try {
    const files = await fs.readdir(DATA_DIR);
    const projects: Project[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(join(DATA_DIR, file), 'utf8');
        projects.push(JSON.parse(content) as Project);
      }
    }
    
    return projects.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (err) {
    console.error('Failed to read projects:', err);
    return [];
  }
}

// Read single project
export async function readProject(id: string): Promise<Project | null> {
  const filePath = join(DATA_DIR, `${id}.json`);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as Project;
  } catch (err) {
    const nodeError = err as NodeError;
    if (nodeError.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

// Write project
export async function writeProject(project: Project): Promise<Project> {
  await ensureProjectDir();
  
  const filePath = join(DATA_DIR, `${project.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(project, null, 2));
  
  return project;
}

// Delete project
export async function deleteProject(id: string): Promise<boolean> {
  const filePath = join(DATA_DIR, `${id}.json`);
  
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    const nodeError = err as NodeError;
    if (nodeError.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}