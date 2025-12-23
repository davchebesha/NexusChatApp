/**
 * ResizeHandle - Draggable handle for resizing sidebar like Telegram
 */

import React, { useState, useCallback, useEffect } from 'react';
import './ResizeHandle.css';

const ResizeHandle = ({ 
  onResize, 
  minWidth = 280, 
  maxWidth = 500, 
  initialWidth = 350,
  side = 'right' // 'left' or 'right'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(initialWidth);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(initialWidth);
    
    // Add global cursor and selection styles
    document.body.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [initialWidth]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    let newWidth;

    if (side === 'right') {
      newWidth = startWidth + deltaX;
    } else {
      newWidth = startWidth - deltaX;
    }

    // Constrain width within bounds
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    onResize(newWidth);
  }, [isDragging, startX, startWidth, minWidth, maxWidth, side, onResize]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // Remove global cursor and selection styles
      document.body.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setStartX(touch.clientX);
    setStartWidth(initialWidth);
  }, [initialWidth]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    let newWidth;

    if (side === 'right') {
      newWidth = startWidth + deltaX;
    } else {
      newWidth = startWidth - deltaX;
    }

    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    onResize(newWidth);
  }, [isDragging, startX, startWidth, minWidth, maxWidth, side, onResize]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.classList.remove('resizing');
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      className={`resize-handle ${side} ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="resize-handle-line" />
    </div>
  );
};

export default ResizeHandle;