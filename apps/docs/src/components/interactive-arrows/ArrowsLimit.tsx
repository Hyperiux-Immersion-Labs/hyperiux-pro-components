import React, { useCallback, useEffect, useRef } from 'react';
import { Point } from './utils';
import { createSuspendedRaf } from './createSuspendedRaf';

class Arrow {
  pos: Point;
  dx: number;
  dy: number;
  angle: number;
  ease: number;

  constructor(position: Point) {
    this.pos = position;
    this.dx = 0;
    this.dy = 0;
    this.angle = 0;
    this.ease = 0.1;
  }

  update(mouseX: number, mouseY: number) {
    const targetDx = mouseX - this.pos.x;
    const targetDy = mouseY - this.pos.y;
    this.dx += (targetDx - this.dx) * this.ease * 0.35;
    this.dy += (targetDy - this.dy) * this.ease * 0.35;
    this.angle = Math.atan2(this.dy, this.dx);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);
    ctx.beginPath();

    ctx.moveTo(50, 0);
    ctx.lineTo(-50, 0);
    ctx.moveTo(50, 0);
    ctx.lineTo(10, -40);
    ctx.moveTo(50, 0);
    ctx.lineTo(10, 40);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.restore();
  }
}

interface ArrowsLimitProps {
  rows?: number;
  columns?: number;
}

const ArrowsLimit = ({ rows = 5, columns = 10 }: ArrowsLimitProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const arrowsRef = useRef<Arrow[]>([]);

  const initializeArrows = useCallback((canvas: HTMLCanvasElement) => {
    const arrows: Arrow[] = [];
    const spacingX = canvas.width / (columns + 1);
    const spacingY = canvas.height / (rows + 1);
    
    for (let y = 1; y <= rows; y++) {
      for (let x = 1; x <= columns; x++) {
        arrows.push(
          new Arrow(
            new Point(
              x * spacingX,
              y * spacingY
            )
          )
        );
      }
    }
    return arrows;
  }, [columns, rows]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      arrowsRef.current = initializeArrows(canvas);
    }
  }, [initializeArrows]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      mouseRef.current = {
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top,  
      };
    }
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const arrows = arrowsRef.current;
    const mouse = mouseRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    arrows.forEach(arrow => {
      arrow.update(mouse.x, mouse.y);
      arrow.draw(ctx);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    arrowsRef.current = initializeArrows(canvas);
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const loop = createSuspendedRaf({
      root: canvas,
      onFrame: drawFrame,
    });
    loop.start();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      loop.destroy();
    };
  }, [drawFrame, handleMouseMove, handleResize, initializeArrows]); 

  return (
    <div className="w-full h-full">
      <canvas 
        ref={canvasRef}
        className="w-full h-full "
      />
    </div>
  );
};

export default ArrowsLimit;
