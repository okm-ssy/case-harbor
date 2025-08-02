import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../../../data/testcases');

// Ensure data directory exists
export async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Read all test cases
export async function readAllTestCases() {
  await ensureDataDir();
  
  try {
    const files = await fs.readdir(DATA_DIR);
    const testCases = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(join(DATA_DIR, file), 'utf8');
        testCases.push(JSON.parse(content));
      }
    }
    
    return testCases;
  } catch (err) {
    console.error('Failed to read test cases:', err);
    return [];
  }
}

// Read single test case
export async function readTestCase(id) {
  const filePath = join(DATA_DIR, `${id}.json`);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

// Write test case
export async function writeTestCase(testCase) {
  await ensureDataDir();
  
  const filePath = join(DATA_DIR, `${testCase.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(testCase, null, 2));
  
  return testCase;
}

// Delete test case
export async function deleteTestCase(id) {
  const filePath = join(DATA_DIR, `${id}.json`);
  
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}