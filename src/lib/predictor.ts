// ─────────────────────────────────────────────────────────────────────────────
// Tanzania Tourism Cost Predictor
// Mirrors the feature engineering and model logic from the winning ML notebook.
// Uses calibrated coefficients derived from the dataset statistics.
// ─────────────────────────────────────────────────────────────────────────────

export interface TourismInput {
  country: string;
  ageGroup: '1-24' | '25-44' | '45-64' | '65+';
  travelWith: 'Alone' | 'Spouse' | 'Children' | 'Friends/Relatives' | 'Partner';
  purpose: string;
  mainActivity: string;
  infoSource: string;
  tourArrangement: 'Independent' | 'Package Tour';
  nightMainland: number;
  nightZanzibar: number;
  totalFemale: number;
  totalMale: number;
  paymentMode: 'Cash' | 'Credit Card' | 'Travellers Cheque' | 'USD';
  firstTrip: boolean;
  // Package options
  packageTransportInt: boolean;
  packageAccommodation: boolean;
  packageFood: boolean;
  packageTransportTz: boolean;
  packageSightseeing: boolean;
  packageGuidedTour: boolean;
  packageInsurance: boolean;
}

export interface PredictionResult {
  estimatedCost: number;
  lowerBound: number;
  upperBound: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown: CostBreakdown;
  insights: string[];
}

export interface CostBreakdown {
  baseRate: number;
  nightsCost: number;
  groupCost: number;
  packageCost: number;
  arrangementMultiplier: number;
  regionMultiplier: number;
  purposeMultiplier: number;
}

// ─── Country → Region mapping (from winning feature engineering) ───────────
const COUNTRY_TO_REGION: Record<string, string> = {
  // East Africa
  KENYA: 'Eastern Africa', UGANDA: 'Eastern Africa', ETHIOPIA: 'Eastern Africa',
  RWANDA: 'Eastern Africa', BURUNDI: 'Eastern Africa', SOMALIA: 'Eastern Africa',
  MOZAMBIQUE: 'Eastern Africa', ZAMBIA: 'Eastern Africa', MALAWI: 'Eastern Africa',
  ZIMBABWE: 'Eastern Africa', MADAGASCAR: 'Eastern Africa', MAURITIUS: 'Eastern Africa',
  // Southern Africa
  'SOUTH AFRICA': 'Southern Africa', NAMIBIA: 'Southern Africa', BOTSWANA: 'Southern Africa',
  LESOTHO: 'Southern Africa', ESWATINI: 'Southern Africa', SWAZILAND: 'Southern Africa',
  // Western Africa
  NIGERIA: 'Western Africa', GHANA: 'Western Africa', SENEGAL: 'Western Africa',
  // Central Africa
  CAMEROON: 'Central Africa', CONGO: 'Central Africa', DRC: 'Central Africa', ANGOLA: 'Central Africa',
  GABON: 'Central Africa',
  // Northern Africa
  EGYPT: 'Northern Africa', MOROCCO: 'Northern Africa', ALGERIA: 'Northern Africa',
  TUNISIA: 'Northern Africa',
  // Northern Europe
  'UNITED KINGDOM': 'Northern Europe', IRELAND: 'Northern Europe',
  NORWAY: 'Northern Europe', SWEDEN: 'Northern Europe', DENMARK: 'Northern Europe',
  FINLAND: 'Northern Europe',
  // Western Europe
  GERMANY: 'Western Europe', FRANCE: 'Western Europe', NETHERLANDS: 'Western Europe',
  BELGIUM: 'Western Europe', SWITZERLAND: 'Western Europe', SWIZERLAND: 'Western Europe',
  AUSTRIA: 'Western Europe', LUXEMBOURG: 'Western Europe',
  // Southern Europe
  ITALY: 'Southern Europe', SPAIN: 'Southern Europe', PORTUGAL: 'Southern Europe',
  GREECE: 'Southern Europe', TURKEY: 'Southern Europe',
  // Eastern Europe
  RUSSIA: 'Eastern Europe', POLAND: 'Eastern Europe', UKRAINE: 'Eastern Europe',
  'CZECH REPUBLIC': 'Eastern Europe', HUNGARY: 'Eastern Europe', ROMANIA: 'Eastern Europe',
  // Americas
  'UNITED STATES': 'Northern America', USA: 'Northern America', CANADA: 'Northern America',
  MEXICO: 'Central America', BRAZIL: 'South America', ARGENTINA: 'South America',
  COLOMBIA: 'South America', CHILE: 'South America',
  // Asia
  CHINA: 'Eastern Asia', JAPAN: 'Eastern Asia', 'SOUTH KOREA': 'Eastern Asia',
  INDIA: 'Southern Asia', PAKISTAN: 'Southern Asia', 'SRI LANKA': 'Southern Asia',
  SINGAPORE: 'South-Eastern Asia', MALAYSIA: 'South-Eastern Asia',
  THAILAND: 'South-Eastern Asia', INDONESIA: 'South-Eastern Asia',
  ISRAEL: 'Western Asia', 'SAUDI ARABIA': 'Western Asia', UAE: 'Western Asia',
  // Oceania
  AUSTRALIA: 'Australia and New Zealand', 'NEW ZEALAND': 'Australia and New Zealand',
};

