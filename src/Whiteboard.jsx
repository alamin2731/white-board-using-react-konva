import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Rect, Circle, RegularPolygon } from "react-konva";
import { BsFillPenFill } from "react-icons/bs";
import { BiRectangle, BiUndo, BiSolidSave } from "react-icons/bi";
import { FaEraser } from "react-icons/fa";
import { AiOutlineClear } from "react-icons/ai";
import { GiMoebiusTriangle, GiStraightPipe, GiCircleClaws } from "react-icons/gi";


const Whiteboard = () => {
  const [mode, setMode] = useState("pen");
  const [lines, setLines] = useState([]);
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const stageRef = useRef(null);
  const isDrawing = useRef(false);
  //const [canvasImage, setCanvasImage] = useState("");
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      { tool: mode, points: [pos.x, pos.y], color, strokeWidth },
    ]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) {
      return;
    }
    const point = e.target.getStage().getPointerPosition();

    if (mode === "pen" || mode === "eraser") {
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    } else if (mode === "rectangle") {
      const lastLine = lines[lines.length - 1];
      lastLine.points[2] = point.x;
      lastLine.points[3] = point.y;
      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    } else if (mode === "triangle") {
      const lastLine = lines[lines.length - 1];
      lastLine.points[2] = lastLine.points[0]; // Right vertex x-coordinate
      lastLine.points[3] = point.y; // Right vertex y-coordinate
      lastLine.points[4] = point.x; // Top vertex x-coordinate
      lastLine.points[5] = lastLine.points[1]; // Top vertex y-coordinate

      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    } else if (mode === "line") {
      const lastLine = lines[lines.length - 1];
      lastLine.points[2] = point.x;
      lastLine.points[3] = point.y;
      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    } else if (mode === "circle") {
      const lastLine = lines[lines.length - 1];
      const radiusX = Math.abs(point.x - lastLine.points[0]);
      const radiusY = Math.abs(point.y - lastLine.points[1]);
      const radius = Math.max(radiusX, radiusY);
      lastLine.points[2] = radius;
      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleUndo = () => {
   setLines(lines.slice(0, -1));
  };

  const handleClearAll = () => {
    setLines([]);
   
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleStrokeWidthChange = (e) => {
    setStrokeWidth(Number(e.target.value));
  };

  const handleSaveCanvas = () => {
    const stage = stageRef.current.getStage();

    // Create a temporary white background layer
    const backgroundLayer = new window.Konva.Layer();
    const backgroundRect = new window.Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: "white",
    });
    backgroundLayer.add(backgroundRect);

    // Add the background layer to the bottom of the layer stack
    stage.add(backgroundLayer);
    backgroundLayer.moveToBottom();

    // Render the stage to a data URL with the white background
    const dataURL = stage.toDataURL({ mimeType: "image/png" });

    // Remove the background layer from the stage
    backgroundLayer.remove();

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas.png";

    // Programmatically trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEraserClick = () => {
    setMode("eraser");
  };

  const handleResize = () => {
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="bg-white">
      <div className="w-full">
        <div className="flex  space-x-4 bg-green-500 text-white h-16 justify-center and items-center property">
          <button
            className={`flex items-center space-x-2 ${
              mode === "pen" ? "selected" : ""
            }`}
            onClick={() => handleModeChange("pen")}
          >
            <BsFillPenFill className="w-5 h-5" />
            <span>Pen</span>
          </button>

          <button
            className={`flex items-center space-x-2 ${
              mode === "rectangle" ? "selected" : ""
            }`}
            onClick={() => handleModeChange("rectangle")}
          >
            <BiRectangle className="w-5 h-5" />
            <span>Rectangle</span>
          </button>

          <button
            className={`flex items-center space-x-2 ${
              mode === "triangle" ? "selected" : ""
            }`}
            onClick={() => handleModeChange("triangle")}
          >
            <GiMoebiusTriangle className="w-5 h-5" />
            <span>Triangle</span>
          </button>

          <button
            className={`flex items-center space-x-2 ${
              mode === "line" ? "selected" : ""
            }`}
            onClick={() => handleModeChange("line")}
          >
            <GiStraightPipe className="w-5 h-5" />
            <span>Line</span>
          </button>

          <button
            className={`flex items-center space-x-2 ${
              mode === "circle" ? "selected" : ""
            }`}
            onClick={() => handleModeChange("circle")}
          >
            <GiCircleClaws className="w-5 h-5" />
            <span>Circle</span>
          </button>

          <button
            className={`flex items-center space-x-2 ${
              mode === "eraser" ? "selected" : ""
            }`}
            onClick={handleEraserClick}
          >
            <FaEraser className="w-5 h-5" />
            <span>Eraser</span>
          </button>

          <label htmlFor="color">Color:</label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />

          <label htmlFor="strokeWidth" className="mr-2">
            Stroke Width:
          </label>
          <div className="flex items-center">
            <input
              type="range"
              id="strokeWidth"
              min="1"
              max="50"
              value={strokeWidth}
              onChange={handleStrokeWidthChange}
              className="w-25 mr-2"
            />
            <div
              className="w-6 h-6 rounded-full"
              style={{
                backgroundColor: color,
                transform: `scale(${strokeWidth / 50})`,
              }}
            ></div>
          </div>

          <button
            className="flex items-center hover:bg-green-600 text-white py-2 px-1 rounded mr-2 transition-colors duration-300"
            onClick={handleUndo}
          >
            <BiUndo className="w-5 h-5" />
            <span>Undo</span>
          </button>

          <button
            className="flex items-center hover:bg-red-600 text-white py-2 px-1 rounded mr-2 transition-colors duration-300"
            onClick={handleClearAll}
          >
            <AiOutlineClear className="w-5 h-5" />
            <span>Clear All</span>
          </button>

          <button
            className="flex items-center hover:bg-blue-600 text-white py-2 px-1 rounded transition-colors duration-300"
            onClick={handleSaveCanvas}
          >
            <BiSolidSave className="w-5 h-5" />
            <span>Save Canvas</span>
          </button>
        </div>
      </div>
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, i) => {
            if (line.tool === "pen" || line.tool === "eraser") {
              return (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  globalCompositeOperation={
                    line.tool === "eraser" ? "destination-out" : "source-over"
                  }
                />
              );
            } else if (line.tool === "rectangle") {
              const [x1, y1, x2, y2] = line.points;
              return (
                <Rect
                  key={i}
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                />
              );
            } else if (line.tool === "triangle") {
              const [x1, y1, x2, y2] = line.points;
              return (
                <RegularPolygon
                  key={i}
                  sides={3}
                  x={x1}
                  y={y1}
                  radius={Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                />
              );
            } else if (line.tool === "line") {
              const [x1, y1, x2, y2] = line.points;
              return (
                <Line
                  key={i}
                  points={[x1, y1, x2, y2]}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                />
              );
            } else if (line.tool === "circle") {
              const [cx, cy, radius] = line.points;
              return (
                <Circle
                  key={i}
                  x={cx}
                  y={cy}
                  radius={radius}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default Whiteboard;
