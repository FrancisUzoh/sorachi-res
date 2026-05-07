
import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block">
      {/* Primary Dot */}
      <motion.div
        className="w-2 h-2 bg-emerald-500 rounded-full fixed"
        style={{ x: position.x - 4, y: position.y - 4 }}
      />
      {/* Outer Ring */}
      <motion.div
        className="w-8 h-8 border border-emerald-500/50 rounded-full fixed"
        style={{ x: cursorX.get() - 16, y: cursorY.get() - 16 }}
        animate={{
          scale: isClicking ? 0.8 : (isHovering ? 1.5 : 1),
          backgroundColor: isHovering ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
          borderColor: isHovering ? 'rgba(16, 185, 129, 1)' : 'rgba(16, 185, 129, 0.5)',
        }}
      />
    </div>
  );
};

export default CustomCursor;
