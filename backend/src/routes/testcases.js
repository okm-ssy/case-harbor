import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  readAllTestCases,
  readTestCase,
  writeTestCase,
  deleteTestCase
} from '../utils/fileStorage.js';

const router = Router();

// GET /api/testcases - Get all test cases (optionally filtered by project)
router.get('/', async (req, res) => {
  try {
    const testCases = await readAllTestCases();
    const { projectId } = req.query;
    
    const filtered = projectId 
      ? testCases.filter(tc => tc.projectId === projectId)
      : testCases;
    
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read test cases' });
  }
});

// GET /api/testcases/:id - Get single test case
router.get('/:id', async (req, res) => {
  try {
    const testCase = await readTestCase(req.params.id);
    
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    res.json(testCase);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read test case' });
  }
});

// POST /api/testcases - Create new test case
router.post('/', async (req, res) => {
  try {
    const testCase = {
      id: uuidv4(),
      projectId: req.body.projectId || '',
      title: req.body.title || 'Untitled Test Case',
      specification: req.body.specification || '',
      preconditions: req.body.preconditions || '',
      steps: req.body.steps || '',
      verification: req.body.verification || '',
      tags: req.body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await writeTestCase(testCase);
    res.status(201).json(testCase);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create test case' });
  }
});

// PUT /api/testcases/:id - Update test case
router.put('/:id', async (req, res) => {
  try {
    const existing = await readTestCase(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await writeTestCase(updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update test case' });
  }
});

// DELETE /api/testcases/:id - Delete test case
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteTestCase(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete test case' });
  }
});

export default router;