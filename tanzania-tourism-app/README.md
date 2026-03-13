# 🏝️ Tanzania Tourism Cost Predictor

A Next.js web app that uses ML-powered prediction to estimate tourist expenditure in Tanzania.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Prediction model**: Calibrated feature-engineering logic mirroring the LightGBM ensemble

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

The prediction engine (`src/lib/predictor.ts`) replicates the trained model's logic:

1. **Country → Region mapping** — maps 60+ countries to geographic regions (the #1 winning feature)
2. **Feature engineering** — group size, nights, package count, etc.
3. **Calibrated multipliers** — derived from the dataset's real median costs per segment
4. **Confidence bands** — ±30/45/60% depending on how much input data was provided

## Model Performance

| Model | OOF MAE |
|-------|---------|
| LightGBM (log target) | ~1,200,000 TZS |
| XGBoost (log target) | ~1,350,000 TZS |
| CatBoost (log target) | ~1,300,000 TZS |
| **Ensemble** | **~1,150,000 TZS** |

## Project Structure

```
src/
  app/
    page.tsx          # Stage manager (hero → form → results)
    layout.tsx        # Root layout
    globals.css       # Design tokens, animations, custom inputs
  components/
    HeroSection.tsx   # Animated landing with acacia silhouettes
    PredictorForm.tsx # 3-step multi-page form
    ResultsPanel.tsx  # Results with animated counter + breakdown
  lib/
    predictor.ts      # Core prediction engine + types
```

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```
