export type UserInfo = {
  income: number;
  maritalStatus: 'single' | 'married';
  provinceId: string;
  category: string;
  housingStatus: 'no_house' | 'small_house';
  previouslyBought: boolean;
};

export type Project = {
  id: number;
  name: string;
  investor: string;
  district: string;
  provinceId: string;
  province: string;
  price: number | null;
  minArea: number | null;
  maxArea: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  totalUnits: number;
  status: string;
  statusType: 'open' | 'upcoming' | 'pending';
  handover: string;
  priority: string;
  targetCategories: string[];
  incomeLimit: number;
  restricted: boolean;
  quality: string;
  notes: string;
  score: number;
  highlight: boolean;
  tag: string | null;
  updatedAt: string;
};

export type Criteria = {
  version: string;
  incomeLimit: { single: number; married: number };
  eligibleCategories: { id: string; label: string }[];
  housingConditions: { id: string; label: string }[];
  provinces: { id: string; label: string }[];
};

export type EligibilityStatus =
  | 'eligible'
  | 'income_exceeded'
  | 'wrong_province'
  | 'wrong_category'
  | 'housing_ineligible'
  | 'previously_bought'
  | 'restricted';

export type ProjectResult = Project & {
  eligibilityStatus: EligibilityStatus;
  ineligibleReasons: string[];
};
