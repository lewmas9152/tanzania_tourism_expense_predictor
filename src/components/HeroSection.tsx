'use client'

import { useEffect, useRef } from 'react'

interface HeroSectionProps {
  onStart: () => void
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animated particles (stars/fireflies)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; opacityDir: number;
    }> = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random(),
        opacityDir: Math.random() > 0.5 ? 0.005 : -0.005,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.opacity += p.opacityDir
        if (p.opacity > 1 || p.opacity < 0.1) p.opacityDir *= -1
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(193, 127, 62, ${p.opacity * 0.6})`
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#0d1f2a]" />

      {/* Gradient orbs */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #c17f3e 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #4a7c59 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #d4620a 0%, transparent 70%)' }}
      />

      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Silhouette acacia tree SVG */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end pointer-events-none opacity-15">
        <svg width="280" height="200" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M140 200V80" stroke="#c17f3e" strokeWidth="8" strokeLinecap="round"/>
          <path d="M140 80 C80 80, 20 40, 60 0 C80 20, 120 30, 140 80Z" fill="#c17f3e"/>
          <path d="M140 80 C200 80, 260 40, 220 0 C200 20, 160 30, 140 80Z" fill="#c17f3e"/>
          <path d="M140 100 C100 100, 50 70, 80 45 C100 65, 125 75, 140 100Z" fill="#c17f3e"/>
          <path d="M140 100 C180 100, 230 70, 200 45 C180 65, 155 75, 140 100Z" fill="#c17f3e"/>
          <path d="M60 200V160" stroke="#c17f3e" strokeWidth="5" strokeLinecap="round"/>
          <path d="M220 200V170" stroke="#c17f3e" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 150V60" stroke="#c17f3e" strokeWidth="6" strokeLinecap="round"/>
          <path d="M100 60 C55 60, 10 28, 45 0 C62 15, 88 22, 100 60Z" fill="#c17f3e"/>
          <path d="M100 60 C145 60, 190 28, 155 0 C138 15, 112 22, 100 60Z" fill="#c17f3e"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs tracking-widest uppercase"
          style={{
            background: 'rgba(193, 127, 62, 0.12)',
            border: '1px solid rgba(193, 127, 62, 0.3)',
            color: '#c17f3e',
            fontFamily: 'var(--font-mono)',
            animationDelay: '0.2s'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#c17f3e] animate-pulse" />
          ML-Powered Prediction · Tanzania Tourism Board
        </div>

        {/* Main headline */}
        <h1
          className="mb-4 leading-[0.95]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem, 9vw, 8rem)', fontWeight: 300 }}
        >
          <span className="block text-[#f5ede0] opacity-90">How much will</span>
          <span className="block shimmer-text italic">Tanzania</span>
          <span className="block text-[#f5ede0] opacity-90">cost you?</span>
        </h1>

        <p
          className="mt-6 mb-12 text-base max-w-lg mx-auto leading-relaxed opacity-60"
          style={{ fontFamily: 'var(--font-body)', color: '#f5ede0' }}
        >
          A machine learning model trained on 4,809 real tourist expenditure
          records estimates your total trip cost — before you book a single flight.
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-full text-sm font-medium tracking-wide transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #c17f3e 0%, #a85f28 100%)',
            color: '#f5ede0',
            boxShadow: '0 8px 32px rgba(193, 127, 62, 0.35)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <span>Estimate my trip cost</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          {[
            { value: '4,809', label: 'Tourist Records' },
            { value: '105', label: 'Countries' },
            { value: 'MAE', label: 'Optimised Metric' },
            { value: 'LightGBM', label: 'Core Model' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div
                className="text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-display)', color: '#c17f3e', fontWeight: 500 }}
              >
                {value}
              </div>
              <div className="text-xs mt-0.5 opacity-40 tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
