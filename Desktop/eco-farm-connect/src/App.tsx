import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { LoginPage } from './pages/auth/Login';

// Tutorial pages
import { TutorialHome } from './pages/tutorial/TutorialHome';
import { LearningPath } from './pages/tutorial/LearningPath';
import { PythonExercises } from './pages/tutorial/PythonExercises';

// Farmer pages
import { FarmerHome } from './pages/farmer/Home';
import { SelectProduct } from './pages/farmer/SelectProduct';
import { PhotoCapture } from './pages/farmer/PhotoCapture';
import { AIAnalyzing } from './pages/farmer/AIAnalyzing';
import { AIResult } from './pages/farmer/AIResult';
import { ProductInfo } from './pages/farmer/ProductInfo';
import { PriceSuggestionPage } from './pages/farmer/PriceSuggestion';
import { MarketingPreview } from './pages/farmer/MarketingPreview';
import { PublishConfirm } from './pages/farmer/PublishConfirm';
import { MyProducts } from './pages/farmer/MyProducts';
import { ProductDetailManage } from './pages/farmer/ProductDetailManage';
import { Inquiries } from './pages/farmer/Inquiries';
import { Chat } from './pages/farmer/Chat';
import { Orders } from './pages/farmer/Orders';
import { FarmerProfile } from './pages/farmer/Profile';
import { Notifications } from './pages/farmer/Notifications';
import { Settings } from './pages/farmer/Settings';
import { HelpCenter } from './pages/farmer/HelpCenter';
import { MarketPrice } from './pages/farmer/MarketPrice';
import { LogisticsEstimator } from './pages/farmer/LogisticsEstimator';

// Buyer pages
import { BuyerHome } from './pages/buyer/Home';
import { BuyerProductDetail } from './pages/buyer/ProductDetail';
import { FarmerPublicProfile } from './pages/buyer/FarmerPublicProfile';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AIMonitoring } from './pages/admin/AIMonitoring';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Auth / Landing */}
        <Route path="/" element={<LoginPage />} />

        {/* Farmer App Routes */}
        <Route path="/farmer" element={<FarmerHome />} />
        <Route path="/farmer/create" element={<SelectProduct />} />
        <Route path="/farmer/create/photo" element={<PhotoCapture />} />
        <Route path="/farmer/create/analyzing" element={<AIAnalyzing />} />
        <Route path="/farmer/create/ai-result" element={<AIResult />} />
        <Route path="/farmer/create/product-info" element={<ProductInfo />} />
        <Route path="/farmer/create/price" element={<PriceSuggestionPage />} />
        <Route path="/farmer/create/marketing" element={<MarketingPreview />} />
        <Route path="/farmer/create/publish" element={<PublishConfirm />} />
        <Route path="/farmer/products" element={<MyProducts />} />
        <Route path="/farmer/products/:productId" element={<ProductDetailManage />} />
        <Route path="/farmer/inquiries" element={<Inquiries />} />
        <Route path="/farmer/inquiries/chat/:inquiryId" element={<Chat />} />
        <Route path="/farmer/orders" element={<Orders />} />
        <Route path="/farmer/profile" element={<FarmerProfile />} />
        <Route path="/farmer/notifications" element={<Notifications />} />
        <Route path="/farmer/settings" element={<Settings />} />
        <Route path="/farmer/help" element={<HelpCenter />} />
        <Route path="/farmer/market" element={<MarketPrice />} />
        {/* Tutorial Routes */}
        <Route path="/farmer/tutorial" element={<TutorialHome />} />
        <Route path="/farmer/tutorial/learning-path" element={<LearningPath />} />
        <Route path="/farmer/tutorial/exercises" element={<PythonExercises />} />

        {/* Buyer Routes */}
        <Route path="/buyer" element={<BuyerHome />} />
        <Route path="/buyer/product/:productId" element={<BuyerProductDetail />} />
        <Route path="/buyer/farmer/:farmerId" element={<FarmerPublicProfile />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/ai-monitoring" element={<AIMonitoring />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
