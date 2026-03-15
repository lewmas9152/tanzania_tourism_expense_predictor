'use client'

import { useEffect, useState } from 'react'
import type { PredictionResult, TourismInput } from '@/lib/predictor'
import { formatTZS, formatUSD } from '@/lib/predictor'

interface ResultsPanelProps {
  result: PredictionResult
  input: TourismInput
  onReset: () => void
}

function AnimatedNumber({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing: ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCurrent(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return <>{current.toLocaleString()}</>
}

function BreakdownBar({
  label, value, total, color
}: { label: string; value: number; total: number; color: string }) {
  const pct = Math.max(2, Math.min(100, (value / total) * 100))
  const [width, setWidth] = useState(0)
  useEffect(() => {
    setTimeout(() => setWidth(pct), 100)
  }, [pct])

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'rgba(245,237,224,0.6)', fontFamily: 'var(--font-body)' }}>{label}</span>
        <span style={{ color, fontFamily: 'var(--font-mono)' }}>{formatTZS(value)}</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'rgba(245,237,224,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  )
}

const CONFIDENCE_CONFIG = {
  high: { label: 'High confidence', color: '#4a7c59', bg: 'rgba(74, 124, 89, 0.15)' },
  medium: { label: 'Medium confidence', color: '#c17f3e', bg: 'rgba(193, 127, 62, 0.15)' },
  low: { label: 'Low confidence', color: '#d4620a', bg: 'rgba(212, 98, 10, 0.15)' },
}

