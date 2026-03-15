'use client'

import { useState } from 'react'
import type { TourismInput } from '@/lib/predictor'
import {
  COUNTRIES, PURPOSES, MAIN_ACTIVITIES, INFO_SOURCES
} from '@/lib/predictor'

interface PredictorFormProps {
  onSubmit: (input: TourismInput) => void
}

const STEPS = ['Origin & Profile', 'Trip Details', 'Package & Payment']

const defaultForm: TourismInput = {
  country: 'United Kingdom',
  ageGroup: '25-44',
  travelWith: 'Alone',
  purpose: 'Leisure and Holidays',
  mainActivity: 'Wildlife tourism',
  infoSource: 'Friends, relatives',
  tourArrangement: 'Independent',
  nightMainland: 7,
  nightZanzibar: 0,
  totalFemale: 0,
  totalMale: 1,
  paymentMode: 'Cash',
  firstTrip: true,
  packageTransportInt: false,
  packageAccommodation: false,
  packageFood: false,
  packageTransportTz: false,
  packageSightseeing: false,
  packageGuidedTour: false,
  packageInsurance: false,
}

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
}
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label className="toggle-pill">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track" />
      <span className="toggle-thumb" />
    </label>
  )
}

interface StepDotsProps { current: number; total: number }
function StepDots({ current, total }: StepDotsProps) {
  return (
    <div className="flex gap-2 items-center justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`step-dot ${i === current ? 'active' : i < current ? 'done' : ''}`}
        />
      ))}
    </div>
  )
}

