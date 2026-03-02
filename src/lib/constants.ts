export const PRODUCE_TYPES = [
  'tomato',
  'onion', 
  'rice',
  'cassava',
  'pepper',
  'potato',
  'okra',
] as const;

export const UNITS = ['kg', 'tons', 'bags', 'crates'] as const;

export const PRICE_DROP_SEVERITY = ['low', 'medium', 'high'] as const;

export const OPPORTUNITY_STATUS = ['New', 'Contacted', 'Closed'] as const;

export const URGENCY_LABELS = ['Low', 'Medium', 'High'] as const;

export type ProduceType = typeof PRODUCE_TYPES[number];
export type Unit = typeof UNITS[number];
export type PriceDropSeverity = typeof PRICE_DROP_SEVERITY[number];
export type OpportunityStatus = typeof OPPORTUNITY_STATUS[number];
export type UrgencyLabel = typeof URGENCY_LABELS[number];
