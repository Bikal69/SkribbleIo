import React from 'react'
import { useState,useRef,useEffect } from 'react'
const DrawingBoard = ({socket,currentRoomId,playerId,artistId}) => {
  const canvasRef=useRef(null);
  const contextRef=useRef(null);
  const [isDrawing,setIsDrawing]=useState(false);//for knowing if current user is drawing or not
  const isArtist = playerId === artistId;
   // A helper that works with either a native canvas event or an object with offsetX/Y.
   console.log('isDrawing:',playerId,artistId)
   const getCoordinates = (eventOrCoords) => {
    // If we have a nativeEvent, extract from it; otherwise assume it already contains offsetX/Y.
    if (eventOrCoords && eventOrCoords.nativeEvent) {
      const { offsetX, offsetY } = eventOrCoords.nativeEvent;
      return { offsetX, offsetY };
    }
    return eventOrCoords;
  };
                      
  // Centralized drawing functions.
  const handleStartDrawing = (coords) => {
    const { offsetX, offsetY } = coords;
    if (!contextRef.current) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };

  const handleDrawing = (coords) => {
    const { offsetX, offsetY } = coords;
    if (!contextRef.current) return;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const handleFinishDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
  };
  useEffect(()=>{
    console.log('hello from drawing board')
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

  socket.on('START-DRAWING',(coordinateData)=>{
    handleStartDrawing(coordinateData)
  });
  socket.on('DRAW',(coordinateData)=>{
    handleDrawing(coordinateData)
  });
  socket.on('STOPPED-DRAWING',()=>{
    handleFinishDrawing();
  })

  //cleanup
  return ()=>{
    socket.off('START-DRAWING');
    socket.off('DRAW');
    socket.off('STOPPED-DRAWING');
  }
  },[socket]);
// Canvas event handlers that use the helper functions.
const startDrawing = (event) => {
   // Only allow drawing if I'm the artist and not already drawing
  if (isDrawing || !isArtist) return;
  const coords = getCoordinates(event);
  // Emit the start event to the server.
  socket.emit('START-DRAWING', {...coords });
  handleStartDrawing(coords);
  setIsDrawing(true);
};

const draw = (event) => {
  if (!isDrawing || !isArtist) return;
  const coords = getCoordinates(event);
  // Emit drawing data to the server.
  socket.emit('DRAW', {...coords });
  handleDrawing(coords);
};

const finishDrawing = (event) => {
  // Optionally, you can extract coordinates from the event if needed.
  if (!isDrawing || !isArtist) return;
  socket.emit('STOPPED-DRAWING');
  handleFinishDrawing();
  setIsDrawing(false);
};
  return (
    <canvas id="drawingCanvas" 
    ref={canvasRef} 
    onMouseDown={startDrawing} 
    onMouseMove={draw} 
    onMouseUp={finishDrawing}
    onMouseLeave={finishDrawing} // Handle case when mouse leaves canvas
    ></canvas>
  )
}

export default DrawingBoard