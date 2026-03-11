"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
  className?: string;
  animate?: boolean;
}

export function Sparkline({
  data,
  width = 80,
  height = 32,
  color = "hsl(168, 82%, 42%)",
  filled = true,
  className,
  animate = true,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    const pad = 2;

    const points = data.map((val, i) => ({
      x: i * step,
      y: pad + (1 - (val - min) / range) * (height - 2 * pad),
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + step / 3;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - step / 3;
      const cp2y = points[i].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
    }
    return d;
  }, [data, width, height]);

  const fillPath = useMemo(() => {
    if (!path || !filled) return "";
    return `${path} L ${width} ${height} L 0 ${height} Z`;
  }, [path, filled, width, height]);

  const lastY = useMemo(() => {
    if (data.length < 2) return height / 2;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    return 2 + (1 - (data[data.length - 1] - min) / range) * (height - 4);
  }, [data, height]);

  if (data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ overflow: "visible" }}
    >
      {filled && fillPath && (
        <motion.path
          d={fillPath}
          fill={color}
          fillOpacity={0.1}
          initial={animate ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
      )}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.circle
        cx={width}
        cy={lastY}
        r={2.5}
        fill={color}
        initial={animate ? { scale: 0, opacity: 0 } : undefined}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 300, damping: 20 }}
      />
    </svg>
  );
}
