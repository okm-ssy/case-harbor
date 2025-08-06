import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  readAllProjects,
  readProject,
  writeProject,
  deleteProject
} from '../utils/projectStorage.js';
import {
  readAllTestCases,
  deleteTestCase
} from '../utils/fileStorage.js';
import { Project } from '../types/index.js';
import { HTTP_STATUS } from '../constants/http.js';

const router = Router();

// GET /api/projects - Get all projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await readAllProjects();
    return res.json(projects);
  } catch (err) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to read projects' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await readProject(req.params.id);
    
    if (!project) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Project not found' });
    }
    
    return res.json(project);
  } catch (err) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to read project' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const project: Project = {
      id: uuidv4(),
      name: req.body.name || 'Untitled Project',
      description: req.body.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await writeProject(project);
    return res.status(HTTP_STATUS.CREATED).json(project);
  } catch (err) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await readProject(req.params.id);
    
    if (!existing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Project not found' });
    }
    
    const updated: Project = {
      ...existing,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await writeProject(updated);
    return res.json(updated);
  } catch (err) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project and all its test cases
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const project = await readProject(req.params.id);
    if (!project) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Project not found' });
    }

    // Delete all test cases for this project
    const testCases = await readAllTestCases();
    const projectTestCases = testCases.filter(tc => tc.projectId === req.params.id);
    
    for (const testCase of projectTestCases) {
      await deleteTestCase(testCase.id);
    }

    // Delete the project
    const deleted = await deleteProject(req.params.id);
    
    if (!deleted) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Project not found' });
    }
    
    return res.json({ 
      message: 'Project deleted successfully',
      deletedTestCases: projectTestCases.length
    });
  } catch (err) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete project' });
  }
});

export default router;