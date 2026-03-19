// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, Crown, Flame, TrendingUp, Users, DollarSign, 
  Target, Award, Shield, Clock, ChevronRight, Filter, 
  Search, Eye, EyeOff, Share2, Copy, BarChart3,
  TrendingUp as TrendingUpIcon, Users as UsersIcon,
  DollarSign as DollarSignIcon, Target as TargetIcon,
  Award as AwardIcon, Shield as ShieldIcon, Clock as ClockIcon,
  ChevronRight as ChevronRightIcon, Filter as FilterIcon,
  Search as SearchIcon, Eye as EyeIcon, EyeOff as EyeOffIcon,
  Share2 as Share2Icon, Copy as CopyIcon, BarChart3 as BarChart3Icon,
  Star, Medal, Zap, TrendingDown, CheckCircle, XCircle,
  AlertCircle, ExternalLink, RefreshCw, Download,
  Instagram, Twitter, Facebook, Linkedin, Globe,
  UserCheck, UserX, Calendar, TrendingUp as FireIcon,
  ArrowUpRight, ArrowDownRight, Percent, Hash,
  User, Check, X, Crown as CrownIcon,
  TrendingUp as RocketIcon, Users as GroupIcon,
  Award as BadgeIcon, Shield as LockIcon,
  Clock as TimeIcon, Zap as LightningIcon,
  TrendingUp as GrowthIcon, DollarSign as MoneyIcon,
  Trophy as TrophyIcon, Crown as KingIcon,
  Flame as HotIcon, TrendingUp as RankIcon,
  Home, Heart, Bell, Menu, X as XIcon,
  Info, BookOpen, Activity, PieChart,
  Briefcase, MessageCircle, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase imports
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  doc, 
  getDoc,
  onSnapshot,
  startAfter,
  getCountFromServer
} from 'firebase/firestore';
import { app } from './firebaseConfig';

// Initialize Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Constants
const INTERNAL_ROUTES = {
  home: "/",
  influencers: "/influencers",
  ranking: "/influ-ranking",

  prizes: "/prizes",
  profile: "/login",
  about: "/about-us",
  learnMore: "/learn",
  downloadKit: "/share-toolkit",
  sponsorship: "/sponsorship",
  career: "/career",
 
  contactUs: "/contact-us",
  faq: "/faq",
  admin: "/admin",
  liveResult: "/live-results",
  blog: "/blog",
  howItWorks: "/learn",
  
  leaderboard: "/leaderboard",
  login: "/influencer/auth",
  terms: "/terms-and-conditions",
  dashboard: "/influencer-dashboard"
};

const LEADERBOARD_TYPES = {
  GLOBAL: 'global',
  RAFFLE: 'raffle',
  WEEKLY: 'weekly'
};

const BADGES = {
  QUALIFIED: { label: '✅ Qualified', color: 'green', icon: CheckCircle },
  TOP_GROWER: { label: '🔥 Top Grower', color: 'orange', icon: Flame },
  WINNER_BOOSTER: { label: '🏆 Winner Booster', color: 'yellow', icon: Trophy },
  TRENDING: { label: '📈 Trending', color: 'blue', icon: TrendingUp },
  NEW: { label: '🆕 New', color: 'purple', icon: Zap }
};

