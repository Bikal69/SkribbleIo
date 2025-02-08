import React from 'react'
import { useState,useRef,useEffect } from 'react'
const DrawingBoard = () => {
  const canvasRef=useRef(null);
  const contextRef=useRef(null);
  const [isDrawing,setIsDrawing]=useState(false);
  useEffect(()=>{
    const canvas=canvasRef.current;
      // Get the 2D drawing context.
      const context = canvas.getContext('2d');
      // Set drawing properties.
  // Get the device pixel ratio, falling back to 1.
  const scale = window.devicePixelRatio || 1;
  // Get the CSS display size.
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  // Set the canvas's internal resolution to match the display size multiplied by the scale.
  canvas.width = cssWidth * scale;
  canvas.height = cssHeight * scale;
  // Scale the context so that drawing operations work in the CSS pixel coordinate system.
  context.scale(scale, scale);
      context.lineCap = 'round';
      context.strokeStyle = '#913d88';
      context.lineWidth = 5;
      // Store the context for use in event handlers.
      contextRef.current = context;
  },[]);
  const startDrawing=({nativeEvent})=>{
    console.log('start drawing')
    const {offsetX,offsetY}=nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX,offsetY);
    setIsDrawing(true);
  }
  const draw=({ nativeEvent })=>{
    console.log('draw')
    if(!isDrawing)return;
    const {offsetX,offsetY}=nativeEvent ;
    contextRef.current.lineTo(offsetX,offsetY);
    contextRef.current.stroke();
  }
  const finishDrawing=({ nativeEvent })=>{
    console.log('finish drawing')
    contextRef.current.closePath();
    setIsDrawing(false);
  }
  return (
    <canvas id="drawingCanvas" ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={finishDrawing}></canvas>
  )
}

export default DrawingBoard