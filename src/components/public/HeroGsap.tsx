'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import {
  Lock, ArrowRight, Cpu, CheckCircle2,
  ShieldCheck, Star, ChevronRight, Zap, Radio,
  Activity, Terminal, Network, Binary
} from 'lucide-react';

export default function HeroGsap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState<string>('');
  const [pulseCount, setPulseCount] = useState<number>(1420);

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Africa/Douala'
        }) + ' UTC+1'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    const pulseTimer = setInterval(() => {
      setPulseCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(pulseTimer);
    };
  }, []);

  // Dual-Theme Interactive Particle Matrix (HTML5 Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 750);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 750;
    };
    window.addEventListener('resize', handleResize);

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      colorIndex: number;
      pulse: number;
    }

    const nodeCount = Math.min(Math.floor((width * height) / 18000), 55);
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1,
        colorIndex: Math.floor(Math.random() * 3),
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const mouse = { x: -1000, y: -1000, active: false };
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const darkColors = ['#3B82F6', '#F59E0B', '#10B981'];
      const lightColors = ['#2563EB', '#D97706', '#059669'];
      const activeColors = isDark ? darkColors : lightColors;

      ctx.clearRect(0, 0, width, height);

      // Faint technical grid
      ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.04)' : 'rgba(15, 23, 42, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.03;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        if (mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            node.x += (dx / dist) * 0.6;
            node.y += (dy / dist) * 0.6;
          }
        }

        const currentRadius = node.radius + Math.sin(node.pulse) * 0.5;
        const color = activeColors[node.colorIndex];
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(currentRadius, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * (isDark ? 0.22 : 0.16);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = isDark ? `rgba(59, 130, 246, ${alpha})` : `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  // GSAP Intro Sequence with Kowalski Animation Principles
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const words = titleRef.current?.querySelectorAll('.hero-word');
      if (words && words.length > 0) {
        gsap.from(words, {
          y: 20,
          opacity: 0,
          duration: 0.75,
          stagger: 0.04,
          ease: 'power3.out',
          clearProps: 'all'
        });
      }

      if (cardRef.current) {
        gsap.from(cardRef.current, {
          scale: 0.96,
          opacity: 0,
          duration: 0.85,
          delay: 0.2,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pt-20 sm:pt-28 pb-24 sm:pb-32 bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800 transition-colors duration-200"
      style={{ minHeight: '82vh' }}
    >
      {/* Canvas interactif */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Halos lumineux subtils adaptés au mode */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-30 dark:opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #3B82F6 0%, #1D4ED8 50%, transparent 80%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-[-5%] w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-15 blur-3xl pointer-events-none"
        style={{ background: '#F59E0B' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Colonne Gauche : Thèse & Typographie Institutionnelle */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Mission Badge & Telemetry Flag */}
            <div className="inline-flex flex-wrap items-center gap-3 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30 bg-white/90 dark:bg-blue-950/40 backdrop-blur-md shadow-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shadow-xs" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700 dark:text-blue-300 font-mono">
                  SYS_CORE · 2026 EN SERVICE
                </span>
              </span>
              <span className="text-slate-300 dark:text-slate-700 text-xs hidden sm:inline">|</span>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{currentTime || 'Saint Jérôme Polytechnique · Douala'}</span>
              </span>
            </div>

            {/* Titre Principal avec Stagger Accessible */}
            <h1
              ref={titleRef}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] font-display"
              aria-label="L'Ingénierie du Futur : Silicium, Firmware & Réseaux Cyber-Physiques"
            >
              <span className="inline-block hero-word">L&apos;Ingénierie</span>{' '}
              <span className="inline-block hero-word">du</span>{' '}
              <span className="inline-block hero-word text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-sky-300">
                Futur
              </span><br />
              <span className="inline-block hero-word text-slate-900 dark:text-white">Silicium,</span>{' '}
              <span className="inline-block hero-word text-amber-600 dark:text-amber-400">Firmware</span>{' '}
              <span className="inline-block hero-word text-slate-400 dark:text-slate-500">&amp;</span><br />
              <span className="inline-block hero-word text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-blue-600 dark:from-amber-400 dark:via-orange-400 dark:to-blue-400">
                Systèmes Cyber-Physiques
              </span>
            </h1>

            {/* Accroche Technique Délibérée */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              La <strong className="text-blue-600 dark:text-blue-400 font-semibold">Division Génie Infotronique (GIT)</strong> de Saint Jérôme Polytechnique conçoit les infrastructures de haute précision : micro-électronique ARM/FPGA bare-metal, réseaux industriels Wi-Fi 6 sécurisés et plateformes logicielles certifiées.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/login"
                className="btn-nasa w-full sm:w-auto px-7 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Portail Membres &amp; Bureau</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#projects"
                className="btn-nasa-outline w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Showcase R&amp;D</span>
              </a>
            </div>

            {/* Badges de Télémétrie Officiels */}
            <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start pt-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Réf. GIT-CDC-2026-001</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Wi-Fi 6 &amp; Filtrage MAC Mikrotik</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Binary className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>PWA Chiffrée &amp; Mode Offline</span>
              </span>
            </div>
          </div>

          {/* Colonne Droite : Module Focal Holographique */}
          <div ref={cardRef} className="lg:col-span-5 flex justify-center">
            <div className="cyber-panel relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#111827]/90 border border-slate-200 dark:border-slate-800 shadow-xl group">
              {/* Scanline Effect */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-12 w-full pointer-events-none opacity-40 animate-[scanLine_4s_linear_infinite]"
                aria-hidden="true"
              />

              {/* Chassis En-Tête */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>INFOTRONICS CHASSIS v2.6</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold">
                  OPÉRATIONNEL
                </span>
              </div>

              {/* Cœur Central */}
              <div className="py-6 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  {/* Anneau Orbital Électrique */}
                  <div className="absolute -inset-2.5 rounded-3xl border border-blue-400/30 dark:border-blue-500/40 animate-[orbitPulse_3s_infinite] pointer-events-none" />

                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-2 border-2 border-blue-500/30 dark:border-blue-400/40 shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/logo.jpg"
                      alt="Logo Division Génie Infotronique"
                      width={120}
                      height={120}
                      className="object-contain w-full h-full"
                      priority
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wider font-display flex items-center justify-center gap-2">
                    <span>GÉNIE INFOTRONIQUE</span>
                  </h2>
                  <p className="text-[11px] font-mono tracking-wider text-blue-600 dark:text-blue-400 uppercase mt-0.5 font-bold">
                    Saint Jérôme Polytechnique · Douala
                  </p>
                </div>
              </div>

              {/* Télémétrie Temps Réel & Registres Matériels */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800/80 text-left">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Horloge Cœur</span>
                  <strong className="text-blue-600 dark:text-blue-300 font-bold">480 MHz ARM M7</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800/80 text-left">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Bande Labo</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Wi-Fi 6 MIMO</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800/80 text-left">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Bus FPGA</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-bold">Verilog Sync</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800/80 text-left">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Paquets Sécurisés</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{pulseCount} pkts/s</strong>
                </div>
              </div>

              {/* Action Rapide Sécurisée */}
              <div className="pt-5">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-200 transition hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Identification Badge QR &amp; PIN</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
