// ===========================
// Type Definitions
// ===========================

export type BarShapeType =
  | 'straight'     // Thanh thẳng [ — a — ]
  | 'l_shape'      // Chữ L [ a ┐ b ]
  | 'u_shape'      // Chữ U / móc 2 đầu [ a ┌ — b — ┐ c ]
  | 'stirrup_rect' // Đai chữ nhật [ a x b + 2 móc c ]
  | 'cranked'      // Vai bò / Uốn xiên [ a \___ b ___/ c ]
  | 'c_shape'      // Đai hở / Chữ C [ a ┌— b —┘ c ]
  | 'hook_ends'    // Thẳng 2 móc tròn [ ⊂— a —⊃ ]
  | 'custom';      // Tùy biến

export interface BarShapeParams {
  a?: number;
  b?: number;
  c?: number;
  d?: number;
  hook?: number;
}

/** A single piece that needs to be cut (dòng trong Bảng thống kê cốt thép) */
export interface CutPiece {
  id: string;
  mark?: number | string;      // Số hiệu thanh (1, 2, 3...)
  shapeType?: BarShapeType;    // Loại hình dạng
  shapeParams?: BarShapeParams; // Thông số các cạnh a, b, c, hook
  diameter: number;            // Đường kính (mm)
  length: number;              // Chiều dài 1 thanh (mm)
  barsPerMember?: number;      // Số thanh trên 1 cấu kiện
  memberCount?: number;        // Số cấu kiện
  quantity: number;            // Tổng số thanh = barsPerMember * memberCount
  note: string;                // Ghi chú cấu kiện (Dầm D1, Cột C1...)
}

/** A piece placed on a bar */
export interface PlacedPiece {
  length: number;
  note: string;
  mark?: number | string;
}

/** A single stock bar with pieces placed on it */
export interface CutBar {
  pieces: PlacedPiece[];
  remaining: number;
  usedLength: number;
  stockLength: number;
}

/** A consolidated pattern (identical bars grouped) */
export interface CutPattern {
  pieces: PlacedPiece[];
  remaining: number;
  usedLength: number;
  stockLength: number;
  count: number;
}

/** Result for one diameter group */
export interface DiameterResult {
  error?: string;
  bars: CutBar[];
  patterns: CutPattern[];
  totalPieces: number;
  totalBars: number;
  totalUsed: number;
  totalWaste: number;
  totalStock: number;
  wastePercent: number;
}

/** All results keyed by diameter */
export type OptimizationResults = Record<string, DiameterResult>;

/** Project structure for Backend persistence */
export interface ProjectSchedule {
  id: string;
  name: string;
  customer?: string;
  stockLength: number;
  bladeWidth: number;
  rows: CutPiece[];
  createdAt: string;
  updatedAt: string;
}

/** Available diameters */
export const DIAMETERS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32] as const;

/** Weight per meter by diameter (kg/m) — formula: d² / 162 */
export const WEIGHT_PER_METER: Record<number, number> = {};
DIAMETERS.forEach(d => {
  WEIGHT_PER_METER[d] = (d * d) / 162;
});
