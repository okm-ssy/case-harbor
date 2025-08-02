import { useState, useRef } from 'react';
import { ProjectSelector } from './ProjectSelector';
import { ExportPanel } from './ExportPanel';
import { TestCase } from '../types';

interface SidebarProps {
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  testCases: TestCase[];
}

export function Sidebar({ selectedProjectId, onProjectChange, testCases }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);


  return (
    <div 
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
    >
      <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? '▶' : '◀'}
      </div>

      <div className="sidebar-content" style={{ display: isCollapsed ? 'none' : 'block' }}>
        <div className="sidebar-header">
          <h1>🚢 CaseHarbor</h1>
          <p className="subtitle">Test Case Management</p>
        </div>

        <div className="sidebar-section">
          <h3>プロジェクト</h3>
          <ProjectSelector
            selectedProjectId={selectedProjectId}
            onProjectChange={onProjectChange}
          />
        </div>

        <div className="sidebar-section">
          <h3>エクスポート</h3>
          <ExportPanel testCases={testCases} />
        </div>

        <div className="sidebar-section">
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">テストケース数</span>
              <span className="stat-value">{testCases.length}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}