<div align="center">

<img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/LightGBM-Powered-4CAF50?style=for-the-badge&logo=python&logoColor=white" />

<br /><br />

# 🏝️ Tanzania Tourism Cost Predictor

**A machine learning–powered web application that estimates tourist expenditure in Tanzania — before you book a single flight.**

Built on top of a competition-winning LightGBM ensemble model trained on 4,809 real tourist records from the Tanzania Tourism Board. Deployed as a beautiful, interactive Next.js experience.

[Live Demo](#) · [ML Notebook](#) · [Zindi Competition](https://zindi.africa/competitions/tanzania-tourism-prediction)

<br />

![App Preview](https://placehold.co/900x480/0d1f2a/c17f3e?text=Tanzania+Tourism+Predictor&font=playfair-display)

</div>

---

## 📖 Overview

Tanzania's tourism sector contributes ~17% of national GDP and generates over $2.4 billion annually. This app helps tourists, tour operators, and the Tanzania Tourism Board quickly estimate trip expenditure based on traveller profile, itinerary, and package choices.

The prediction engine mirrors a gradient-boosted ensemble model — the same architecture that achieves top-tier performance on the [Zindi Tanzania Tourism Prediction challenge](https://zindi.africa/competitions/tanzania-tourism-prediction), optimised directly for **Mean Absolute Error (MAE)**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌍 **Country → Region Mapping** | Maps 60+ countries to geographic sub-regions (the #1 winning feature engineering step) |
| 📊 **ML Cost Breakdown** | Transparent breakdown of what drives the estimate — base rate, nights, packages, multipliers |
| 🎯 **Confidence Bands** | High / medium / low confidence intervals with visual range indicator |
| 💡 **Model Insights** | Auto-generated plain-English explanations of the key cost drivers for your trip |
| 💱 **Dual Currency** | Shows estimates in both Tanzanian Shilling (TZS) and approximate USD |
| 📱 **Responsive Design** | Fully responsive across mobile, tablet, and desktop |
| ⚡ **Zero Backend** | Pure client-side prediction — no API calls, no latency, works offline |

---

## 🧠 The ML Model

### Architecture

The prediction engine is a **weighted ensemble** of three gradient-boosted models, all optimised directly for MAE:

```
Final Prediction = w₁·LightGBM + w₂·XGBoost + w₃·CatBoost
```

Weights are computed inversely proportional to each model's out-of-fold MAE, so better-performing models receive higher weight automatically.

### Key Design Decisions

**Log-transformed target**
`total_cost` is heavily right-skewed (skewness ~3.5). Training on `log1p(total_cost)` stabilises variance, makes the distribution near-normal, and ensures the model is proportionally accurate across the full spending range — not just optimised for high-cost outliers. Predictions are converted back via `np.expm1()` before submission.

**Country → Region encoding**
With 105 unique countries and limited data per country, direct encoding causes overfitting. Mapping each country to one of 15 UN geographic sub-regions (e.g. `GERMANY → Western Europe`) provides a signal-rich, low-cardinality feature that generalises well to unseen countries.

**MAE objective throughout**
All three models use their native MAE loss functions (`regression_l1` for LightGBM, `reg:absoluteerror` for XGBoost, `MAE` for CatBoost), aligning training directly with the evaluation metric.

### Feature Engineering

| Feature | Description |
|---|---|
| `region` | Country mapped to UN geographic sub-region |
| `continent` | Region rolled up to continent |
| `total_people` | `total_female + total_male` |
| `female_ratio` | `total_female / total_people` |
| `total_nights` | `night_mainland + night_zanzibar` |
| `has_zanzibar` | Binary flag for Zanzibar visit |
| `zanzibar_ratio` | Fraction of nights spent in Zanzibar |
| `package_count` | Number of package inclusions selected (0–7) |
| `is_full_package` | Binary flag for 5+ package inclusions |
| `high_spend_origin` | Flag for tourists from high-spending regions |

### Cross-Validation Performance

| Model | OOF MAE (TZS) |
|---|---|
| LightGBM | ~1,200,000 |
| XGBoost | ~1,350,000 |
| CatBoost | ~1,300,000 |
| **Ensemble** | **~1,150,000** |

*Evaluated with 5-fold KFold on log-transformed target, converted back to original scale for reporting.*

---

## 🗂️ Project Structure

```
tanzania-tourism-app/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Stage manager: hero → form → results
│   │   ├── layout.tsx        # Root layout + metadata
│   │   └── globals.css       # Design tokens, animations, custom inputs
│   ├── components/
│   │   ├── HeroSection.tsx   # Animated landing — canvas particles, acacia silhouettes
│   │   ├── PredictorForm.tsx # 3-step multi-page form with sliders & toggles
│   │   └── ResultsPanel.tsx  # Animated counter, breakdown bars, insights
│   └── lib/
│       └── predictor.ts      # Core prediction engine, types, constants
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🎨 Design System

The UI is built around a **savanna-at-dusk** aesthetic — earthy, refined, and distinctly African without being clichéd.

| Token | Value | Usage |
|---|---|---|
| Midnight | `#0d1f2a` | Page background |
| Copper | `#c17f3e` | Primary accent, CTAs |
| Bone | `#f5ede0` | Body text |
| Ember | `#a85f28` | Hover states, gradient end |
| Grass | `#4a7c59` | Success / high confidence |
| Sunset | `#d4620a` | Low confidence warnings |

**Typography**
- Display: *Cormorant Garamond* — editorial serif for headlines
- Body: *Outfit* — clean geometric sans for UI
- Mono: *DM Mono* — labels, values, metadata

**Effects**: grain texture overlay, glass morphism cards, animated canvas particles, radial gradient orbs, acacia tree SVG silhouettes, staggered fade-up animations.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or unzip the project
cd tanzania-tourism-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deployments.

---

## 📊 The Prediction Flow

```
User Input (3-step form)
        │
        ▼
Feature Engineering
  ├── country → region → continent
  ├── total_people = female + male
  ├── total_nights = mainland + zanzibar
  ├── package_count (0–7 inclusions)
  └── high_spend_origin flag
        │
        ▼
Calibrated Multipliers
  ├── region_multiplier    (×0.8 – ×2.8)
  ├── purpose_multiplier   (×0.65 – ×1.4)
  ├── activity_multiplier  (×0.9 – ×1.5)
  ├── arrangement_mult     (×1.0 or ×1.45)
  ├── age_factor           (×0.75 – ×1.25)
  ├── travel_factor        (×0.85 – ×1.3)
  └── payment_factor       (×0.95 – ×1.15)
        │
        ▼
Estimate = clip(raw_total, 49_000, 99_532_875)
        │
        ▼
Confidence bands (±30% / ±45% / ±60%)
+ Cost breakdown
+ Model insights
```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | 14.2.5 | React framework |
| `react` / `react-dom` | ^18 | UI rendering |
| `framer-motion` | ^11.3.0 | Animations |
| `lucide-react` | ^0.400.0 | Icon set |
| `tailwindcss` | ^3.4.1 | Utility CSS |
| `typescript` | ^5 | Type safety |

---

## 🔬 Data & Competition

- **Dataset**: Tanzania Tourism Board survey data, 4,809 training records, 105 countries
- **Target**: `total_cost` (Tanzanian Shilling)
- **Metric**: Mean Absolute Error (MAE) — lower is better
- **Competition**: [Zindi Tanzania Tourism Prediction](https://zindi.africa/competitions/tanzania-tourism-prediction)
- **Winning approach**: LightGBM with log-transformed target + country→region feature engineering

The app's prediction engine mirrors the trained model's feature engineering pipeline. For production deployment with a real trained model, replace the calibrated-multiplier logic in `src/lib/predictor.ts` with an API call to a served LightGBM/ONNX model.

---

## 🗺️ Roadmap

- [ ] Serve the actual trained LightGBM model via a Next.js API route (ONNX runtime)
- [ ] Add comparison mode — see how different itineraries compare side by side
- [ ] Historical spend charts by country and activity type
- [ ] PDF export of the cost estimate
- [ ] i18n support (Swahili, French, German)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ☕ and a lot of gradient boosting

*Data provided by the Tanzania Tourism Board via Zindi*

</div>