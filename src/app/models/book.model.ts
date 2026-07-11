export type BookType = 'Textbook' | 'Notes' | 'Study Guide';

export type BookCondition = 'Like New' | 'Good' | 'Fair' | 'Acceptable';

export interface Seller {
  id: string;
  name: string;
  initials: string;
  university: string;
  rating: number;
  totalSales: number;
  responseTime: string;
  responseRate: string;
  memberSince: string;
}

export interface BookListing {
  id: string;
  title: string;
  author: string;
  subject: string;
  type: BookType;
  condition: BookCondition;
  description: string;
  price: number;
  originalPrice: number;
  edition?: string;
  isbn?: string;
  imageUrl: string;
  postedDate: string;
  savingsPercent?: number;
  status?: 'ACTIVE' | 'SOLD' | 'DRAFT';
  viewCount?: number;
  seller: Seller;
}
