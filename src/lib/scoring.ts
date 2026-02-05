import type { PriceDropSeverity, UrgencyLabel } from './constants';

// Districts far from Freetown (Western Area)
const REMOTE_DISTRICTS = [
  'Kailahun',
  'Kono',
  'Falaba',
  'Karene',
  'Pujehun',
  'Bonthe',
];

interface SignalData {
  harvestDeadlineDays: number;
  quantity: number;
  unit: string;
  priceDropSeverity: PriceDropSeverity;
  district: string;
  produceType: string;
}

export function calculateScore(signal: SignalData): number {
  let score = 0;

  // Harvest deadline scoring
  if (signal.harvestDeadlineDays <= 2) {
    score += 40;
  } else if (signal.harvestDeadlineDays <= 5) {
    score += 25;
  } else if (signal.harvestDeadlineDays <= 7) {
    score += 10;
  }

  // Quantity scoring (normalize to kg for comparison)
  const quantityInKg = normalizeToKg(signal.quantity, signal.unit);
  if (quantityInKg >= 5000) {
    score += 15;
  } else if (quantityInKg >= 1000) {
    score += 8;
  }

  // Price drop severity scoring
  if (signal.priceDropSeverity === 'high') {
    score += 25;
  } else if (signal.priceDropSeverity === 'medium') {
    score += 12;
  }

  // Location scoring
  if (REMOTE_DISTRICTS.includes(signal.district)) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function getUrgencyLabel(score: number): UrgencyLabel {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function getRecommendedAction(
  score: number,
  produceType: string,
  district: string,
  priceDropSeverity: PriceDropSeverity
): string {
  const urgency = getUrgencyLabel(score);

  if (urgency === 'High') {
    if (priceDropSeverity === 'high') {
      return `URGENT: Call ${district} wholesalers + supermarkets today for ${produceType}`;
    }
    return `Priority: Send bulk offer to exporters and restaurant chains for ${produceType}`;
  }

  if (urgency === 'Medium') {
    if (REMOTE_DISTRICTS.includes(district)) {
      return `Route ${produceType} to NGO food programs in ${district} area`;
    }
    return `Target local restaurant bulk buyers for ${produceType} in ${district}`;
  }

  return `Monitor ${produceType} pricing in ${district} - schedule follow-up in 2-3 days`;
}

function normalizeToKg(quantity: number, unit: string): number {
  switch (unit) {
    case 'tons':
      return quantity * 1000;
    case 'bags':
      return quantity * 50; // Assume 50kg bags
    case 'crates':
      return quantity * 20; // Assume 20kg crates
    default:
      return quantity;
  }
}

export function getScoreBreakdown(signal: SignalData): {
  category: string;
  points: number;
  reason: string;
}[] {
  const breakdown: { category: string; points: number; reason: string }[] = [];

  // Harvest deadline
  if (signal.harvestDeadlineDays <= 2) {
    breakdown.push({
      category: 'Harvest Deadline',
      points: 40,
      reason: 'Critical: ≤2 days until spoilage',
    });
  } else if (signal.harvestDeadlineDays <= 5) {
    breakdown.push({
      category: 'Harvest Deadline',
      points: 25,
      reason: 'Urgent: ≤5 days until spoilage',
    });
  } else if (signal.harvestDeadlineDays <= 7) {
    breakdown.push({
      category: 'Harvest Deadline',
      points: 10,
      reason: 'Moderate: ≤7 days until spoilage',
    });
  }

  // Quantity
  const quantityInKg = normalizeToKg(signal.quantity, signal.unit);
  if (quantityInKg >= 5000) {
    breakdown.push({
      category: 'Quantity',
      points: 15,
      reason: 'Large volume: 5+ tons',
    });
  } else if (quantityInKg >= 1000) {
    breakdown.push({
      category: 'Quantity',
      points: 8,
      reason: 'Medium volume: 1+ tons',
    });
  }

  // Price drop
  if (signal.priceDropSeverity === 'high') {
    breakdown.push({
      category: 'Price Drop',
      points: 25,
      reason: 'High price drop severity',
    });
  } else if (signal.priceDropSeverity === 'medium') {
    breakdown.push({
      category: 'Price Drop',
      points: 12,
      reason: 'Medium price drop severity',
    });
  }

  // Location
  if (REMOTE_DISTRICTS.includes(signal.district)) {
    breakdown.push({
      category: 'Location',
      points: 10,
      reason: `Remote district: ${signal.district}`,
    });
  }

  return breakdown;
}
