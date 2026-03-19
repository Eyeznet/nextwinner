// src/pages/InfluencerProfile.jsx - OPTIMIZED VERSION
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Ticket, Trophy, Share2, ChevronRight, 
  ArrowRight, ExternalLink, Award, Clock, TrendingUp,
  Star, Crown, Target, Check, ChevronDown, Eye,
  Link as LinkIcon, MessageSquare, Instagram, Twitter,
  Facebook, Youtube, Globe, Mail, Calendar, MapPin,
  BarChart3, DollarSign, Gift, Heart, Zap,
  ShoppingBag, TrendingDown, Users as UsersIcon,
  Award as AwardIcon, TrendingUp as TrendIcon,
  Users as ReferralIcon, DollarSign as MoneyIcon,
  Activity, BarChart, LineChart, CandlestickChart,
  Target as TargetIcon, TrendingUp as GrowthIcon,
  Users as TeamIcon, Award as BadgeIcon, 
  BarChart as StatsIcon, LineChart as GraphIcon,
  AlertCircle, X, Sparkles, CheckCircle2, MessageCircle,
  Phone, Send, Medal, Rocket, Gift as GiftIcon
} from 'lucide-react';

// Firebase imports - Optimized
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from './firebaseConfig';

// Initialize Firebase
const db = getFirestore(app);

// DESIGN SYSTEM COMPONENTS

// Glassmorphic Card Component
const GlassCard = ({ children, className = "", ...props }) => (
  <div 
    className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Animated Badge Component
const AnimatedRankBadge = ({ rank, className = "" }) => {
  const getRankColors = (rank) => {
    switch(rank) {
      case 1: return {
        gradient: "from-yellow-400 to-yellow-600",
        glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
        icon: <Crown className="w-4 h-4" />
      };
      case 2: return {
        gradient: "from-gray-400 to-gray-600",
        glow: "shadow-[0_0_15px_rgba(156,163,175,0.3)]",
        icon: <Medal className="w-4 h-4" />
      };
      case 3: return {
        gradient: "from-orange-400 to-orange-600",
        glow: "shadow-[0_0_15px_rgba(251,146,60,0.3)]",
        icon: <Award className="w-4 h-4" />
      };
      default: return {
        gradient: "from-blue-500 to-indigo-600",
        glow: "shadow-[0_0_10px_rgba(59,130,246,0.2)]",
        icon: <Trophy className="w-3 h-3" />
      };
    }
  };

  const colors = getRankColors(rank);

  return (
    <motion.div
      className={`
        relative w-12 h-12 bg-gradient-to-r ${colors.gradient} rounded-lg flex items-center justify-center text-white ${colors.glow}
        backdrop-blur-lg border border-white/30 ${className}
      `}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.1 
      }}
      whileHover={{ 
        scale: 1.05, 
        rotate: [0, -2, 2, 0],
        transition: { duration: 0.2 }
      }}
    >
      <div className="text-center">
        {colors.icon}
        <div className="text-[8px] font-semibold mt-0.5">Rank #{rank}</div>
      </div>
    </motion.div>
  );
};

