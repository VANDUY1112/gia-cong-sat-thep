import { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import type { CutPiece, OptimizationResults, BarShapeType, BarShapeParams, ProjectSchedule } from './types';
import { DIAMETERS, WEIGHT_PER_METER } from './types';
import { api } from './services/api';
import { RebarShapePreview } from './components/RebarShapePreview';
import { ShapeEditorModal } from './components/ShapeEditorModal';
import { ModernDropdown } from './components/ModernDropdown';
import { QuantityPickerDropdown } from './components/QuantityPickerDropdown';
import {
  Scissors,
  SlidersHorizontal,
  Layers,
  Plus,
  CopyPlus,
  Sparkles,
  Trash2,
  HelpCircle,
  Zap,
  BarChart3,
  Scale,
  Ruler,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  X,
  Info,
  Check,
  Server,
  FolderOpen,
  Save,
  Shapes,
  Boxes,
  Table,
  LayoutGrid
} from 'lucide-react';

// ===========================
// Utility Helpers
// ===========================
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function formatNum(num: number, decimals = 0): string {
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// 25 items extracted accurately from user's uploaded Excel sheet "BẢNG THỐNG KÊ CỐT THÉP"
const EXCEL_BBS_DATA: Omit<CutPiece, 'id'>[] = [
  { mark: 1, shapeType: 'u_shape', shapeParams: { a: 150, b: 4030, c: 150 }, diameter: 12, length: 4330, barsPerMember: 88, memberCount: 1, quantity: 88, note: 'Dầm D1' },
  { mark: 2, shapeType: 'straight', shapeParams: { a: 630 }, diameter: 10, length: 630, barsPerMember: 12, memberCount: 1, quantity: 12, note: 'Thanh thẳng' },
  { mark: 3, shapeType: 'u_shape', shapeParams: { a: 600, b: 3430, c: 600 }, diameter: 20, length: 4630, barsPerMember: 8, memberCount: 1, quantity: 8, note: 'Trụ góc' },
  { mark: 4, shapeType: 'stirrup_rect', shapeParams: { a: 120, b: 350, hook: 65 }, diameter: 8, length: 1070, barsPerMember: 94, memberCount: 1, quantity: 94, note: 'Đai dầm' },
  { mark: 5, shapeType: 'u_shape', shapeParams: { a: 3220, b: 3430, c: 1150 }, diameter: 20, length: 7800, barsPerMember: 2, memberCount: 1, quantity: 2, note: 'Gia cường' },
  { mark: 6, shapeType: 'u_shape', shapeParams: { a: 3080, b: 3430, c: 1010 }, diameter: 20, length: 7520, barsPerMember: 2, memberCount: 1, quantity: 2, note: 'Gia cường' },
  { mark: 7, shapeType: 'u_shape', shapeParams: { a: 240, b: 2220, c: 120 }, diameter: 12, length: 2580, barsPerMember: 120, memberCount: 1, quantity: 120, note: 'Cột C1' },
  { mark: 8, shapeType: 'c_shape', shapeParams: { a: 120, b: 50, c: 50 }, diameter: 6, length: 220, barsPerMember: 42, memberCount: 1, quantity: 42, note: 'Đai móc C' },
  { mark: 9, shapeType: 'cranked', shapeParams: { a: 200, b: 714, c: 200 }, diameter: 12, length: 1114, barsPerMember: 62, memberCount: 1, quantity: 62, note: 'Uốn xiên vai bò' },
  { mark: 10, shapeType: 'straight', shapeParams: { a: 730 }, diameter: 10, length: 730, barsPerMember: 10, memberCount: 1, quantity: 10, note: 'Thanh thẳng' },
  { mark: 11, shapeType: 'u_shape', shapeParams: { a: 240, b: 3430, c: 240 }, diameter: 10, length: 3910, barsPerMember: 8, memberCount: 1, quantity: 8, note: 'Dầm D2' },
  { mark: 12, shapeType: 'u_shape', shapeParams: { a: 70, b: 2730, c: 240 }, diameter: 10, length: 3040, barsPerMember: 4, memberCount: 1, quantity: 4, note: 'Dầm D3' },
  { mark: 13, shapeType: 'u_shape', shapeParams: { a: 70, b: 2729, c: 240 }, diameter: 10, length: 3039, barsPerMember: 4, memberCount: 1, quantity: 4, note: 'Dầm D3' },
  { mark: 14, shapeType: 'u_shape', shapeParams: { a: 240, b: 3428, c: 240 }, diameter: 10, length: 3908, barsPerMember: 14, memberCount: 1, quantity: 14, note: 'Dầm sàn' },
  { mark: 15, shapeType: 'u_shape', shapeParams: { a: 70, b: 3430, c: 70 }, diameter: 10, length: 3570, barsPerMember: 8, memberCount: 1, quantity: 8, note: 'Dầm sàn' },
  { mark: 16, shapeType: 'u_shape', shapeParams: { a: 70, b: 2730, c: 70 }, diameter: 10, length: 2870, barsPerMember: 4, memberCount: 1, quantity: 4, note: 'Móng đơn' },
  { mark: 17, shapeType: 'u_shape', shapeParams: { a: 70, b: 2720, c: 70 }, diameter: 10, length: 2860, barsPerMember: 4, memberCount: 1, quantity: 4, note: 'Móng đơn' },
  { mark: 18, shapeType: 'u_shape', shapeParams: { a: 70, b: 3420, c: 70 }, diameter: 10, length: 3560, barsPerMember: 14, memberCount: 1, quantity: 14, note: 'Móng băng' },
  { mark: 19, shapeType: 'u_shape', shapeParams: { a: 3380, b: 3430, c: 1000 }, diameter: 16, length: 7810, barsPerMember: 2, memberCount: 1, quantity: 2, note: 'Cột C2' },
  { mark: 20, shapeType: 'u_shape', shapeParams: { a: 480, b: 3430, c: 480 }, diameter: 16, length: 4390, barsPerMember: 8, memberCount: 1, quantity: 8, note: 'Cột C2' },
  { mark: 21, shapeType: 'u_shape', shapeParams: { a: 3070, b: 3430, c: 690 }, diameter: 16, length: 7190, barsPerMember: 2, memberCount: 1, quantity: 2, note: 'Cột C2' },
  { mark: 22, shapeType: 'straight', shapeParams: { a: 1200 }, diameter: 12, length: 1200, barsPerMember: 16, memberCount: 1, quantity: 16, note: 'Thanh thẳng' },
  { mark: 23, shapeType: 'straight', shapeParams: { a: 1250 }, diameter: 12, length: 1250, barsPerMember: 24, memberCount: 1, quantity: 24, note: 'Thanh thẳng' },
  { mark: 24, shapeType: 'stirrup_rect', shapeParams: { a: 100, b: 100, hook: 50 }, diameter: 6, length: 500, barsPerMember: 40, memberCount: 1, quantity: 40, note: 'Đai cột nhỏ' },
  { mark: 25, shapeType: 'stirrup_rect', shapeParams: { a: 100, b: 120, hook: 65 }, diameter: 6, length: 570, barsPerMember: 95, memberCount: 1, quantity: 95, note: 'Đai dầm nhỏ' },
];

const DIAMETER_OPTIONS = DIAMETERS.map(d => ({
  value: d,
  label: `Φ${d}`,
  sub: `${((d * d) / 162).toFixed(2)} kg/m`,
}));

// ===========================
// Toast Notification
// ===========================
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  out?: boolean;
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => (t.id === id ? { ...t, out: true } : t)));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3200);
  }, []);

  return { toasts, show };
}

