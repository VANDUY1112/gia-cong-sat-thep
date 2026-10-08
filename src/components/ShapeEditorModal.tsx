import React, { useState, useEffect } from 'react';
import type { BarShapeType, BarShapeParams } from '../types';
import { X, Check, Ruler } from 'lucide-react';

interface ShapeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: BarShapeType;
  initialParams?: BarShapeParams;
  initialLength: number;
  onSave: (type: BarShapeType, params: BarShapeParams, computedLength: number) => void;
}

export const ShapeEditorModal: React.FC<ShapeEditorModalProps> = ({
  isOpen,
  onClose,
  initialType = 'straight',
  initialParams = {},
  initialLength = 0,
  onSave,
}) => {
  const [shapeType, setShapeType] = useState<BarShapeType>(initialType);
  const [params, setParams] = useState<BarShapeParams>(initialParams);

  useEffect(() => {
    setShapeType(initialType || 'straight');
    setParams(initialParams || { a: initialLength || 0 });
  }, [initialType, initialParams, initialLength, isOpen]);

  if (!isOpen) return null;

  // Compute total cut length
  const computeTotalLength = (): number => {
    const a = Number(params.a) || 0;
    const b = Number(params.b) || 0;
    const c = Number(params.c) || 0;
    const hook = Number(params.hook) || 0;

    switch (shapeType) {
      case 'straight':
        return a;
      case 'u_shape':
        return a + b + (c || a);
      case 'l_shape':
        return a + b;
      case 'stirrup_rect':
        return 2 * (a + b) + 2 * hook;
      case 'cranked':
        return a + b + (c || a);
      case 'c_shape':
        return a + b + c;
      default:
        return a || initialLength;
    }
  };

  const computedLen = computeTotalLength();

  const handleApply = () => {
    onSave(shapeType, params, computedLen);
    onClose();
  };

  return (
    <div
      className="modal-overlay active"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="shape-modal-card">
        {/* Modal Header */}
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="card-icon input" style={{ width: 32, height: 32 }}>
              <Ruler size={16} />
            </div>
            <h3>Chọn Hình Dạng & Kích Thước Thanh Thép</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Shape Type Selector Grid */}
        <div className="shape-type-grid">
          {[
            { id: 'straight', name: 'Thanh thẳng', desc: 'L = a' },
            { id: 'u_shape', name: 'Chữ U (Móc 2 đầu)', desc: 'L = a + b + c' },
            { id: 'stirrup_rect', name: 'Đai chữ nhật', desc: 'L = 2(a+b) + 2*hook' },
            { id: 'cranked', name: 'Uốn xiên / Vai bò', desc: 'L = a + b + c' },
            { id: 'l_shape', name: 'Chữ L (Móc 1 đầu)', desc: 'L = a + b' },
            { id: 'c_shape', name: 'Đai hở chữ C', desc: 'L = a + b + c' },
          ].map(item => (
            <button
              key={item.id}
              type="button"
              className={`shape-type-btn ${shapeType === item.id ? 'active' : ''}`}
              onClick={() => {
                setShapeType(item.id as BarShapeType);
                if (item.id === 'straight' && !params.a) {
                  setParams({ a: initialLength || 1000 });
                } else if (item.id === 'u_shape' && (!params.a || !params.b)) {
                  setParams({ a: 150, b: initialLength > 300 ? initialLength - 300 : 4030, c: 150 });
                } else if (item.id === 'stirrup_rect' && (!params.a || !params.b)) {
                  setParams({ a: 120, b: 350, hook: 65 });
                }
              }}
            >
              <span className="shape-btn-name">{item.name}</span>
              <span className="shape-btn-desc">{item.desc}</span>
            </button>
          ))}
        </div>

        {/* Interactive Dimension Inputs */}
        <div className="dimension-inputs-group">
          {shapeType === 'straight' && (
            <div className="dim-row">
              <label>Chiều dài thanh (a):</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={params.a || ''}
                  onChange={e => setParams(p => ({ ...p, a: Number(e.target.value) }))}
                  placeholder="VD: 4030"
                />
                <span className="unit-badge">mm</span>
              </div>
            </div>
          )}

          {shapeType === 'u_shape' && (
            <div className="dim-form-grid">
              <div className="dim-row">
                <label>Móc trái (a):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.a || ''}
                    onChange={e => setParams(p => ({ ...p, a: Number(e.target.value) }))}
                    placeholder="VD: 150"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
              <div className="dim-row">
                <label>Thân giữa (b):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.b || ''}
                    onChange={e => setParams(p => ({ ...p, b: Number(e.target.value) }))}
                    placeholder="VD: 4030"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
              <div className="dim-row">
                <label>Móc phải (c):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.c !== undefined ? params.c : (params.a || '')}
                    onChange={e => setParams(p => ({ ...p, c: Number(e.target.value) }))}
                    placeholder="VD: 150"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
            </div>
          )}

          {shapeType === 'stirrup_rect' && (
            <div className="dim-form-grid">
              <div className="dim-row">
                <label>Chiều cao đai (a):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.a || ''}
                    onChange={e => setParams(p => ({ ...p, a: Number(e.target.value) }))}
                    placeholder="VD: 120"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
              <div className="dim-row">
                <label>Chiều rộng đai (b):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.b || ''}
                    onChange={e => setParams(p => ({ ...p, b: Number(e.target.value) }))}
                    placeholder="VD: 350"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
              <div className="dim-row">
                <label>Móc uốn 135° (hook):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.hook || ''}
                    onChange={e => setParams(p => ({ ...p, hook: Number(e.target.value) }))}
                    placeholder="VD: 65"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
            </div>
          )}

          {shapeType === 'cranked' && (
            <div className="dim-form-grid">
              <div className="dim-row">
                <label>Xiên trái (a):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.a || ''}
                    onChange={e => setParams(p => ({ ...p, a: Number(e.target.value) }))}
                    placeholder="VD: 200"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
              <div className="dim-row">
                <label>Thân thẳng (b):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.b || ''}
                    onChange={e => setParams(p => ({ ...p, b: Number(e.target.value) }))}
                    placeholder="VD: 714"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
              <div className="dim-row">
                <label>Xiên phải (c):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.c !== undefined ? params.c : (params.a || '')}
                    onChange={e => setParams(p => ({ ...p, c: Number(e.target.value) }))}
                    placeholder="VD: 200"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
            </div>
          )}

          {shapeType === 'l_shape' && (
            <div className="dim-form-grid">
              <div className="dim-row">
                <label>Móc góc (a):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.a || ''}
                    onChange={e => setParams(p => ({ ...p, a: Number(e.target.value) }))}
                    placeholder="VD: 200"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
              <div className="dim-row">
                <label>Thân dài (b):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={params.b || ''}
                    onChange={e => setParams(p => ({ ...p, b: Number(e.target.value) }))}
                    placeholder="VD: 2500"
                  />
                  <span className="unit-badge">mm</span>
                </div>
              </div>
            </div>
          )}

          {shapeType === 'c_shape' && (
            <div className="dim-form-grid">
              <div className="dim-row">
                <label>Móc 1 (a):</label>
                <input
                  type="number"
                  value={params.a || ''}
                  onChange={e => setParams(p => ({ ...p, a: Number(e.target.value) }))}
                />
              </div>
              <div className="dim-row">
                <label>Thân (b):</label>
                <input
                  type="number"
                  value={params.b || ''}
                  onChange={e => setParams(p => ({ ...p, b: Number(e.target.value) }))}
                />
              </div>
              <div className="dim-row">
                <label>Móc 2 (c):</label>
                <input
                  type="number"
                  value={params.c || ''}
                  onChange={e => setParams(p => ({ ...p, c: Number(e.target.value) }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Calculation Display */}
        <div className="computed-length-box">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              TỰ ĐỘNG TÍNH CHIỀU DÀI 1 THANH:
            </span>
            <div className="computed-val font-mono">
              {computedLen.toLocaleString('vi-VN')} <span>mm</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleApply}>
            <Check size={16} />
            <span>Áp dụng kích thước</span>
          </button>
        </div>
      </div>
    </div>
  );
};
