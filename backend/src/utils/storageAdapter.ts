import { TestCase } from '../types/index.js';
import { isNewStorageMode } from '../config/storage.js';

// Import old storage functions
import * as oldStorage from './fileStorage.js';

// Import new storage functions  
import * as newStorage from './projectFileStorage.js';

// Read all test cases
export async function readAllTestCases(): Promise<TestCase[]> {
  if (isNewStorageMode()) {
    return newStorage.readAllTestCases();
  }
  return oldStorage.readAllTestCases();
}

// Read single test case
export async function readTestCase(id: string): Promise<TestCase | null> {
  if (isNewStorageMode()) {
    return newStorage.readTestCase(id);
  }
  return oldStorage.readTestCase(id);
}

// Write test case
export async function writeTestCase(testCase: TestCase): Promise<TestCase> {
  if (isNewStorageMode()) {
    return newStorage.writeTestCase(testCase);
  }
  return oldStorage.writeTestCase(testCase);
}

// Delete test case
export async function deleteTestCase(id: string): Promise<boolean> {
  if (isNewStorageMode()) {
    return newStorage.deleteTestCase(id);
  }
  return oldStorage.deleteTestCase(id);
}

// Update multiple test cases order
export async function updateTestCasesOrder(updates: { id: string; order: number }[]): Promise<void> {
  if (isNewStorageMode()) {
    return newStorage.updateTestCasesOrder(updates);
  }
  return oldStorage.updateTestCasesOrder(updates);
}

// Ensure data directory exists
export async function ensureDataDir(): Promise<void> {
  if (isNewStorageMode()) {
    return newStorage.ensureStorageDir();
  }
  return oldStorage.ensureDataDir();
}