import { useState, useEffect } from 'react';
import { Project } from '../types';

interface ProjectSelectorProps {
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
}

export function ProjectSelector({ selectedProjectId, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
      
      // Auto-select first project if none selected
      if (!selectedProjectId && data.length > 0) {
        onProjectChange(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName.trim() })
      });

      if (response.ok) {
        const newProject = await response.json();
        await fetchProjects();
        onProjectChange(newProject.id);
        setNewProjectName('');
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure? This will delete all test cases in this project.')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchProjects();
        if (selectedProjectId === projectId) {
          onProjectChange(projects.length > 1 ? projects.find(p => p.id !== projectId)?.id || '' : '');
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="project-selector">
      <select 
        value={selectedProjectId} 
        onChange={(e) => onProjectChange(e.target.value)}
        className="project-dropdown"
      >
        <option value="">プロジェクトを選択</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      {isCreating ? (
        <div className="project-create">
          <input
            type="text"
            placeholder="プロジェクト名"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createProject();
              if (e.key === 'Escape') setIsCreating(false);
            }}
            autoFocus
          />
          <div className="project-create-buttons">
            <button className="btn btn-sm btn-primary" onClick={createProject}>
              ✅
            </button>
            <button className="btn btn-sm" onClick={() => setIsCreating(false)}>
              ❌
            </button>
          </div>
        </div>
      ) : (
        <div className="project-actions">
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => setIsCreating(true)}
          >
            新規作成
          </button>
          {selectedProjectId && (
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => deleteProject(selectedProjectId)}
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
}