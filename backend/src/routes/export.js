import { Router } from 'express';
import { readAllTestCases } from '../utils/fileStorage.js';

const router = Router();

// Convert test cases to CSV format
function toCSV(testCases) {
  const headers = ['ID', 'Title', 'Specification', 'Preconditions', 'Steps', 'Verification', 'Tags', 'Created At', 'Updated At'];
  const rows = testCases.map(tc => [
    tc.id,
    `"${tc.title.replace(/"/g, '""')}"`,
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
function toMarkdown(testCases) {
  return testCases.map(tc => {
    const sections = [
      `# ${tc.title}`,
      '',
      `**ID:** ${tc.id}`,
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

// POST /api/export/:format - Export test cases in specified format
router.post('/:format', async (req, res) => {
  try {
    const format = req.params.format.toLowerCase();
    const testCases = await readAllTestCases();
    
    // Filter by IDs if provided
    let filtered = testCases;
    if (req.body.ids && Array.isArray(req.body.ids)) {
      filtered = testCases.filter(tc => req.body.ids.includes(tc.id));
    }
    
    switch (format) {
    case 'json':
      res.json(filtered);
      break;
      
    case 'csv':
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="testcases.csv"');
      res.send(toCSV(filtered));
      break;
      
    case 'markdown':
    case 'md':
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="testcases.md"');
      res.send(toMarkdown(filtered));
      break;
      
    default:
      res.status(400).json({ error: `Unsupported format: ${format}` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to export test cases' });
  }
});

export default router;