// ===========================
// Main Application Component
// ===========================
export default function App() {
  // Project settings
  const [projectName, setProjectName] = useState('BẢNG THỐNG KÊ CỐT THÉP XÂY DỰNG');
  const [stockLength, setStockLength] = useState(11700);
  const [bladeWidth, setBladeWidth] = useState(3);

  // Backend connection status
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Input rows (matching BBS columns)
  const [rows, setRows] = useState<CutPiece[]>(() =>
    EXCEL_BBS_DATA.slice(0, 6).map((item, idx) => ({
      ...item,
      id: generateId(),
      mark: idx + 1,
    }))
  );

  // Shape Modal State
  const [activeEditingRowId, setActiveEditingRowId] = useState<string | null>(null);

  // View Mode: 'table' (wide table) or 'cards' (touch-friendly mobile cards)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Results
  const [results, setResults] = useState<OptimizationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizedSource, setOptimizedSource] = useState<'backend' | 'client'>('backend');

  // Help Modal
  const [helpOpen, setHelpOpen] = useState(false);

  // Project List Modal
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ProjectSchedule[]>([]);

  // Toast
  const { toasts, show: showToast } = useToast();

  // Scroll ref
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check backend health on mount
  useEffect(() => {
    const check = async () => {
      const ok = await api.checkHealth();
      setBackendOnline(ok);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHelpOpen(false);
        setActiveEditingRowId(null);
        setProjectsModalOpen(false);
      }
      if (e.ctrlKey && e.key === 'Enter') handleOptimize();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rows, stockLength, bladeWidth]);

  // Row Manipulation Handlers
  const addRow = () => {
    const nextMark = rows.length + 1;
    setRows(prev => [
      ...prev,
      {
        id: generateId(),
        mark: nextMark,
        shapeType: 'straight',
        shapeParams: { a: 3000 },
        diameter: 12,
        length: 3000,
        barsPerMember: 10,
        memberCount: 1,
        quantity: 10,
        note: '',
      },
    ]);
  };

  const addMultipleRows = () => {
    const startMark = rows.length + 1;
    const newRows: CutPiece[] = Array.from({ length: 5 }, (_, i) => ({
      id: generateId(),
      mark: startMark + i,
      shapeType: 'straight',
      shapeParams: { a: 0 },
      diameter: 12,
      length: 0,
      barsPerMember: 0,
      memberCount: 1,
      quantity: 0,
      note: '',
    }));
    setRows(prev => [...prev, ...newRows]);
    showToast('Đã thêm 5 hàng mới vào bảng', 'info');
  };

  const deleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof CutPiece, value: unknown) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };

        // Auto calculate total quantity = barsPerMember * memberCount
        if (field === 'barsPerMember' || field === 'memberCount') {
          const bpm = field === 'barsPerMember' ? Number(value) : (r.barsPerMember || r.quantity || 1);
          const mc = field === 'memberCount' ? Number(value) : (r.memberCount || 1);
          updated.barsPerMember = bpm;
          updated.memberCount = mc;
          updated.quantity = bpm * mc;
        }

        return updated;
      })
    );
  };

  // Shape Modal Save Handler
  const handleSaveShape = (type: BarShapeType, params: BarShapeParams, computedLength: number) => {
    if (!activeEditingRowId) return;
    setRows(prev =>
      prev.map(r => {
        if (r.id !== activeEditingRowId) return r;
        return {
          ...r,
          shapeType: type,
          shapeParams: params,
          length: computedLength,
        };
      })
    );
    showToast(`Đã cập nhật hình dạng (Chiều dài: ${computedLength}mm)`, 'success');
  };

  // Load sample dataset matching user's photo
  const loadExcelSample = () => {
    setRows(
      EXCEL_BBS_DATA.map((item, idx) => ({
        ...item,
        id: generateId(),
        mark: idx + 1,
      }))
    );
    showToast('Đã nạp 25 cấu kiện thực tế từ Bảng Thống Kê Cốt Thép!', 'success');
  };

  const clearAll = () => {
    if (rows.length === 0) return;
    setRows([]);
    setResults(null);
    showToast('Đã làm trống danh sách thanh cắt', 'info');
  };

  // Run Optimization Algorithm (Backend API with Fallback)
  const handleOptimize = async () => {
    const validRows = rows.filter(r => r.length > 0 && r.quantity > 0);
    if (validRows.length === 0) {
      showToast('Vui lòng nhập ít nhất 1 quy cách thanh thép (dài > 0, số lượng > 0)!', 'error');
      return;
    }
    if (!stockLength || stockLength <= 0) {
      showToast('Chiều dài cây thép gốc không hợp lệ!', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.optimize(validRows, stockLength, bladeWidth);
      setResults(response.results);
      setOptimizedSource(response.source);
      showToast(
        response.source === 'backend'
          ? 'Backend API: Tối ưu hóa thành công!'
          : 'Tối ưu hóa thành công (Client Engine)!',
        'success'
      );
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      showToast('Lỗi tính toán: ' + (err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save Project to Backend
  const handleSaveToBackend = async () => {
    const project: Partial<ProjectSchedule> = {
      name: projectName,
      stockLength,
      bladeWidth,
      rows,
    };
    const saved = await api.saveProject(project);
    if (saved) {
      showToast(`Đã lưu dự án "${saved.name}" vào cơ sở dữ liệu Backend!`, 'success');
    } else {
      showToast('Không thể lưu vào backend, vui lòng kiểm tra server', 'error');
    }
  };

  // Open Project List Modal
  const handleOpenProjectsModal = async () => {
    const list = await api.getProjects();
    setSavedProjects(list);
    setProjectsModalOpen(true);
  };

  // Load a saved project
  const handleSelectProject = (proj: ProjectSchedule) => {
    setProjectName(proj.name);
    setStockLength(proj.stockLength);
    setBladeWidth(proj.bladeWidth);
    setRows(proj.rows.map(r => ({ ...r, id: generateId() })));
    setProjectsModalOpen(false);
    showToast(`Đã mở dự án "${proj.name}"!`, 'success');
  };

  // Export BBS Excel / CSV
  const handleExportCSV = async () => {
    try {
      await api.exportExcel(projectName, rows);
      showToast('Đã xuất file Bảng Thống Kê Cốt Thép thành công!', 'success');
    } catch {
      showToast('Lỗi khi xuất file', 'error');
    }
  };

  // Compute Live BBS Summary by Diameter (matching bottom of user's photo!)
  const bbsSummary = (() => {
    const summary: Record<number, { lengthM: number; weightKg: number; count: number }> = {};
    rows.forEach(r => {
      if (!r.length || !r.quantity) return;
      const d = r.diameter;
      const totalLenM = (r.length * r.quantity) / 1000;
      const weightPerM = WEIGHT_PER_METER[d] || (d * d) / 162;
      const weightKg = totalLenM * weightPerM;

      if (!summary[d]) {
        summary[d] = { lengthM: 0, weightKg: 0, count: 0 };
      }
      summary[d].lengthM += totalLenM;
      summary[d].weightKg += weightKg;
      summary[d].count += r.quantity;
    });
    return summary;
  })();

  // Calculate Overall Statistics
  const globalStats = results
    ? (() => {
        let totalBars = 0;
        let totalPieces = 0;
        let totalWaste = 0;
        let totalStock = 0;
        let totalWeightKg = 0;

        Object.keys(results).forEach(d => {
          const r = results[d];
          if (r.error) return;
          totalBars += r.totalBars;
          totalPieces += r.totalPieces;
          totalWaste += r.totalWaste;
          totalStock += r.totalStock;
          totalWeightKg += (r.totalUsed / 1000) * (WEIGHT_PER_METER[parseInt(d)] || 0);
        });

        const wastePercent = totalStock > 0 ? (totalWaste / totalStock) * 100 : 0;
        return { totalBars, totalPieces, totalWaste, totalStock, totalWeightKg, wastePercent };
      })()
    : null;

  // Active row being edited in shape modal
  const activeEditingRow = rows.find(r => r.id === activeEditingRowId);

  return (
    <div className="app-container">
      {/* Modern Cyber & Tech Ambient Canvas */}
      <div className="bg-modern-canvas">
        <div className="orb orb-primary" />
        <div className="orb orb-warm" />
        <div className="orb orb-accent" />
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-wrapper">
            <div className="logo-badge">
              <Scissors size={20} strokeWidth={2.4} />
            </div>
            <div className="logo-text">
              <h1 className="logo-title-full">TỐI ƯU CẮT THÉP & BẢNG THỐNG KÊ</h1>
              <h1 className="logo-title-short">TỐI ƯU CẮT THÉP</h1>
              <span className="logo-sub">Steel BBS & Cutting Optimizer Pro</span>
            </div>
          </div>

          <div className="header-actions">
            {/* Backend status badge */}
            <span
              className={`backend-status-pill ${backendOnline ? '' : 'offline'}`}
              title={backendOnline ? 'Backend Express API đang chạy tại port 3001' : 'Backend offline - Chạy chế độ dự phòng'}
            >
              <span className="backend-dot" />
              <Server size={13} />
              <span className="backend-text-full">{backendOnline ? 'Backend Online (Port 3001)' : 'Offline'}</span>
              <span className="backend-text-short">{backendOnline ? 'Online' : 'Offline'}</span>
            </span>

            <button
              className="btn btn-secondary header-btn"
              onClick={handleOpenProjectsModal}
              title="Quản lý dự án đã lưu"
            >
              <FolderOpen size={14} />
              <span className="header-btn-text">Dự Án</span>
            </button>

            <button
              className="btn btn-secondary header-btn"
              onClick={handleSaveToBackend}
              title="Lưu bảng thống kê hiện tại"
            >
              <Save size={14} />
              <span className="header-btn-text">Lưu</span>
            </button>

            <button
              className="btn btn-secondary header-btn"
              onClick={() => setHelpOpen(true)}
              title="Hướng dẫn sử dụng"
            >
              <HelpCircle size={14} />
              <span className="header-btn-text">Trợ Giúp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Settings Card */}
        <section className="card">
          <div className="card-header settings-header">
            <div className="card-title-group">
              <div className="card-icon settings">
                <SlidersHorizontal size={18} strokeWidth={2.4} />
              </div>
              <div>
                <h2 className="card-title">Cài Đặt Cây Thép Gốc & Dự Án</h2>
              </div>
            </div>

            <div className="proj-name-wrapper">
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Tên công trình / hạng mục..."
                className="proj-name-input"
              />
            </div>
          </div>

          <div className="settings-grid">
            {/* Stock Length Input & Presets */}
            <div className="form-group">
              <label htmlFor="stockLength" className="form-label">
                <Ruler size={14} /> Chiều dài cây thép nguyên (thương phẩm)
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="stockLength"
                  value={stockLength}
                  onChange={e => setStockLength(Number(e.target.value))}
                  min={1000}
                  max={25000}
                  step={100}
                />
                <span className="unit-badge">mm</span>
              </div>

              {/* Segmented Preset Pills */}
              <div className="presets-list">
                {[
                  { label: '11.7m (Chuẩn xưởng VN)', shortLabel: '11.7m', value: 11700 },
                  { label: '12.0m', shortLabel: '12m', value: 12000 },
                  { label: '6.0m', shortLabel: '6m', value: 6000 },
                  { label: '9.0m', shortLabel: '9m', value: 9000 },
                ].map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`preset-pill ${stockLength === preset.value ? 'active' : ''}`}
                    onClick={() => setStockLength(preset.value)}
                  >
                    <span className="preset-text-full">{preset.label}</span>
                    <span className="preset-text-short">{preset.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Blade Width */}
            <div className="form-group">
              <label htmlFor="bladeWidth" className="form-label">
                <Scissors size={14} /> Độ dày mạch cắt lưỡi cưa
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="bladeWidth"
                  value={bladeWidth}
                  onChange={e => setBladeWidth(Number(e.target.value))}
                  min={0}
                  max={15}
                  step={1}
                />
                <span className="unit-badge">mm</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Hao hụt mạch cưa đĩa hoặc máy chặt/cắt thủy lực (0-5mm)
              </span>
            </div>
          </div>
        </section>

        {/* Input Table Card (BẢNG THỐNG KÊ CỐT THÉP) */}
        <section className="card">
          <div className="card-header bbs-card-header">
            <div className="card-title-group">
              <div className="card-icon input">
                <Layers size={18} strokeWidth={2.4} />
              </div>
              <h2 className="card-title">BẢNG THỐNG KÊ CỐT THÉP</h2>
              <span className="badge-counter">{rows.length} cấu kiện</span>
            </div>

            <div className="bbs-header-actions">
              {/* Responsive View Switcher */}
              <div className="view-mode-pill-toggle">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Dạng Bảng cuộn"
                >
                  <Table size={13} />
                  <span>Bảng</span>
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="Dạng Thẻ di động"
                >
                  <LayoutGrid size={13} />
                  <span>Thẻ</span>
                </button>
              </div>

              <button
                className="btn btn-accent btn-sm"
                onClick={loadExcelSample}
                title="Tải đúng 25 cấu kiện từ ảnh chụp Excel của bạn"
              >
                <Sparkles size={14} />
                <span className="btn-label-full">Nạp mẫu ảnh Excel (25 cấu kiện)</span>
                <span className="btn-label-short">Nạp mẫu Excel</span>
              </button>

              <button
                className="btn btn-ghost-danger btn-sm"
                onClick={clearAll}
                title="Xóa trắng danh sách"
              >
                <Trash2 size={14} />
                <span>Xóa hết</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Horizontal Scrolling Table */}
          {viewMode === 'table' && (
            <>
              <div className="mobile-scroll-hint">
                <span>👈 Vuốt ngang bảng để xem và sửa đủ 9 cột 👉</span>
              </div>
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ width: 44, textAlign: 'center' }} className="sticky-col">#</th>
                      <th style={{ width: 180, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Shapes size={14} />
                          <span>Hình dạng - Kích thước</span>
                        </div>
                      </th>
                      <th style={{ width: 140 }}>Đường kính</th>
                      <th style={{ width: 110 }}>Số thanh / CK</th>
                      <th style={{ width: 90 }}>Số CK</th>
                      <th style={{ width: 110 }}>Tổng số thanh</th>
                      <th style={{ width: 120 }}>Chiều dài 1 thanh (mm)</th>
                      <th style={{ width: 100 }}>Tổng dài (m)</th>
                      <th>Ghi chú cấu kiện</th>
                      <th style={{ width: 40, textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const barsPer = row.barsPerMember !== undefined ? row.barsPerMember : row.quantity;
                      const memberCount = row.memberCount !== undefined ? row.memberCount : 1;
                      const totalQty = row.quantity;
                      const totalLenM = row.length && totalQty ? (row.length * totalQty) / 1000 : 0;

                      return (
                        <tr key={row.id}>
                          {/* Số hiệu (Sticky) */}
                          <td style={{ textAlign: 'center' }} className="sticky-col">
                            <span className="stt-badge">{row.mark || idx + 1}</span>
                          </td>

                          {/* Hình dạng - Kích thước */}
                          <td>
                            <RebarShapePreview
                              type={row.shapeType}
                              params={row.shapeParams}
                              totalLength={row.length}
                              onClick={() => setActiveEditingRowId(row.id)}
                            />
                          </td>

                          {/* Đường kính Φ (Custom Animated Dropdown) */}
                          <td style={{ minWidth: 155 }}>
                            <ModernDropdown
                              value={row.diameter}
                              options={DIAMETER_OPTIONS}
                              onChange={val => updateRow(row.id, 'diameter', val)}
                            />
                          </td>

                          {/* Số thanh / cấu kiện (Dropdown Picker & Stepper) */}
                          <td style={{ minWidth: 125 }}>
                            <QuantityPickerDropdown
                              value={barsPer || 1}
                              onChange={val => updateRow(row.id, 'barsPerMember', val)}
                              placeholder="88"
                              label="Số thanh"
                              presets={[1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 40, 60, 88, 94, 100, 120]}
                            />
                          </td>

                          {/* Số cấu kiện (Dropdown Picker & Stepper) */}
                          <td style={{ minWidth: 105 }}>
                            <QuantityPickerDropdown
                              value={memberCount || 1}
                              onChange={val => updateRow(row.id, 'memberCount', val)}
                              placeholder="1"
                              label="Số cấu kiện"
                              presets={[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]}
                            />
                          </td>

                          {/* Tổng số thanh */}
                          <td>
                            <span className="font-mono" style={{ fontWeight: 700, color: '#f8fafc', paddingLeft: 6 }}>
                              {totalQty}
                            </span>
                          </td>

                          {/* Chiều dài 1 thanh (mm) */}
                          <td>
                            <input
                              type="number"
                              placeholder="VD: 4330"
                              value={row.length || ''}
                              onChange={e => updateRow(row.id, 'length', Number(e.target.value))}
                              min={1}
                            />
                          </td>

                          {/* Tổng chiều dài (m) */}
                          <td>
                            <span className="font-mono" style={{ fontSize: '0.85rem', color: '#94a3b8', paddingLeft: 4 }}>
                              {totalLenM > 0 ? totalLenM.toFixed(2) : '-'}
                            </span>
                          </td>

                          {/* Ghi chú */}
                          <td>
                            <input
                              type="text"
                              placeholder="VD: Dầm chính, Cột C1..."
                              value={row.note}
                              onChange={e => updateRow(row.id, 'note', e.target.value)}
                            />
                          </td>

                          {/* Xóa dòng */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn-delete-row"
                              onClick={() => deleteRow(row.id)}
                              title="Xóa dòng này"
                            >
                              <X size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* VIEW MODE 2: Mobile Touch-Friendly Card List */}
          {viewMode === 'cards' && (
            <div className="mobile-cards-list">
              {rows.map((row, idx) => {
                const barsPer = row.barsPerMember !== undefined ? row.barsPerMember : row.quantity;
                const memberCount = row.memberCount !== undefined ? row.memberCount : 1;
                const totalQty = row.quantity;
                const totalLenM = row.length && totalQty ? (row.length * totalQty) / 1000 : 0;

                return (
                  <div key={row.id} className="mobile-rebar-card">
                    <div className="m-card-top">
                      <div className="m-card-left">
                        <span className="stt-badge">#{row.mark || idx + 1}</span>
                        <div style={{ width: 145 }}>
                          <ModernDropdown
                            value={row.diameter}
                            options={DIAMETER_OPTIONS}
                            onChange={val => updateRow(row.id, 'diameter', val)}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-delete-row"
                        onClick={() => deleteRow(row.id)}
                        title="Xóa dòng này"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="m-card-shape-wrapper">
                      <RebarShapePreview
                        type={row.shapeType}
                        params={row.shapeParams}
                        totalLength={row.length}
                        onClick={() => setActiveEditingRowId(row.id)}
                      />
                    </div>

                    <div className="m-card-fields-grid">
                      <div className="m-field-item">
                        <label>Số thanh/CK:</label>
                        <QuantityPickerDropdown
                          value={barsPer || 1}
                          onChange={val => updateRow(row.id, 'barsPerMember', val)}
                          placeholder="88"
                          label="Số thanh"
                          presets={[1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 40, 60, 88, 94, 100, 120]}
                        />
                      </div>
                      <div className="m-field-item">
                        <label>Số CK:</label>
                        <QuantityPickerDropdown
                          value={memberCount || 1}
                          onChange={val => updateRow(row.id, 'memberCount', val)}
                          placeholder="1"
                          label="Số cấu kiện"
                          presets={[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]}
                        />
                      </div>
                    </div>

                    <div className="m-card-footer">
                      <div className="m-summary-chip">
                        <span>Tổng: <strong>{totalQty} thanh</strong> ({totalLenM > 0 ? totalLenM.toFixed(1) : 0}m)</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Ghi chú cấu kiện..."
                        value={row.note}
                        onChange={e => updateRow(row.id, 'note', e.target.value)}
                        className="m-note-input"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table Toolbar Actions */}
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <button className="btn btn-primary" onClick={addRow}>
                <Plus size={16} strokeWidth={2.4} />
                <span>Thêm 1 hàng</span>
              </button>
              <button className="btn btn-secondary" onClick={addMultipleRows}>
                <CopyPlus size={16} />
                <span>Thêm 5 hàng</span>
              </button>
            </div>

            <div className="table-toolbar-right">
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                <Download size={15} />
                <span>Xuất file Excel</span>
              </button>
            </div>
          </div>

          {/* BẢNG TỔNG HỢP KHỐI LƯỢNG THÉP THEO ĐƯỜNG KÍNH (Y hệt chân bảng trong ảnh) */}
          {Object.keys(bbsSummary).length > 0 && (
            <div className="bbs-summary-container">
              <div className="bbs-summary-title">
                <Scale size={16} style={{ color: 'var(--orange)' }} />
                <span>BẢNG TỔNG HỢP KHỐI LƯỢNG THÉP THEO ĐƯỜNG KÍNH (BBS SUMMARY)</span>
              </div>
              <div className="bbs-summary-chips">
                {Object.keys(bbsSummary)
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map(dStr => {
                    const d = parseInt(dStr, 10);
                    const item = bbsSummary[d];
                    return (
                      <div key={d} className="bbs-summary-item">
                        <span className="bbs-diam-badge">Thép Φ{d}</span>
                        <span className="bbs-length-val">
                          <Ruler size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#38bdf8' }} />
                          {item.lengthM.toFixed(2)} m
                        </span>
                        <span className="bbs-weight-val">
                          <Scale size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: '#34d399' }} />
                          {item.weightKg.toFixed(2)} kg
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </section>

        {/* Big CTA Optimize Button */}
        <div className="optimize-wrapper">
          <button
            className={`btn-optimize ${loading ? 'loading' : ''}`}
            onClick={handleOptimize}
          >
            <Zap size={22} fill="currentColor" />
            <span>
              {loading
                ? 'ĐANG TÍNH TOÁN CẮT TỐI ƯU...'
                : 'CHẠY TỐI ƯU CẮT THÉP (CTRL + ENTER)'}
            </span>
          </button>
        </div>

        {/* Results Presentation */}
        {results && globalStats && (
          <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Overview Stats */}
            <section className="card">
              <div className="card-header">
                <div className="card-title-group">
                  <div className="card-icon stats">
                    <BarChart3 size={18} strokeWidth={2.4} />
                  </div>
                  <div>
                    <h2 className="card-title">Kết Quả Tối Ưu Cắt Thép</h2>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Xử lý qua: {optimizedSource === 'backend' ? 'Backend Node.js API (Port 3001)' : 'Client Algorithm Engine'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={handleExportCSV} title="Xuất CSV">
                    <Download size={15} />
                    <span>Xuất CSV</span>
                  </button>
                  <button className="btn btn-secondary" onClick={() => window.print()} title="In phiếu cắt">
                    <Printer size={15} />
                    <span>In phiếu</span>
                  </button>
                </div>
              </div>

              <div className="stats-overview-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Tổng cây thép gốc cần dùng</span>
                    <Layers size={16} className="stat-icon" />
                  </div>
                  <span className="stat-value blue">{formatNum(globalStats.totalBars)}</span>
                  <span className="stat-sub">Cây nguyên ({stockLength / 1000}m / cây)</span>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Tổng thanh thành phẩm</span>
                    <Scissors size={16} className="stat-icon" />
                  </div>
                  <span className="stat-value purple">{formatNum(globalStats.totalPieces)}</span>
                  <span className="stat-sub">Thanh quy cách</span>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Tỷ lệ hao phí phế liệu</span>
                    <TrendingRate waste={globalStats.wastePercent} />
                  </div>
                  <span
                    className={`stat-value ${
                      globalStats.wastePercent < 5
                        ? 'emerald'
                        : globalStats.wastePercent < 10
                        ? 'orange'
                        : 'rose'
                    }`}
                  >
                    {formatNum(globalStats.wastePercent, 1)}%
                  </span>
                  <span className="stat-sub">Hao hụt {formatNum(globalStats.totalWaste / 1000, 1)} m</span>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">Ước tính khối lượng thép</span>
                    <Scale size={16} className="stat-icon" />
                  </div>
                  <span className="stat-value orange">{formatNum(globalStats.totalWeightKg, 1)}</span>
                  <span className="stat-sub">kg sắt thép</span>
                </div>
              </div>
            </section>

            {/* Per-Diameter Cutting Detail Cards */}
            {Object.keys(results)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(diameter => {
                const res = results[diameter];
                const d = parseInt(diameter);
                const wasteRateClass =
                  res.wastePercent < 5
                    ? 'waste-low'
                    : res.wastePercent < 10
                    ? 'waste-medium'
                    : 'waste-high';

                if (res.error) {
                  return (
                    <div key={diameter} className="diameter-group-card">
                      <div className="diameter-head">
                        <div className="diameter-head-left">
                          <span className={`diameter-pill pill-${d}`}>Φ{d}</span>
                          <div>
                            <h3 style={{ color: '#f87171' }}>Lỗi thanh quá dài</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
                              {res.error}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const lengthMeters = res.totalUsed / 1000;
                const weightKg = lengthMeters * (WEIGHT_PER_METER[d] || 0);

                return (
                  <div key={diameter} className="diameter-group-card">
                    {/* Header */}
                    <div className="diameter-head">
                      <div className="diameter-head-left">
                        <span className={`diameter-pill pill-${d}`}>Φ{d}</span>
                        <div className="diameter-meta">
                          <h3>Thép Cốt Φ{d}</h3>
                          <div className="diameter-chips">
                            <span className="meta-chip chip-bars">
                              <Boxes size={13} strokeWidth={2.2} className="chip-icon" />
                              <span className="chip-label">Cây gốc:</span>
                              <strong className="chip-val">{res.totalBars}</strong>
                            </span>
                            <span className="meta-chip chip-pieces">
                              <Scissors size={13} strokeWidth={2.2} className="chip-icon" />
                              <span className="chip-label">Thanh cắt:</span>
                              <strong className="chip-val">{res.totalPieces}</strong>
                            </span>
                            <span className="meta-chip chip-weight">
                              <Scale size={13} strokeWidth={2.2} className="chip-icon" />
                              <span className="chip-label">Khối lượng:</span>
                              <strong className="chip-val">{formatNum(weightKg, 1)}</strong>
                              <span className="chip-unit">kg</span>
                            </span>
                            <span className="meta-chip chip-length">
                              <Ruler size={13} strokeWidth={2.2} className="chip-icon" />
                              <span className="chip-label">Chiều dài:</span>
                              <strong className="chip-val">{formatNum(lengthMeters, 1)}</strong>
                              <span className="chip-unit">m</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`waste-rate-badge ${wasteRateClass}`}>
                        {res.wastePercent < 5 ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <AlertTriangle size={14} />
                        )}
                        {formatNum(res.wastePercent, 1)}% hao phí
                      </span>
                    </div>

                    {/* Cutting Patterns */}
                    <div className="patterns-container">
                      {res.patterns.map((pattern, pIdx) => {
                        const sortedPieces = [...pattern.pieces].sort(
                          (a, b) => b.length - a.length
                        );
                        let colorIdx = 0;

                        return (
                          <div key={pIdx} className="pattern-item-card">
                            <div className="pattern-header-line">
                              <span className="pattern-title">
                                Sơ đồ cắt #{pIdx + 1}
                              </span>
                              <span className="pattern-multiplier">
                                × {pattern.count} cây thép gốc ({stockLength / 1000}m)
                              </span>
                            </div>

                            {/* Visual simulation bar */}
                            <div className="cutting-bar-track">
                              {sortedPieces.map((p, pi) => {
                                const widthPercent = (p.length / stockLength) * 100;
                                const colorClass = `seg-c${colorIdx % 10}`;
                                colorIdx++;
                                return (
                                  <div
                                    key={pi}
                                    className={`cut-segment ${colorClass}`}
                                    style={{ width: `${widthPercent}%` }}
                                    title={`${p.length}mm${p.note ? ' (' + p.note + ')' : ''}`}
                                  >
                                    {widthPercent > 6 ? `${p.length}mm` : ''}
                                  </div>
                                );
                              })}

                              {pattern.remaining > 0 && (
                                <div
                                  className="segment-waste"
                                  style={{
                                    width: `${(pattern.remaining / stockLength) * 100}%`,
                                  }}
                                  title={`Phế liệu cắt dư: ${pattern.remaining}mm`}
                                >
                                  {(pattern.remaining / stockLength) * 100 > 6
                                    ? `${pattern.remaining}`
                                    : ''}
                                </div>
                              )}
                            </div>

                            {/* Detail Chips */}
                            <div className="pattern-breakdown-tags">
                              {sortedPieces.map((p, pi) => (
                                <span key={pi} className="breakdown-chip">
                                  {p.mark ? `#${p.mark}: ` : ''}{p.length}mm {p.note && `(${p.note})`}
                                </span>
                              ))}

                              {pattern.remaining > 0 ? (
                                <span className="breakdown-waste-chip">
                                  Dư {pattern.remaining} mm
                                </span>
                              ) : (
                                <span className="breakdown-perfect-chip">
                                  <Check size={12} style={{ display: 'inline', marginRight: 3 }} />
                                  Vừa khít 100%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>

      {/* Shape Editor Modal */}
      {activeEditingRow && (
        <ShapeEditorModal
          isOpen={!!activeEditingRowId}
          onClose={() => setActiveEditingRowId(null)}
          initialType={activeEditingRow.shapeType}
          initialParams={activeEditingRow.shapeParams}
          initialLength={activeEditingRow.length}
          onSave={handleSaveShape}
        />
      )}

      {/* Project Selector Modal */}
      {projectsModalOpen && (
        <div
          className="modal-overlay active"
          onClick={e => {
            if (e.target === e.currentTarget) setProjectsModalOpen(false);
          }}
        >
          <div className="modern-modal">
            <div className="modal-head">
              <h2>Danh Sách Dự Án Bảng Thống Kê (Backend)</h2>
              <button className="btn-icon" onClick={() => setProjectsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto' }}>
              {savedProjects.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chưa có dự án nào được lưu.</p>
              ) : (
                savedProjects.map(proj => (
                  <div
                    key={proj.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectProject(proj)}
                  >
                    <div>
                      <h4 style={{ color: '#ffffff', fontSize: '0.95rem' }}>{proj.name}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {proj.rows.length} cấu kiện • Thép gốc: {proj.stockLength / 1000}m
                      </span>
                    </div>
                    <button className="btn btn-secondary">Mở</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      <div
        className={`modal-overlay ${helpOpen ? 'active' : ''}`}
        onClick={e => {
          if (e.target === e.currentTarget) setHelpOpen(false);
        }}
      >
        <div className="modern-modal">
          <div className="modal-head">
            <h2>Quy Trình Quản Lý & Tối Ưu Cắt Thép</h2>
            <button className="btn-icon" onClick={() => setHelpOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-step-list">
            {[
              {
                title: '1. Nhập hình dạng & kích thước cấu kiện',
                desc: 'Nhấp vào ô "Hình dạng" để chọn thanh thẳng, chữ U, đai chữ nhật dầm/cột, uốn xiên vai bò... Phần mềm sẽ tự động cộng dồn kích thước ra tổng chiều dài.',
              },
              {
                title: '2. Nhập số thanh và số cấu kiện',
                desc: 'Hệ thống tự động tính Tổng số thanh = (Số thanh / cấu kiện) × (Số cấu kiện) và tổng chiều dài (m).',
              },
              {
                title: '3. Kiểm tra Bảng tổng hợp khối lượng (BBS Summary)',
                desc: 'Tự động tính tổng chiều dài (m) và trọng lượng (kg) cho từng loại thép Φ6, Φ8, Φ10, Φ12, Φ16, Φ20.',
              },
              {
                title: '4. Tối ưu cắt & Lưu trữ Backend',
                desc: 'Bấm nút "Chạy Tối Ưu" hoặc bấm tổ hợp Ctrl+Enter. Dữ liệu được tính toán và lưu trữ an toàn trong Backend database.',
              },
            ].map((step, idx) => (
              <div key={idx} className="modal-step">
                <div className="step-num-badge">{idx + 1}</div>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Toast Container */}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`modern-toast ${t.type} ${t.out ? 'out' : ''}`}>
            {t.type === 'success' && <CheckCircle2 size={16} />}
            {t.type === 'error' && <AlertTriangle size={16} />}
            {t.type === 'info' && <Info size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Subcomponent for status icon
function TrendingRate({ waste }: { waste: number }) {
  if (waste < 5) return <CheckCircle2 size={16} className="stat-icon" style={{ color: '#34d399' }} />;
  if (waste < 10) return <AlertTriangle size={16} className="stat-icon" style={{ color: '#fbbf24' }} />;
  return <AlertTriangle size={16} className="stat-icon" style={{ color: '#fb7185' }} />;
}
