import express, { Request, Response } from 'express';
import cors from 'cors';
import { optimizeCutting } from './optimizer';
import { getAllProjects, getProjectById, saveProject, deleteProject } from './storage';
import { WEIGHT_PER_METER, type CutPiece } from '../src/types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Steel Cutting Optimization Backend API',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// Run cutting optimization algorithm
app.post('/api/optimize', (req: Request, res: Response) => {
  try {
    const { pieces, stockLength, bladeWidth } = req.body;
    if (!pieces || !Array.isArray(pieces)) {
      return res.status(400).json({ error: 'Danh sách thanh cắt (pieces) không hợp lệ' });
    }
    const stock = Number(stockLength) || 11700;
    const kerf = Number(bladeWidth) || 0;

    const results = optimizeCutting(pieces, stock, kerf);
    return res.json({ success: true, results, stockLength: stock, bladeWidth: kerf });
  } catch (error) {
    console.error('Error optimizing:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
});

// Get all projects
app.get('/api/projects', (_req: Request, res: Response) => {
  try {
    const projects = getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get project by id
app.get('/api/projects/:id', (req: Request, res: Response) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Không tìm thấy dự án' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Save or update project
app.post('/api/projects', (req: Request, res: Response) => {
  try {
    const saved = saveProject(req.body);
    res.json({ success: true, project: saved });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete project
app.delete('/api/projects/:id', (req: Request, res: Response) => {
  try {
    const ok = deleteProject(req.params.id);
    if (ok) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Không tìm thấy dự án để xóa' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Export BBS Excel / CSV
app.post('/api/export-excel', (req: Request, res: Response) => {
  try {
    const { projectName, rows } = req.body as { projectName?: string; rows: CutPiece[] };
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }

    let csv = '\uFEFF'; // UTF-8 BOM for Excel in Vietnamese
    csv += `BẢNG THỐNG KÊ CỐT THÉP - ${projectName || 'DỰ ÁN'}\n\n`;
    csv += 'Số hiệu,Hình dạng - Kích thước,Đường kính (Φ),Số thanh/cấu kiện,Số cấu kiện,Tổng số thanh,Chiều dài 1 thanh (mm),Tổng chiều dài (m),Ghi chú\n';

    // Summary accumulator per diameter
    const diamSummary: Record<number, { lengthM: number; weightKg: number }> = {};

    rows.forEach((r, idx) => {
      const mark = r.mark || idx + 1;
      const d = r.diameter;
      const barsPer = r.barsPerMember || r.quantity;
      const members = r.memberCount || 1;
      const totalQty = r.quantity || barsPer * members;
      const len = r.length;
      const totalLenM = (len * totalQty) / 1000;

      // Shape description
      let shapeDesc = '';
      if (r.shapeType === 'u_shape' && r.shapeParams) {
        shapeDesc = `U: ${r.shapeParams.a || 0} - ${r.shapeParams.b || 0} - ${r.shapeParams.c || 0}`;
      } else if (r.shapeType === 'stirrup_rect' && r.shapeParams) {
        shapeDesc = `Đai: ${r.shapeParams.a || 0}x${r.shapeParams.b || 0} + 2x${r.shapeParams.hook || 0}`;
      } else if (r.shapeType === 'cranked' && r.shapeParams) {
        shapeDesc = `Xiên: ${r.shapeParams.a || 0} / ${r.shapeParams.b || 0} \\ ${r.shapeParams.c || 0}`;
      } else if (r.shapeType === 'straight') {
        shapeDesc = `Thẳng: ${len}`;
      } else {
        shapeDesc = `L = ${len}`;
      }

      csv += `"${mark}","${shapeDesc}",${d},${barsPer},${members},${totalQty},${len},${totalLenM.toFixed(2)},"${r.note || ''}"\n`;

      if (!diamSummary[d]) {
        diamSummary[d] = { lengthM: 0, weightKg: 0 };
      }
      diamSummary[d].lengthM += totalLenM;
      diamSummary[d].weightKg += totalLenM * (WEIGHT_PER_METER[d] || 0);
    });

    csv += '\nBẢNG TỔNG HỢP KHỐI LƯỢNG THÉP THEO ĐƯỜNG KÍNH\n';
    csv += 'Đường kính,Tổng chiều dài (m),Đơn trọng (kg/m),Tổng khối lượng (kg)\n';

    Object.keys(diamSummary)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(dStr => {
        const d = parseInt(dStr, 10);
        const item = diamSummary[d];
        const unitWeight = WEIGHT_PER_METER[d] || 0;
        csv += `Φ${d},${item.lengthM.toFixed(2)},${unitWeight.toFixed(3)},${item.weightKg.toFixed(2)}\n`;
      });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bang-thong-ke-cot-thep.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`[Backend Server] Ready on http://localhost:${PORT}`);
});