function SliderField({
  label, value, min, max, onChange, unit = ''
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; unit?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs tracking-widest uppercase opacity-50"
          style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
          {label}
        </label>
        <span className="text-sm font-medium" style={{ color: '#c17f3e', fontFamily: 'var(--font-mono)' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-xs opacity-30 mt-1"
        style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

export default function PredictorForm({ onSubmit }: PredictorFormProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<TourismInput>(defaultForm)

  const set = <K extends keyof TourismInput>(key: K, value: TourismInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else onSubmit(form)
  }

  const handleBack = () => setStep(s => s - 1)

  const labelClass = "block text-xs tracking-widest uppercase opacity-50 mb-2"
  const labelStyle = { fontFamily: 'var(--font-mono)', color: '#f5ede0' }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 bg-[#0d1f2a]" />
      <div
        className="fixed top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c17f3e 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className="text-4xl mb-2"
            style={{ fontFamily: 'var(--font-display)', color: '#f5ede0', fontWeight: 300 }}
          >
            {STEPS[step]}
          </h2>
          <p className="text-xs opacity-40 tracking-widest uppercase mb-4"
            style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
            Step {step + 1} of {STEPS.length}
          </p>
          <StepDots current={step} total={STEPS.length} />
        </div>

        {/* Form card */}
        <div
          className="glass rounded-2xl p-8 space-y-6"
          key={step}
          style={{ animation: 'fadeUp 0.4s ease forwards' }}
        >
          {/* ── STEP 0: Origin & Profile ── */}
          {step === 0 && (
            <>
              <div>
                <label className={labelClass} style={labelStyle}>Country of Origin</label>
                <select
                  className="input-field"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Age Group</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['1-24', '25-44', '45-64', '65+'] as const).map(age => (
                    <button
                      key={age}
                      onClick={() => set('ageGroup', age)}
                      className="py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: form.ageGroup === age
                          ? 'linear-gradient(135deg, #c17f3e, #a85f28)'
                          : 'rgba(245, 237, 224, 0.05)',
                        color: form.ageGroup === age ? '#f5ede0' : 'rgba(245,237,224,0.5)',
                        border: `1px solid ${form.ageGroup === age ? '#c17f3e' : 'rgba(193,127,62,0.2)'}`,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Travelling With</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Alone', 'Spouse', 'Partner', 'Children', 'Friends/Relatives'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => set('travelWith', opt)}
                      className="py-2 px-3 rounded-lg text-xs transition-all duration-200"
                      style={{
                        background: form.travelWith === opt
                          ? 'linear-gradient(135deg, #c17f3e, #a85f28)'
                          : 'rgba(245, 237, 224, 0.05)',
                        color: form.travelWith === opt ? '#f5ede0' : 'rgba(245,237,224,0.5)',
                        border: `1px solid ${form.travelWith === opt ? '#c17f3e' : 'rgba(193,127,62,0.2)'}`,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={labelStyle}>Females in Group</label>
                  <input
                    type="number" min={0} max={50}
                    value={form.totalFemale}
                    onChange={e => set('totalFemale', Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Males in Group</label>
                  <input
                    type="number" min={0} max={50}
                    value={form.totalMale}
                    onChange={e => set('totalMale', Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── STEP 1: Trip Details ── */}
          {step === 1 && (
            <>
              <div>
                <label className={labelClass} style={labelStyle}>Purpose of Visit</label>
                <select
                  className="input-field"
                  value={form.purpose}
                  onChange={e => set('purpose', e.target.value)}
                >
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Main Activity</label>
                <select
                  className="input-field"
                  value={form.mainActivity}
                  onChange={e => set('mainActivity', e.target.value)}
                >
                  {MAIN_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>How Did You Hear About Tanzania?</label>
                <select
                  className="input-field"
                  value={form.infoSource}
                  onChange={e => set('infoSource', e.target.value)}
                >
                  {INFO_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <SliderField
                label="Nights on Mainland"
                value={form.nightMainland}
                min={0} max={60}
                onChange={v => set('nightMainland', v)}
                unit=" nights"
              />

              <SliderField
                label="Nights in Zanzibar"
                value={form.nightZanzibar}
                min={0} max={30}
                onChange={v => set('nightZanzibar', v)}
                unit=" nights"
              />

              <div>
                <label className={labelClass} style={labelStyle}>Tour Arrangement</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Independent', 'Package Tour'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => set('tourArrangement', opt)}
                      className="py-3 rounded-lg text-sm transition-all duration-200"
                      style={{
                        background: form.tourArrangement === opt
                          ? 'linear-gradient(135deg, #c17f3e, #a85f28)'
                          : 'rgba(245, 237, 224, 0.05)',
                        color: form.tourArrangement === opt ? '#f5ede0' : 'rgba(245,237,224,0.5)',
                        border: `1px solid ${form.tourArrangement === opt ? '#c17f3e' : 'rgba(193,127,62,0.2)'}`,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STEP 2: Package & Payment ── */}
          {step === 2 && (
            <>
              <div>
                <label className={labelClass} style={labelStyle}>Package Inclusions</label>
                <div className="space-y-3">
                  {([
                    { key: 'packageTransportInt', label: 'International Transport' },
                    { key: 'packageAccommodation', label: 'Accommodation' },
                    { key: 'packageFood', label: 'Food & Drinks' },
                    { key: 'packageTransportTz', label: 'Local Transport (TZ)' },
                    { key: 'packageSightseeing', label: 'Sightseeing' },
                    { key: 'packageGuidedTour', label: 'Guided Tour' },
                    { key: 'packageInsurance', label: 'Travel Insurance' },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b"
                      style={{ borderColor: 'rgba(193,127,62,0.1)' }}>
                      <span className="text-sm" style={{ color: 'rgba(245,237,224,0.7)', fontFamily: 'var(--font-body)' }}>
                        {label}
                      </span>
                      <Toggle
                        checked={form[key] as boolean}
                        onChange={v => set(key, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Cash', 'Credit Card', 'Travellers Cheque', 'USD'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => set('paymentMode', opt)}
                      className="py-2 rounded-lg text-xs transition-all duration-200"
                      style={{
                        background: form.paymentMode === opt
                          ? 'linear-gradient(135deg, #c17f3e, #a85f28)'
                          : 'rgba(245, 237, 224, 0.05)',
                        color: form.paymentMode === opt ? '#f5ede0' : 'rgba(245,237,224,0.5)',
                        border: `1px solid ${form.paymentMode === opt ? '#c17f3e' : 'rgba(193,127,62,0.2)'}`,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-xl"
                style={{ background: 'rgba(193,127,62,0.08)', border: '1px solid rgba(193,127,62,0.2)' }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: '#f5ede0', fontFamily: 'var(--font-body)' }}>
                    First visit to Tanzania?
                  </div>
                  <div className="text-xs opacity-40 mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: '#f5ede0' }}>
                    First-timers spend ~12% more on avg
                  </div>
                </div>
                <Toggle checked={form.firstTrip} onChange={v => set('firstTrip', v)} />
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: 'rgba(245,237,224,0.05)',
                color: 'rgba(245,237,224,0.6)',
                border: '1px solid rgba(193,127,62,0.2)',
                fontFamily: 'var(--font-body)',
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #c17f3e 0%, #a85f28 100%)',
              color: '#f5ede0',
              boxShadow: '0 4px 20px rgba(193, 127, 62, 0.3)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {step === STEPS.length - 1 ? 'Get My Estimate →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
