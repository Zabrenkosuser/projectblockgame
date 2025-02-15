"use client";
import React from "react";

function BlockPiece({
  shape = "square",
  color = "#4a90e2",
  onDragStart,
  onDragEnd,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const getShapeBlocks = () => {
    switch (shape) {
      case "line":
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ];
      case "square":
        return [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ];
      case "tShape":
        return [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
        ];
      case "lShape":
        return [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 2 },
        ];
      default:
        return [{ x: 0, y: 0 }];
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", JSON.stringify({ shape, color }));
    onDragStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const blocks = getShapeBlocks();
  const gridSize = 30;
  const width = Math.max(...blocks.map((b) => b.x)) + 1;
  const height = Math.max(...blocks.map((b) => b.y)) + 1;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`relative cursor-grab active:cursor-grabbing`}
      style={{
        width: `${width * gridSize}px`,
        height: `${height * gridSize}px`,
      }}
    >
      {blocks.map((block, index) => (
        <div
          key={index}
          className={`absolute rounded transition-transform`}
          style={{
            width: `${gridSize - 2}px`,
            height: `${gridSize - 2}px`,
            backgroundColor: color,
            left: `${block.x * gridSize}px`,
            top: `${block.y * gridSize}px`,
            transform: isDragging ? "scale(0.95)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

function BlockPieceStory() {
  const shapes = ["square", "line", "tShape", "lShape"];
  const colors = ["#4a90e2", "#e24a4a", "#4ae24a", "#e2e24a"];

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex flex-wrap gap-8">
        {shapes.map((shape) => (
          <div key={shape} className="flex flex-col items-center gap-2">
            <span className="font-roboto text-sm">{shape}</span>
            <BlockPiece shape={shape} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-8">
        {colors.map((color) => (
          <div key={color} className="flex flex-col items-center gap-2">
            <span className="font-roboto text-sm">{color}</span>
            <BlockPiece color={color} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-8">
        {shapes.map((shape, i) => (
          <BlockPiece
            key={`${shape}-${i}`}
            shape={shape}
            color={colors[i % colors.length]}
          />
        ))}
      </div>
    </div>
  );
}

export default BlockPiece;