export default function ResultsPanel({ result, input, onReset }: ResultsPanelProps) {
  const conf = CONFIDENCE_CONFIG[result.confidence]
  const totalNights = input.nightMainland + input.nightZanzibar
  const totalPeople = Math.max(input.totalFemale + input.totalMale, 1)

  const breakdownTotal = result.breakdown.baseRate
    + result.breakdown.nightsCost
    + result.breakdown.packageCost

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12 pb-20">
      {/* Background */}
      <div className="fixed inset-0 bg-[#0d1f2a]" />
      <div
        className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4a7c59 0%, transparent 70%)' }}
      />
      <div
        className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c17f3e 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-2xl space-y-5">
        {/* Hero result card */}
        <div
          className="glass rounded-2xl p-8 text-center animate-fade-up"
          style={{ animationDelay: '0s' }}
        >
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: conf.bg,
              color: conf.color,
              border: `1px solid ${conf.color}40`,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: conf.color }} />
            {conf.label}
          </div>

          <div className="mb-1 text-xs tracking-widest uppercase opacity-40"
            style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
            Estimated Total Cost
          </div>

          <div
            className="leading-none my-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 300,
              color: '#c17f3e',
            }}
          >
            TZS <AnimatedNumber target={Math.round(result.estimatedCost)} />
          </div>

          <div className="text-lg opacity-60" style={{ fontFamily: 'var(--font-display)', color: '#f5ede0' }}>
            {formatUSD(result.estimatedCost)}
          </div>

          {/* Range bar */}
          <div className="mt-6 relative">
            <div className="flex justify-between text-xs mb-2 opacity-40"
              style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
              <span>Low estimate</span>
              <span>High estimate</span>
            </div>
            <div className="relative h-2 rounded-full" style={{ background: 'rgba(245,237,224,0.08)' }}>
              {/* Range fill */}
              <div
                className="absolute h-full rounded-full"
                style={{
                  left: `${(result.lowerBound / result.upperBound) * 100 * 0.15}%`,
                  right: '5%',
                  background: 'linear-gradient(90deg, rgba(193,127,62,0.3), rgba(193,127,62,0.6))',
                }}
              />
              {/* Center marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
                style={{
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: '#c17f3e',
                  borderColor: '#0d1f2a',
                }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(245,237,224,0.5)' }}>
              <span>{formatTZS(result.lowerBound)}</span>
              <span>{formatTZS(result.upperBound)}</span>
            </div>
          </div>
        </div>

        {/* Trip summary row */}
        <div
          className="glass rounded-2xl p-5 animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="text-xs tracking-widest uppercase opacity-40 mb-4"
            style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
            Trip Summary
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Origin', value: input.country },
              { label: 'Duration', value: `${totalNights} nights` },
              { label: 'Group Size', value: `${totalPeople} person${totalPeople > 1 ? 's' : ''}` },
              { label: 'Activity', value: input.mainActivity.split(' ')[0] },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-xs opacity-40 mb-1 tracking-wider uppercase"
                  style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>{label}</div>
                <div className="text-sm font-medium truncate"
                  style={{ fontFamily: 'var(--font-body)', color: '#f5ede0' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost breakdown */}
        <div
          className="glass rounded-2xl p-6 animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="text-xs tracking-widest uppercase opacity-40 mb-5"
            style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
            Cost Breakdown
          </div>
          <div className="space-y-4">
            <BreakdownBar
              label="Base travel cost (demographics)"
              value={result.breakdown.baseRate}
              total={breakdownTotal}
              color="#4a7c59"
            />
            <BreakdownBar
              label="Accommodation & nights"
              value={result.breakdown.nightsCost}
              total={breakdownTotal}
              color="#c17f3e"
            />
            <BreakdownBar
              label="Package inclusions"
              value={result.breakdown.packageCost}
              total={breakdownTotal}
              color="#5588b4"
            />
          </div>

          {/* Multipliers */}
          <div className="mt-5 pt-4 border-t grid grid-cols-3 gap-3"
            style={{ borderColor: 'rgba(193,127,62,0.1)' }}>
            {[
              { label: 'Region factor', value: `×${result.breakdown.regionMultiplier.toFixed(1)}` },
              { label: 'Purpose factor', value: `×${result.breakdown.purposeMultiplier.toFixed(1)}` },
              { label: 'Tour type', value: `×${result.breakdown.arrangementMultiplier.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center py-2 rounded-lg"
                style={{ background: 'rgba(245,237,224,0.04)' }}>
                <div className="text-sm font-semibold" style={{ color: '#c17f3e', fontFamily: 'var(--font-mono)' }}>{value}</div>
                <div className="text-xs opacity-40 mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-person breakdown */}
        <div
          className="glass rounded-2xl p-6 animate-fade-up"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="text-xs tracking-widest uppercase opacity-40 mb-4"
            style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
            Per-Person Cost
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Per Person Total',
                value: formatTZS(result.estimatedCost / totalPeople),
                sub: formatUSD(result.estimatedCost / totalPeople),
              },
              {
                label: 'Per Night',
                value: totalNights > 0 ? formatTZS(result.estimatedCost / totalNights) : 'N/A',
                sub: totalNights > 0 ? formatUSD(result.estimatedCost / totalNights) : '—',
              },
              {
                label: 'Per Person/Night',
                value: totalNights > 0 ? formatTZS(result.estimatedCost / (totalPeople * totalNights)) : 'N/A',
                sub: totalNights > 0 ? formatUSD(result.estimatedCost / (totalPeople * totalNights)) : '—',
              },
            ].map(({ label, value, sub }) => (
              <div key={label} className="text-center py-3 rounded-xl"
                style={{ background: 'rgba(245,237,224,0.04)', border: '1px solid rgba(193,127,62,0.1)' }}>
                <div className="text-sm font-semibold" style={{ color: '#c17f3e', fontFamily: 'var(--font-mono)' }}>{value}</div>
                <div className="text-xs opacity-50 mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>{sub}</div>
                <div className="text-xs opacity-30 mt-1 tracking-wide"
                  style={{ fontFamily: 'var(--font-body)', color: '#f5ede0' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Insights */}
        {result.insights.length > 0 && (
          <div
            className="glass rounded-2xl p-6 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="text-xs tracking-widest uppercase opacity-40 mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
              Model Insights
            </div>
            <div className="space-y-3">
              {result.insights.map((insight, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="mt-0.5 text-[#c17f3e]">◆</span>
                  <p className="text-sm leading-relaxed opacity-70"
                    style={{ fontFamily: 'var(--font-body)', color: '#f5ede0' }}>
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model info footer */}
        <div
          className="glass rounded-2xl p-5 animate-fade-up"
          style={{ animationDelay: '0.35s' }}
        >
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(193,127,62,0.15)', border: '1px solid rgba(193,127,62,0.3)' }}>
              <span className="text-xs" style={{ color: '#c17f3e' }}>ℹ</span>
            </div>
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: '#f5ede0', fontFamily: 'var(--font-body)' }}>
                About this prediction
              </div>
              <p className="text-xs leading-relaxed opacity-40"
                style={{ fontFamily: 'var(--font-body)', color: '#f5ede0' }}>
                This estimate is generated by a LightGBM ensemble model trained on 4,809 real tourist
                expenditure records from the Tanzania Tourism Board. The model was optimised for
                Mean Absolute Error and includes region-based, activity, and package features.
                Actual costs may vary based on personal choices and market conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={onReset}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(245,237,224,0.05)',
              color: 'rgba(245,237,224,0.7)',
              border: '1px solid rgba(193,127,62,0.2)',
              fontFamily: 'var(--font-body)',
            }}
          >
            ← Recalculate
          </button>
          <button
            onClick={() => {
              const text = `Tanzania Trip Estimate\n${formatTZS(result.estimatedCost)} (${formatUSD(result.estimatedCost)})\nRange: ${formatTZS(result.lowerBound)} – ${formatTZS(result.upperBound)}`
              navigator.clipboard?.writeText(text).catch(() => {})
            }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #c17f3e 0%, #a85f28 100%)',
              color: '#f5ede0',
              boxShadow: '0 4px 20px rgba(193, 127, 62, 0.3)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Copy Estimate
          </button>
        </div>
      </div>
    </div>
  )
}
