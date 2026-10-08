import React from 'react';
import type { BarShapeType, BarShapeParams } from '../types';

interface RebarShapePreviewProps {
  type?: BarShapeType;
  params?: BarShapeParams;
  totalLength: number;
  onClick?: () => void;
}

export const RebarShapePreview: React.FC<RebarShapePreviewProps> = ({
  type = 'straight',
  params = {},
  totalLength,
  onClick,
}) => {
  const { a = 0, b = 0, c = 0, hook = 0 } = params;

  // Render SVG based on shape type
  const renderSvg = () => {
    switch (type) {
      case 'straight':
        return (
          <svg viewBox="0 0 160 36" className="shape-svg">
            {/* Dimension line & text */}
            <text x="80" y="13" textAnchor="middle" className="shape-dim-text">
              {a || totalLength}
            </text>
            {/* Rebar line */}
            <line x1="20" y1="24" x2="140" y2="24" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
            {/* End ticks */}
            <line x1="20" y1="18" x2="20" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="140" y1="18" x2="140" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
          </svg>
        );

      case 'u_shape':
        return (
          <svg viewBox="0 0 160 48" className="shape-svg">
            {/* Left leg label */}
            <text x="18" y="18" textAnchor="middle" className="shape-dim-text-sm">
              {a || 0}
            </text>
            {/* Middle body label */}
            <text x="80" y="14" textAnchor="middle" className="shape-dim-text">
              {b || totalLength}
            </text>
            {/* Right leg label */}
            <text x="142" y="18" textAnchor="middle" className="shape-dim-text-sm">
              {c || a || 0}
            </text>
            {/* U-Shape Path: bent downwards like in structural drawings */}
            <path
              d="M 28 10 L 28 34 L 132 34 L 132 10"
              fill="none"
              stroke="#fb923c"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'l_shape':
        return (
          <svg viewBox="0 0 160 42" className="shape-svg">
            <text x="20" y="20" textAnchor="middle" className="shape-dim-text-sm">
              {a || 0}
            </text>
            <text x="85" y="14" textAnchor="middle" className="shape-dim-text">
              {b || totalLength}
            </text>
            <path
              d="M 30 10 L 30 30 L 135 30"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'stirrup_rect':
        return (
          <svg viewBox="0 0 160 48" className="shape-svg">
            {/* Height text on left */}
            <text x="24" y="26" textAnchor="middle" className="shape-dim-text-sm">
              {a || 0}
            </text>
            {/* Width text in middle */}
            <text x="80" y="13" textAnchor="middle" className="shape-dim-text">
              {b || 0}
            </text>
            {/* Hook label on right */}
            {hook > 0 && (
              <text x="136" y="26" textAnchor="middle" className="shape-dim-text-sm" fill="#f43f5e">
                {hook}
              </text>
            )}
            {/* Stirrup Rect Outline */}
            <rect
              x="42"
              y="16"
              width="76"
              height="24"
              rx="3"
              fill="rgba(59, 130, 246, 0.08)"
              stroke="#34d399"
              strokeWidth="2.5"
            />
            {/* 135-degree hooks */}
            <path
              d="M 42 16 L 36 22 M 42 16 L 48 22"
              stroke="#34d399"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'cranked':
        return (
          <svg viewBox="0 0 160 44" className="shape-svg">
            {/* Left bend label */}
            <text x="22" y="16" textAnchor="middle" className="shape-dim-text-sm">
              {a || 0}
            </text>
            {/* Middle label */}
            <text x="80" y="38" textAnchor="middle" className="shape-dim-text">
              {b || totalLength}
            </text>
            {/* Right bend label */}
            <text x="138" y="16" textAnchor="middle" className="shape-dim-text-sm">
              {c || a || 0}
            </text>
            {/* Cranked shape path */}
            <path
              d="M 15 14 L 38 28 L 122 28 L 145 14"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'c_shape':
        return (
          <svg viewBox="0 0 160 42" className="shape-svg">
            <text x="20" y="22" textAnchor="middle" className="shape-dim-text-sm">
              {a || 0}
            </text>
            <text x="80" y="14" textAnchor="middle" className="shape-dim-text">
              {b || 0}
            </text>
            <text x="140" y="22" textAnchor="middle" className="shape-dim-text-sm">
              {c || 0}
            </text>
            <path
              d="M 30 32 L 30 18 L 130 18 L 130 32"
              fill="none"
              stroke="#f472b6"
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        );

      default:
        return (
          <div className="shape-custom-badge">
            <span>{totalLength > 0 ? `${totalLength} mm` : 'Chọn dạng'}</span>
          </div>
        );
    }
  };

  return (
    <div
      className="rebar-shape-cell"
      onClick={onClick}
      title="Nhấp để chọn hình dạng và nhập kích thước chi tiết"
    >
      {renderSvg()}
    </div>
  );
};
