"use client";

import React, { useRef, useEffect, useState } from "react";
import { registerFxTarget, unregisterFxTarget } from "./2dcanvasTracker";

const GRID_SIZE = 35;
const EFFECT_RADIUS = 40;
const MAX_TRAIL_LENGTH = 8;
const CELL_LIFETIME = 100;
const GRID_IMAGE_BASE_URL =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/FeddleAsciCursor";
const getCanvasSafeMediaUrl = (source) => source;

export default function PixelBloom({
  src,
  type = "video",
  className = "h-[30vw] w-auto aspect-video",
  gridSize = GRID_SIZE,
  effectRadius = EFFECT_RADIUS,
  maxTrailLength = MAX_TRAIL_LENGTH,
  cellLifetime = CELL_LIFETIME,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRef = useRef(null);

  const [gridImages, setGridImages] = useState([]);

  const animationRef = useRef(null);
  const cellImageMapRef = useRef(new Map());
  const trailRef = useRef([]);
  const sequenceRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const images = [];
    let loadedCount = 0;
    const totalImages = 10;

    for (let i = 0; i < totalImages; i++) {
      const img = new window.Image();
      img.src = getCanvasSafeMediaUrl(`${GRID_IMAGE_BASE_URL}/grid-${i}.1.png`);

      img.onload = () => {
        loadedCount += 1;

        if (!cancelled && loadedCount === totalImages) {
          setGridImages(images);
        }
      };

      img.onerror = () => {
        loadedCount += 1;

        if (!cancelled && loadedCount === totalImages) {
          setGridImages(images.filter((image) => image.complete));
        }
      };

      images.push(img);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handlers = {
      onMove: ({ localX, localY }) => {
        const now = Date.now();
        const rand = () => Math.random() - 0.5;

        trailRef.current.unshift({
          x: localX + rand() * 30,
          y: localY + rand() * 30,
          timestamp: now,
        });

        for (let i = 0; i < 2; i++) {
          trailRef.current.unshift({
            x: localX + rand() * 60,
            y: localY + rand() * 60,
            timestamp: now,
          });
        }

        if (trailRef.current.length > maxTrailLength) {
          trailRef.current.length = maxTrailLength;
        }
      },
      onLeave: () => {},
    };

    registerFxTarget(container, handlers);

    return () => {
      unregisterFxTarget(container);
    };
  }, [maxTrailLength]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const media = mediaRef.current;
    const container = containerRef.current;

    if (!canvas || !media || !container || gridImages.length === 0) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const drawMediaCover = (mediaElement, context, canvasWidth, canvasHeight) => {
      const mediaWidth =
        type === "video"
          ? mediaElement.videoWidth
          : mediaElement.naturalWidth;

      const mediaHeight =
        type === "video"
          ? mediaElement.videoHeight
          : mediaElement.naturalHeight;

      if (!mediaWidth || !mediaHeight) {
        try {
          context.drawImage(mediaElement, 0, 0, canvasWidth, canvasHeight);
        } catch {
          return;
        }

        return;
      }

      const mediaAspect = mediaWidth / mediaHeight;
      const canvasAspect = canvasWidth / canvasHeight;

      let srcX;
      let srcY;
      let srcW;
      let srcH;

      if (mediaAspect > canvasAspect) {
        srcH = mediaHeight;
        srcW = mediaHeight * canvasAspect;
        srcX = (mediaWidth - srcW) / 2;
        srcY = 0;
      } else {
        srcW = mediaWidth;
        srcH = mediaWidth / canvasAspect;
        srcX = 0;
        srcY = (mediaHeight - srcH) / 2;
      }

      try {
        context.drawImage(
          mediaElement,
          srcX,
          srcY,
          srcW,
          srcH,
          0,
          0,
          canvasWidth,
          canvasHeight
        );
      } catch {
        return;
      }
    };

    const render = () => {
      const rect = container.getBoundingClientRect();
      const { width, height } = rect;
      const now = Date.now();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      drawMediaCover(media, ctx, width, height);

      trailRef.current = trailRef.current.filter(
        (point) => now - point.timestamp < cellLifetime
      );

      const affectedCells = new Map();

      for (const { x: mx, y: my, timestamp } of trailRef.current) {
        if (mx < 0 || mx > width || my < 0 || my > height) continue;

        const radius = effectRadius * (0.5 + Math.random() * 0.8);

        const startCol = Math.max(0, Math.floor((mx - radius) / gridSize));
        const endCol = Math.min(
          Math.ceil(width / gridSize),
          Math.ceil((mx + radius) / gridSize)
        );

        const startRow = Math.max(0, Math.floor((my - radius) / gridSize));
        const endRow = Math.min(
          Math.ceil(height / gridSize),
          Math.ceil((my + radius) / gridSize)
        );

        for (let row = startRow; row < endRow; row++) {
          for (let col = startCol; col < endCol; col++) {
            if (Math.random() > 0.7) continue;

            const cx = col * gridSize + gridSize / 2;
            const cy = row * gridSize + gridSize / 2;

            if (Math.hypot(cx - mx, cy - my) < radius) {
              const key = `${col},${row}`;

              if (!affectedCells.has(key) || timestamp > affectedCells.get(key)) {
                affectedCells.set(key, timestamp);
              }
            }
          }
        }
      }

      for (const [key, timestamp] of affectedCells) {
        const cell = cellImageMapRef.current.get(key);

        if (cell) {
          cell.timestamp = timestamp;
        } else {
          const index = sequenceRef.current % gridImages.length;
          sequenceRef.current += 1;

          cellImageMapRef.current.set(key, {
            gridIndex: index,
            timestamp,
            randomDelay: Math.random() * 500,
          });
        }
      }

      for (const [key, cell] of cellImageMapRef.current) {
        if (
          now - cell.timestamp > cellLifetime + (cell.randomDelay || 0) &&
          Math.random() > 0.3
        ) {
          cellImageMapRef.current.delete(key);
        }
      }

      for (const [key, { gridIndex }] of cellImageMapRef.current) {
        const [col, row] = key.split(",").map(Number);
        const img = gridImages[gridIndex];

        if (!img?.complete) continue;

        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        if (!iw || !ih) continue;

        const imgAspect = iw / ih;

        let srcX;
        let srcY;
        let srcW;
        let srcH;

        if (imgAspect > 1) {
          srcH = ih;
          srcW = ih;
          srcX = (iw - srcW) / 2;
          srcY = 0;
        } else {
          srcW = iw;
          srcH = iw;
          srcX = 0;
          srcY = (ih - srcH) / 2;
        }

        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcW,
          srcH,
          col * gridSize,
          row * gridSize,
          gridSize,
          gridSize
        );
      }

      animationRef.current = requestAnimationFrame(render);
    };

    const startRender = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      resizeCanvas();
      render();
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    if (type === "video") {
      media.addEventListener("loadeddata", startRender);
      media.addEventListener("play", startRender);

      if (media.readyState >= 2) {
        startRender();
      }
    } else {
      media.addEventListener("load", startRender);

      if (media.complete) {
        startRender();
      }
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);

      if (type === "video") {
        media.removeEventListener("loadeddata", startRender);
        media.removeEventListener("play", startRender);
      } else {
        media.removeEventListener("load", startRender);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      animationRef.current = null;
      cellImageMapRef.current.clear();
      trailRef.current = [];
    };
  }, [cellLifetime, effectRadius, gridImages, gridSize, src, type]);

  const defaultVideoSrc = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/draggable-video.mp4";

  return (
    <div
      ref={containerRef}
      className={`fx-target relative overflow-hidden rounded-2xl max-md:rounded-sm max-sm:rounded-lg ${className}`}
    >
      {type === "video" ? (
        <video
          ref={mediaRef}
          src={src || defaultVideoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
      ) : (
        <img
          ref={mediaRef}
          src={getCanvasSafeMediaUrl(src)}
          alt="asset-image"
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
      )}

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
