/**
 * ============================================
 * CUTTING STOCK OPTIMIZATION ENGINE
 * ============================================
 * 
 * Implements Best Fit Decreasing (BFD) heuristic
 * for the 1D Cutting Stock Problem.
 * 
 * Enhanced with:
 * - Blade kerf (mạch cắt) consideration
 * - Pattern consolidation (nhóm phương án giống nhau)
 * - Per-diameter grouping
 */

import type {
  CutPiece,
  PlacedPiece,
  CutBar,
  CutPattern,
  DiameterResult,
  OptimizationResults,
} from './types';

/**
 * Main optimization function.
 * Groups pieces by diameter, then optimizes each group independently.
 */
export function optimizeCutting(
  pieces: CutPiece[],
  stockLength: number,
  bladeWidth: number
): OptimizationResults {
  // Group by diameter
  const grouped: Record<string, PlacedPiece[]> = {};

  pieces.forEach(p => {
    const key = String(p.diameter);
    if (!grouped[key]) grouped[key] = [];
    // Expand quantity into individual pieces
    for (let i = 0; i < p.quantity; i++) {
      grouped[key].push({
        length: p.length,
        note: p.note,
      });
    }
  });

  const results: OptimizationResults = {};

  // Sort diameters numerically
  Object.keys(grouped)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(diameter => {
      results[diameter] = optimizeGroup(grouped[diameter], stockLength, bladeWidth);
    });

  return results;
}

/**
 * Optimize a single diameter group using Best Fit Decreasing.
 */
function optimizeGroup(
  items: PlacedPiece[],
  stockLength: number,
  bladeWidth: number
): DiameterResult {
  // Sort by length descending (FFD/BFD first step)
  const sorted = [...items].sort((a, b) => b.length - a.length);

  // Validate: check if any piece exceeds stock length
  const tooLong = sorted.find(p => p.length > stockLength);
  if (tooLong) {
    return {
      error: `Thanh ${tooLong.length}mm dài hơn cây thép gốc ${stockLength}mm!`,
      bars: [],
      patterns: [],
      totalPieces: items.length,
      totalBars: 0,
      totalUsed: 0,
      totalWaste: 0,
      totalStock: 0,
      wastePercent: 0,
    };
  }

  // Best Fit Decreasing
  const bars: CutBar[] = [];

  sorted.forEach(piece => {
    // Try to fit in existing bars (best fit = smallest remaining space after placing)
    let bestBarIndex = -1;
    let bestRemaining = Infinity;

    for (let i = 0; i < bars.length; i++) {
      const kerf = bars[i].pieces.length > 0 ? bladeWidth : 0;
      const needed = piece.length + kerf;
      const remaining = bars[i].remaining - needed;

      if (remaining >= 0 && remaining < bestRemaining) {
        bestBarIndex = i;
        bestRemaining = remaining;
      }
    }

    if (bestBarIndex >= 0) {
      const bar = bars[bestBarIndex];
      const kerf = bar.pieces.length > 0 ? bladeWidth : 0;
      bar.pieces.push(piece);
      bar.remaining -= (piece.length + kerf);
      bar.usedLength += (piece.length + kerf);
    } else {
      // Open a new bar
      bars.push({
        pieces: [piece],
        remaining: stockLength - piece.length,
        usedLength: piece.length,
        stockLength,
      });
    }
  });

  // Try to improve with local search (swap optimization)
  improveWithSwaps(bars, stockLength, bladeWidth);

  // Consolidate identical patterns
  const patterns = consolidatePatterns(bars, stockLength);

  // Calculate statistics
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

/**
 * Local search improvement: try swapping pieces between bars
 * to reduce overall waste (number of bars).
 */
function improveWithSwaps(
  bars: CutBar[],
  _stockLength: number,
  bladeWidth: number
): void {
  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    // Try to merge small bars into others
    for (let i = bars.length - 1; i >= 0; i--) {
      const bar = bars[i];

      // Try to move all pieces from this bar into other bars
      let canEmpty = true;
      const placements: { pieceIdx: number; targetBarIdx: number }[] = [];

      for (let pi = 0; pi < bar.pieces.length; pi++) {
        const piece = bar.pieces[pi];
        let placed = false;

        for (let j = 0; j < bars.length; j++) {
          if (j === i) continue;
          // Check if piece can fit (accounting for kerf and already planned placements)
          const extraKerf = bars[j].pieces.length > 0 ? bladeWidth : 0;
          let additionalUsed = 0;
          placements.filter(p => p.targetBarIdx === j).forEach(p => {
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
        // Execute the placements
        placements.forEach(({ pieceIdx, targetBarIdx }) => {
          const piece = bar.pieces[pieceIdx];
          const target = bars[targetBarIdx];
          const kerf = target.pieces.length > 0 ? bladeWidth : 0;
          target.pieces.push(piece);
          target.remaining -= (piece.length + kerf);
          target.usedLength += (piece.length + kerf);
        });

        // Remove the emptied bar
        bars.splice(i, 1);
        improved = true;
        break; // Restart from the end
      }
    }
  }
}

/**
 * Group identical cutting patterns together.
 */
function consolidatePatterns(bars: CutBar[], stockLength: number): CutPattern[] {
  const patternMap = new Map<string, CutPattern>();

  bars.forEach(bar => {
    // Create a key from sorted piece lengths
    const key = bar.pieces
      .map(p => p.length)
      .sort((a, b) => b - a)
      .join('-');

    if (patternMap.has(key)) {
      patternMap.get(key)!.count++;
    } else {
      patternMap.set(key, {
        pieces: bar.pieces.map(p => ({ length: p.length, note: p.note })),
        remaining: bar.remaining,
        usedLength: bar.usedLength,
        stockLength,
        count: 1,
      });
    }
  });

  return Array.from(patternMap.values());
}
