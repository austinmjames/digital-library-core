import { Theme } from "@/types/reader";
import { useCallback, useEffect, useRef } from "react";

/**
 * useSpatialTying Hook (v2.0)
 * Filepath: lib/hooks/useSpatialTying.ts
 * Role: Orchestrates the Bezier curve "threads" between text and commentary.
 * PRD Alignment: Section 3.2 (The Reader - Spatial UI).
 * Fix: Added high-frequency scroll sync and CSS variable integration.
 */

export function useSpatialTying(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  activeRef: string,
  isSidePanelOpen: boolean,
  theme: Theme
) {
  const requestRef = useRef<number>(0);

  const drawCurves = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Exit early if the UI doesn't require a link
    if (!activeRef || !isSidePanelOpen) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // 2. High-DPI Scaling Logic
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Only resize if dimensions actually changed to save GPU cycles
    if (
      canvas.width !== rect.width * dpr ||
      canvas.height !== rect.height * dpr
    ) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, rect.width, rect.height);

    // 3. Anchor Detection (Supports VirtualVerseList v2.3)
    const sourceEl = document.querySelector(`[data-ref="${activeRef}"]`);
    const targetEl = document.querySelector('[data-commentary-header="true"]');

    if (sourceEl && targetEl) {
      const sR = sourceEl.getBoundingClientRect();
      const tR = targetEl.getBoundingClientRect();
      const cR = rect;

      // Calculate relative coordinates
      const startX = sR.right - cR.left - 10; // Offset for scholarly margin
      const startY = sR.top - cR.top + sR.height / 2;
      const endX = tR.left - cR.left;
      const endY = tR.top - cR.top + 30; // Anchor to the top-ish of the panel

      // 4. Draw Scholarly Thread
      ctx.beginPath();
      ctx.moveTo(startX, startY);

      // Control point logic for a graceful S-curve
      const cpX = startX + (endX - startX) / 2;
      ctx.bezierCurveTo(cpX, startY, cpX, endY, endX, endY);

      // Aesthetic Polish: Use CSS variables from globals.css for theme awareness
      const strokeColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--bezier-stroke")
          .trim() ||
        (theme === "dark"
          ? "rgba(63, 63, 70, 0.4)"
          : "rgba(212, 212, 216, 0.5)");

      ctx.strokeStyle = strokeColor;
      ctx.setLineDash([4, 4]); // DASH-001: Minimalist dashed line
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [activeRef, isSidePanelOpen, theme, canvasRef]);

  // 5. Orchestration: Listening for Resize and Scroll (Manifest Performance)
  useEffect(() => {
    const handleUpdate = () => {
      // Using requestAnimationFrame to ensure the curve follows the virtual list smoothly
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(drawCurves);
    };

    window.addEventListener("resize", handleUpdate);

    // We listen to the capturing phase of scroll to detect virtual list movements
    window.addEventListener("scroll", handleUpdate, true);

    // Initial draw
    handleUpdate();

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [drawCurves]);

  return { drawCurves };
}