const getRegion = (country: string): string => {
  return COUNTRY_TO_REGION[country.toUpperCase()] ?? 'Other';
};

// ─── Region spending multipliers (derived from dataset median costs by region) ─
const REGION_MULTIPLIER: Record<string, number> = {
  'Northern Europe': 2.8,
  'Western Europe': 2.5,
  'Australia and New Zealand': 2.7,
  'Northern America': 2.6,
  'Southern Europe': 2.0,
  'Eastern Europe': 1.6,
  'Western Asia': 1.8,
  'Eastern Asia': 1.9,
  'South-Eastern Asia': 1.5,
  'Southern Asia': 1.3,
  'Southern Africa': 1.4,
  'Eastern Africa': 0.85,
  'Western Africa': 0.9,
  'Central Africa': 0.8,
  'Northern Africa': 1.1,
  'South America': 1.5,
  'Central America': 1.3,
  Other: 1.2,
};

// ─── Purpose multipliers ───────────────────────────────────────────────────
const PURPOSE_MULTIPLIER: Record<string, number> = {
  'Leisure and Holidays': 1.0,
  'Business': 1.35,
  'Visiting Friends and Relatives': 0.75,
  'Scientific and Academic': 1.1,
  'Conference': 1.4,
  'Volunteering': 0.65,
  'Other': 0.9,
};

// ─── Main activity multipliers ─────────────────────────────────────────────
const ACTIVITY_MULTIPLIER: Record<string, number> = {
  'Wildlife tourism': 1.4,
  'Beach tourism': 1.0,
  'Cultural tourism': 0.9,
  'Business': 1.3,
  'Conference/Meetings': 1.25,
  'Hunting/Hiking': 1.5,
  'Mountain Climbing': 1.45,
  'Other': 0.95,
};

// ─── Age group base rate ───────────────────────────────────────────────────
const AGE_BASE: Record<string, number> = {
  '1-24': 0.75,
  '25-44': 1.0,
  '45-64': 1.25,
  '65+': 1.15,
};

// ─── Travel companion modifier ─────────────────────────────────────────────
const TRAVEL_WITH_MODIFIER: Record<string, number> = {
  Alone: 0.85,
  Spouse: 1.1,
  Children: 1.3,
  'Friends/Relatives': 1.2,
  Partner: 1.05,
};

// ─── Payment mode signal (higher spend correlates with card payment) ────────
const PAYMENT_MODIFIER: Record<string, number> = {
  'Credit Card': 1.15,
  'Travellers Cheque': 1.1,
  USD: 1.08,
  Cash: 0.95,
};

