/**
 * A* Search Algorithm Visualizer
 *
 * A* is an informed search algorithm that finds the shortest path
 * using heuristics to guide the search. It combines Dijkstra's
 * algorithm with greedy best-first search.
 *
 * Uses grid-based representation as specified in user preferences.
 *
 * Time: O((V + E) log V) with good heuristic
 * Space: O(V) for open/closed sets
 */

import type {
  Visualizer,
  Step,
  VisualizerConfig,
  Snapshot,
  ActionPayload,
  InputField,
  CodeSnippets,
  ActionButton,
  ComplexityInfo,
} from '../core/types';
import { createStepMeta } from '../core/types';
import { registry } from '../core/registry';

// Grid cell types
type CellType = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited' | 'frontier' | 'current';

interface GridCell {
  row: number;
  col: number;
  type: CellType;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to end)
  f: number; // Total cost (g + h)
  parent: { row: number; col: number } | null;
}

interface AStarData {
  grid: GridCell[][];
  rows: number;
  cols: number;
  start: { row: number; col: number };
  end: { row: number; col: number };
  openSet: Set<string>; // "row,col" format
  closedSet: Set<string>;
  pathFound: boolean;
  pathCells: { row: number; col: number }[];
}

// Constants for grid visualization
const CELL_COLORS: Record<CellType, string> = {
  empty: '#1e293b',
  wall: '#374151',
  start: '#22c55e',
  end: '#ef4444',
  path: '#f59e0b',
  visited: '#475569',
  frontier: '#3b82f6',
  current: '#8b5cf6',
};

const CANVAS_PADDING = 20;

// Helper to create cell key
function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

// Helper to clone grid
function cloneGrid(grid: GridCell[][]): GridCell[][] {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      parent: cell.parent ? { ...cell.parent } : null,
    }))
  );
}

// Manhattan distance heuristic
function manhattanDistance(
  a: { row: number; col: number },
  b: { row: number; col: number }
): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// Get neighbors (4-directional)
function getNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number
): { row: number; col: number }[] {
  const neighbors: { row: number; col: number }[] = [];
  const directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }

  return neighbors;
}

