import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ProjectSchedule, CutPiece } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data folder and file exists
function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialProjects: ProjectSchedule[] = [
      {
        id: 'sample-project-01',
        name: 'BẢNG THỐNG KÊ CỐT THÉP (Công Trình Mẫu)',
        customer: 'Dự án BTKT',
        stockLength: 11700,
        bladeWidth: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rows: [
          { id: 'r1', mark: 1, shapeType: 'u_shape', shapeParams: { a: 150, b: 4030, c: 150 }, diameter: 12, length: 4330, barsPerMember: 88, memberCount: 1, quantity: 88, note: 'Dầm D1' },
          { id: 'r2', mark: 2, shapeType: 'straight', shapeParams: { a: 630 }, diameter: 10, length: 630, barsPerMember: 12, memberCount: 1, quantity: 12, note: 'Thanh thẳng' },
          { id: 'r3', mark: 3, shapeType: 'u_shape', shapeParams: { a: 600, b: 3430, c: 600 }, diameter: 20, length: 4630, barsPerMember: 8, memberCount: 1, quantity: 8, note: 'Trụ góc' },
          { id: 'r4', mark: 4, shapeType: 'stirrup_rect', shapeParams: { a: 120, b: 350, hook: 65 }, diameter: 8, length: 1070, barsPerMember: 94, memberCount: 1, quantity: 94, note: 'Đai dầm' },
          { id: 'r5', mark: 5, shapeType: 'u_shape', shapeParams: { a: 3220, b: 3430, c: 1150 }, diameter: 20, length: 7800, barsPerMember: 2, memberCount: 1, quantity: 2, note: 'Gia cường' },
          { id: 'r6', mark: 6, shapeType: 'u_shape', shapeParams: { a: 3080, b: 3430, c: 1010 }, diameter: 20, length: 7520, barsPerMember: 2, memberCount: 1, quantity: 2, note: 'Gia cường' },
          { id: 'r7', mark: 7, shapeType: 'u_shape', shapeParams: { a: 240, b: 2220, c: 120 }, diameter: 12, length: 2580, barsPerMember: 120, memberCount: 1, quantity: 120, note: 'Cột C1' },
          { id: 'r8', mark: 8, shapeType: 'c_shape', shapeParams: { a: 120, b: 50, c: 50 }, diameter: 6, length: 220, barsPerMember: 42, memberCount: 1, quantity: 42, note: 'Thép đai C' },
          { id: 'r9', mark: 9, shapeType: 'cranked', shapeParams: { a: 200, b: 714, c: 200 }, diameter: 12, length: 1114, barsPerMember: 62, memberCount: 1, quantity: 62, note: 'Uốn xiên vai bò' },
          { id: 'r10', mark: 10, shapeType: 'straight', shapeParams: { a: 730 }, diameter: 10, length: 730, barsPerMember: 10, memberCount: 1, quantity: 10, note: 'Thanh thẳng' },
          { id: 'r11', mark: 11, shapeType: 'u_shape', shapeParams: { a: 240, b: 3430, c: 240 }, diameter: 10, length: 3910, barsPerMember: 8, memberCount: 1, quantity: 8, note: 'Dầm D2' },
          { id: 'r12', mark: 12, shapeType: 'u_shape', shapeParams: { a: 70, b: 2730, c: 240 }, diameter: 10, length: 3040, barsPerMember: 4, memberCount: 1, quantity: 4, note: 'Dầm D3' },
          { id: 'r13', mark: 13, shapeType: 'u_shape', shapeParams: { a: 70, b: 2729, c: 240 }, diameter: 10, length: 3039, barsPerMember: 4, memberCount: 1, quantity: 4, note: 'Dầm D3' },
          { id: 'r14', mark: 14, shapeType: 'u_shape', shapeParams: { a: 240, b: 3428, c: 240 }, diameter: 10, length: 3908, barsPerMember: 14, memberCount: 1, quantity: 14, note: 'Dầm sàn' },
          { id: 'r15', mark: 15, shapeType: 'u_shape', shapeParams: { a: 70, b: 3430, c: 70 }, diameter: 10, length: 3570, barsPerMember: 8, memberCount: 1, quantity: 8, note: 'Dầm sàn' },
          { id: 'r16', mark: 16, shapeType: 'u_shape', shapeParams: { a: 70, b: 2730, c: 70 }, diameter: 10, length: 2870, barsPerMember: 4, memberCount: 1, quantity: 4, note: 'Móng đơn' },
          { id: 'r17', mark: 17, shapeType: 'u_shape', shapeParams: { a: 70, b: 2720, c: 70 }, diameter: 10, length: 2860, barsPerMember: 4, memberCount: 1, quantity: 4, note: 'Móng đơn' },
          { id: 'r18', mark: 18, shapeType: 'u_shape', shapeParams: { a: 70, b: 3420, c: 70 }, diameter: 10, length: 3560, barsPerMember: 14, memberCount: 1, quantity: 14, note: 'Móng băng' },
          { id: 'r19', mark: 19, shapeType: 'u_shape', shapeParams: { a: 3380, b: 3430, c: 1000 }, diameter: 16, length: 7810, barsPerMember: 2, memberCount: 1, quantity: 2, note: 'Cột C2' },
          { id: 'r20', mark: 20, shapeType: 'u_shape', shapeParams: { a: 480, b: 3430, c: 480 }, diameter: 16, length: 4390, barsPerMember: 8, memberCount: 1, quantity: 8, note: 'Cột C2' },
          { id: 'r21', mark: 21, shapeType: 'u_shape', shapeParams: { a: 3070, b: 3430, c: 690 }, diameter: 16, length: 7190, barsPerMember: 2, memberCount: 1, quantity: 2, note: 'Cột C2' },
          { id: 'r22', mark: 22, shapeType: 'straight', shapeParams: { a: 1200 }, diameter: 12, length: 1200, barsPerMember: 16, memberCount: 1, quantity: 16, note: 'Thanh thẳng' },
          { id: 'r23', mark: 23, shapeType: 'straight', shapeParams: { a: 1250 }, diameter: 12, length: 1250, barsPerMember: 24, memberCount: 1, quantity: 24, note: 'Thanh thẳng' },
          { id: 'r24', mark: 24, shapeType: 'stirrup_rect', shapeParams: { a: 100, b: 100, hook: 50 }, diameter: 6, length: 500, barsPerMember: 40, memberCount: 1, quantity: 40, note: 'Đai cột nhỏ' },
          { id: 'r25', mark: 25, shapeType: 'stirrup_rect', shapeParams: { a: 100, b: 120, hook: 65 }, diameter: 6, length: 570, barsPerMember: 95, memberCount: 1, quantity: 95, note: 'Đai dầm nhỏ' },
        ],
      },
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialProjects, null, 2), 'utf-8');
  }
}

