import { Farmer, Buyer, ProductListing, Inquiry, ChatMessage, Notification, AIAnalysis, PriceSuggestion, MarketingContent, AdminStats, AIAccuracyData, Order } from '../types';

export const mockFarmer: Farmer = {
  id: 'farmer-1',
  name: 'Nguyễn Văn An',
  phone: '0912 345 678',
  role: 'farmer',
  location: 'Gia Lai',
  farmName: 'Trang Trại Xanh Gia Lai',
  mainProducts: ['Cà phê', 'Hồ tiêu'],
  verificationStatus: 'phone',
  rating: 4.5,
  totalListings: 12,
  totalDeals: 8,
  bio: 'Nông dân trồng cà phê và hồ tiêu tại Gia Lai với hơn 10 năm kinh nghiệm.',
  createdAt: '2025-01-15',
};

export const mockBuyer: Buyer = {
  id: 'buyer-1',
  name: 'Công ty TNHH Thực Phẩm Sạch',
  phone: '0987 654 321',
  role: 'buyer',
  location: 'TP. Hồ Chí Minh',
  businessName: 'Thực Phẩm Sạch SG',
  savedProducts: ['listing-1', 'listing-3'],
  createdAt: '2025-02-20',
};

export const mockListings: ProductListing[] = [
  {
    id: 'listing-1',
    farmerId: 'farmer-1',
    farmerName: 'Nguyễn Văn An',
    farmerLocation: 'Gia Lai',
    productName: 'Cà phê Robusta',
    category: 'coffee',
    quantity: 500,
    unit: 'kg',
    harvestDate: '2025-05-15',
    grade: 'Grade 1',
    price: 46000,
    suggestedPrice: 46000,
    minSafePrice: 42000,
    competitivePrice: 44000,
    images: ['☕'],
    description: 'Cà phê Robusta Grade 1 từ Gia Lai – hạt đều, chất lượng ổn định',
    location: 'Gia Lai',
    deliveryOptions: ['direct', 'buyer_pickup'],
    status: 'active',
    views: 45,
    inquiries: 3,
    createdAt: '2025-05-20',
    packaging: 'Bao 50kg',
    availableDate: '2025-06-01',
  },
  {
    id: 'listing-2',
    farmerId: 'farmer-1',
    farmerName: 'Nguyễn Văn An',
    farmerLocation: 'Gia Lai',
    productName: 'Hồ tiêu đen',
    category: 'pepper',
    quantity: 200,
    unit: 'kg',
    harvestDate: '2025-04-10',
    grade: 'Grade 2',
    price: 85000,
    suggestedPrice: 85000,
    minSafePrice: 78000,
    competitivePrice: 82000,
    images: ['🌶️'],
    description: 'Hồ tiêu đen Gia Lai chất lượng tốt, hạt đều',
    location: 'Gia Lai',
    deliveryOptions: ['direct', 'pickup_point'],
    status: 'active',
    views: 28,
    inquiries: 2,
    createdAt: '2025-05-18',
    packaging: 'Bao 30kg',
  },
  {
    id: 'listing-3',
    farmerId: 'farmer-2',
    farmerName: 'HTX Nông Nghiệp Đắk Lắk',
    farmerLocation: 'Đắk Lắk',
    productName: 'Cà phê Arabica',
    category: 'coffee',
    quantity: 1000,
    unit: 'kg',
    harvestDate: '2025-05-20',
    grade: 'Premium',
    price: 65000,
    suggestedPrice: 65000,
    minSafePrice: 58000,
    competitivePrice: 62000,
    images: ['🫘'],
    description: 'Cà phê Arabica chất lượng cao từ Đắk Lắk',
    location: 'Đắk Lắk',
    deliveryOptions: ['direct', 'pickup_point', 'buyer_pickup'],
    status: 'active',
    views: 67,
    inquiries: 5,
    createdAt: '2025-05-22',
    packaging: 'Bao 60kg',
  },
  {
    id: 'listing-4',
    farmerId: 'farmer-1',
    farmerName: 'Nguyễn Văn An',
    farmerLocation: 'Gia Lai',
    productName: 'Cà phê Robusta',
    category: 'coffee',
    quantity: 300,
    unit: 'kg',
    harvestDate: '2025-06-01',
    grade: 'Grade 1',
    price: 44000,
    suggestedPrice: 44000,
    minSafePrice: 40000,
    competitivePrice: 42000,
    images: ['☕'],
    description: 'Cà phê Robusta chất lượng tốt, giá cạnh tranh',
    location: 'Gia Lai',
    deliveryOptions: ['direct', 'buyer_pickup'],
    status: 'draft',
    views: 0,
    inquiries: 0,
    createdAt: '2025-05-25',
  },
  {
    id: 'listing-5',
    farmerId: 'farmer-1',
    farmerName: 'Nguyễn Văn An',
    farmerLocation: 'Gia Lai',
    productName: 'Hồ tiêu đen',
    category: 'pepper',
    quantity: 100,
    unit: 'kg',
    harvestDate: '2025-03-20',
    grade: 'Grade 1',
    price: 92000,
    suggestedPrice: 90000,
    minSafePrice: 82000,
    competitivePrice: 88000,
    images: ['🌶️'],
    description: 'Hồ tiêu đen hạt to, chất lượng cao',
    location: 'Gia Lai',
    deliveryOptions: ['direct'],
    status: 'sold',
    views: 55,
    inquiries: 4,
    createdAt: '2025-04-01',
  },
];