// Create sample grid with obstacles
export function createSampleGrid(rows = 8, cols = 10): GridCell[][] {
  const grid: GridCell[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
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

  // Add some walls to make it interesting
  const walls = [
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [6, 5],
    [3, 7],
    [4, 7],
    [5, 7],
  ];

  for (const [r, c] of walls) {
    if (r < rows && c < cols) {
      grid[r][c].type = 'wall';
    }
  }

  // Set start and end
  grid[0][0].type = 'start';
  grid[rows - 1][cols - 1].type = 'end';

  return grid;
}

/**
 * Generate visualization steps for A* Search
 */
export function generateAStarSteps(
  inputGrid: GridCell[][],
  startPos?: { row: number; col: number },
  endPos?: { row: number; col: number }
): Step<AStarData>[] {
  const steps: Step<AStarData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const rows = inputGrid.length;
  const cols = inputGrid[0]?.length ?? 0;

  if (rows === 0 || cols === 0) {
    return steps;
  }

  // Clone grid for manipulation
  const grid = cloneGrid(inputGrid);

  // Find start and end positions
  let start = startPos;
  let end = endPos;

  for (let r = 0; r < rows && (!start || !end); r++) {
    for (let c = 0; c < cols && (!start || !end); c++) {
      if (grid[r][c].type === 'start') {
        start = { row: r, col: c };
      }
      if (grid[r][c].type === 'end') {
        end = { row: r, col: c };
      }
    }
  }

  if (!start || !end) {
    steps.push({
      id: stepId++,
      description: 'Error: Grid must have start and end positions',
      snapshot: {
        data: {
          grid: cloneGrid(grid),
          rows,
          cols,
          start: start ?? { row: 0, col: 0 },
          end: end ?? { row: rows - 1, col: cols - 1 },
          openSet: new Set(),
          closedSet: new Set(),
          pathFound: false,
          pathCells: [],
        },
      },
      meta: createStepMeta({ comparisons }),
    });
    return steps;
  }

  // Initialize open and closed sets
  const openSet = new Set<string>();
  const closedSet = new Set<string>();

  // Initialize start node
  grid[start.row][start.col].g = 0;
  grid[start.row][start.col].h = manhattanDistance(start, end);
  grid[start.row][start.col].f = grid[start.row][start.col].h;
  openSet.add(cellKey(start.row, start.col));

  // Initial step
  steps.push({
    id: stepId++,
    description: `A* Search: Finding path from (${start.row},${start.col}) to (${end.row},${end.col})`,
    snapshot: {
      data: {
        grid: cloneGrid(grid),
        rows,
        cols,
        start,
        end,
        openSet: new Set(openSet),
        closedSet: new Set(closedSet),
        pathFound: false,
        pathCells: [],
      },
    },
    meta: createStepMeta({ highlightedLine: 0, comparisons }),
  });

  steps.push({
    id: stepId++,
    description: `Initialized start node with g=0, h=${grid[start.row][start.col].h} (Manhattan distance)`,
    snapshot: {
      data: {
        grid: cloneGrid(grid),
        rows,
        cols,
        start,
        end,
        openSet: new Set(openSet),
        closedSet: new Set(closedSet),
        pathFound: false,
        pathCells: [],
      },
    },
    meta: createStepMeta({ highlightedLine: 1, comparisons }),
  });

  let pathFound = false;
  let iterations = 0;
  const maxIterations = rows * cols;

  // Main A* loop
  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;

    // Find node with lowest f score in open set
    let currentKey: string | null = null;
    let lowestF = Infinity;

    for (const key of openSet) {
      const [r, c] = key.split(',').map(Number);
      comparisons++;
      if (grid[r][c].f < lowestF) {
        lowestF = grid[r][c].f;
        currentKey = key;
      }
    }

    if (!currentKey) {
      break;
    }

    const [currentRow, currentCol] = currentKey.split(',').map(Number);
    const current = { row: currentRow, col: currentCol };

    // Mark current cell
    if (grid[current.row][current.col].type !== 'start') {
      grid[current.row][current.col].type = 'current';
    }

    steps.push({
      id: stepId++,
      description: `Processing (${current.row},${current.col}) with f=${grid[current.row][current.col].f.toFixed(1)} (g=${grid[current.row][current.col].g}, h=${grid[current.row][current.col].h.toFixed(1)})`,
      snapshot: {
        data: {
          grid: cloneGrid(grid),
          rows,
          cols,
          start,
          end,
          openSet: new Set(openSet),
          closedSet: new Set(closedSet),
          pathFound: false,
          pathCells: [],
        },
      },
      activeIndices: [current.row * cols + current.col],
      meta: createStepMeta({ highlightedLine: 2, comparisons }),
    });

    // Check if we reached the goal
    if (current.row === end.row && current.col === end.col) {
      pathFound = true;

      // Reconstruct path
      const pathCells: { row: number; col: number }[] = [];
      let pathNode: { row: number; col: number } | null = current;

      while (pathNode) {
        pathCells.unshift(pathNode);
        const cell: GridCell = grid[pathNode.row][pathNode.col];
        if (cell.type !== 'start' && cell.type !== 'end') {
          grid[pathNode.row][pathNode.col].type = 'path';
        }
        pathNode = cell.parent;
      }

      steps.push({
        id: stepId++,
        description: `Path found! Length: ${pathCells.length} cells, Cost: ${grid[end.row][end.col].g}`,
        snapshot: {
          data: {
            grid: cloneGrid(grid),
            rows,
            cols,
            start,
            end,
            openSet: new Set(openSet),
            closedSet: new Set(closedSet),
            pathFound: true,
            pathCells,
          },
        },
        meta: createStepMeta({ highlightedLine: 3, comparisons }),
      });

      break;
    }

    // Move current from open to closed
    openSet.delete(currentKey);
    closedSet.add(currentKey);

    if (grid[current.row][current.col].type !== 'start') {
      grid[current.row][current.col].type = 'visited';
    }

    // Process neighbors
    const neighbors = getNeighbors(current.row, current.col, rows, cols);

    for (const neighbor of neighbors) {
      const neighborKey = cellKey(neighbor.row, neighbor.col);
      const neighborCell = grid[neighbor.row][neighbor.col];

      // Skip walls and closed cells
      if (neighborCell.type === 'wall' || closedSet.has(neighborKey)) {
        continue;
      }

      const tentativeG = grid[current.row][current.col].g + 1; // Cost of 1 per cell

      // Check if this path is better
      const isNewPath = !openSet.has(neighborKey);
      const isBetterPath = tentativeG < neighborCell.g;

      if (isNewPath || isBetterPath) {
        // Update neighbor
        neighborCell.g = tentativeG;
        neighborCell.h = manhattanDistance(neighbor, end);
        neighborCell.f = neighborCell.g + neighborCell.h;
        neighborCell.parent = { row: current.row, col: current.col };

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
          if (neighborCell.type !== 'end') {
            neighborCell.type = 'frontier';
          }

          steps.push({
            id: stepId++,
            description: `Added (${neighbor.row},${neighbor.col}) to frontier: f=${neighborCell.f.toFixed(1)} (g=${neighborCell.g}, h=${neighborCell.h.toFixed(1)})`,
            snapshot: {
              data: {
                grid: cloneGrid(grid),
                rows,
                cols,
                start,
                end,
                openSet: new Set(openSet),
                closedSet: new Set(closedSet),
                pathFound: false,
                pathCells: [],
              },
            },
            activeIndices: [neighbor.row * cols + neighbor.col],
            meta: createStepMeta({ highlightedLine: 4, comparisons }),
          });
        }
      }
    }
  }

  if (!pathFound) {
    steps.push({
      id: stepId++,
      description: 'No path exists between start and end positions',
      snapshot: {
        data: {
          grid: cloneGrid(grid),
          rows,
          cols,
          start,
          end,
          openSet: new Set(openSet),
          closedSet: new Set(closedSet),
          pathFound: false,
          pathCells: [],
        },
      },
      meta: createStepMeta({ highlightedLine: 5, comparisons }),
    });
  }

  return steps;
}

