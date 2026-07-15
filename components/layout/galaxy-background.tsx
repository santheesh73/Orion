"use client";

import { useEffect, useRef } from "react";

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Mouse interaction
    let mouse = {
      x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
      y: typeof window !== "undefined" ? window.innerHeight / 2 : 0
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    window.addEventListener("mousemove", handleMouseMove);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      density: number;
      baseOpacity: number;
      currentOpacity: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 0.5;
        this.density = (Math.random() * 30) + 5;
        this.baseOpacity = Math.random() * 0.7 + 0.3; // 0.3 to 1.0 opacity
        this.currentOpacity = 0;
      }

      update(mouseX: number, mouseY: number) {
        let targetX = this.baseX;
        let targetY = this.baseY;
        let targetOpacity = 0;
        
        // Interactive repulsion
        let dx = mouseX - targetX;
        let dy = mouseY - targetY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        const maxDistance = 250;
        
        if (distance < maxDistance) {
            targetOpacity = this.baseOpacity;
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            // Force depends on closeness
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density * 5.0;
            let directionY = forceDirectionY * force * this.density * 5.0;
            
            targetX -= directionX;
            targetY -= directionY;
        }

        // Lerp towards target for smooth movement
        this.x += (targetX - this.x) * 0.25;
        this.y += (targetY - this.y) * 0.25;
        this.currentOpacity += (targetOpacity - this.currentOpacity) * 0.15;
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (this.currentOpacity < 0.01) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.currentOpacity})`;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = `rgba(255, 255, 255, ${this.currentOpacity})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      // Calculate number of particles based on screen size
      const numParticles = Math.floor((canvas.width * canvas.height) / 3000); 
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      // Clear the canvas to allow CSS background to show through
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update(mouse.x, mouse.y);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ background: "radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, #09090b 80%)" }}
    />
  );
}
