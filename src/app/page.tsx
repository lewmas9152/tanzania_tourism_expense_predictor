'use client'

import { useState } from 'react'
import HeroSection from '@/components/HeroSection'
import PredictorForm from '@/components/PredictorForm'
import ResultsPanel from '@/components/ResultsPanel'
import type { TourismInput, PredictionResult } from '@/lib/predictor'
import { predict } from '@/lib/predictor'

export default function Home() {
  const [stage, setStage] = useState<'hero' | 'form' | 'results'>('hero')
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [lastInput, setLastInput] = useState<TourismInput | null>(null)

  const handleStart = () => setStage('form')

  const handleSubmit = (input: TourismInput) => {
    const prediction = predict(input)
    setResult(prediction)
    setLastInput(input)
    setStage('results')
  }

  const handleReset = () => {
    setResult(null)
    setLastInput(null)
    setStage('form')
  }

  return (
    <main className="min-h-screen">
      {stage === 'hero' && <HeroSection onStart={handleStart} />}
      {stage === 'form' && <PredictorForm onSubmit={handleSubmit} />}
      {stage === 'results' && result && lastInput && (
        <ResultsPanel
          result={result}
          input={lastInput}
          onReset={handleReset}
        />
      )}
    </main>
  )
}
