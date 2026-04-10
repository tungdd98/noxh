export type Project = {
  id: number;
  title: string;
  address: string | null;
  capacity: string | null;
  status: string | null;
  owner: string | null;
  url: string | null;
  imageUrl: string | null;
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
