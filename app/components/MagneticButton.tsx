"use client";
import React, { useRef, useState, useEffect } from "react";

export default function MagneticButton({ children, className = "" }: { children: React.ReactElement, className?: string }) {
  const boundingRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boundingRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = boundingRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    // Calculate distance from center, scale down for subtlety
    const maxDistance = 20; // max pixel shift
    const x = ((clientX - centerX) / (width / 2)) * maxDistance;
    const y = ((clientY - centerY) / (height / 2)) * maxDistance;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={boundingRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 && position.y === 0 ? "transform 0.5s var(--ease)" : "transform 0.1s linear",
      }}
    >
      {children}
    </div>
  );
}
