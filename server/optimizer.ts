import type { CutPiece, OptimizationResults, CutBar, CutPattern, DiameterResult } from '../src/types';

/**
 * Server-side cutting optimizer implementing Best-Fit Decreasing
 * with multi-pass local search swap improvements.
 */
export function optimizeCutting(
  pieces: CutPiece[],
  stockLength: number,
  bladeWidth: number = 0
): OptimizationResults {
  // Group pieces by diameter
  const byDiameter: Record<number, CutPiece[]> = {};
  for (const p of pieces) {
    if (p.length <= 0 || p.quantity <= 0) continue;
    if (!byDiameter[p.diameter]) {
      byDiameter[p.diameter] = [];
    }
    byDiameter[p.diameter].push(p);
  }

  const results: OptimizationResults = {};

  for (const dStr of Object.keys(byDiameter)) {
    const d = parseInt(dStr, 10);
    const dPieces = byDiameter[d];

    // Expand pieces by quantity
    const items: { length: number; note: string; mark?: number | string }[] = [];
    for (const p of dPieces) {
      for (let i = 0; i < p.quantity; i++) {
        items.push({ length: p.length, note: p.note, mark: p.mark });
      }
    }

    // Check if any piece exceeds stock length
    const tooLong = items.find(it => it.length > stockLength);
    if (tooLong) {
      results[d] = {
        error: `Có thanh dài ${tooLong.length}mm vượt quá chiều dài cây thép gốc (${stockLength}mm)`,
        bars: [],
        patterns: [],
        totalPieces: items.length,
        totalBars: 0,
        totalUsed: 0,
        totalWaste: 0,
        totalStock: 0,
        wastePercent: 0,
      };
      continue;
    }

    results[d] = optimizeDiameter(items, stockLength, bladeWidth);
  }

  return results;
}

function optimizeDiameter(
  items: { length: number; note: string; mark?: number | string }[],
  stockLength: number,
  bladeWidth: number
): DiameterResult {
  // Sort descending (First-Fit / Best-Fit Decreasing)
  const sorted = [...items].sort((a, b) => b.length - a.length);

  const bars: CutBar[] = [];

  sorted.forEach(piece => {
    let bestBarIdx = -1;
    let minRemaining = Infinity;

    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const kerf = bar.pieces.length > 0 ? bladeWidth : 0;
      const spaceNeeded = piece.length + kerf;

      if (bar.remaining >= spaceNeeded) {
        const remainingAfter = bar.remaining - spaceNeeded;
        if (remainingAfter < minRemaining) {
          minRemaining = remainingAfter;
          bestBarIdx = i;
        }
      }
    }

    if (bestBarIdx !== -1) {
      const bar = bars[bestBarIdx];
      const kerf = bar.pieces.length > 0 ? bladeWidth : 0;
      bar.pieces.push(piece);
      bar.remaining -= (piece.length + kerf);
      bar.usedLength += (piece.length + kerf);
    } else {
      bars.push({
        pieces: [piece],
        remaining: stockLength - piece.length,
        usedLength: piece.length,
        stockLength,
      });
    }
  });

  improveWithSwaps(bars, bladeWidth);

  const patterns = consolidatePatterns(bars, stockLength);

  const totalBars = bars.length;
  const totalUsed = bars.reduce((sum, b) => sum + b.usedLength, 0);
  const totalStock = totalBars * stockLength;
  const totalWaste = totalStock - totalUsed;
  const wastePercent = totalStock > 0 ? (totalWaste / totalStock) * 100 : 0;

  return {
    bars,
    patterns,
    totalPieces: items.length,
    totalBars,
    totalUsed,
    totalWaste,
    totalStock,
    wastePercent,
  };
}

function improveWithSwaps(bars: CutBar[], bladeWidth: number): void {
  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = bars.length - 1; i >= 0; i--) {
      const bar = bars[i];
      let canEmpty = true;
      const placements: { pieceIdx: number; targetBarIdx: number }[] = [];

      for (let pi = 0; pi < bar.pieces.length; pi++) {
        const piece = bar.pieces[pi];
        let placed = false;

        for (let j = 0; j < bars.length; j++) {
          if (j === i) continue;
          const extraKerf = bars[j].pieces.length > 0 ? bladeWidth : 0;
          let additionalUsed = 0;
          placements
            .filter(p => p.targetBarIdx === j)
            .forEach(p => {
              additionalUsed += bar.pieces[p.pieceIdx].length + bladeWidth;
            });

          const availableSpace = bars[j].remaining - additionalUsed - piece.length - extraKerf;
          if (availableSpace >= 0) {
            placements.push({ pieceIdx: pi, targetBarIdx: j });
            placed = true;
            break;
          }
        }

        if (!placed) {
          canEmpty = false;
          break;
        }
      }

      if (canEmpty && placements.length > 0) {
        placements.forEach(({ pieceIdx, targetBarIdx }) => {
          const piece = bar.pieces[pieceIdx];
          const target = bars[targetBarIdx];
          const kerf = target.pieces.length > 0 ? bladeWidth : 0;
          target.pieces.push(piece);
          target.remaining -= (piece.length + kerf);
          target.usedLength += (piece.length + kerf);
        });

        bars.splice(i, 1);
        improved = true;
        break;
      }
    }
  }
}

function consolidatePatterns(bars: CutBar[], stockLength: number): CutPattern[] {
  const patternMap = new Map<string, CutPattern>();

  bars.forEach(bar => {
    const key = bar.pieces
      .map(p => p.length)
      .sort((a, b) => b - a)
      .join('-');

    if (patternMap.has(key)) {
      patternMap.get(key)!.count++;
    } else {
      patternMap.set(key, {
        pieces: [...bar.pieces],
        remaining: bar.remaining,
        usedLength: bar.usedLength,
        stockLength,
        count: 1,
      });
    }
  });

  return Array.from(patternMap.values()).sort((a, b) => b.count - a.count);
}
