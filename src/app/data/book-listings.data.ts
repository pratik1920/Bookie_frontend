import { BookListing, BookType, Seller } from '../models/book.model';

export const SELLERS: Seller[] = [
  {
    id: 's1',
    name: 'Ava Thompson',
    initials: 'AT',
    university: 'UC Berkeley',
    rating: 4.9,
    totalSales: 32,
    responseTime: 'Under 1 hour',
    responseRate: '98%',
    memberSince: '2023'
  },
  {
    id: 's2',
    name: 'Jordan Patel',
    initials: 'JP',
    university: 'MIT',
    rating: 4.8,
    totalSales: 21,
    responseTime: 'Under 2 hours',
    responseRate: '95%',
    memberSince: '2022'
  },
  {
    id: 's3',
    name: 'Miguel Rivera',
    initials: 'MR',
    university: 'UCLA',
    rating: 4.7,
    totalSales: 18,
    responseTime: 'Within 4 hours',
    responseRate: '92%',
    memberSince: '2024'
  },
  {
    id: 's4',
    name: 'Emily Chen',
    initials: 'EC',
    university: 'Stanford University',
    rating: 5,
    totalSales: 40,
    responseTime: 'Under 1 hour',
    responseRate: '99%',
    memberSince: '2021'
  }
];

function sellerById(id: string): Seller {
  return SELLERS.find((seller) => seller.id === id) ?? SELLERS[0];
}

export const BOOK_LISTINGS: BookListing[] = [
  {
    id: 'b1',
    title: 'Calculus: Early Transcendentals',
    author: 'James Stewart',
    subject: 'Mathematics',
    type: 'Textbook',
    condition: 'Fair',
    description:
      'Great for Calculus I and II. A few highlighted sections in chapters 3 and 5, but otherwise very usable.',
    price: 60,
    originalPrice: 180,
    edition: '8th Edition',
    isbn: '978-1285741550',
    imageUrl:
      'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=1200&q=80',
    postedDate: '2026-06-10',
    seller: sellerById('s1')
  },
  {
    id: 'b2',
    title: 'Psychology Study Guide - Midterm & Final',
    author: 'Study Materials',
    subject: 'Study Notes',
    type: 'Study Guide',
    condition: 'Like New',
    description:
      'Concise and high-yield notes covering intro psych topics with practice questions and memory tricks.',
    price: 15,
    originalPrice: 45,
    imageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    postedDate: '2026-06-11',
    seller: sellerById('s2')
  },
  {
    id: 'b3',
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest, Stein',
    subject: 'Computer Science',
    type: 'Textbook',
    condition: 'Good',
    description:
      'CLRS 4th edition. Minimal markings, includes protective cover. Perfect for DS&A courses.',
    price: 72,
    originalPrice: 120,
    edition: '4th Edition',
    isbn: '978-0262046305',
    imageUrl:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    postedDate: '2026-06-09',
    seller: sellerById('s4')
  },
  {
    id: 'b4',
    title: 'General Physics Formula Notes',
    author: 'Ava Thompson',
    subject: 'Physics',
    type: 'Notes',
    condition: 'Like New',
    description:
      'Printed formula sheets and solved examples for mechanics, E&M, and waves. Easy exam revision format.',
    price: 18,
    originalPrice: 55,
    imageUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    postedDate: '2026-06-12',
    seller: sellerById('s1')
  },
  {
    id: 'b5',
    title: 'Campbell Biology',
    author: 'Urry et al.',
    subject: 'Biology',
    type: 'Textbook',
    condition: 'Good',
    description:
      'Complete textbook with all chapters intact. Some pencil notes in chapter summaries only.',
    price: 68,
    originalPrice: 165,
    edition: '12th Edition',
    isbn: '978-0135188743',
    imageUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    postedDate: '2026-06-08',
    seller: sellerById('s3')
  },
  {
    id: 'b6',
    title: 'Principles of Microeconomics',
    author: 'N. Gregory Mankiw',
    subject: 'Business',
    type: 'Textbook',
    condition: 'Acceptable',
    description:
      'Older copy with visible wear but fully readable. Best for budget buyers taking intro econ.',
    price: 25,
    originalPrice: 95,
    edition: '9th Edition',
    isbn: '978-0357133484',
    imageUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    postedDate: '2026-06-07',
    seller: sellerById('s2')
  },
  {
    id: 'b7',
    title: 'Discrete Math Quick Notes',
    author: 'Emily Chen',
    subject: 'Mathematics',
    type: 'Notes',
    condition: 'Like New',
    description:
      'Clean typed notes with truth tables, induction templates, and combinatorics cheat sheets.',
    price: 20,
    originalPrice: 50,
    imageUrl:
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80',
    postedDate: '2026-06-12',
    seller: sellerById('s4')
  },
  {
    id: 'b8',
    title: 'Organic Chemistry I Study Guide',
    author: 'Jordan Patel',
    subject: 'Study Notes',
    type: 'Study Guide',
    condition: 'Good',
    description:
      'Reaction map summaries, mechanism walkthroughs, and practice prompt answers from tutoring sessions.',
    price: 22,
    originalPrice: 70,
    imageUrl:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80',
    postedDate: '2026-06-06',
    seller: sellerById('s2')
  }
];

export const SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Study Notes',
  'Physics',
  'Biology',
  'Business'
] as const;

export const BOOK_TYPES: BookType[] = ['Textbook', 'Notes', 'Study Guide'];