// Glassmorphic Components
const GlassCard = ({ children, className = "", ...props }) => (
  <motion.div 
    className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

const GlassButton = ({ children, onClick, variant = "primary", size = "sm", className = "", ...props }) => {
  const baseClasses = "font-bold transition-all flex items-center justify-center gap-1";
  const sizeClasses = {
    sm: "py-1 px-2 text-xs rounded-lg",
    md: "py-2 px-3 text-sm rounded-xl",
    lg: "py-2 px-4 text-sm rounded-xl"
  };
  const variantClasses = {
    primary: "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg",
    secondary: "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow",
    accent: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg",
    glass: "backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 shadow"
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const GlassInput = ({ value, onChange, placeholder, icon: Icon, ...props }) => (
  <div className="relative">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-1.5 pl-7 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow text-xs"
      {...props}
    />
    {Icon && (
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-400">
        <Icon className="w-3 h-3" />
      </div>
    )}
  </div>
);

const GlassSelect = ({ value, onChange, options, ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full p-1.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs focus:outline-none focus:ring-pink-500 shadow"
    {...props}
  >
    {options.map(option => (
      <option key={option.value} value={option.value} className="bg-gray-800">
        {option.label}
      </option>
    ))}
  </select>
);

const RankBadge = ({ rank, size = "sm" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg"
  };

  return (
    <div className={`${sizeClasses[size]} rounded flex items-center justify-center text-white font-bold ${
      rank === 1 ? "bg-gradient-to-r from-yellow-400 to-amber-500 shadow" :
      rank === 2 ? "bg-gradient-to-r from-gray-400 to-gray-600 shadow" :
      rank === 3 ? "bg-gradient-to-r from-amber-600 to-amber-800 shadow" :
      "bg-gradient-to-r from-pink-500 to-purple-500"
    }`}>
      {rank}
    </div>
  );
};

const TrendBadge = ({ trend, value }) => (
  <div className={`backdrop-blur-md rounded-full px-1 py-0.5 flex items-center gap-0.5 text-xs ${
    trend === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
  }`}>
    {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
    <span>{value}</span>
  </div>
);

// Header Links Component
const HeaderLinks = ({ onMobile = false }) => {
  const allPages = [
   
    { name: "Leaderboard", path: INTERNAL_ROUTES.leaderboard, icon: BarChart3 },
    
   
    { name: "About Us", path: INTERNAL_ROUTES.about, icon: Info },
   
    
   
    { name: "Sponsorship", path: INTERNAL_ROUTES.sponsorship, icon: DollarSign },
    { name: "Career", path: INTERNAL_ROUTES.career, icon: Briefcase },
    { name: "Contact Us", path: INTERNAL_ROUTES.contactUs, icon: MessageCircle },
    { name: "Terms", path: INTERNAL_ROUTES.terms, icon: Info },
    { name: "Dashboard", path: INTERNAL_ROUTES.dashboard, icon: PieChart },
  ];

  if (onMobile) {
    return (
      <div className="grid grid-cols-2 gap-1 p-2">
        {allPages.map((page) => (
          <Link
            key={page.name}
            to={page.path}
            className="flex items-center gap-1 p-1 backdrop-blur-md bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-xs"
          >
            <page.icon className="w-3 h-3 text-pink-400" />
            <span className="font-medium text-white truncate">{page.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-wrap gap-1 justify-center">
      {allPages.slice(0, 8).map((page) => (
        <Link
          key={page.name}
          to={page.path}
          className="flex items-center gap-1 px-2 py-1 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 shadow hover:bg-white/20 transition-all text-xs"
        >
          <page.icon className="w-3 h-3" />
          {page.name}
        </Link>
      ))}
    </div>
  );
};

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-purple-900 text-white pt-6 pb-20 px-4 mt-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent mb-2">
              NextWinner
            </h3>
            <p className="text-gray-300 mb-2 text-xs leading-tight">
              Leading influencer platform with real-time earnings and rankings.
            </p>
            <div className="flex gap-1">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="w-6 h-6 rounded-full backdrop-blur-md bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className="w-3 h-3" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Contest Links */}
          <div>
            <h4 className="font-semibold text-white text-xs mb-2">Platform</h4>
            <ul className="space-y-1">
              {[
                { name: "Home", path: INTERNAL_ROUTES.home },
                { name: "Leaderboard", path: INTERNAL_ROUTES.leaderboard },
                { name: "Influencers", path: INTERNAL_ROUTES.influencers },
                { name: "How It Works", path: INTERNAL_ROUTES.howItWorks },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 hover:text-white transition-colors text-xs">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h4 className="font-semibold text-white text-xs mb-2">Information</h4>
            <ul className="space-y-1">
              {[
                { name: "About", path: INTERNAL_ROUTES.about },
                { name: "FAQ", path: INTERNAL_ROUTES.faq },
                { name: "Terms", path: INTERNAL_ROUTES.terms },
                { name: "Contact", path: INTERNAL_ROUTES.contactUs },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 hover:text-white transition-colors text-xs">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Other Links */}
          <div>
            <h4 className="font-semibold text-white text-xs mb-2">Support</h4>
            <ul className="space-y-1">
              {[
                { name: "Sponsorship", path: INTERNAL_ROUTES.sponsorship },
                { name: "Career", path: INTERNAL_ROUTES.career },
                { name: "Dashboard", path: INTERNAL_ROUTES.dashboard },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-300 hover:text-white transition-colors text-xs">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-2 text-center">
          <p className="text-xs text-gray-400">
            © {currentYear} NextWinner. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Utility functions
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatTimeAgo = (date) => {
  if (!date) return 'Recently';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-32 bg-white/10 rounded-xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-24 bg-white/10 rounded-xl"></div>
      <div className="h-24 bg-white/10 rounded-xl"></div>
      <div className="h-24 bg-white/10 rounded-xl"></div>
    </div>
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-20 bg-white/10 rounded-xl"></div>
      ))}
    </div>
  </div>
);

// Badge Component
const Badge = ({ type, size = 'sm' }) => {
  const badge = BADGES[type] || BADGES.QUALIFIED;
  const Icon = badge.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} backdrop-blur-md bg-${badge.color}-500/20 text-${badge.color}-400 rounded-full font-medium border border-${badge.color}-500/30`}>
      <Icon className="w-3 h-3" />
      {badge.label}
    </span>
  );
};

// Top 3 Card Component with Glassmorphic Design
const TopInfluencerCard = ({ influencer, rank, currentUser }) => {
  const isCurrentUser = currentUser?.uid === influencer.id;
  const rankColors = [
    'from-yellow-400/20 to-amber-500/20', // Gold
    'from-gray-400/20 to-gray-600/20',     // Silver
    'from-amber-600/20 to-amber-800/20'   // Bronze
  ];
  
  const rankIcons = ['👑', '🥈', '🥉'];
  const rankTitles = ['Top Growth Driver', 'Elite Performer', 'Rising Star'];

  return (
    <motion.div
      className={`relative rounded-xl p-4 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.37)] transform transition-all duration-300 hover:scale-[1.02] ${isCurrentUser ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
      style={{ background: `linear-gradient(135deg, ${rankColors[rank - 1]})` }}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (rank - 1) * 0.1 }}
    >
      {/* Rank Badge */}
      <div className="absolute -top-2 -left-2">
        <RankBadge rank={rank} size="md" />
      </div>

      {/* Crown for #1 */}
      {rank === 1 && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Crown className="w-6 h-6 text-yellow-300 animate-pulse" />
        </div>
      )}

      <div className="pt-2">
        {/* Profile */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full backdrop-blur-md bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
              {influencer.photoURL ? (
                <img src={influencer.photoURL} alt={influencer.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">
                  {influencer.displayName?.charAt(0) || 'I'}
                </span>
              )}
            </div>
            {isCurrentUser && (
              <div className="absolute -bottom-1 -right-1 backdrop-blur-md bg-blue-500/80 text-white p-1 rounded-full border border-white/20">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm truncate">{influencer.displayName}</h3>
            <p className="text-white/80 text-xs">{rankTitles[rank - 1]}</p>
            {influencer.referralCode && (
              <p className="text-xs text-white/60 truncate">ID: {influencer.referralCode}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-[2px] mb-3">
          <div className="flex flex-col items-center justify-center p-2 backdrop-blur-md bg-white/5 rounded-lg">
            <div className="text-sm font-bold">
              {formatNumber(influencer.totalReferrals)}
            </div>
            <div className="text-[10px] text-white/60">
              Referrals
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 backdrop-blur-md bg-white/5 rounded-lg">
            <div className="text-sm font-bold">
              {formatNumber(influencer.ticketsSold)}
            </div>
            <div className="text-[10px] text-white/60">
              Tickets
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2 backdrop-blur-md bg-white/5 rounded-lg">
            <div className="text-sm font-bold text-green-400">
              {formatCurrency(influencer.totalEarnings)}
            </div>
            <div className="text-[10px] text-white/60">
              Earnings
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge type="QUALIFIED" size="sm" />
          {rank === 1 && <Badge type="TOP_GROWER" size="sm" />}
          {influencer.hasWinnerBonus && <Badge type="WINNER_BOOSTER" size="sm" />}
        </div>
      </div>
    </motion.div>
  );
};

// Regular Influencer Card Component with Glassmorphic Design
const InfluencerCard = ({ influencer, rank, currentUser, showEarnings = false, index }) => {
  const isCurrentUser = currentUser?.uid === influencer.id;

  return (
    <motion.div
      className="rounded-lg backdrop-blur-lg bg-white/10 border border-white/20 shadow p-3 mb-2"
      whileHover={{ y: -1 }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <RankBadge rank={rank} />

        {/* Profile Image */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          {influencer.photoURL ? (
            <img src={influencer.photoURL} alt={influencer.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {influencer.displayName?.charAt(0) || 'I'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm truncate">{influencer.displayName}</h3>
                {isCurrentUser && (
                  <span className="px-1.5 py-0.5 backdrop-blur-md bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">You</span>
                )}
              </div>
              <p className="text-xs text-gray-300">Tier: {influencer.tier || 'Bronze'}</p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="flex items-center gap-0.5">
                <Users className="w-3 h-3 text-blue-400" />
                <span className="text-white font-semibold">{formatNumber(influencer.totalReferrals)}</span>
              </div>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {influencer.qualified && <Badge type="QUALIFIED" size="sm" />}
            {influencer.hasWinnerBonus && <Badge type="WINNER_BOOSTER" size="sm" />}
            {influencer.trending && <Badge type="TRENDING" size="sm" />}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
              <div className="text-center">
                <div className="text-xs text-gray-300">Tickets</div>
                <div className="font-bold text-white text-sm">{formatNumber(influencer.ticketsSold)}</div>
              </div>
              {showEarnings && (
                <div className="text-center">
                  <div className="text-xs text-gray-300">Earnings</div>
                  <div className="font-bold text-green-400 text-sm">{formatCurrency(influencer.totalEarnings)}</div>
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <GlassButton
              onClick={() => window.location.href = `/influencer/${influencer.id}`}
              size="sm"
              variant="accent"
            >
              View
              <ChevronRight className="w-3 h-3" />
            </GlassButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Leaderboard Stats (Glassmorphic)
const LeaderboardStats = ({ stats, leaderboardType, raffleTitle }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
    {/* Total Influencers */}
    <GlassCard className="p-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-purple-400" />
        <div>
          <div className="text-sm font-bold">{formatNumber(stats.totalInfluencers)}</div>
          <div className="text-xs text-gray-300">Influencers</div>
        </div>
      </div>
    </GlassCard>

    {/* Total Referrals */}
    <GlassCard className="p-3">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-400" />
        <div>
          <div className="text-sm font-bold">{formatNumber(stats.totalReferrals)}</div>
          <div className="text-xs text-gray-300">Referrals</div>
        </div>
      </div>
    </GlassCard>

    {/* Total Earnings */}
    <GlassCard className="p-3">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-green-400" />
        <div>
          <div className="text-sm font-bold text-green-400">{formatCurrency(stats.totalEarnings)}</div>
          <div className="text-xs text-gray-300">Payouts</div>
        </div>
      </div>
    </GlassCard>

    {/* Qualified */}
    <GlassCard className="p-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <div>
          <div className="text-sm font-bold">{stats.qualifiedCount}</div>
          <div className="text-xs text-gray-300">Qualified ({stats.qualifiedPercentage}%)</div>
        </div>
      </div>
    </GlassCard>
  </div>
);

// Main Leaderboard Component
const LeaderboardPage = () => {
  const { raffleId } = useParams();
  const navigate = useNavigate();
  
  const [leaderboardType, setLeaderboardType] = useState(
    raffleId ? LEADERBOARD_TYPES.RAFFLE : LEADERBOARD_TYPES.GLOBAL
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEarnings, setShowEarnings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Live messages for notification
  const LIVE_MESSAGES = React.useMemo(() => [
    "🎯 LIVE UPDATES: Rankings update every 5 minutes!",
    "🚀 Watch your rank climb the leaderboard!",
    "💎 Earn commissions on every referral!",
    "🔥 Don't miss the excitement - Start Referring!",
    "⚡ Real-time earnings unfolding before your eyes!"
  ], []);

  // Auto-rotate live messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LIVE_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [LIVE_MESSAGES.length]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [leaderboardData, setLeaderboardData] = useState({
    influencers: [],
    stats: {
      totalInfluencers: 0,
      totalReferrals: 0,
      totalEarnings: 0,
      qualifiedCount: 0,
      qualifiedPercentage: 0
    },
    currentRaffle: null,
    userRank: null,
    lastUpdated: null
  });

  // Load current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load leaderboard data
  useEffect(() => {
    loadLeaderboardData();
    
    // Set up real-time listener for referrals collection
    const referralsQuery = query(collection(db, 'referrals'));
    const unsubscribe = onSnapshot(referralsQuery, (snapshot) => {
      loadLeaderboardData();
    });

    return () => unsubscribe();
  }, [leaderboardType, raffleId]);

  const loadLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      let influencersData = [];
      let stats = {
        totalInfluencers: 0,
        totalReferrals: 0,
        totalEarnings: 0,
        qualifiedCount: 0,
        qualifiedPercentage: 0
      };

      if (leaderboardType === LEADERBOARD_TYPES.GLOBAL) {
        const { influencers, statistics } = await loadGlobalLeaderboard();
        influencersData = influencers;
        stats = statistics;
      } else if (leaderboardType === LEADERBOARD_TYPES.RAFFLE && raffleId) {
        const { influencers, raffle } = await loadRaffleLeaderboard(raffleId);
        influencersData = influencers;
        setLeaderboardData(prev => ({ ...prev, currentRaffle: raffle }));
      } else if (leaderboardType === LEADERBOARD_TYPES.WEEKLY) {
        const { influencers } = await loadWeeklyLeaderboard();
        influencersData = influencers;
      }

      // Calculate user rank
      let userRank = null;
      if (currentUser) {
        userRank = influencersData.findIndex(influencer => influencer.id === currentUser.uid) + 1;
      }

      setLeaderboardData({
        influencers: influencersData,
        stats,
        userRank,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }, [leaderboardType, raffleId, currentUser]);

  const loadGlobalLeaderboard = async () => {
    const usersQuery = query(
      collection(db, 'users'),
      where('accountType', '==', 'influencer'),
      orderBy('createdAt', 'desc')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const influencers = [];
    let totalReferrals = 0;
    let totalEarnings = 0;
    let qualifiedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('userId', '==', userDoc.id)
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      const referralsData = referralsSnapshot.docs[0]?.data() || { referredUsers: [], totalEarned: 0 };
      
      const ticketsSold = await calculateTicketsSold(referralsData.referredUsers || []);
      
      const qualified = (referralsData.referredUsers?.length || 0) >= 50;
      if (qualified) qualifiedCount++;
      
      const hasWinnerBonus = await checkWinnerBonus(userDoc.id);
      const trending = await checkTrendingStatus(userDoc.id);
      
      influencers.push({
        id: userDoc.id,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        referralCode: userData.referralCode,
        tier: userData.influencerData?.tier || 'Bronze',
        totalReferrals: referralsData.referredUsers?.length || 0,
        ticketsSold,
        totalEarnings: referralsData.totalEarned || 0,
        qualified,
        hasWinnerBonus,
        trending,
        joined: userData.createdAt?.toDate()
      });
      
      totalReferrals += referralsData.referredUsers?.length || 0;
      totalEarnings += referralsData.totalEarned || 0;
    }

    // Sort by total referrals (primary), then earnings (secondary)
    influencers.sort((a, b) => {
      if (b.totalReferrals !== a.totalReferrals) {
        return b.totalReferrals - a.totalReferrals;
      }
      return b.totalEarnings - a.totalEarnings;
    });

    // Calculate next rank differences
    for (let i = 0; i < influencers.length; i++) {
      if (i > 0) {
        influencers[i].nextRankDiff = influencers[i - 1].totalReferrals - influencers[i].totalReferrals;
      } else {
        influencers[i].nextRankDiff = 0;
      }
    }

    return {
      influencers,
      statistics: {
        totalInfluencers: influencers.length,
        totalReferrals,
        totalEarnings,
        qualifiedCount,
        qualifiedPercentage: influencers.length > 0 ? Math.round((qualifiedCount / influencers.length) * 100) : 0
      }
    };
  };

  const loadRaffleLeaderboard = async (raffleId) => {
    const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
    if (!raffleDoc.exists()) {
      throw new Error('Raffle not found');
    }
    const raffleData = raffleDoc.data();
    
    const ticketsQuery = query(
      collection(db, 'tickets'),
      where('raffleId', '==', raffleId)
    );
    const ticketsSnapshot = await getDocs(ticketsQuery);
    
    const influencerStats = {};
    
    for (const ticketDoc of ticketsSnapshot.docs) {
      const ticket = ticketDoc.data();
      
      const referralQuery = query(
        collection(db, 'referrals'),
        where('referredUsers', 'array-contains', ticket.userId)
      );
      const referralSnapshot = await getDocs(referralQuery);
      
      if (!referralSnapshot.empty) {
        const referralData = referralSnapshot.docs[0].data();
        const influencerId = referralData.userId;
        
        if (!influencerStats[influencerId]) {
          influencerStats[influencerId] = {
            tickets: 0,
            value: 0,
            users: new Set()
          };
        }
        
        influencerStats[influencerId].tickets++;
        influencerStats[influencerId].value += ticket.price || 0;
        influencerStats[influencerId].users.add(ticket.userId);
      }
    }
    
    const influencers = [];
    for (const [influencerId, stats] of Object.entries(influencerStats)) {
      const userDoc = await getDoc(doc(db, 'users', influencerId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        const referralsQuery = query(
          collection(db, 'referrals'),
          where('userId', '==', influencerId)
        );
        const referralsSnapshot = await getDocs(referralsQuery);
        const referralsData = referralsSnapshot.docs[0]?.data() || { referredUsers: [] };
        
        influencers.push({
          id: influencerId,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          tier: userData.influencerData?.tier || 'Bronze',
          raffleReferrals: stats.users.size,
          raffleTickets: stats.tickets,
          raffleValue: stats.value,
          totalReferrals: referralsData.referredUsers?.length || 0,
          bonusEligible: stats.tickets >= 10
        });
      }
    }
    
    influencers.sort((a, b) => {
      if (b.raffleReferrals !== a.raffleReferrals) {
        return b.raffleReferrals - a.raffleReferrals;
      }
      return b.raffleValue - a.raffleValue;
    });
    
    return {
      influencers,
      raffle: raffleData
    };
  };

  const loadWeeklyLeaderboard = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const referralsQuery = query(
      collection(db, 'referrals')
    );
    const referralsSnapshot = await getDocs(referralsQuery);
    
    const weeklyStats = {};
    
    for (const referralDoc of referralsSnapshot.docs) {
      const referralData = referralDoc.data();
      const influencerId = referralData.userId;
      
      const recentReferrals = await getRecentReferrals(referralData.referredUsers || [], sevenDaysAgo);
      
      if (recentReferrals.length > 0) {
        if (!weeklyStats[influencerId]) {
          weeklyStats[influencerId] = {
            weeklyReferrals: 0,
            recentReferrals: []
          };
        }
        weeklyStats[influencerId].weeklyReferrals += recentReferrals.length;
        weeklyStats[influencerId].recentReferrals.push(...recentReferrals);
      }
    }
    
    const influencers = [];
    for (const [influencerId, stats] of Object.entries(weeklyStats)) {
      const userDoc = await getDoc(doc(db, 'users', influencerId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        const weeklyTickets = await calculateTicketsSold(stats.recentReferrals);
        
        influencers.push({
          id: influencerId,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          weeklyReferrals: stats.weeklyReferrals,
          weeklyTickets,
          growthRate: await calculateGrowthRate(influencerId, stats.weeklyReferrals),
          trending: stats.weeklyReferrals >= 10
        });
      }
    }
    
    influencers.sort((a, b) => b.weeklyReferrals - a.weeklyReferrals);
    
    return { influencers };
  };

  const calculateTicketsSold = async (userIds) => {
    if (!userIds.length) return 0;
    
    let totalTickets = 0;
    for (let i = 0; i < userIds.length; i += 10) {
      const chunk = userIds.slice(i, i + 10);
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('userId', 'in', chunk)
      );
      const ticketsSnapshot = await getDocs(ticketsQuery);
      totalTickets += ticketsSnapshot.size;
    }
    
    return totalTickets;
  };

  const getRecentReferrals = async (userIds, sinceDate) => {
    const recentUsers = [];
    
    for (const userId of userIds.slice(0, 30)) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.createdAt?.toDate() >= sinceDate) {
          recentUsers.push(userId);
        }
      }
    }
    
    return recentUsers;
  };

  const checkWinnerBonus = async (influencerId) => {
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('userId', '==', influencerId)
    );
    const referralsSnapshot = await getDocs(referralsQuery);
    const referralsData = referralsSnapshot.docs[0]?.data() || { referredUsers: [] };
    
    if (!referralsData.referredUsers?.length) return false;
    
    for (const userId of referralsData.referredUsers.slice(0, 20)) {
      const winnersQuery = query(
        collection(db, 'winners'),
        where('userId', '==', userId)
      );
      const winnersSnapshot = await getDocs(winnersQuery);
      if (!winnersSnapshot.empty) {
        return true;
      }
    }
    
    return false;
  };

  const checkTrendingStatus = async (influencerId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('userId', '==', influencerId)
    );
    const referralsSnapshot = await getDocs(referralsQuery);
    const referralsData = referralsSnapshot.docs[0]?.data() || { referredUsers: [] };
    
    const recentReferrals = await getRecentReferrals(referralsData.referredUsers || [], sevenDaysAgo);
    
    return recentReferrals.length >= 10;
  };

  const calculateGrowthRate = async (influencerId, weeklyReferrals) => {
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('userId', '==', influencerId)
    );
    const referralsSnapshot = await getDocs(referralsQuery);
    const referralsData = referralsSnapshot.docs[0]?.data() || { referredUsers: [] };
    const totalReferrals = referralsData.referredUsers?.length || 0;
    
    if (totalReferrals === 0) return 0;
    return (weeklyReferrals / totalReferrals) * 100;
  };

  // Filter and search influencers
  const filteredInfluencers = leaderboardData.influencers.filter(influencer => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        influencer.displayName?.toLowerCase().includes(query) ||
        influencer.referralCode?.toLowerCase().includes(query)
      );
    }
    
    if (filter === 'qualified' && !influencer.qualified) return false;
    if (filter === 'trending' && !influencer.trending) return false;
    if (filter === 'new') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return influencer.joined && influencer.joined >= oneWeekAgo;
    }
    
    return true;
  });

  const top3Influencers = filteredInfluencers.slice(0, 3);
  const otherInfluencers = filteredInfluencers.slice(3);

  const shareLeaderboard = () => {
    const text = `🏆 Check out the NextWinner Influencer Leaderboard! I'm ranked #${leaderboardData.userRank || 'N/A'}. Join me and start earning!`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'NextWinner Leaderboard',
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  const refreshLeaderboard = () => {
    loadLeaderboardData();
  };

  const downloadLeaderboard = () => {
    const csvContent = [
      ['Rank', 'Name', 'Referrals', 'Tickets', 'Earnings', 'Status', 'Tier'],
      ...filteredInfluencers.map((inf, index) => [
        index + 1,
        inf.displayName,
        inf.totalReferrals,
        inf.ticketsSold,
        formatCurrency(inf.totalEarnings),
        inf.qualified ? 'Qualified' : 'Not Qualified',
        inf.tier
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nextwinner-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 text-white antialiased pb-20">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 text-white antialiased pb-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <GlassCard className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Leaderboard</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <GlassButton onClick={refreshLeaderboard} variant="primary" size="md">
              Try Again
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 text-white antialiased pb-20">
      {/* Fixed Notification Banner */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-1.5 px-2 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 truncate">
            <Bell className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{LIVE_MESSAGES[currentMessageIndex]}</span>
          </div>
          <Link
            to="/influencer/auth"
            className="bg-white text-blue-600 px-1.5 py-0.5 rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors shadow whitespace-nowrap flex-shrink-0"
          >
            Join as an Influencer
          </Link>
        </div>
      </motion.div>

      {/* Header */}
      <header className="pt-12 pb-1 px-2">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-between items-center mb-2">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-lg backdrop-blur-md bg-white/10 border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <XIcon className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
            </motion.button>
            
            {/* Mobile Login Button */}
            {currentUser ? (
              <Link
                to={INTERNAL_ROUTES.dashboard}
                className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow hover:from-green-600 hover:to-emerald-600 transition-all text-xs flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                Dashboard
              </Link>
            ) : (
              <Link
                to={INTERNAL_ROUTES.login}
                className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow hover:from-green-600 hover:to-emerald-600 transition-all text-xs flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                Login
              </Link>
            )}
          </div>

          {/* Desktop Header Links */}
          <div className="hidden lg:block mb-2">
            <HeaderLinks />
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-2">
            <motion.div 
              className="relative"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <GlassInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search influencers by name or ID..."
                icon={Search}
              />
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div 
            className="flex flex-wrap gap-1 justify-center mb-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {[
              { label: "Home", path: INTERNAL_ROUTES.home, icon: Home },
              { label: "Influencers", path: INTERNAL_ROUTES.influencers, icon: Users },
              { label: "Live Results", path: INTERNAL_ROUTES.liveResult, icon: Activity },
              { label: "How It Works", path: INTERNAL_ROUTES.howItWorks, icon: Info },
              { label: "Dashboard", path: INTERNAL_ROUTES.dashboard, icon: PieChart },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className="flex items-center gap-1 px-2 py-1 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 shadow hover:bg-white/20 transition-all text-xs"
                >
                  <Icon className="w-3 h-3" />
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-3"
        >
          <GlassCard className="p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
            
            <div className="text-center relative z-10">
              <motion.div 
                className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Trophy className="w-5 h-5 text-white" />
              </motion.div>
              
              <motion.h1 
                className="text-xl font-extrabold mb-1"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  🏆 NEXTWINNER INFLUENCER LEADERBOARD
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-gray-300 text-sm mb-2 leading-relaxed"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Watch rankings update in <span className="font-bold text-green-400">real-time!</span> Every referral counts!
              </motion.p>

              {/* Quick Stats */}
              {leaderboardType === LEADERBOARD_TYPES.GLOBAL && (
                <LeaderboardStats 
                  stats={leaderboardData.stats} 
                  leaderboardType={leaderboardType}
                  raffleTitle={leaderboardData.currentRaffle?.title}
                />
              )}

              {/* CTA Buttons */}
              <div className="flex gap-1 justify-center">
                <GlassButton
                  onClick={shareLeaderboard}
                  variant="accent"
                  size="md"
                >
                  <Share2 className="w-3 h-3" />
                  Share Board
                </GlassButton>
                {!currentUser ? (
                  <Link to="/influencers/auth">
                    <GlassButton variant="success" size="md">
                      <Users className="w-3 h-3" />
                      Join as Influencer
                    </GlassButton>
                  </Link>
                ) : (
                  <Link to={INTERNAL_ROUTES.dashboard}>
                    <GlassButton variant="success" size="md">
                      <PieChart className="w-3 h-3" />
                      Your Dashboard
                    </GlassButton>
                  </Link>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Navigation Tabs */}
        <motion.div 
          className="mb-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-1">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: "global", label: "🏆 Global", icon: Trophy },
                { id: "weekly", label: "🚀 Weekly", icon: Flame },
                { id: "raffle", label: "🎯 Raffle", icon: Target },
                { id: "qualified", label: "✅ Qualified", icon: CheckCircle },
                { id: "trending", label: "📈 Trending", icon: TrendingUp }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'global') setLeaderboardType(LEADERBOARD_TYPES.GLOBAL);
                    if (tab.id === 'weekly') setLeaderboardType(LEADERBOARD_TYPES.WEEKLY);
                    if (tab.id === 'raffle') setLeaderboardType(LEADERBOARD_TYPES.RAFFLE);
                    if (tab.id === 'qualified') setFilter('qualified');
                    if (tab.id === 'trending') setFilter('trending');
                  }}
                  className={`flex-1 min-w-max px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                    (tab.id === 'global' && leaderboardType === LEADERBOARD_TYPES.GLOBAL) ||
                    (tab.id === 'weekly' && leaderboardType === LEADERBOARD_TYPES.WEEKLY) ||
                    (tab.id === 'raffle' && leaderboardType === LEADERBOARD_TYPES.RAFFLE) ||
                    (tab.id === 'qualified' && filter === 'qualified') ||
                    (tab.id === 'trending' && filter === 'trending')
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Controls Bar */}
        <GlassCard className="p-2 mb-3">
          <div className="flex gap-1 mb-2">
            {/* Filter Dropdown */}
            <div className="flex-1">
              <GlassSelect
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Influencers' },
                  { value: 'qualified', label: '✅ Qualified Only' },
                  { value: 'trending', label: '📈 Trending' },
                  { value: 'new', label: '🆕 New This Week' }
                ]}
              />
            </div>

            {/* Action Buttons */}
            <GlassButton
              onClick={() => setShowEarnings(!showEarnings)}
              variant="glass"
              size="sm"
            >
              {showEarnings ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </GlassButton>
            <GlassButton
              onClick={refreshLeaderboard}
              variant="glass"
              size="sm"
            >
              <RefreshCw className="w-3 h-3" />
            </GlassButton>
            <GlassButton
              onClick={downloadLeaderboard}
              variant="glass"
              size="sm"
            >
              <Download className="w-3 h-3" />
            </GlassButton>
          </div>

          {/* Info Bar */}
          <div className="flex justify-between items-center text-xs text-gray-300">
            <span>Showing {filteredInfluencers.length} of {leaderboardData.influencers.length} influencers</span>
            <span>Last updated: {leaderboardData.lastUpdated ? formatTimeAgo(leaderboardData.lastUpdated) : 'Loading...'}</span>
          </div>
        </GlassCard>

        {/* Top 3 Winners */}
        {top3Influencers.length > 0 && leaderboardType === LEADERBOARD_TYPES.GLOBAL && (
          <GlassCard className="p-3 mb-3">
            <h2 className="text-sm font-bold text-center text-white mb-3">🥇 Top 3 Performers</h2>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
              {top3Influencers.map((influencer, index) => (
                <TopInfluencerCard
                  key={influencer.id}
                  influencer={influencer}
                  rank={index + 1}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Leaderboard List */}
        <GlassCard className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white text-sm">
              {leaderboardType === LEADERBOARD_TYPES.GLOBAL && "Full Leaderboard"}
              {leaderboardType === LEADERBOARD_TYPES.RAFFLE && "Raffle Rankings"}
              {leaderboardType === LEADERBOARD_TYPES.WEEKLY && "Weekly Top Performers"}
            </h2>
            
            {currentUser && leaderboardData.userRank && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-300">Your Rank:</div>
                <div className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-lg">
                  #{leaderboardData.userRank}
                </div>
              </div>
            )}
          </div>

          {filteredInfluencers.length > 0 ? (
            <div className="space-y-2">
              {otherInfluencers.map((influencer, index) => (
                <InfluencerCard
                  key={influencer.id}
                  influencer={influencer}
                  rank={index + 4}
                  currentUser={currentUser}
                  showEarnings={showEarnings}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
              <p className="text-gray-400 text-sm">No influencers found</p>
              <p className="text-gray-500 text-xs mt-1">Try changing your search or filter</p>
            </div>
          )}
        </GlassCard>

        {/* How It Works Section */}
        <GlassCard className="p-4 mt-3">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1">
            <Info className="w-4 h-4 text-blue-400" />
            📊 How the Leaderboard Works
          </h3>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
            <div className="p-3 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="w-8 h-8 mb-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold mb-1">Ranking System</h4>
              <ul className="text-[10px] text-white/60 space-y-1">
                <li>• Total referrals (Primary)</li>
                <li>• Ticket sales value</li>
                <li>• 50+ referrals to qualify</li>
                <li>• Verified users only</li>
              </ul>
            </div>

            <div className="p-3 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="w-8 h-8 mb-2 rounded-md bg-gradient-to-r from-yellow-600 to-orange-600 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold mb-1">Visibility & Benefits</h4>
              <ul className="text-[10px] text-white/60 space-y-1">
                <li>• Higher rank = More exposure</li>
                <li>• Public trust indicator</li>
                <li>• Featured on homepage</li>
                <li>• Social proof advantage</li>
              </ul>
            </div>

            <div className="p-3 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="w-8 h-8 mb-2 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-semibold mb-1">Earnings & Growth</h4>
              <ul className="text-[10px] text-white/60 space-y-1">
                <li>• 5% commission on tickets</li>
                <li>• 15% winner bonus</li>
                <li>• Multi-raffle tracking</li>
                <li>• Real-time updates</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Leaderboard updates in real time using verified activity. Earnings are settled manually by admin.
            </p>
          </div>
        </GlassCard>

        {/* Join CTA */}
        {!currentUser && (
          <GlassCard className="p-4 mt-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30">
            <h3 className="text-sm font-bold text-center mb-2">🚀 Join the Influencer Leaderboard</h3>
            <p className="text-xs text-gray-300 text-center mb-3">
              Share your referral link, grow verified referrals, and unlock bonuses at{' '}
              <span className="font-semibold text-white">50 total referrals</span>.
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/influencers/auth">
                <GlassButton variant="success" size="md">
                  <Users className="w-3 h-3" />
                  Become Influencer
                </GlassButton>
              </Link>
              <GlassButton onClick={shareLeaderboard} variant="accent" size="md">
                <Share2 className="w-3 h-3" />
                Share Board
              </GlassButton>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3">
              Earnings are calculated from verified referrals and paid manually by admin.
            </p>
          </GlassCard>
        )}

        {/* Raffle-Specific Info */}
        {leaderboardType === LEADERBOARD_TYPES.RAFFLE && leaderboardData.currentRaffle && (
          <GlassCard className="p-4 mt-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-sm mb-1">{leaderboardData.currentRaffle.title}</h3>
                <p className="text-gray-300 text-xs mb-2">{leaderboardData.currentRaffle.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>🎯 Prize: {formatCurrency(leaderboardData.currentRaffle.value)}</span>
                  <span>📅 Draw: {leaderboardData.currentRaffle.drawDate?.toDate().toLocaleDateString()}</span>
                </div>
              </div>
              <Link
                to={`/raffle/${raffleId}`}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow"
              >
                View Raffle
              </Link>
            </div>
          </GlassCard>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-20 right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 10 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      {/* Permanent Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent py-1"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="backdrop-blur-xl bg-white/10 border-t border-white/20 mx-2 rounded-t-xl px-1 pt-1">
          <div className="flex justify-between items-center">
            {[
              { id: "home", label: "Home", icon: Home, url: INTERNAL_ROUTES.home },
              { id: "leaderboard", label: "Board", icon: Trophy, url: INTERNAL_ROUTES.leaderboard },
              { id: "influencers", label: "Earn", icon: Users, url: INTERNAL_ROUTES.influencer},
              { id: "dashboard", label: "Dashboard", icon: PieChart, url: INTERNAL_ROUTES.dashboard },
              { id: "profile", label: "Profile", icon: User, url: currentUser ? INTERNAL_ROUTES.dashboard : INTERNAL_ROUTES.login },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  to={tab.url}
                  className="flex-1 flex flex-col items-center py-0.5 min-w-0"
                >
                  <motion.div
                    className={`p-1 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      window.location.pathname === tab.url 
                        ? "bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow" 
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </motion.div>
                  <div className={`text-[10px] text-center leading-tight mt-0.5 ${window.location.pathname === tab.url ? "text-pink-400 font-semibold" : "text-gray-400"}`}>
                    {tab.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="absolute top-12 left-2 right-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-3 shadow-xl max-h-[70vh] overflow-y-auto"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3">
                <h3 className="font-bold text-white text-xs mb-1 flex items-center gap-1">
                  <Menu className="w-3 h-3" />
                  Menu
                </h3>
                <HeaderLinks onMobile={true} />
              </div>

              <div className="border-t border-white/20 pt-2">
                <h3 className="font-bold text-white text-xs mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Account
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {currentUser ? (
                    <Link
                      to={INTERNAL_ROUTES.dashboard}
                      className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-center hover:from-green-600 hover:to-emerald-600 transition-all text-xs"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="font-bold">Dashboard</span>
                      </div>
                    </Link>
                  ) : (
                    <Link
                      to={INTERNAL_ROUTES.login}
                      className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-center hover:from-green-600 hover:to-emerald-600 transition-all text-xs"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <LogIn className="w-3 h-3" />
                        <span className="font-bold">Login</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardPage;