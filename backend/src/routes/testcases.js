import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  readAllTestCases,
  readTestCase,
  writeTestCase,
  deleteTestCase
} from '../utils/fileStorage.js';
import { HTTP_STATUS } from '../constants/http.js';
import { ERROR_MESSAGES } from '../constants/messages.js';
import { TEST_CASE_DEFAULTS } from '../constants/defaults.js';

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
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.TEST_CASE_CREATION_FAILED });
  }
});

// GET /api/testcases/:id - Get single test case
router.get('/:id', async (req, res) => {
  try {
    const testCase = await readTestCase(req.params.id);
    
    if (!testCase) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.TEST_CASE_NOT_FOUND });
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
      title: req.body.title || TEST_CASE_DEFAULTS.TITLE,
      specification: req.body.specification || TEST_CASE_DEFAULTS.SPECIFICATION,
      preconditions: req.body.preconditions || TEST_CASE_DEFAULTS.PRECONDITIONS,
      steps: req.body.steps || TEST_CASE_DEFAULTS.STEPS,
      verification: req.body.verification || TEST_CASE_DEFAULTS.VERIFICATION,
      tags: req.body.tags || TEST_CASE_DEFAULTS.TAGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await writeTestCase(testCase);
    res.status(HTTP_STATUS.CREATED).json(testCase);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.TEST_CASE_CREATION_FAILED });
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