// Mock AI Analysis result
export const mockAIAnalysis: AIAnalysis = {
  grade: 'Grade 1',
  confidenceScore: 82,
  qualityNotes: [
    { label: 'Màu sắc', value: 'Tốt', status: 'good' },
    { label: 'Kích thước', value: 'Đồng đều', status: 'good' },
    { label: 'Lỗi nhìn thấy', value: 'Ít', status: 'good' },
    { label: 'Tạp chất', value: 'Không có', status: 'good' },
  ],
  detectedDefects: [],
  hasIssue: false,
  timestamp: new Date().toISOString(),
};

// Low confidence AI Analysis
export const mockAIAnalysisLow: AIAnalysis = {
  grade: 'Grade 2',
  confidenceScore: 45,
  qualityNotes: [
    { label: 'Màu sắc', value: 'Trung bình', status: 'average' },
    { label: 'Kích thước', value: 'Không đồng đều', status: 'poor' },
    { label: 'Lỗi nhìn thấy', value: 'Trung bình', status: 'average' },
    { label: 'Tạp chất', value: 'Có thể có', status: 'average' },
  ],
  detectedDefects: ['Kích thước không đồng đều', 'Màu sắc không đồng nhất'],
  hasIssue: true,
  timestamp: new Date().toISOString(),
};

// Mock Price Suggestion
export const mockPriceSuggestion: PriceSuggestion = {
  recommendedPrice: 46000,
  minSafePrice: 42000,
  competitivePrice: 44000,
  referenceMarketPrice: 48000,
  qualityAdjustment: -1000,
  logisticsEstimate: 3000,
  platformFee: 1000,
  taxAssumption: 500,
  riskBuffer: 1000,
  desiredProfitMargin: 3500,
};

// Mock Marketing Content
export const mockMarketingContent: MarketingContent = {
  title: 'Cà phê Robusta Grade 1 từ Gia Lai – hạt đều, chất lượng ổn định',
  shortDescription: 'Cà phê Robusta loại 1, hạt đều, rang xay pha phin hoặc espresso đều ngon.',
  detailedDescription: `Sản phẩm: Cà phê Robusta
Loại: Robusta
Grade: Grade 1
Khối lượng: 500 kg
Khu vực sản xuất: Gia Lai
Ngày thu hoạch: 15/05/2025
Tình trạng: Hạt đều, màu sắc tốt, không tạp chất
Đóng gói: Bao 50kg
Giao hàng: Có thể giao trong vòng 7 ngày

Ghi chú: Sản phẩm đã được AI phân tích và đề xuất grade.`,
  socialCaption: '🌿 Cà phê Robusta Gia Lai chất lượng cao đã có hàng! Hạt đều, thơm ngon, giá tốt. Inbox để đặt mua ngay! 🚚',
  hashtags: ['#CàPhêRobusta', '#GiaLai', '#NôngSảnSạch', '#EcoFarmConnect', '#CàPhêViệt'],
  buyerReply: 'Cảm ơn bạn đã quan tâm! Sản phẩm hiện còn hàng với giá 46.000đ/kg. Bạn cần số lượng bao nhiêu ạ?',
};

