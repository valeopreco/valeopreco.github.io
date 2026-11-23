/** Valores monetários sempre em centavos inteiros. */
export type Cents = number;

export const CATEGORY_SLUGS = [
  'alimentacao',
  'transporte',
  'vestuario',
  'tecnologia',
  'lazer',
  'educacao',
  'casa',
  'saude',
  'servicos',
  'outros',
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type Frequency =
  | { kind: 'once' }
  | { kind: 'daily' }
  | { kind: 'weekdays' }
  | { kind: 'weekly'; times: number }
  | { kind: 'monthly'; times: number };

export interface EvaluationInput {
  description?: string;
  priceCents: Cents;
  categorySlug?: CategorySlug;
  frequency?: Frequency;
  estimatedUses?: number;
}

export interface FinancialProfile {
  netIncomeCents: Cents;
  monthlyHours: number;
  /** Opcional: permite expressar o tempo também em dias de trabalho. */
  workDaysPerMonth?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetCents: Cents;
  currentCents?: Cents;
  active: boolean;
}

export interface PriceReference {
  id: string;
  /** Forma singular e plural, para frases como "1 livro" / "5 livros". */
  singular: string;
  plural: string;
  categorySlug: CategorySlug;
  priceCents: Cents;
  source: string;
  /** Data ISO (AAAA-MM-DD) da última atualização do preço. */
  updatedAt: string;
  universal: boolean;
  estimated: boolean;
  active: boolean;
}

export interface EvaluationContext {
  financial?: FinancialProfile;
  goals?: Goal[];
  references?: PriceReference[];
}

export type MissingReason =
  | 'financial-profile'
  | 'no-matching-reference'
  | 'no-frequency'
  | 'one-time-purchase'
  | 'no-estimated-uses'
  | 'no-active-goal';

export type Block<T> = { available: true; data: T } | { available: false; missing: MissingReason };

export interface WorkTimeData {
  hourlyRateCents: Cents;
  hours: number;
  label: string;
  /** Presente apenas quando o usuário informou dias trabalhados por mês. */
  daysLabel?: string;
}

export interface EquivalenceItem {
  refId: string;
  quantity: number;
  label: string;
  unitPriceCents: Cents;
  source: string;
  updatedAt: string;
  estimated: boolean;
}

export interface RecurrenceData {
  occurrencesPerYear: number;
  monthlyAverageCents: Cents;
  yearlyCents: Cents;
  frequencyLabel: string;
}

export interface CostPerUseData {
  cents: Cents;
  uses: number;
  estimated: true;
}

export interface GoalComparison {
  goalId: string;
  name: string;
  targetCents: Cents;
  pctOfTarget: number;
  /** % do valor que ainda falta para a meta, quando há valor atual informado. */
  pctOfRemaining?: number;
}

export interface EvaluationResult {
  engineVersion: string;
  priceCents: Cents;
  workTime: Block<WorkTimeData>;
  equivalences: Block<{ items: EquivalenceItem[] }>;
  recurrence: Block<RecurrenceData>;
  costPerUse: Block<CostPerUseData>;
  goals: Block<{ items: GoalComparison[] }>;
}
