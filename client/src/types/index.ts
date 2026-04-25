export type User = {
  _id: string;
  name: string;
  email: string;
  role: "guest" | "host" | "admin";
  phone?: string;
  bio?: string;
  avatar?: string;
  social?: { twitter?: string; instagram?: string; linkedin?: string };
  locationCity?: string;
  preferences?: { maxPrice: number; propertyTypes: string[] };
  /** Simulated wallet balance in USD (demo) */
  walletBalance?: number;
  createdAt?: string;
};

export type Property = {
  _id: string;
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  country: string;
  location: { lat: number; lng: number };
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  isActive?: boolean;
  host?: User | { name: string; avatar?: string; _id: string; bio?: string; social?: User["social"] };
};

export type Booking = {
  _id: string;
  property: Property | string;
  guest: User | string;
  host: User | string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: string;
  mockPayReference?: string;
  notes?: string;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  author: User;
  published: boolean;
  views: number;
  createdAt: string;
};

export type Notification = {
  _id: string;
  message: string;
  read: boolean;
  type: string;
  link: string;
  createdAt: string;
};

export type TransactionRow = {
  _id: string;
  kind: "debit" | "credit";
  amount: number;
  label: string;
  category: string;
  createdAt: string;
};