// Mock Inquiries
export const mockInquiries: Inquiry[] = [
  {
    id: 'inq-1',
    buyerId: 'buyer-1',
    buyerName: 'Công ty TNHH Thực Phẩm Sạch',
    listingId: 'listing-1',
    listingTitle: 'Cà phê Robusta Grade 1',
    requestedQuantity: 200,
    proposedPrice: 45000,
    deliveryLocation: 'TP. Hồ Chí Minh',
    message: 'Chào anh, tôi muốn mua 200kg cà phê. Còn hàng không ạ?',
    status: 'negotiating',
    lastMessage: 'Vâng, tôi sẽ đặt 200kg. Khi nào có thể giao ạ?',
    lastMessageTime: '2025-05-28T14:30:00',
    createdAt: '2025-05-27T10:00:00',
  },
  {
    id: 'inq-2',
    buyerId: 'buyer-3',
    buyerName: 'Quán Cà Phê Nhỏ',
    listingId: 'listing-1',
    listingTitle: 'Cà phê Robusta Grade 1',
    requestedQuantity: 50,
    deliveryLocation: 'Đà Nẵng',
    message: 'Mình muốn mua 50kg thử, giá có bớt chút không?',
    status: 'new',
    lastMessage: 'Mình muốn mua 50kg thử, giá có bớt chút không?',
    lastMessageTime: '2025-05-29T09:15:00',
    createdAt: '2025-05-29T09:15:00',
  },
  {
    id: 'inq-3',
    buyerId: 'buyer-4',
    buyerName: 'Cửa hàng Nông sản Xanh',
    listingId: 'listing-3',
    listingTitle: 'Cà phê Arabica Premium',
    requestedQuantity: 500,
    deliveryLocation: 'Hà Nội',
    message: 'Chúng tôi cần 500kg Arabica chất lượng cao cho chuỗi cửa hàng.',
    status: 'confirmed',
    lastMessage: 'Đã chốt đơn 500kg, cảm ơn anh!',
    lastMessageTime: '2025-05-26T16:45:00',
    createdAt: '2025-05-25T08:30:00',
  },
];

// Mock Chat Messages for inq-1
export const mockChatMessages: Record<string, ChatMessage[]> = {
  'inq-1': [
    {
      id: 'msg-1',
      senderId: 'buyer-1',
      senderName: 'Công ty TNHH Thực Phẩm Sạch',
      content: 'Chào anh, tôi muốn mua 200kg cà phê. Còn hàng không ạ?',
      isAI: false,
      timestamp: '2025-05-27T10:00:00',
    },
    {
      id: 'msg-2',
      senderId: 'farmer-1',
      senderName: 'Nguyễn Văn An',
      content: 'Chào bạn, cà phê vẫn còn hàng ạ. Anh cần 200kg loại Grade 1 đúng không?',
      isAI: false,
      timestamp: '2025-05-27T11:30:00',
    },
    {
      id: 'msg-3',
      senderId: 'buyer-1',
      senderName: 'Công ty TNHH Thực Phẩm Sạch',
      content: 'Vâng, tôi muốn giá 45.000đ/kg được không?',
      isAI: false,
      timestamp: '2025-05-27T14:00:00',
    },
    {
      id: 'msg-4',
      senderId: 'farmer-1',
      senderName: 'Nguyễn Văn An',
      content: 'Giá đề xuất là 46.000đ/kg anh ạ. Nếu lấy 200kg, em để 45.500đ/kg nhé?',
      isAI: false,
      timestamp: '2025-05-27T15:20:00',
    },
    {
      id: 'msg-5',
      senderId: 'system',
      senderName: 'AI Gợi ý',
      content: 'Gợi ý: Giá 45.500đ/kg vẫn cao hơn giá tối thiểu an toàn (42.000đ/kg) và giúp bạn có lợi nhuận tốt.',
      isAI: true,
      timestamp: '2025-05-27T15:20:01',
    },
    {
      id: 'msg-6',
      senderId: 'buyer-1',
      senderName: 'Công ty TNHH Thực Phẩm Sạch',
      content: 'Vâng, tôi sẽ đặt 200kg. Khi nào có thể giao ạ?',
      isAI: false,
      timestamp: '2025-05-28T14:30:00',
    },
  ],
};

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'inquiry',
    title: 'Có người hỏi mua cà phê',
    message: 'Quán Cà Phê Nhỏ muốn mua 50kg cà phê Robusta Grade 1.',
    read: false,
    createdAt: '2025-05-29T09:15:00',
    linkTo: '/farmer/inquiries',
  },
  {
    id: 'notif-2',
    type: 'price_change',
    title: 'Giá cà phê hôm nay tăng',
    message: 'Giá tham khảo cà phê Robusta hôm nay tăng 1.000đ/kg.',
    read: false,
    createdAt: '2025-05-29T08:00:00',
  },
  {
    id: 'notif-3',
    type: 'message',
    title: 'Tin nhắn mới từ Thực Phẩm Sạch',
    message: 'Công ty TNHH Thực Phẩm Sạch đã trả lời tin nhắn của bạn.',
    read: true,
    createdAt: '2025-05-28T14:30:00',
    linkTo: '/farmer/inquiries/chat/inq-1',
  },
  {
    id: 'notif-4',
    type: 'listing_approved',
    title: 'Bài đăng đã được duyệt',
    message: 'Bài đăng "Cà phê Robusta Grade 1" đã được duyệt và đang hiển thị.',
    read: true,
    createdAt: '2025-05-20T10:00:00',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    listingId: 'listing-3',
    buyerId: 'buyer-4',
    buyerName: 'Cửa hàng Nông sản Xanh',
    farmerId: 'farmer-2',
    productName: 'Cà phê Arabica Premium',
    quantity: 500,
    unitPrice: 65000,
    totalAmount: 32500000,
    deliveryDate: '2025-06-05',
    deliveryLocation: 'Hà Nội',
    deliveryMethod: 'Giao trực tiếp',
    status: 'confirmed',
    notes: 'Giao tại kho Hà Nội',
    createdAt: '2025-05-25',
  },
  {
    id: 'order-2',
    listingId: 'listing-1',
    buyerId: 'buyer-1',
    buyerName: 'Công ty TNHH Thực Phẩm Sạch',
    farmerId: 'farmer-1',
    productName: 'Cà phê Robusta Grade 1',
    quantity: 200,
    unitPrice: 45500,
    totalAmount: 9100000,
    deliveryDate: '2025-06-03',
    deliveryLocation: 'TP. Hồ Chí Minh',
    deliveryMethod: 'Giao trực tiếp',
    status: 'pending',
    createdAt: '2025-05-28',
  },
];