// Stats Grid Component
const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            className="backdrop-blur-xl bg-white/10 rounded-lg p-4 border border-white/20 hover:border-white/30 transition-all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-300">{stat.label}</div>
              </div>
            </div>
            {stat.trend && (
              <div className={`text-xs flex items-center gap-1 ${stat.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp className="w-3 h-3" />
                {stat.trend > 0 ? '+' : ''}{stat.trend}%
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// Copy to Clipboard Component
const CopyCodeSection = ({ code, title, description }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <GlassCard className="p-4">
      <div className="text-center mb-3">
        <motion.div
          className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2"
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>

      <motion.div
        className="bg-white/20 rounded-lg p-3 mb-3 backdrop-blur-sm border border-white/30"
        whileHover={{ scale: 1.01 }}
      >
        <div className="text-center">
          <div className="text-xs opacity-90 mb-1 text-gray-300">REFERRAL CODE</div>
          <motion.div
            className="font-mono text-xl font-black tracking-wider mb-1 bg-white/10 py-2 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            {code}
          </motion.div>
        </div>
      </motion.div>

      <motion.button
        onClick={copyToClipboard}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all text-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          animate={copied ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.2 }}
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        </motion.div>
        <span>{copied ? "Copied! 🎉" : "Copy Referral Code"}</span>
      </motion.button>
    </GlassCard>
  );
};

// Tab Navigation Component
const TabNavigation = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <motion.div
      className="backdrop-blur-xl bg-white/10 rounded-lg p-1 border border-white/20 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// UTILITY FUNCTIONS
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  
  if (date.toDate && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Cache system for Firebase reads
const influencerCache = new Map();
const rafflesCache = { data: null, timestamp: 0, ttl: 300000 }; // 5 minutes cache

// Optimized Firebase Queries
const getCachedRaffles = async () => {
  const now = Date.now();
  if (rafflesCache.data && (now - rafflesCache.timestamp) < rafflesCache.ttl) {
    return rafflesCache.data;
  }

  try {
    const rafflesQuery = query(
      collection(db, 'raffles'),
      where('status', '==', 'active'),
      orderBy('endDate', 'asc'),
      limit(4)
    );
    const rafflesSnapshot = await getDocs(rafflesQuery);
    const rafflesData = rafflesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    rafflesCache.data = rafflesData;
    rafflesCache.timestamp = now;
    return rafflesData;
  } catch (error) {
    console.error('Error loading raffles:', error);
    return [];
  }
};

// Main Influencer Profile Component - OPTIMIZED
const InfluencerProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRaffles, setActiveRaffles] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Memoized calculations
  const influencerStats = useMemo(() => {
    if (!influencer) return null;
    
    const data = influencer.influencerData || {};
    return {
      totalReferrals: data.totalReferrals || 0,
      totalTicketsReferred: data.totalTicketsReferred || 0,
      totalWinsReferred: data.totalWinsReferred || 0,
      conversionRate: data.conversionRate || 0,
      engagementRate: data.engagementRate || 0,
      lifetimeEarnings: data.lifetimeEarnings || 0
    };
  }, [influencer]);

  const tierInfo = useMemo(() => {
    const tier = influencer?.influencerData?.tier || 'Bronze';
    const colors = {
      'Bronze': { gradient: 'from-amber-700 to-amber-900', color: 'text-amber-400' },
      'Silver': { gradient: 'from-gray-400 to-gray-600', color: 'text-gray-300' },
      'Gold': { gradient: 'from-yellow-500 to-yellow-700', color: 'text-yellow-400' },
      'Platinum': { gradient: 'from-purple-500 to-purple-700', color: 'text-purple-400' },
      'Diamond': { gradient: 'from-cyan-400 to-blue-600', color: 'text-cyan-300' }
    };
    return { name: tier, ...(colors[tier] || colors.Bronze) };
  }, [influencer]);

  useEffect(() => {
    loadInfluencerProfile();
  }, [username]);

  const loadInfluencerProfile = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      if (influencerCache.has(username)) {
        const cached = influencerCache.get(username);
        setInfluencer(cached.influencer);
        setActiveRaffles(cached.raffles);
        setLoading(false);
        return;
      }

      // 1. Try direct document fetch first (fastest)
      try {
        const influencerRef = doc(db, 'users', username);
        const influencerDoc = await getDoc(influencerRef);
        
        if (influencerDoc.exists()) {
          const data = influencerDoc.data();
          if (data.accountType === 'influencer') {
            await handleInfluencerFound({ id: influencerDoc.id, ...data });
            return;
          }
        }
      } catch (error) {
        console.log('Not a direct ID, trying other methods...');
      }

      // 2. Try referral code query
      const refQuery = query(
        collection(db, 'users'),
        where('referralCode', '==', username),
        where('accountType', '==', 'influencer'),
        limit(1)
      );
      const refSnapshot = await getDocs(refQuery);
      
      if (!refSnapshot.empty) {
        const doc = refSnapshot.docs[0];
        await handleInfluencerFound({ id: doc.id, ...doc.data() });
        return;
      }

      setError('Influencer not found');
      
    } catch (error) {
      console.error('Error loading influencer:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInfluencerFound = async (influencerData) => {
    setInfluencer(influencerData);
    
    // Load raffles from cache or fresh
    const raffles = await getCachedRaffles();
    setActiveRaffles(raffles);
    
    // Cache the result
    influencerCache.set(username, {
      influencer: influencerData,
      raffles,
      timestamp: Date.now()
    });
  };

  const copyReferralLink = () => {
    if (!influencer?.referralCode) return;
    const link = `${window.location.origin}/i/${influencer.referralCode}`;
    navigator.clipboard.writeText(link);
    // Optional: Show toast notification instead of alert
  };

  const getReferralUrl = (path = '') => {
    if (!influencer?.referralCode) return path;
    return `${path}?ref=${influencer.referralCode}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !influencer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <GlassCard className="p-6 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Influencer Not Found</h2>
          <p className="text-gray-300 mb-4">{error || 'The influencer profile could not be loaded'}</p>
          <div className="space-y-3">
            <Link
              to="/influencers"
              className="block bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all"
            >
              Browse All Influencers
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg transition-all"
            >
              Go Back
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const displayName = influencer.influencerData?.stageName || influencer.displayName || influencer.username || 'Influencer';
  const bio = influencer.influencerData?.bio || 'Join me on NextWinner to win amazing prizes!';
  const socialLinks = influencer.influencerData?.socialLinks || {};
  const referralLink = `${window.location.origin}/i/${influencer.referralCode}`;

  const statsData = [
    {
      label: "Total Referrals",
      value: influencerStats?.totalReferrals.toLocaleString() || "0",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      trend: 12
    },
    {
      label: "Tickets Referred",
      value: influencerStats?.totalTicketsReferred.toLocaleString() || "0",
      icon: Ticket,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      trend: 8
    },
    {
      label: "Wins Referred",
      value: influencerStats?.totalWinsReferred.toLocaleString() || "0",
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      trend: 5
    },
    {
      label: "Earnings",
      value: formatCurrency(influencerStats?.lifetimeEarnings || 0),
      icon: DollarSign,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      trend: 15
    }
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "raffles", label: "Live Raffles", icon: Ticket },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "contact", label: "Contact", icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white pb-16">
      {/* Header Section with Glassmorphic Design */}
      <div className="relative">
        {/* Cover Image with Gradient Overlay */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
          {influencer.influencerData?.coverImage ? (
            <img
              src={influencer.influencerData.coverImage}
              alt={`${displayName} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Profile Header */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image */}
              <div className="relative">
                <motion.div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white/20 overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 p-1"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {influencer.photoURL ? (
                    <img 
                      src={influencer.photoURL} 
                      alt={displayName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center text-3xl font-bold">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </motion.div>
                
                {/* Tier Badge */}
                <div className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${tierInfo.gradient} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                  {tierInfo.name}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <motion.h1 
                      className="text-2xl md:text-3xl font-bold text-white truncate"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {displayName}
                    </motion.h1>
                    <motion.p 
                      className="text-purple-300 font-semibold text-sm md:text-base mb-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      @{influencer.username || influencer.referralCode}
                    </motion.p>
                    <motion.p 
                      className="text-gray-300 text-sm md:text-base leading-relaxed mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {bio}
                    </motion.p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AnimatedRankBadge rank={influencer.influencerData?.rank || 1} />
                    
                    {/* Share Button */}
                    <div className="relative">
                      <motion.button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 backdrop-blur-sm transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Share2 className="w-5 h-5" />
                      </motion.button>
                      
                      {showShareMenu && (
                        <motion.div
                          className="absolute right-0 mt-2 w-48 bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="p-3 border-b border-white/20">
                            <p className="text-sm font-medium text-white">Share Profile</p>
                          </div>
                          <div className="p-2 space-y-1">
                            <button
                              onClick={() => {
                                copyReferralLink();
                                setShowShareMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <LinkIcon className="w-4 h-4" />
                              Copy Link
                            </button>
                            <button
                              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Join ${displayName} on NextWinner! ${referralLink}`)}`, '_blank')}
                              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <MessageSquare className="w-4 h-4" />
                              WhatsApp
                            </button>
                            <button
                              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join ${displayName} on NextWinner! ${referralLink}`)}`, '_blank')}
                              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg flex items-center gap-2 text-sm"
                            >
                              <Twitter className="w-4 h-4" />
                              Twitter
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {(socialLinks.instagram || socialLinks.twitter || socialLinks.youtube) && (
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {socialLinks.instagram && (
                      <a 
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a 
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.youtube && (
                      <a 
                        href={socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <Youtube className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.website && (
                      <a 
                        href={socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <StatsGrid stats={statsData} />
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Why Join Section */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Why Join With Me?</h3>
                        <p className="text-gray-300 text-sm">Exclusive benefits when you register</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Get ₦500 bonus on your first deposit",
                        "Exclusive access to premium raffles",
                        "Personalized winning strategies",
                        "24/7 support from my team",
                        "Daily raffle recommendations",
                        "Higher chances of winning"
                      ].map((benefit, index) => (
                        <motion.div
                          key={index}
                          className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-sm text-gray-300">{benefit}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
                
                <div>
                  <CopyCodeSection
                    code={influencer.referralCode}
                    title={`Join ${displayName}'s Team`}
                    description="Use my referral code to get started"
                  />
                </div>
              </div>
            )}

            {/* Raffles Tab */}
            {activeTab === "raffles" && (
              <div>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-green-400" />
                      Live Raffles
                    </h3>
                    <Link 
                      to={getReferralUrl('/live-draw')}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  {activeRaffles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeRaffles.map((raffle, index) => (
                        <motion.div
                          key={raffle.id}
                          className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="h-40 bg-gradient-to-r from-purple-600/30 to-pink-600/30 relative overflow-hidden">
                            {raffle.image ? (
                              <img 
                                src={raffle.image} 
                                alt={raffle.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Ticket className="w-12 h-12 text-purple-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-bold text-white mb-2">{raffle.title}</h4>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-green-400 font-bold">
                                {formatCurrency(raffle.value)}
                              </span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Active
                              </span>
                            </div>
                            
                            <Link
                              to={getReferralUrl(`/item/${raffle.id}`)}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                            >
                              Join via {displayName.split(' ')[0]}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400">No active raffles at the moment</p>
                      <p className="text-sm text-gray-500 mt-2">Check back soon for new raffles!</p>
                    </div>
                  )}
                </GlassCard>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="mt-8">
          <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <GlassCard className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Ready to Start Winning?</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Join thousands of winners who started with {displayName}'s referral. 
                Your next big win could be just a click away!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={getReferralUrl('/signup')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  Join Now with {displayName}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/influencers"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all"
                >
                  Browse All Influencers
                </Link>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

// Loading Skeleton with Glassmorphic Design
const LoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <GlassCard className="p-6">
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 bg-white/10 rounded-2xl animate-pulse"></div>
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-white/10 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-1/2"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    </GlassCard>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="backdrop-blur-xl bg-white/10 rounded-lg p-4 border border-white/20 animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  </div>
);

export default InfluencerProfile;