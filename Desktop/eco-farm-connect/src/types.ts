// ========== Core Domain Types ==========

export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  location: string;
  avatar?: string;
  createdAt: string;
}

export interface Farmer extends User {
  role: 'farmer';
  farmName: string;
  cooperativeId?: string;
  mainProducts: string[];
  verificationStatus: VerificationStatus;
  rating: number;
  totalListings: number;
  totalDeals: number;
  bio?: string;
}

export type VerificationStatus = 'unverified' | 'phone' | 'location' | 'admin';

export interface Buyer extends User {
  role: 'buyer';
  businessName?: string;
  savedProducts: string[];
}

// ========== Product Listing Types ==========

export type ProductCategory = 'coffee' | 'pepper' | 'fruit' | 'vegetable' | 'rice' | 'other';

export type Grade = 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Premium';

export type ListingStatus = 'active' | 'draft' | 'pending' | 'sold' | 'out_of_stock';

export interface ProductListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
  harvestDate: string;
  grade: Grade;
  price: number;
  suggestedPrice: number;
  minSafePrice: number;
  competitivePrice: number;
  images: string[];
  description: string;
  location: string;
  deliveryOptions: DeliveryOption[];
  status: ListingStatus;
  views: number;
  inquiries: number;
  createdAt: string;
  packaging?: string;
  availableDate?: string;
  notes?: string;
}

export type DeliveryOption = 'direct' | 'pickup_point' | 'buyer_pickup' | 'batch';

// ========== AI Types ==========

export interface AIAnalysis {
  grade: Grade;
  confidenceScore: number;
  qualityNotes: QualityNote[];
  detectedDefects: string[];
  hasIssue: boolean;
  timestamp: string;
}

export interface QualityNote {
  label: string;
  value: string;
  status: 'good' | 'average' | 'poor';
}

export interface PriceSuggestion {
  recommendedPrice: number;
  minSafePrice: number;
  competitivePrice: number;
  referenceMarketPrice: number;
  qualityAdjustment: number;
  logisticsEstimate: number;
  platformFee: number;
  taxAssumption: number;
  riskBuffer: number;
  desiredProfitMargin: number;
}

// ========== Marketing Types ==========

export interface MarketingContent {
  title: string;
  shortDescription: string;
  detailedDescription: string;
  socialCaption: string;
  hashtags: string[];
  buyerReply: string;
}

export type ContentTone = 'simple' | 'professional' | 'friendly' | 'premium' | 'promotional';

export type Platform = 'facebook' | 'zalo' | 'tiktok' | 'shopee' | 'direct' | 'copy';

// ========== Inquiry Types ==========

export type InquiryStatus = 'new' | 'negotiating' | 'confirmed' | 'completed' | 'failed';

export interface Inquiry {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  listingId: string;
  listingTitle: string;
  requestedQuantity: number;
  proposedPrice?: number;
  deliveryLocation?: string;
  message: string;
  status: InquiryStatus;
  lastMessage: string;
  lastMessageTime: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  isAI: boolean;
  timestamp: string;
}

// ========== Order Types ==========

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string;
  deliveryLocation: string;
  deliveryMethod: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

// ========== Admin Types ==========

export interface AdminStats {
  totalFarmers: number;
  activeBuyers: number;
  activeListings: number;
  newListingsThisWeek: number;
  totalInquiries: number;
  lowConfidenceCases: number;
  pendingApprovals: number;
  complaints: number;
}

export interface AIAccuracyData {
  category: string;
  accuracy: number;
  totalImages: number;
  lowConfidenceRate: number;
  manualCorrections: number;
}

// ========== Logistics Types ==========

export interface LogisticsEstimate {
  cost: number;
  estimatedDays: string;
  costRatio: number;
  warnings: string[];
  options: DeliveryOption[];
}

// ========== Notification Types ==========

export interface Notification {
  id: string;
  type: 'inquiry' | 'message' | 'listing_approved' | 'price_change' | 'logistics_warning' | 'order_reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}