// Mock Admin Stats
export const mockAdminStats: AdminStats = {
  totalFarmers: 48,
  activeBuyers: 126,
  activeListings: 87,
  newListingsThisWeek: 15,
  totalInquiries: 234,
  lowConfidenceCases: 8,
  pendingApprovals: 5,
  complaints: 2,
};

// Mock AI Accuracy Data
export const mockAIAccuracyData: AIAccuracyData[] = [
  { category: 'Cà phê', accuracy: 85, totalImages: 320, lowConfidenceRate: 8, manualCorrections: 25 },
  { category: 'Hồ tiêu', accuracy: 78, totalImages: 150, lowConfidenceRate: 12, manualCorrections: 18 },
  { category: 'Trái cây', accuracy: 72, totalImages: 95, lowConfidenceRate: 15, manualCorrections: 12 },
  { category: 'Rau củ', accuracy: 80, totalImages: 110, lowConfidenceRate: 10, manualCorrections: 8 },
  { category: 'Gạo', accuracy: 90, totalImages: 80, lowConfidenceRate: 5, manualCorrections: 4 },
];

// Product type templates
export const productTypes = [
  { id: 'coffee', name: 'Cà phê', icon: '☕', supported: true, subTypes: ['Robusta', 'Arabica', 'Culi', 'Moka'] },
  { id: 'pepper', name: 'Hồ tiêu', icon: '🌶️', supported: true, subTypes: ['Tiêu đen', 'Tiêu trắng', 'Tiêu xanh'] },
  { id: 'fruit', name: 'Trái cây', icon: '🍎', supported: true, subTypes: ['Sầu riêng', 'Chôm chôm', 'Măng cụt', 'Xoài'] },
  { id: 'vegetable', name: 'Rau củ', icon: '🥬', supported: false, subTypes: [] },
  { id: 'rice', name: 'Gạo', icon: '🌾', supported: false, subTypes: [] },
  { id: 'other', name: 'Khác', icon: '📦', supported: false, subTypes: [] },
];

// Quick replies for chat
export const quickReplies = [
  'Sản phẩm còn hàng.',
  'Bạn cần số lượng bao nhiêu?',
  'Giá hiện tại là...',
  'Tôi có thể giao vào ngày...',
  'Vui lòng cho biết địa chỉ nhận hàng.',
  'Tôi sẽ kiểm tra phí giao hàng và báo lại.',
];

// Market prices
export const marketPrices = [
  { product: 'Cà phê Robusta', price: 48000, unit: 'đ/kg', change: '+1.000', isUp: true },
  { product: 'Cà phê Arabica', price: 68000, unit: 'đ/kg', change: '-2.000', isUp: false },
  { product: 'Hồ tiêu đen', price: 88000, unit: 'đ/kg', change: '+500', isUp: true },
  { product: 'Sầu riêng Monthong', price: 75000, unit: 'đ/kg', change: '+3.000', isUp: true },
];

// Vietnamese provinces
export const provinces = [
  'Gia Lai', 'Đắk Lắk', 'Lâm Đồng', 'Đắk Nông', 'Kon Tum',
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'An Giang', 'Đồng Nai', 'Bình Dương', 'Bình Phước', 'Tây Ninh',
];
