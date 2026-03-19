// App.jsx (COMPLETE WITH ALL IMPORTS)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/animations.css';
import HomePage from "./HomePage";
import ItemDetailPage from "./ItemDetailPage";
import UserDashboard from "./UserDashboard";
import WinnersPage from "./WinnersPage";
import HowItWorksPage from "./HowItWorksPage";
import LiveDrawPages from "./LiveDrawPages";
import ForumPage from "./ForumPage";
import AuthPage from "./LoginRegister";
import LegalPage from "./LegalPage";
import AboutPage from "./AboutPage";
import RafflesPage from "./RafflesPage";
import ContactPage from "./ContactPage";
import RaffleUploadForm from "./RaffleUploadForm";
import CompleteAdminDashboard from "./CompleteAdminDashboard";
import AdminLogin from './admin-login';
import LearnMore from "./LearnMore";
import InfluencerAuth from './InfluencerAuth';
import InfluencerDashboard from './InfluencerDashboard';
import LeaderboardPage from './LeaderboardPage';
import InfluencerProfile from './InfluencerProfile';
import InfluencerApp from './InfluencerApp';
import WithdrawalRequests from "./WithdrawalRequests";
import AdminInfluencerDashboard from './AdminInfluencerDashboard';
import InfluencerShareToolkit from './InfluencerShareToolkit';
import AdminRoute from "./components/AdminRoute";

// Import Lucide React icons for the 404 page
import {
  Trophy, Ticket, Award, Zap, Users, MessageCircle,
  Eye, ChevronRight, Bell, TrendingUp, Crown,
  Shield, Star, DollarSign, Calendar, Gift,
  Users as UsersIcon, Home, Settings, LogOut,
  ArrowRight, Search, Filter, Clock, CheckCircle,
  XCircle, AlertCircle, Info, HelpCircle
} from 'lucide-react';