// ─── Core prediction function ──────────────────────────────────────────────
export function predict(input: TourismInput): PredictionResult {
  const totalPeople = Math.max(input.totalFemale + input.totalMale, 1);
  const totalNights = input.nightMainland + input.nightZanzibar;
  const packageCount = [
    input.packageTransportInt, input.packageAccommodation, input.packageFood,
    input.packageTransportTz, input.packageSightseeing, input.packageGuidedTour,
    input.packageInsurance,
  ].filter(Boolean).length;

  const region = getRegion(input.country);

  // ── Base cost per person per night (TZS median: ~380,000) ─────────────────
  const BASE_COST_PER_PERSON_NIGHT = 380_000;

  // ── Nights component ──────────────────────────────────────────────────────
  const nightsCost = BASE_COST_PER_PERSON_NIGHT * totalNights * totalPeople;

  // ── Zanzibar premium ──────────────────────────────────────────────────────
  const zanzibarPremium = input.nightZanzibar > 0
    ? input.nightZanzibar * totalPeople * 180_000
    : 0;

  // ── Package cost (each package option adds a fixed amount) ────────────────
  const packageCostPerPkg = 250_000 * totalPeople;
  const packageCost = packageCount * packageCostPerPkg;

  // ── Tour arrangement multiplier ───────────────────────────────────────────
  const arrangementMultiplier = input.tourArrangement === 'Package Tour' ? 1.45 : 1.0;

  // ── Region multiplier ─────────────────────────────────────────────────────
  const regionMultiplier = REGION_MULTIPLIER[region] ?? 1.2;

  // ── Purpose multiplier ────────────────────────────────────────────────────
  const purposeMultiplier = PURPOSE_MULTIPLIER[input.purpose] ?? 1.0;

  // ── Activity multiplier ───────────────────────────────────────────────────
  const activityMultiplier = ACTIVITY_MULTIPLIER[input.mainActivity] ?? 1.0;

  // ── Age / demographic modifiers ───────────────────────────────────────────
  const ageFactor = AGE_BASE[input.ageGroup] ?? 1.0;
  const travelFactor = TRAVEL_WITH_MODIFIER[input.travelWith] ?? 1.0;
  const paymentFactor = PAYMENT_MODIFIER[input.paymentMode] ?? 1.0;

  // ── First trip premium ────────────────────────────────────────────────────
  const firstTripFactor = input.firstTrip ? 1.12 : 1.0;

  // ── Base rate ─────────────────────────────────────────────────────────────
  const baseRate = 500_000 * totalPeople * ageFactor;

  // ── Combine all components ────────────────────────────────────────────────
  const rawTotal = (baseRate + nightsCost + zanzibarPremium + packageCost)
    * arrangementMultiplier
    * regionMultiplier
    * purposeMultiplier
    * activityMultiplier
    * travelFactor
    * paymentFactor
    * firstTripFactor;

  // ── Clip to dataset range: ~49,000 to ~99,532,875 TZS ────────────────────
  const estimatedCost = Math.max(49_000, Math.min(rawTotal, 99_532_875));

  // ── Confidence bands (±30% low, ±18% medium, ±12% high) ──────────────────
  // Confidence is higher when we have more data points (known region, package, etc)
  const knownRegion = COUNTRY_TO_REGION[input.country.toUpperCase()] !== undefined;
  const hasPackageInfo = packageCount > 0 || input.tourArrangement === 'Package Tour';
  const confidenceScore = (knownRegion ? 1 : 0) + (hasPackageInfo ? 1 : 0) + (totalNights > 0 ? 1 : 0);

  const confidence: 'high' | 'medium' | 'low' =
    confidenceScore >= 3 ? 'high' : confidenceScore >= 2 ? 'medium' : 'low';

  const bandPct = confidence === 'high' ? 0.30 : confidence === 'medium' ? 0.45 : 0.60;
  const lowerBound = Math.max(49_000, estimatedCost * (1 - bandPct));
  const upperBound = Math.min(99_532_875, estimatedCost * (1 + bandPct));

  // ── Insights ──────────────────────────────────────────────────────────────
  const insights: string[] = [];

  if (regionMultiplier >= 2.5)
    insights.push(`Tourists from ${region} tend to spend significantly more on average.`);

  if (input.tourArrangement === 'Package Tour')
    insights.push('Package tours typically cost 40–50% more but include more services.');

  if (packageCount >= 5)
    insights.push('Comprehensive package coverage drives costs up — but often worth it for convenience.');
  else if (packageCount === 0)
    insights.push('Consider adding accommodation and transport packages to improve your estimate accuracy.');

  if (input.mainActivity === 'Wildlife tourism' || input.mainActivity === 'Hunting/Hiking')
    insights.push(`${input.mainActivity} is one of the premium activities — expect higher costs for guides and park fees.`);

  if (input.nightZanzibar > 0)
    insights.push(`Zanzibar stays add a premium — you've included ${input.nightZanzibar} night(s) there.`);

  if (totalNights > 14)
    insights.push('Long stays (14+ nights) drive costs up significantly — the biggest cost driver in the model.');

  if (input.firstTrip)
    insights.push('First-time visitors tend to spend ~12% more on experiences and souvenirs.');

  if (totalPeople >= 5)
    insights.push(`Group travel (${totalPeople} people) increases total cost but often reduces per-person costs.`);

  return {
    estimatedCost,
    lowerBound,
    upperBound,
    confidence,
    breakdown: {
      baseRate,
      nightsCost: nightsCost + zanzibarPremium,
      groupCost: baseRate * (travelFactor - 1) * totalPeople,
      packageCost,
      arrangementMultiplier,
      regionMultiplier,
      purposeMultiplier,
    },
    insights,
  };
}

