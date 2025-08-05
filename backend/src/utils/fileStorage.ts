import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TestCase, NodeError } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variable or default to repository root data directory
const repositoryRoot: string = process.env.REPOSITORY_ROOT || join(__dirname, '../../..');
const DATA_DIR: string = join(repositoryRoot, 'data/testcases');

// Ensure data directory exists
export async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Read all test cases
export async function readAllTestCases(): Promise<TestCase[]> {
  await ensureDataDir();
  
  try {
    const files = await fs.readdir(DATA_DIR);
    const testCases: TestCase[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(join(DATA_DIR, file), 'utf8');
        testCases.push(JSON.parse(content) as TestCase);
      }
    }
    
    return testCases;
  } catch (err) {
    console.error('Failed to read test cases:', err);
    return [];
  }
}

// Read single test case
export async function readTestCase(id: string): Promise<TestCase | null> {
  const filePath = join(DATA_DIR, `${id}.json`);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as TestCase;
  } catch (err) {
    const nodeError = err as NodeError;
    if (nodeError.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

// Write test case
export async function writeTestCase(testCase: TestCase): Promise<TestCase> {
  await ensureDataDir();
  
  const filePath = join(DATA_DIR, `${testCase.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(testCase, null, 2));
  
  return testCase;
}

// Delete test case
export async function deleteTestCase(id: string): Promise<boolean> {
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