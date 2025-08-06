import { Router, Request, Response } from 'express';
import { readAllTestCases } from '../utils/fileStorage.js';
import { TestCase, ExportFormat } from '../types/index.js';
import { HTTP_STATUS } from '../constants/http.js';
import { ERROR_MESSAGES } from '../constants/messages.js';

const router = Router();

// Convert test cases to CSV format
function toCSV(testCases: TestCase[]): string {
  const headers = ['ID', 'Project ID', 'Specification', 'Preconditions', 'Steps', 'Verification', 'Tags', 'Created At', 'Updated At'];
  const rows = testCases.map(tc => [
    tc.id,
    tc.projectId,
    `"${tc.specification.replace(/"/g, '""')}"`,
    `"${tc.preconditions.replace(/"/g, '""')}"`,
    `"${tc.steps.replace(/"/g, '""')}"`,
    `"${tc.verification.replace(/"/g, '""')}"`,
    `"${tc.tags.join(', ').replace(/"/g, '""')}"`,
    tc.createdAt,
    tc.updatedAt
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// Convert test cases to Markdown format
function toMarkdown(testCases: TestCase[]): string {
  return testCases.map(tc => {
    const sections = [
      `# Test Case ${tc.id}`,
      '',
      `**プロジェクトID:** ${tc.projectId}`,
      '',
      '## 仕様',
      tc.specification || '_仕様が入力されていません_',
      '',
      '## 事前条件',
      tc.preconditions || '_事前条件が入力されていません_',
      '',
      '## 手順',
      tc.steps || '_手順が入力されていません_',
      '',
      '## 確認事項',
      tc.verification || '_確認事項が入力されていません_',
      '',
      '## タグ',
      tc.tags.length > 0 ? tc.tags.join(', ') : '_タグなし_',
      '',
      '---',
      `_作成日: ${tc.createdAt}_  `,
      `_更新日: ${tc.updatedAt}_`,
      '',
      '---',
      ''
    ];
    
    return sections.join('\n');
  }).join('\n\n');
}

interface ExportRequest extends Request {
  body: {
    ids?: string[];
  };
}

// POST /api/export/:format - Export test cases in specified format
router.post('/:format', async (req: ExportRequest, res: Response) => {
  try {
    const format = req.params.format.toLowerCase() as ExportFormat;
    const testCases = await readAllTestCases();
    
    // Filter by IDs if provided
    let filtered = testCases;
    if (req.body.ids && Array.isArray(req.body.ids)) {
      filtered = testCases.filter(tc => req.body.ids!.includes(tc.id));
    }
    
    switch (format) {
    case 'json':
      return res.json(filtered);
      
    case 'csv':
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="testcases.csv"');
      return res.send(toCSV(filtered));
      
    case 'markdown':
    case 'md':
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="testcases.md"');
      return res.send(toMarkdown(filtered));
      
    default:
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Unsupported format: ${format}` });
    }
  } catch (err) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.EXPORT_FAILED });
  }
});

export default router;