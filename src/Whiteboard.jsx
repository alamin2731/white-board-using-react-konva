import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Rect, Circle, RegularPolygon } from "react-konva";

const Whiteboard = () => {
    const [mode, setMode] = useState("pen");
    const [lines, setLines] = useState([]);
    const [color, setColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(2);
    const stageRef = useRef(null);
    const isDrawing = useRef(false);
    const [canvasImage, setCanvasImage] = useState("");

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
        setCanvasImage("");
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
            fill: 'white',
        });
        backgroundLayer.add(backgroundRect);

        // Add the background layer to the bottom of the layer stack
        stage.add(backgroundLayer);
        backgroundLayer.moveToBottom();

        // Render the stage to a data URL with the white background
        const dataURL = stage.toDataURL({ mimeType: 'image/png' });

        // Remove the background layer from the stage
        backgroundLayer.remove();

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'canvas.png';

        // Programmatically trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const handleEraserClick = () => {
        setMode("eraser");
    };

    useEffect(() => {
        const handleResize = () => {
            const stage = stageRef.current.getStage();
            stage.width(window.innerWidth);
            stage.height(window.innerHeight);
            stage.batchDraw();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="bg-white">
            <div className="">
                <div className="flex space-x-4 bg-green-500 text-white h-16 justify-center and items-center property ">
                    <button
                        className={mode === "pen" ? "selected" : ""}
                        onClick={() => handleModeChange("pen")}
                    >
                        Pen
                    </button>
                    <button
                        className={mode === "rectangle" ? "selected" : ""}
                        onClick={() => handleModeChange("rectangle")}
                    >
                        Rectangle
                    </button>
                    <button
                        className={mode === "triangle" ? "selected" : ""}
                        onClick={() => handleModeChange("triangle")}
                    >
                        Triangle
                    </button>
                    <button
                        className={mode === "line" ? "selected" : ""}
                        onClick={() => handleModeChange("line")}
                    >
                        Line
                    </button>
                    <button
                        className={mode === "circle" ? "selected" : ""}
                        onClick={() => handleModeChange("circle")}
                    >
                        Circle
                    </button>
                    <button className={mode === "eraser" ? "selected" : ""} onClick={handleEraserClick}>
                        Eraser
                    </button>
                    <label htmlFor="color">Color:</label>
                    <input
                        type="color"
                        id="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />

                    <label htmlFor="strokeWidth" className="mr-2">Stroke Width:</label>
                    <div className="flex items-center ">
                        <input
                            type="range"
                            id="strokeWidth"
                            min="1"
                            max="50"
                            value={strokeWidth}
                            onChange={handleStrokeWidthChange}
                            className="w-25 mr-2 "
                        />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color, transform: `scale(${strokeWidth / 50})` }}></div>
                    </div>

                    <button className="bg-green-500 hover:bg-green-600 text-white  py-2 px-4 rounded mr-2 transition-colors duration-300"onClick={handleUndo} >
                        Undo
                    </button>

                    <button className="bg-red-500 hover:bg-red-600 text-white  py-2 px-4 rounded mr-2 transition-colors duration-300" onClick={handleClearAll}>
                        Clear All
                    </button>

                    <button className="bg-blue-500 hover:bg-blue-600 text-white  py-2 px-4 rounded transition-colors duration-300" onClick={handleSaveCanvas}>
                        Save Canvas
                    </button>

                </div>
            </div>
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
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
                                    stroke={line.tool === "eraser" ? "white" : line.color}
                                    strokeWidth={line.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            );
                        } else if (line.tool === "rectangle") {
                            return (
                                <Rect
                                    key={i}
                                    x={line.points[0]}
                                    y={line.points[1]}
                                    width={line.points[2] - line.points[0]}
                                    height={line.points[3] - line.points[1]}
                                    stroke={line.color}
                                    strokeWidth={line.strokeWidth}
                                />
                            );
                        } else if (line.tool === "triangle") {
                            return (
                                <RegularPolygon
                                    key={i}
                                    x={line.points[0]}
                                    y={line.points[1]}
                                    sides={3}
                                    radius={Math.sqrt(
                                        Math.pow(line.points[4] - line.points[0], 2) +
                                        Math.pow(line.points[5] - line.points[1], 2)
                                    )}
                                    fill={null}
                                    stroke={line.color}
                                    strokeWidth={line.strokeWidth}
                                    rotation={-90}
                                />
                            );
                        } else if (line.tool === "line") {
                            return (
                                <Line
                                    key={i}
                                    points={line.points}
                                    stroke={line.color}
                                    strokeWidth={line.strokeWidth}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            );
                        } else if (line.tool === "circle") {
                            return (
                                <Circle
                                    key={i}
                                    x={line.points[0]}
                                    y={line.points[1]}
                                    radius={line.points[2]}
                                    stroke={line.color}
                                    strokeWidth={line.strokeWidth}
                                />
                            );
                        }
                        return null;
                    })}
                </Layer>
            </Stage>
            {canvasImage && (
                <div>
                    <h2>Canvas Image</h2>
                    <img src={canvasImage} alt="Canvas" />
                </div>
            )}
        </div>
    );
};

export default Whiteboard;