// =============================================================================
// Draw Function
// =============================================================================

function drawAStar(
  data: AStarData,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const { grid, rows, cols, openSet, closedSet, pathCells } = data;

  if (rows === 0 || cols === 0) {
    return;
  }

  // Calculate cell size
  const availableWidth = width - 2 * CANVAS_PADDING;
  const availableHeight = height - 2 * CANVAS_PADDING - 30; // Reserve space for legend
  const cellSize = Math.min(availableWidth / cols, availableHeight / rows);
  const offsetX = (width - cellSize * cols) / 2;
  const offsetY = (height - 30 - cellSize * rows) / 2;

  // Draw grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const x = offsetX + c * cellSize;
      const y = offsetY + r * cellSize;
      const key = cellKey(r, c);

      // Determine cell color
      let color = CELL_COLORS[cell.type];

      // Override for open/closed set membership visualization
      if (
        openSet.has(key) &&
        cell.type !== 'start' &&
        cell.type !== 'end' &&
        cell.type !== 'current'
      ) {
        color = CELL_COLORS.frontier;
      } else if (closedSet.has(key) && cell.type !== 'start' && cell.type !== 'end') {
        color = CELL_COLORS.visited;
      }

      // Draw cell background
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

      // Draw border
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

      // Draw f-score for non-wall, non-empty cells
      if (
        cell.type !== 'wall' &&
        cell.type !== 'start' &&
        cell.type !== 'end' &&
        cell.g < Infinity
      ) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `${Math.max(10, cellSize / 4)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.f.toFixed(0), x + cellSize / 2, y + cellSize / 2);
      }

      // Draw S for start, E for end
      if (cell.type === 'start' || cell.type === 'end') {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(14, cellSize / 2.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.type === 'start' ? 'S' : 'E', x + cellSize / 2, y + cellSize / 2);
      }
    }
  }

  // Draw path connections
  if (pathCells.length > 1) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const firstCell = pathCells[0];
    ctx.moveTo(
      offsetX + firstCell.col * cellSize + cellSize / 2,
      offsetY + firstCell.row * cellSize + cellSize / 2
    );
    for (let i = 1; i < pathCells.length; i++) {
      const cell = pathCells[i];
      ctx.lineTo(
        offsetX + cell.col * cellSize + cellSize / 2,
        offsetY + cell.row * cellSize + cellSize / 2
      );
    }
    ctx.stroke();
  }

  // Draw legend
  const legendY = height - 25;
  const legendItems = [
    { color: CELL_COLORS.start, label: 'Start' },
    { color: CELL_COLORS.end, label: 'End' },
    { color: CELL_COLORS.frontier, label: 'Frontier' },
    { color: CELL_COLORS.visited, label: 'Visited' },
    { color: CELL_COLORS.path, label: 'Path' },
    { color: CELL_COLORS.wall, label: 'Wall' },
  ];

  ctx.font = '11px sans-serif';
  let legendX = CANVAS_PADDING;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, legendX + 16, legendY + 6);
    legendX += ctx.measureText(item.label).width + 30;
  }
}

// =============================================================================
// Visualizer Class
// =============================================================================

/**
 * A* Search Visualizer class
 */
class AStarVisualizer implements Visualizer<AStarData> {
  readonly config: VisualizerConfig = {
    id: 'a-star',
    name: 'A* Search',
    description: 'A* pathfinding algorithm with Manhattan distance heuristic',
    category: 'graph',
    defaultSpeed: 400,
  };

  getInitialState(): Snapshot<AStarData> {
    const grid = createSampleGrid();
    return {
      data: {
        grid,
        rows: grid.length,
        cols: grid[0]?.length ?? 0,
        start: { row: 0, col: 0 },
        end: { row: grid.length - 1, col: (grid[0]?.length ?? 1) - 1 },
        openSet: new Set(),
        closedSet: new Set(),
        pathFound: false,
        pathCells: [],
      },
    };
  }

  getSteps(action: ActionPayload<AStarData>): Step<AStarData>[] {
    const data = action.data ?? this.getInitialState().data;

    switch (action.type) {
      case 'run':
        return generateAStarSteps(data.grid);
      case 'random': {
        const rows = (action.params?.rows as number) ?? 8;
        const cols = (action.params?.cols as number) ?? 10;
        const newGrid = createSampleGrid(rows, cols);
        return generateAStarSteps(newGrid);
      }
      case 'reset': {
        const grid = createSampleGrid();
        return [
          {
            id: 0,
            description: 'Reset to sample grid',
            snapshot: {
              data: {
                grid,
                rows: grid.length,
                cols: grid[0]?.length ?? 0,
                start: { row: 0, col: 0 },
                end: { row: grid.length - 1, col: (grid[0]?.length ?? 1) - 1 },
                openSet: new Set(),
                closedSet: new Set(),
                pathFound: false,
                pathCells: [],
              },
            },
            meta: createStepMeta({}),
          },
        ];
      }
      default:
        return generateAStarSteps(data.grid);
    }
  }

  draw(snapshot: Snapshot<AStarData>, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    drawAStar(snapshot.data, ctx, width, height);
  }

  getPseudocode(): string[] {
    return [
      'aStar(start: Node, goal: Node): Path {',
      '  const openSet = new PriorityQueue();',
      '  const gScore = new Map<Node, number>();',
      '  gScore.set(start, 0);',
      '  openSet.enqueue(start, heuristic(start, goal));',
      '  while (!openSet.isEmpty()) {',
      '    const current = openSet.dequeue();',
      '    if (current === goal) return reconstructPath(current);',
      '    for (const neighbor of current.neighbors) {',
      '      const tentativeG = gScore.get(current)! + 1;',
      '      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {',
      '        gScore.set(neighbor, tentativeG);',
      '        openSet.enqueue(neighbor, tentativeG + heuristic(neighbor, goal));',
      '      }',
      '    }',
      '  }',
      '  return null; // No path',
      '}',
    ];
  }

  getCode(): CodeSnippets {
    return {
      typescript: [
        'type Cell = { row: number; col: number };',
        '',
        'function heuristic(a: Cell, b: Cell): number {',
        '  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);',
        '}',
        '',
        'function aStar(grid: number[][], start: Cell, goal: Cell): Cell[] | null {',
        '  const gScore = new Map<string, number>();',
        '  const fScore = new Map<string, number>();',
        '  const cameFrom = new Map<string, Cell>();',
        '  const key = (c: Cell) => `${c.row},${c.col}`;',
        '',
        '  gScore.set(key(start), 0);',
        '  fScore.set(key(start), heuristic(start, goal));',
        '  const openSet: Cell[] = [start];',
        '',
        '  while (openSet.length > 0) {',
        '    openSet.sort((a, b) => (fScore.get(key(a)) ?? Infinity)',
        '                         - (fScore.get(key(b)) ?? Infinity));',
        '    const current = openSet.shift()!;',
        '    if (current.row === goal.row && current.col === goal.col)',
        '      return reconstructPath(cameFrom, current);',
        '',
        '    for (const neighbor of getNeighbors(grid, current)) {',
        '      const tentativeG = gScore.get(key(current))! + 1;',
        '      if (tentativeG < (gScore.get(key(neighbor)) ?? Infinity)) {',
        '        cameFrom.set(key(neighbor), current);',
        '        gScore.set(key(neighbor), tentativeG);',
        '        fScore.set(key(neighbor), tentativeG + heuristic(neighbor, goal));',
        '        openSet.push(neighbor);',
        '      }',
        '    }',
        '  }',
        '  return null;',
        '}',
      ],
      python: [
        'import heapq',
        '',
        'def heuristic(a: tuple, b: tuple) -> int:',
        '    return abs(a[0] - b[0]) + abs(a[1] - b[1])',
        '',
        'def a_star(grid: list[list[int]], start: tuple, goal: tuple):',
        '    g_score = {start: 0}',
        '    f_score = {start: heuristic(start, goal)}',
        '    came_from = {}',
        '    open_set = [(f_score[start], start)]',
        '',
        '    while open_set:',
        '        _, current = heapq.heappop(open_set)',
        '        if current == goal:',
        '            return reconstruct_path(came_from, current)',
        '',
        '        for neighbor in get_neighbors(grid, current):',
        '            tentative_g = g_score[current] + 1',
        '            if tentative_g < g_score.get(neighbor, float("inf")):',
        '                came_from[neighbor] = current',
        '                g_score[neighbor] = tentative_g',
        '                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)',
        '                heapq.heappush(open_set, (f_score[neighbor], neighbor))',
        '',
        '    return None',
      ],
      java: [
        'int heuristic(int[] a, int[] b) {',
        '    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);',
        '}',
        '',
        'List<int[]> aStar(int[][] grid, int[] start, int[] goal) {',
        '    Map<String, Integer> gScore = new HashMap<>();',
        '    Map<String, Integer> fScore = new HashMap<>();',
        '    Map<String, int[]> cameFrom = new HashMap<>();',
        '    PriorityQueue<int[]> openSet = new PriorityQueue<>(',
        '        Comparator.comparingInt(c -> fScore.getOrDefault(key(c), Integer.MAX_VALUE)));',
        '',
        '    gScore.put(key(start), 0);',
        '    fScore.put(key(start), heuristic(start, goal));',
        '    openSet.offer(start);',
        '',
        '    while (!openSet.isEmpty()) {',
        '        int[] current = openSet.poll();',
        '        if (Arrays.equals(current, goal))',
        '            return reconstructPath(cameFrom, current);',
        '',
        '        for (int[] neighbor : getNeighbors(grid, current)) {',
        '            int tentativeG = gScore.get(key(current)) + 1;',
        '            if (tentativeG < gScore.getOrDefault(key(neighbor), Integer.MAX_VALUE)) {',
        '                cameFrom.put(key(neighbor), current);',
        '                gScore.put(key(neighbor), tentativeG);',
        '                fScore.put(key(neighbor), tentativeG + heuristic(neighbor, goal));',
        '                openSet.offer(neighbor);',
        '            }',
        '        }',
        '    }',
        '    return null;',
        '}',
      ],
    };
  }

  getComplexity(): ComplexityInfo {
    return {
      time: {
        best: 'O(E)',
        average: 'O((V + E) log V)',
        worst: 'O((V + E) log V)',
      },
      space: 'O(V)',
    };
  }

  getInputs(): InputField[] {
    return [
      {
        id: 'rows',
        label: 'Rows',
        type: 'number',
        defaultValue: 8,
        min: 3,
        max: 15,
      },
      {
        id: 'cols',
        label: 'Columns',
        type: 'number',
        defaultValue: 10,
        min: 3,
        max: 20,
      },
    ];
  }

  getActions(): ActionButton[] {
    return [
      { id: 'run', label: 'Find Path', primary: true },
      { id: 'random', label: 'New Grid' },
      { id: 'reset', label: 'Reset' },
    ];
  }
}

// =============================================================================
// Registration
// =============================================================================

registry.register<AStarData>(
  {
    id: 'a-star',
    name: 'A* Search',
    description:
      'An informed search algorithm that uses heuristics to find the shortest path efficiently on grids.',
    category: 'graph',
    defaultSpeed: 400,
  },
  () => new AStarVisualizer()
);

export { AStarVisualizer };
