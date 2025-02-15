"use client";
import React from "react";

function GameGrid({ blocks = [], onBlocksUpdate }) {
  const [grid, setGrid] = useState(
    Array.from({ length: 10 })
      .fill()
      .map(() => Array.from({ length: 10 }).fill(null))
  );
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const newGrid = Array.from({ length: 10 })
      .fill()
      .map(() => Array.from({ length: 10 }).fill(null));
    blocks.forEach((block) => {
      if (block.x >= 0 && block.x < 10 && block.y >= 0 && block.y < 10) {
        newGrid[block.y][block.x] = block;
      }
    });
    setGrid(newGrid);
    checkCompletions(newGrid);
  }, [blocks]);

  const checkCompletions = useCallback(
    (currentGrid) => {
      let completedRows = [];
      let completedCols = [];

      for (let i = 0; i < 10; i++) {
        if (currentGrid[i].every((cell) => cell !== null)) {
          completedRows.push(i);
        }
        if (currentGrid.every((row) => row[i] !== null)) {
          completedCols.push(i);
        }
      }

      if (completedRows.length > 0 || completedCols.length > 0) {
        setClearing(true);
        setTimeout(() => {
          const newGrid = [...currentGrid].map((row) => [...row]);

          completedRows.forEach((rowIndex) => {
            for (let x = 0; x < 10; x++) {
              newGrid[rowIndex][x] = null;
            }
          });

          completedCols.forEach((colIndex) => {
            for (let y = 0; y < 10; y++) {
              newGrid[y][colIndex] = null;
            }
          });

          const updatedBlocks = [];
          newGrid.forEach((row, y) => {
            row.forEach((cell, x) => {
              if (cell !== null) {
                updatedBlocks.push({ ...cell, x, y });
              }
            });
          });

          setClearing(false);
          onBlocksUpdate?.(updatedBlocks);
        }, 500);
      }
    },
    [onBlocksUpdate]
  );

  return (
    <div className="w-[400px] h-[400px] bg-[#1a1a1a] rounded-lg p-2">
      <div className="grid grid-cols-10 gap-1 w-full h-full">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`
                w-full h-full rounded
                ${cell ? "bg-[#4a90e2]" : "bg-[#2a2a2a]"}
                ${clearing ? "transition-all duration-500" : ""}
                ${cell && clearing ? "scale-0" : "scale-100"}
              `}
            />
          ))
        )}
      </div>
    </div>
  );
}

function GameGridStory() {
  const [blocks, setBlocks] = useState([
    { x: 0, y: 0, id: 1 },
    { x: 1, y: 0, id: 2 },
    { x: 2, y: 0, id: 3 },
  ]);

  const handleBlocksUpdate = (newBlocks) => {
    setBlocks(newBlocks);
  };

  return (
    <div className="p-8 flex flex-col items-center gap-8">
      <GameGrid blocks={blocks} onBlocksUpdate={handleBlocksUpdate} />

      <GameGrid
        blocks={[
          { x: 0, y: 0, id: 1 },
          { x: 1, y: 0, id: 2 },
          { x: 2, y: 0, id: 3 },
          { x: 3, y: 0, id: 4 },
          { x: 4, y: 0, id: 5 },
          { x: 5, y: 0, id: 6 },
          { x: 6, y: 0, id: 7 },
          { x: 7, y: 0, id: 8 },
          { x: 8, y: 0, id: 9 },
          { x: 9, y: 0, id: 10 },
        ]}
      />
    </div>
  );
}

export default GameGrid;