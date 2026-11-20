export type SubscriptionDuration = '1_week' | '1_month' | '1_year';

export interface SubscriptionTier {
  id: SubscriptionDuration;
  name: string;
  durationLabel: string;
  price: number;
  maxSlots: number;
  claimedSlots: number;
  perks: string[];
  recommended?: boolean;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  caption: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  tag?: string;
  isCustom?: boolean;
}

export interface ModuleFeature {
  title: string;
  desc: string;
}

export interface SystemRequirement {
  label: string;
  value: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  items: string[];
}

export interface ModuleItem {
  id: string;
  name: string;
  game: string;
  tagline: string;
  description: string;
  version: string;
  status: 'Operational' | 'Testing' | 'Updating' | 'Detected';
  coverImage: string;
  tiers: Record<SubscriptionDuration, SubscriptionTier>;
  media: MediaItem[];
  features: ModuleFeature[];
  requirements: SystemRequirement[];
  changelog: ChangelogEntry[];
  createdAt: number;
}

export interface OrderRecord {
  id: string;
  moduleId: string;
  moduleName: string;
  tierId: SubscriptionDuration;
  tierName: string;
  price: number;
  licenseKey: string;
  customerHandle: string;
  email: string;
  paymentMethod: 'card' | 'crypto' | 'instant';
  purchasedAt: number;
  expiresAt: number;
  status: 'active' | 'expired';
}

export interface WaitlistEntry {
  id: string;
  moduleId: string;
  moduleName: string;
  tierId: SubscriptionDuration;
  email: string;
  createdAt: number;
}

export type UserRole = 'Admin' | 'Member' | 'VIP';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isOwner?: boolean;
  assignedBy?: string;
  assignedAt: number;
}

