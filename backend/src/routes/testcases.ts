import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  readAllTestCases,
  readTestCase,
  writeTestCase,
  deleteTestCase,
  updateTestCasesOrder
} from '../utils/fileStorage.js';
import { TestCase } from '../types/index.js';
import { HTTP_STATUS } from '../constants/http.js';
import { ERROR_MESSAGES } from '../constants/messages.js';
import { TEST_CASE_DEFAULTS } from '../constants/defaults.js';

const router = Router();

// GET /api/testcases - Get all test cases (optionally filtered by project)
router.get('/', async (req: Request, res: Response) => {
  try {
    const testCases = await readAllTestCases();
    const { projectId } = req.query;
    
    const filtered = projectId 
      ? testCases.filter(tc => tc.projectId === projectId as string)
      : testCases;
    
    // Sort by order field, then by createdAt for backwards compatibility
    const sorted = filtered.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    res.json(sorted);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.TEST_CASE_CREATION_FAILED });
  }
});

// GET /api/testcases/:id - Get single test case
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const testCase = await readTestCase(req.params.id);
    
    if (!testCase) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.TEST_CASE_NOT_FOUND });
    }
    
    res.json(testCase);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to read test case' });
  }
});

// POST /api/testcases - Create new test case
router.post('/', async (req: Request, res: Response) => {
  try {
    // Get existing test cases to determine next order
    const allTestCases = await readAllTestCases();
    const projectTestCases = allTestCases.filter(tc => tc.projectId === (req.body.projectId || ''));
    const maxOrder = projectTestCases.reduce((max, tc) => 
      Math.max(max, tc.order || 0), -1);
    
    const testCase: TestCase = {
      id: uuidv4(),
      projectId: req.body.projectId || '',
      specification: req.body.specification || TEST_CASE_DEFAULTS.SPECIFICATION,
      preconditions: req.body.preconditions || TEST_CASE_DEFAULTS.PRECONDITIONS,
      steps: req.body.steps || TEST_CASE_DEFAULTS.STEPS,
      verification: req.body.verification || TEST_CASE_DEFAULTS.VERIFICATION,
      tags: req.body.tags || TEST_CASE_DEFAULTS.TAGS,
      order: maxOrder + 1,
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await readTestCase(req.params.id);
    
    if (!existing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.TEST_CASE_NOT_FOUND });
    }
    
    const updated: TestCase = {
      ...existing,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await writeTestCase(updated);
    res.json(updated);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.TEST_CASE_UPDATE_FAILED });
  }
});

// PUT /api/testcases/reorder - Reorder test cases
router.put('/reorder', async (req: Request, res: Response) => {
  try {
    const { updates, projectId } = req.body;
    
    if (!Array.isArray(updates) || !projectId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        error: 'Invalid request. Expected updates array and projectId.' 
      });
    }
    
    // Validate updates format
    for (const update of updates) {
      if (!update.id || typeof update.order !== 'number') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          error: 'Invalid update format. Expected id and order for each update.' 
        });
      }
    }
    
    await updateTestCasesOrder(updates);
    
    res.json({ success: true, message: 'Test cases reordered successfully' });
  } catch (err) {
    console.error('Failed to reorder test cases:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error: 'Failed to reorder test cases' 
    });
  }
});

// DELETE /api/testcases/:id - Delete test case
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await deleteTestCase(req.params.id);
    
    if (!deleted) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.TEST_CASE_NOT_FOUND });
    }
    
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.TEST_CASE_DELETE_FAILED });
  }
});

export default router;