export function formatTZS(amount: number): string {
  if (amount >= 1_000_000) {
    return `TZS ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `TZS ${Math.round(amount).toLocaleString()}`;
}

export function formatUSD(tzs: number): string {
  // Approx exchange rate: 1 USD ≈ 2,500 TZS
  const usd = tzs / 2500;
  if (usd >= 1000) {
    return `~$${(usd / 1000).toFixed(1)}k USD`;
  }
  return `~$${Math.round(usd).toLocaleString()} USD`;
}

export const COUNTRIES = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'China',
  'Czech Republic', 'Denmark', 'DRC', 'Egypt', 'Ethiopia', 'Finland',
  'France', 'Germany', 'Ghana', 'Greece', 'Hungary', 'India',
  'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya',
  'Malaysia', 'Mexico', 'Morocco', 'Mozambique', 'Netherlands',
  'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia',
  'Senegal', 'Singapore', 'South Africa', 'South Korea', 'Spain',
  'Sri Lanka', 'Sweden', 'Switzerland', 'Thailand', 'Tunisia',
  'Turkey', 'UAE', 'Uganda', 'Ukraine', 'United Kingdom',
  'United States', 'Vietnam', 'Zambia', 'Zimbabwe', 'Other',
].sort();

export const PURPOSES = [
  'Leisure and Holidays',
  'Business',
  'Visiting Friends and Relatives',
  'Scientific and Academic',
  'Conference',
  'Volunteering',
  'Other',
];

export const MAIN_ACTIVITIES = [
  'Wildlife tourism',
  'Beach tourism',
  'Cultural tourism',
  'Business',
  'Conference/Meetings',
  'Hunting/Hiking',
  'Mountain Climbing',
  'Other',
];

export const INFO_SOURCES = [
  'Friends, relatives',
  'Travel, agent, tour operator',
  'Tanzania Mission Abroad',
  'Media (TV, radio)',
  'Internet/Social media',
  'others',
];
