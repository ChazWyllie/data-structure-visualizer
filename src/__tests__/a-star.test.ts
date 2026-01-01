/**
 * A* Search Algorithm Visualizer Tests
 */

import { describe, it, expect } from 'vitest';
import { generateAStarSteps, createSampleGrid } from '../visualizers/a-star';

type CellType = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited' | 'frontier' | 'current';

interface GridCell {
  row: number;
  col: number;
  type: CellType;
  g: number;
  h: number;
  f: number;
  parent: { row: number; col: number } | null;
}

function createSimpleGrid(): GridCell[][] {
  // 3x3 grid with no obstacles
  const grid: GridCell[][] = [];
  for (let r = 0; r < 3; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < 3; c++) {
      row.push({
        row: r,
        col: c,
        type: 'empty',
        g: Infinity,
        h: 0,
        f: Infinity,
        parent: null,
      });
    }
    grid.push(row);
  }
  grid[0][0].type = 'start';
  grid[2][2].type = 'end';
  return grid;
}

function createBlockedGrid(): GridCell[][] {
  // 3x3 grid with wall blocking path
  const grid = createSimpleGrid();
  grid[0][1].type = 'wall';
  grid[1][1].type = 'wall';
  grid[2][1].type = 'wall';
  return grid;
}

function createMazeGrid(): GridCell[][] {
  // 5x5 grid with a maze-like structure
  const grid: GridCell[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < 5; c++) {
      row.push({
        row: r,
        col: c,
        type: 'empty',
        g: Infinity,
        h: 0,
        f: Infinity,
        parent: null,
      });
    }
    grid.push(row);
  }
  grid[0][0].type = 'start';
  grid[4][4].type = 'end';
  // Add walls
  grid[1][1].type = 'wall';
  grid[1][2].type = 'wall';
  grid[2][2].type = 'wall';
  grid[3][2].type = 'wall';
  return grid;
}

describe('A* Search Visualizer', () => {
  describe('generateAStarSteps', () => {
    it('should find path in simple grid', () => {
      const grid = createSimpleGrid();
      const steps = generateAStarSteps(grid);

      expect(steps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.pathFound).toBe(true);
    });

    it('should return no path when blocked', () => {
      const grid = createBlockedGrid();
      const steps = generateAStarSteps(grid);

      expect(steps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.snapshot.data.pathFound).toBe(false);
      expect(finalStep.description).toContain('No path');
    });

    it('should find path in maze grid', () => {
      const grid = createMazeGrid();
      const steps = generateAStarSteps(grid);

      const pathStep = steps.find((s) => s.description.includes('Path found'));
      expect(pathStep).toBeDefined();
      expect(pathStep!.snapshot.data.pathFound).toBe(true);
    });

    it('should initialize with correct start message', () => {
      const grid = createSimpleGrid();
      const steps = generateAStarSteps(grid);

      const firstStep = steps[0];
      expect(firstStep.description).toContain('A* Search');
      expect(firstStep.description).toContain('Finding path');
    });

    it('should use Manhattan distance heuristic', () => {
      const grid = createSimpleGrid();
      const steps = generateAStarSteps(grid);

      const initStep = steps.find((s) => s.description.includes('Manhattan'));
      expect(initStep).toBeDefined();
    });
  });

  describe('createSampleGrid', () => {
    it('should create grid with specified dimensions', () => {
      const grid = createSampleGrid(5, 6);
      expect(grid.length).toBe(5);
      expect(grid[0].length).toBe(6);
    });

    it('should have start in top-left', () => {
      const grid = createSampleGrid();
      expect(grid[0][0].type).toBe('start');
    });

    it('should have end in bottom-right', () => {
      const grid = createSampleGrid(8, 10);
      expect(grid[7][9].type).toBe('end');
    });

    it('should contain some walls', () => {
      const grid = createSampleGrid();
      let wallCount = 0;
      for (const row of grid) {
        for (const cell of row) {
          if (cell.type === 'wall') {
            wallCount++;
          }
        }
      }
      expect(wallCount).toBeGreaterThan(0);
    });
  });

  describe('path reconstruction', () => {
    it('should return path cells when path is found', () => {
      const grid = createSimpleGrid();
      const steps = generateAStarSteps(grid);

      const pathStep = steps.find((s) => s.description.includes('Path found'));
      expect(pathStep).toBeDefined();
      expect(pathStep!.snapshot.data.pathCells.length).toBeGreaterThan(0);
    });

    it('should start path from start position', () => {
      const grid = createSimpleGrid();
      const steps = generateAStarSteps(grid);

      const pathStep = steps.find((s) => s.description.includes('Path found'));
      if (pathStep) {
        const pathCells = pathStep.snapshot.data.pathCells;
        expect(pathCells[0]).toEqual({ row: 0, col: 0 });
      }
    });

    it('should end path at end position', () => {
      const grid = createSimpleGrid();
      const steps = generateAStarSteps(grid);

      const pathStep = steps.find((s) => s.description.includes('Path found'));
      if (pathStep) {
        const pathCells = pathStep.snapshot.data.pathCells;
        const lastCell = pathCells[pathCells.length - 1];
        expect(lastCell).toEqual({ row: 2, col: 2 });
      }
    });
  });

  describe('step metadata', () => {
    it('should have unique sequential step ids', () => {
      const grid = createSimpleGrid();
      const steps = generateAStarSteps(grid);

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].id).toBe(i);
      }
    });

    it('should have descriptions for all steps', () => {
      const grid = createSimpleGrid();
      const steps = generateAStarSteps(grid);

      for (const step of steps) {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it('should track comparisons', () => {
      const grid = createMazeGrid();
      const steps = generateAStarSteps(grid);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.meta.comparisons).toBeGreaterThan(0);
    });
  });
});