export function getAllProjects(): ProjectSchedule[] {
  ensureFile();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data) as ProjectSchedule[];
  } catch (err) {
    console.error('Error reading projects:', err);
    return [];
  }
}

export function getProjectById(id: string): ProjectSchedule | null {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}

export function saveProject(project: Partial<ProjectSchedule>): ProjectSchedule {
  const projects = getAllProjects();
  const now = new Date().toISOString();

  let target: ProjectSchedule;
  const existingIdx = projects.findIndex(p => p.id === project.id);

  if (existingIdx !== -1) {
    target = {
      ...projects[existingIdx],
      ...project,
      updatedAt: now,
    } as ProjectSchedule;
    projects[existingIdx] = target;
  } else {
    target = {
      id: project.id || 'proj-' + Math.random().toString(36).substring(2, 9),
      name: project.name || 'Bảng Thống Kê Mới',
      customer: project.customer || '',
      stockLength: project.stockLength || 11700,
      bladeWidth: project.bladeWidth !== undefined ? project.bladeWidth : 3,
      rows: (project.rows as CutPiece[]) || [],
      createdAt: now,
      updatedAt: now,
    };
    projects.unshift(target);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  return target;
}

export function deleteProject(id: string): boolean {
  const projects = getAllProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length !== projects.length) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}