function App() {
  return (
    <Router>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/raffles" element={<RafflesPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/winners" element={<WinnersPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/learn" element={<LearnMore />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/influencers/*" element={<InfluencerApp />} />
        
        {/* Influencer Routes */}
        <Route path="/influencer/:username/share" element={<InfluencerShareToolkit />} />
        <Route path="/i/:referralCode/share" element={<InfluencerShareToolkit />} />
        <Route path="/i/:username" element={<InfluencerProfile />} />
        <Route path="/influencer/:username" element={<InfluencerProfile />} />
        <Route path="/influencers/auth" element={<InfluencerAuth />} />
        <Route path="/influencer-dashboard" element={<InfluencerDashboard />} />
        
        
        {/* Admin Routes */}
        <Route path="/admin-influ" element={<AdminInfluencerDashboard />} />
        

 <Route path="/admin/withdrawals" element={
  <AdminRoute>
    <WithdrawalRequests />
  </AdminRoute>
} />

        {/* ---------- LIVE DRAW ROUTES ---------- */}
        <Route path="/live-draw" element={<LiveDrawPages />} />
        
        {/* ---------- FORUM & INFO ROUTES ---------- */}
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* ---------- AUTH ROUTES ---------- */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<AuthPage />} />
        
        {/* ---------- USER DASHBOARD ---------- */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/dashboard/:tab" element={<UserDashboard />} />
        
        {/* ---------- RAFFLE CREATION ---------- */}
        <Route path="/create-raffle" element={<RaffleUploadForm />} />
        
        {/* ---------- ADMIN ROUTES ---------- */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<CompleteAdminDashboard />} />
        <Route path="/admin/:tab" element={<CompleteAdminDashboard />} />
        
        {/* ---------- 404 PAGE ---------- */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-2xl border-b border-blue-500/30">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <a href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-white/80">Raffle Draw</div>
                      <div className="font-black text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        WIN BIG
                      </div>
                    </div>
                  </a>
                  <a 
                    href="/" 
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="px-4 pt-12 pb-20 max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="relative inline-block mb-8">
                  <div className="text-9xl font-black bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    404
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                </div>
                
                <h1 className="text-4xl font-black mb-4">Page Not Found</h1>
                <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
                  Oops! The page you're looking for doesn't exist or has been moved. 
                  Don't worry though, there are plenty of exciting raffles waiting for you!
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center mb-12">
                  <a 
                    href="/" 
                    className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105"
                  >
                    🏠 Back to Home
                  </a>
                  <a 
                    href="/raffles" 
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105"
                  >
                    🎫 Browse Raffles
                  </a>
                  <a 
                    href="/dashboard" 
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105"
                  >
                    📊 My Dashboard
                  </a>
                </div>
              </div>
              
              {/* Quick Links Section */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/15 mb-8">
                <h2 className="text-2xl font-black text-center mb-6">Quick Navigation</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Raffles Section */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Ticket size={24} />
                      </div>
                      <h3 className="font-bold text-lg">Raffles</h3>
                    </div>
                    <div className="space-y-2">
                      <a href="/raffles" className="block p-2 hover:bg-white/5 rounded-lg transition-all">All Raffles</a>
                      <a href="/raffles?category=electronics" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Electronics</a>
                      <a href="/raffles?category=cash" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Cash Prizes</a>
                      <a href="/raffles?status=active" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Active Draws</a>
                    </div>
                  </div>
                  
                  {/* Winners Section */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Award size={24} />
                      </div>
                      <h3 className="font-bold text-lg">Winners</h3>
                    </div>
                    <div className="space-y-2">
                      <a href="/winners" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Recent Winners</a>
                      <a href="/winners?time=today" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Today's Wins</a>
                      <a href="/winners?time=week" className="block p-2 hover:bg-white/5 rounded-lg transition-all">This Week</a>
                      <a href="/winners?prize=big" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Big Winners</a>
                    </div>
                  </div>
                  
                  {/* Live Draws Section */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Zap size={24} />
                      </div>
                      <h3 className="font-bold text-lg">Live Draws</h3>
                    </div>
                    <div className="space-y-2">
                      <a href="/live-draw" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Live Now</a>
                      <a href="/live-draw?status=upcoming" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Upcoming</a>
                      <a href="/live-draw?status=completed" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Completed</a>
                      <a href="/admin" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Admin Control</a>
                    </div>
                  </div>
                  
                  {/* User Section */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Users size={24} />
                      </div>
                      <h3 className="font-bold text-lg">My Account</h3>
                    </div>
                    <div className="space-y-2">
                      <a href="/dashboard" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Dashboard</a>
                      <a href="/dashboard/tickets" className="block p-2 hover:bg-white/5 rounded-lg transition-all">My Tickets</a>
                      <a href="/dashboard/winnings" className="block p-2 hover:bg-white/5 rounded-lg transition-all">My Winnings</a>
                      <a href="/dashboard/referrals" className="block p-2 hover:bg-white/5 rounded-lg transition-all">Referrals</a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Popular Raffles Section */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-black text-center mb-6">Popular Raffles Right Now</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "iPhone 15 Pro Max", prize: "₦1,500,000", tickets: "234/500", color: "from-blue-500/20 to-cyan-500/20" },
                    { title: "Cash Prize ₦2M", prize: "₦2,000,000", tickets: "189/300", color: "from-green-500/20 to-emerald-500/20" },
                    { title: "MacBook Pro M3", prize: "₦1,200,000", tickets: "156/200", color: "from-purple-500/20 to-pink-500/20" },
                  ].map((raffle, index) => (
                    <a 
                      key={index}
                      href="/raffles" 
                      className={`bg-gradient-to-r ${raffle.color} backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-bold text-lg">{raffle.title}</div>
                          <div className="text-sm text-white/60">Grand Prize</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-yellow-400">{raffle.prize}</div>
                        </div>
                      </div>
                      <div className="text-sm text-white/60 mb-2">Tickets: {raffle.tickets}</div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                          style={{ width: `${parseInt(raffle.tickets.split('/')[0]) / parseInt(raffle.tickets.split('/')[1]) * 100}%` }}
                        ></div>
                      </div>
                    </a>
                  ))}
                </div>
                
                <div className="text-center mt-8">
                  <a 
                    href="/raffles" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                  >
                    <Eye size={20} />
                    View All Raffles
                  </a>
                </div>
              </div>
              
              {/* Support Section */}
              <div className="text-center mt-12">
                <div className="inline-flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Need Help?</div>
                    <div className="text-sm text-white/60">Contact our support team</div>
                  </div>
                  <a 
                    href="/contact" 
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 transition-all rounded-xl"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </main>
            
            {/* Footer */}
            <footer className="border-t border-white/10 py-8">
              <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Trophy size={20} />
                      </div>
                      <div className="font-black text-lg">Raffle Draw</div>
                    </div>
                    <p className="text-white/60 text-sm">
                      Your chance to win amazing prizes through fair and transparent raffle draws.
                    </p>
                  </div>
                  
                  <div>
                    <div className="font-bold mb-4">Quick Links</div>
                    <div className="space-y-2">
                      <a href="/how-it-works" className="block text-sm text-white/60 hover:text-white">How It Works</a>
                      <a href="/legal" className="block text-sm text-white/60 hover:text-white">Terms & Conditions</a>
                      <a href="/about" className="block text-sm text-white/60 hover:text-white">About Us</a>
                      <a href="/forum" className="block text-sm text-white/60 hover:text-white">Community Forum</a>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-bold mb-4">Get Started</div>
                    <div className="space-y-2">
                      <a href="/register" className="block text-sm text-white/60 hover:text-white">Create Account</a>
                      <a href="/login" className="block text-sm text-white/60 hover:text-white">Login</a>
                      <a href="/create-raffle" className="block text-sm text-white/60 hover:text-white">Create Raffle</a>
                      <a href="/admin-login" className="block text-sm text-white/60 hover:text-white">Admin Login</a>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-white/40 mt-8 pt-6 border-t border-white/10">
                  © {new Date().getFullYear()} Raffle Draw. All rights reserved.
                </div>
              </div>
            </footer>
            
            {/* Live Draw Alert */}
            <div className="fixed bottom-4 right-4 z-50">
              <a 
                href="/live-draw" 
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-2xl transition-all animate-pulse"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                <span>🔥 Live Draws Now</span>
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;