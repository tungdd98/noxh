export type Project = {
  id: number;
  title: string;
  status: string | null;
  price: string | null;
  handover: string | null;
  address: string | null;
  owner: string | null;
  applyTime: string | null;
  scale: string | null;
  area: string | null;
  density: string | null;
  maintenance: string | null;
  imageUrl: string | null;
  url: string | null;
  scrapedAt: string | null;
  // Scoring fields
  lat: number | null;
  lng: number | null;
  investorTier: 'state' | 'experienced' | 'new' | null;
  targetGroup: string | null; // comma-separated categories, null = open to all
};

export type UserInfo = {
  income: number; // VND/month
  savings: number; // VND — vốn tự có
  workAddress: string; // địa chỉ nơi làm việc
  maritalStatus: 'single' | 'married';
  category: string; // 'income_low' | 'worker' | 'civil_servant'
  housingStatus: 'no_house' | 'small_house';
  previouslyBought: boolean;
};

export type CriteriaWeights = {
  finance: 'high' | 'medium' | 'low' | 'off';
  location: 'high' | 'medium' | 'low' | 'off';
  urgency: 'high' | 'medium' | 'low' | 'off';
  investorReputation: 'high' | 'medium' | 'low' | 'off';
};

export const DEFAULT_CRITERIA_WEIGHTS: CriteriaWeights = {
  finance: 'high',
  location: 'high',
  urgency: 'medium',
  investorReputation: 'medium',
};

export type ScoreBreakdown = {
  finance: number | null; // 0–100, null nếu dữ liệu thiếu
  location: number | null; // 0–100, null nếu thiếu tọa độ
  urgency: number | null; // 0–100
  investorReputation: number | null; // 0–100
  eligible: boolean; // false → tag "Không đủ điều kiện"
};

export type ScoredProject = Project & {
  totalScore: number; // 0–100
  scoreBreakdown: ScoreBreakdown;
  distanceKm: number | null; // khoảng cách đến nơi làm việc
};

export const CATEGORY_OPTIONS = [
  { id: 'income_low', label: 'Người thu nhập thấp đô thị' },
  { id: 'worker', label: 'Công nhân / người lao động' },
  { id: 'civil_servant', label: 'Cán bộ, công chức, viên chức' },
] as const;

export const HOUSING_STATUS_OPTIONS = [
  { id: 'no_house', label: 'Chưa có nhà ở' },
  { id: 'small_house', label: 'Có nhà nhưng diện tích <10m²/người' },
] as const;
