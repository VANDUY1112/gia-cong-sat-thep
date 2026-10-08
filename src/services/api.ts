import type { CutPiece, OptimizationResults, ProjectSchedule } from '../types';
import { optimizeCutting as clientOptimize } from '../optimizer';

const API_BASE = '/api';

export const api = {
  // Check backend health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      const data = await res.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  },

  // Optimize cutting stock (Backend API with client fallback)
  async optimize(
    pieces: CutPiece[],
    stockLength: number,
    bladeWidth: number
  ): Promise<{ results: OptimizationResults; source: 'backend' | 'client' }> {
    try {
      const res = await fetch(`${API_BASE}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pieces, stockLength, bladeWidth }),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return { results: data.results, source: 'backend' };
    } catch (err) {
      console.warn('Backend API unreachable, using client-side engine:', err);
      // Fallback seamlessly to client-side computation
      const results = clientOptimize(pieces, stockLength, bladeWidth);
      return { results, source: 'client' };
    }
  },

  // Load all projects from backend
  async getProjects(): Promise<ProjectSchedule[]> {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return await res.json();
    } catch (err) {
      console.error('getProjects error:', err);
      return [];
    }
  },

  // Save project to backend
  async saveProject(project: Partial<ProjectSchedule>): Promise<ProjectSchedule | null> {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error('Failed to save project');
      const data = await res.json();
      return data.project;
    } catch (err) {
      console.error('saveProject error:', err);
      return null;
    }
  },

  // Export Excel CSV from backend
  async exportExcel(projectName: string, rows: CutPiece[]): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/export-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, rows }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bang-Thong-Ke-Cot-Thep-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      throw err;
    }
  },
};
