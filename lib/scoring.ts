// ============================================================
// lib/scoring.ts
// Scholarship priority scoring algorithm.
//
// Scores applications 0-100 based on:
// - Annual family income (lower = higher priority)
// - Amount requested relative to income
// - Completeness of application (address provided, reason length)
//
// This is a transparent, auditable algorithm that helps admins
// prioritize applications but does NOT make automated decisions.
// Final decisions are always made by human admins.
// ============================================================

interface ScoringInput {
  income: number;
  amount_requested: number;
  reason: string;
  address?: string | null;
}

interface ScoringResult {
  score: number;              // 0-100
  breakdown: {
    income_score: number;     // 0-50
    need_score: number;       // 0-30
    completeness_score: number; // 0-20
  };
  priority: 'high' | 'medium' | 'low';
  notes: string[];
}

export function computeApplicationScore(input: ScoringInput): ScoringResult {
  const notes: string[] = [];

  // ---- 1. Income Score (0-50 points) ----
  // Lower income = higher score. Thresholds in local currency (INR/USD adaptable).
  // Assumes values in INR. Adjust INCOME_TIERS for your currency.
  const INCOME_TIERS = [
    { max: 100_000, points: 50 },    // < 1 Lakh: maximum need
    { max: 200_000, points: 42 },    // 1-2 Lakh
    { max: 300_000, points: 34 },    // 2-3 Lakh
    { max: 500_000, points: 25 },    // 3-5 Lakh
    { max: 800_000, points: 15 },    // 5-8 Lakh
    { max: 1_200_000, points: 8 },   // 8-12 Lakh
    { max: Infinity, points: 2 },    // > 12 Lakh
  ];

  const incomeTier = INCOME_TIERS.find((tier) => input.income <= tier.max)!;
  const income_score = incomeTier.points;
  
  if (input.income < 100_000) {
    notes.push('Extremely low income - high priority candidate');
  }

  // ---- 2. Need Score (0-30 points) ----
  // Amount requested relative to income indicates genuine need.
  // Higher ratio (need > income) = higher need score.
  const ratio = input.income > 0 ? input.amount_requested / input.income : 1;
  let need_score = 0;
  
  if (ratio >= 1.0) need_score = 30;        // Requesting more than annual income
  else if (ratio >= 0.5) need_score = 24;   // Requesting > 50% of income
  else if (ratio >= 0.25) need_score = 18;  // Requesting > 25% of income
  else if (ratio >= 0.1) need_score = 12;   // Requesting > 10% of income
  else need_score = 5;                       // Requesting < 10% of income

  if (ratio >= 0.5) {
    notes.push('Scholarship amount represents significant portion of family income');
  }

  // ---- 3. Completeness Score (0-20 points) ----
  let completeness_score = 0;
  
  // Address provided: +5
  if (input.address && input.address.length > 10) {
    completeness_score += 5;
  }
  
  // Reason quality (length as proxy): up to +15
  const reasonLength = input.reason.trim().length;
  if (reasonLength >= 500) {
    completeness_score += 15;
    notes.push('Detailed application reason provided');
  } else if (reasonLength >= 200) {
    completeness_score += 10;
  } else if (reasonLength >= 100) {
    completeness_score += 6;
  } else {
    completeness_score += 2;
  }

  const score = income_score + need_score + completeness_score;

  const priority: ScoringResult['priority'] =
    score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  return {
    score,
    breakdown: { income_score, need_score, completeness_score },
    priority,
    notes,
  };
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}
