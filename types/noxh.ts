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
};

export type UserInfo = {
  income: number;
  maritalStatus: 'single' | 'married';
  provinceId: string;
  category: string;
  housingStatus: 'no_house' | 'small_house';
  previouslyBought: boolean;
};
