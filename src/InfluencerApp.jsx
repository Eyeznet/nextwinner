// src/pages/RafflePartnersList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route, useParams } from 'react-router-dom';
import { 
  Users, Trophy, Star, Filter, Search, TrendingUp,
  X, ChevronDown, ChevronRight, Check, Instagram,
  Twitter, Youtube, Award, Crown, AlertCircle,
  Share2, Copy, Facebook, MessageSquare, Mail, ArrowLeft,
  QrCode, Download, Image as ImageIcon, Link as LinkIcon,
  Globe, Gift, DollarSign, TrendingUp as TrendingUpIcon,
  Users as UsersIcon, Target, BarChart, Percent,Home,User
} from 'lucide-react';

// Firebase imports
import { getFirestore, collection, query, getDocs, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Firebase
const db = getFirestore(app);
const auth = getAuth(app);

// Import glassmorphic components
import {
  GradientBackground,
  GlassHeader,
  MainContainer,
  GlassCard,
  StatsCard,
  SearchBar,
  PrimaryButton,
  SecondaryButton,
  ViewModeToggle,
  MobileHamburgerMenu,
  Pagination,
  CategoryFilters,
  EmptyState,
  CallToAction,
  CountdownNotice,
  BottomNavigation,
  CategoryBadge,
  COLOR_SCHEME
} from './components/GlassmorphicUI';

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
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const getTierColor = (tier) => {
  const tierMap = {
    'platinum': 'from-blue-500 to-indigo-600',
    'gold': 'from-yellow-500 to-amber-500',
    'silver': 'from-gray-400 to-gray-600',
    'bronze': 'from-amber-700 to-amber-900'
  };
  return tierMap[tier?.toLowerCase()] || tierMap.bronze;
};

const getTierName = (tier) => {
  if (!tier) return 'Bronze';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
};

// Loading Skeleton
const PartnerCardSkeleton = () => (
  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 rounded-full bg-white/10"></div>
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded mb-1 w-32"></div>
        <div className="h-3 bg-white/10 rounded w-24"></div>
      </div>
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-3 bg-white/10 rounded w-full"></div>
      <div className="h-3 bg-white/10 rounded w-3/4"></div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <div className="h-8 bg-white/10 rounded"></div>
      <div className="h-8 bg-white/10 rounded"></div>
      <div className="h-8 bg-white/10 rounded"></div>
    </div>
  </div>
);

// Share Toolkit Component
const PartnerShareToolkit = () => {
  const { username, referralCode } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const partnersQuery = query(
            collection(db, 'users'),
            where('accountType', '==', 'marketing_partner')
          );
          
          const snapshot = await getDocs(partnersQuery);
          
          if (!snapshot.empty) {
            const partnerData = snapshot.docs[0].data();
            setPartner({
              id: snapshot.docs[0].id,
              ...partnerData
            });
            
            const baseUrl = window.location.origin;
            setShareUrl(`${baseUrl}/join?ref=${partnerData.referralCode || username}`);
          } else {
            navigate('/partners');
          }
        } catch (error) {
          console.error('Error loading partner:', error);
          navigate('/partners');
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [username, referralCode, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateShareText = (platform) => {
    const partnerName = partner?.displayName || 'Our Raffle';
    const baseText = `🎉 Join the excitement! Participate in amazing raffles and win big prizes! Use my referral link to get bonus tickets on your first purchase. ${partnerName}`;
    
    switch (platform) {
      case 'twitter':
        return `${baseText}\n\n${shareUrl}\n\n#RaffleTime #WinBig #PrizeGiveaway`;
      case 'whatsapp':
        return `Hey! Check out these amazing raffles with huge prizes! Join using my referral link for bonus tickets: ${shareUrl}\n\nGood luck! 🎁`;
      case 'email':
        return {
          subject: `Join Our Exciting Raffles - Win Amazing Prizes!`,
          body: `Hi!\n\nI wanted to invite you to join our exciting raffle platform where you can win amazing prizes!\n\nUse my referral link to get bonus tickets on your first purchase: ${shareUrl}\n\nBest of luck!\n${partnerName}`
        };
      default:
        return `${baseText}\n\n${shareUrl}`;
    }
  };

  const handleShare = (platform) => {
    const shareText = generateShareText(platform);
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText.subject)}&body=${encodeURIComponent(shareText.body)}`;
        break;
      case 'instagram':
        handleCopyLink();
        break;
    }
  };

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm">Loading share toolkit...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    navigate('/partners');
    return null;
  }

  return (
    <GradientBackground>
      <GlassHeader
        title="Share & Earn"
        subtitle="Spread the word and earn rewards"
        onBack={() => navigate(-1)}
      />

      <MainContainer>
        {/* Partner Profile */}
        <GlassCard className="p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden">
                {partner.photoURL ? (
                  <img 
                    src={partner.photoURL} 
                    alt={partner.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                    {partner.displayName?.charAt(0) || 'P'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-sm font-bold text-white">{partner.displayName}</h2>
              <p className="text-gray-300 text-xs">Marketing Partner</p>
              
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <UsersIcon className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-gray-300">12 referrals</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-300">{formatCurrency(partner.earnings || 0)} earned</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Referral Link */}
        <GlassCard className="p-3 mb-3">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1">
            <LinkIcon className="w-4 h-4" />
            Your Referral Link
          </h3>
          
          <div className="flex gap-1 mb-2">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 overflow-x-auto">
              <code className="text-xs text-gray-300">{shareUrl}</code>
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-3 rounded-lg text-xs font-medium flex items-center gap-1 ${
                copied 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gradient-to-r from-pink-500 to-purple-500'
              }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <p className="text-gray-300 text-xs">
            Share this link. When someone joins using it, you earn commission!
          </p>
        </GlassCard>

        {/* Quick Share Buttons */}
        <GlassCard className="p-3 mb-3">
          <h3 className="text-sm font-bold text-white mb-3">Quick Share</h3>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleShare('whatsapp')}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg flex flex-col items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">WhatsApp</span>
            </button>
            
            <button
              onClick={() => handleShare('twitter')}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex flex-col items-center gap-1"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-xs">Twitter</span>
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="p-2 bg-blue-700 hover:bg-blue-800 rounded-lg flex flex-col items-center gap-1"
            >
              <Facebook className="w-4 h-4" />
              <span className="text-xs">Facebook</span>
            </button>
          </div>
        </GlassCard>

        {/* QR Code Section */}
        <GlassCard className="p-3 mb-3">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1">
            <QrCode className="w-4 h-4" />
            QR Code
          </h3>
          
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-lg">
              <img 
                src={generateQRCode()} 
                alt="QR Code" 
                className="w-32 h-32"
              />
            </div>
            
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = generateQRCode();
                link.download = `raffle-qr-${partner.referralCode || partner.id}.png`;
                link.click();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download QR
            </button>
          </div>
        </GlassCard>

        {/* Final CTA */}
        <CallToAction
          title="Ready to Earn More?"
          description="Join our partner program and maximize your earnings!"
          primaryAction={
            <Link
              to="/partners/join"
              className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold text-xs flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3" />
              Become Partner
            </Link>
          }
          secondaryAction={
            <Link
              to="/learn/partners"
              className="px-3 py-1.5 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 text-xs font-medium"
            >
              Learn More
            </Link>
          }
        />
      </MainContainer>
    </GradientBackground>
  );
};

// Marketing Content Component
const MarketingContent = () => {
  const marketingTips = [
    {
      title: "Social Media Power",
      description: "Share raffle links on all your social platforms",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Email Campaigns",
      description: "Send targeted emails to your subscriber list",
      icon: Mail,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "QR Code Magic",
      description: "Use QR codes for offline marketing",
      icon: QrCode,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Referral Rewards",
      description: "Earn commission on every successful referral",
      icon: DollarSign,
      color: "from-yellow-500 to-amber-500"
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white mb-2">Marketing Strategies</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {marketingTips.map((tip, index) => (
          <GlassCard key={index} className="p-2">
            <div className="flex items-start gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tip.color} flex items-center justify-center`}>
                <tip.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{tip.title}</h4>
                <p className="text-gray-300 text-xs">{tip.description}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

// Main Component
const RafflePartnersList = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tier: 'all',
    sortBy: 'referrals',
    activeOnly: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Mock data for marketing partners
  const mockPartners = [
    {
      id: '1',
      displayName: 'Tech Reviews NG',
      photoURL: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop',
      bio: 'Bringing you the latest tech raffles with amazing gadget prizes!',
      tier: 'platinum',
      verified: true,
      referralStats: {
        totalReferrals: 2450,
        totalEarnings: 1250000,
        conversionRate: 12.5,
        totalWins: 45
      },
      socialLinks: {
        twitter: '@techreviewsng',
        instagram: '@techreviews.ng'
      },
      referralCode: 'techreviews',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      displayName: 'Fashion Finds',
      photoURL: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
      bio: 'Exclusive fashion and lifestyle raffles with luxury prizes!',
      tier: 'gold',
      verified: true,
      referralStats: {
        totalReferrals: 1870,
        totalEarnings: 935000,
        conversionRate: 10.8,
        totalWins: 32
      },
      socialLinks: {
        instagram: '@fashionfindsng'
      },
      referralCode: 'fashionfinds',
      createdAt: new Date('2024-02-20')
    },
    {
      id: '3',
      displayName: 'Gaming Arena',
      photoURL: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
      bio: 'Win gaming consoles, PCs, and exclusive gaming merchandise!',
      tier: 'gold',
      verified: false,
      referralStats: {
        totalReferrals: 1560,
        totalEarnings: 780000,
        conversionRate: 8.5,
        totalWins: 28
      },
      socialLinks: {
        twitter: '@gamingarena',
        youtube: 'Gaming Arena'
      },
      referralCode: 'gamingarena',
      createdAt: new Date('2024-03-10')
    },
    {
      id: '4',
      displayName: 'Home & Living',
      photoURL: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      bio: 'Home appliance and furniture raffles with practical prizes!',
      tier: 'silver',
      verified: true,
      referralStats: {
        totalReferrals: 980,
        totalEarnings: 490000,
        conversionRate: 7.2,
        totalWins: 18
      },
      referralCode: 'homeliving',
      createdAt: new Date('2024-04-05')
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setPartners(mockPartners);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = searchTerm === '' || 
      partner.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.bio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = filters.tier === 'all' || partner.tier === filters.tier;
    const matchesActive = !filters.activeOnly || partner.verified;
    
    return matchesSearch && matchesTier && matchesActive;
  });

  // Sort partners
  const sortedPartners = [...filteredPartners].sort((a, b) => {
    switch (filters.sortBy) {
      case 'referrals':
        return b.referralStats.totalReferrals - a.referralStats.totalReferrals;
      case 'earnings':
        return b.referralStats.totalEarnings - a.referralStats.totalEarnings;
      case 'recent':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return b.referralStats.totalReferrals - a.referralStats.totalReferrals;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPartners = sortedPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPartners.length / itemsPerPage);

  const stats = [
    {
      label: "Active Partners",
      value: partners.filter(p => p.verified).length,
      change: "+2 this month",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Total Referrals",
      value: formatNumber(partners.reduce((sum, p) => sum + p.referralStats.totalReferrals, 0)),
      change: "+15% growth",
      trend: "up",
      icon: TrendingUpIcon,
      color: "from-pink-500 to-rose-500"
    },
    {
      label: "Total Earnings",
      value: formatCurrency(partners.reduce((sum, p) => sum + p.referralStats.totalEarnings, 0)),
      change: "Commission paid",
      trend: "up",
      icon: DollarSign,
      color: "from-purple-500 to-indigo-500"
    },
    {
      label: "Conversion Rate",
      value: "9.8%",
      change: "Industry leading",
      trend: "up",
      icon: Percent,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Partners', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { id: 'platinum', name: 'Platinum', icon: Crown, color: 'from-blue-500 to-indigo-600' },
    { id: 'gold', name: 'Gold', icon: Trophy, color: 'from-yellow-500 to-amber-500' },
    { id: 'silver', name: 'Silver', icon: Award, color: 'from-gray-400 to-gray-600' },
    { id: 'bronze', name: 'Bronze', icon: Star, color: 'from-amber-700 to-amber-900' }
  ];

  const PartnerCard = ({ partner, index }) => {
    return (
      <motion.div
        className="rounded-xl overflow-hidden backdrop-blur-xl bg-white/10 border border-white/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.2 }}
        whileHover={{ y: -2, scale: 1.01 }}
      >
        <div className="relative overflow-hidden">
          <img
            src={partner.photoURL}
            alt={partner.displayName}
            className="w-full h-32 object-cover"
          />
          
          {/* Tier Badge */}
          <div className="absolute top-2 left-2">
            <CategoryBadge
              icon={partner.tier === 'platinum' ? Crown : partner.tier === 'gold' ? Trophy : Award}
              color={getTierColor(partner.tier)}
            />
          </div>

          {/* Verified Badge */}
          {partner.verified && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm truncate">{partner.displayName}</h4>
              <p className="text-gray-300 text-xs truncate">{partner.bio}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-center p-2 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="text-xs font-bold text-purple-400">
                {formatNumber(partner.referralStats.totalReferrals)}
              </div>
              <div className="text-gray-300 text-xs">Referrals</div>
            </div>
            <div className="text-center p-2 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="text-xs font-bold text-green-400">
                {formatCurrency(partner.referralStats.totalEarnings)}
              </div>
              <div className="text-gray-300 text-xs">Earned</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <PrimaryButton
              onClick={() => navigate(`/partner/${partner.referralCode}`)}
              className="flex-1 text-xs"
              size="sm"
            >
              <UsersIcon className="w-3 h-3" />
              Follow
            </PrimaryButton>
            <SecondaryButton
              onClick={() => navigate(`/share/${partner.referralCode}`)}
              className="flex-1 text-xs"
              size="sm"
            >
              <Share2 className="w-3 h-3" />
              Share
            </SecondaryButton>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <GradientBackground>
      <GlassHeader
        title="Marketing Partners"
        subtitle="Join forces with top promoters"
        rightSection={
          <>
            <MobileHamburgerMenu
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              menuItems={[
                { name: "Home", path: "/", icon: Home },
                { name: "Raffles", path: "/raffles", icon: Gift },
                { name: "Partners", path: "/partners", icon: Users },
                { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
                { name: "Dashboard", path: "/dashboard", icon: BarChart },
                { name: "Profile", path: "/profile", icon: User }
              ]}
            />
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
          </>
        }
      />

      <MainContainer>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Join CTA */}
        <CallToAction
          title="Become a Marketing Partner!"
          description="Earn up to 15% commission on every referral. Start earning today!"
          icon={DollarSign}
          gradient="from-green-500/20 to-emerald-500/20"
          primaryAction={
            <Link
              to="/partners/join"
              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3" />
              Join Now
            </Link>
          }
          secondaryAction={
            <Link
              to="/learn/partners"
              className="px-3 py-1.5 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 text-xs font-medium"
            >
              Learn More
            </Link>
          }
        />

        {/* Search and Filter */}
        <GlassCard className="p-2 mb-3">
          <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-between">
            <SearchBar
              placeholder="Search marketing partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex gap-1 w-full lg:w-auto">
              <SecondaryButton
                onClick={() => setShowFilters(!showFilters)}
                icon={Filter}
                size="sm"
              >
                Filters
              </SecondaryButton>
              
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="px-2 py-1.5 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 focus:ring-1 focus:ring-pink-500 focus:border-transparent text-xs"
              >
                <option value="referrals">Most Referrals</option>
                <option value="earnings">Highest Earnings</option>
                <option value="recent">Recently Joined</option>
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/20">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tier Level</label>
                <select
                  value={filters.tier}
                  onChange={(e) => setFilters({...filters, tier: e.target.value})}
                  className="w-full px-2 py-1.5 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 focus:ring-1 focus:ring-pink-500 focus:border-transparent text-xs"
                >
                  <option value="all">All Tiers</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                <select
                  value={filters.activeOnly}
                  onChange={(e) => setFilters({...filters, activeOnly: e.target.value === 'true'})}
                  className="w-full px-2 py-1.5 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 focus:ring-1 focus:ring-pink-500 focus:border-transparent text-xs"
                >
                  <option value="true">Active Only</option>
                  <option value="false">All Partners</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({
                      tier: 'all',
                      sortBy: 'referrals',
                      activeOnly: true
                    });
                    setSearchTerm('');
                  }}
                  className="w-full px-2 py-1.5 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all text-xs"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Category Quick Filters */}
        <CategoryFilters
          categories={categories}
          selectedCategory={filters.tier}
          onSelectCategory={(category) => setFilters({...filters, tier: category})}
        />

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-2">
          <div>
            <h3 className="font-bold text-white text-sm">
              {sortedPartners.length} Marketing Partners
            </h3>
            <p className="text-gray-300 text-xs">
              {searchTerm && `"${searchTerm}"`}
              {filters.tier !== 'all' && ` • ${categories.find(c => c.id === filters.tier)?.name}`}
            </p>
          </div>
          <div className="text-xs text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <PartnerCardSkeleton key={i} />
            ))}
          </div>
        ) : currentPartners.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
            {currentPartners.map((partner, index) => (
              <PartnerCard key={partner.id} partner={partner} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No Partners Found"
            description="Try adjusting your search or filters"
            actionButton={
              <PrimaryButton onClick={() => {
                setFilters({
                  tier: 'all',
                  sortBy: 'referrals',
                  activeOnly: true
                });
                setSearchTerm('');
              }}>
                Reset Filters
              </PrimaryButton>
            }
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Marketing Content Section */}
        <GlassCard className="p-3 mb-3">
          <MarketingContent />
        </GlassCard>

        {/* Final Join CTA */}
        <CallToAction
          title="Ready to Start Earning?"
          description="Join our marketing partner program today and earn commissions on every successful referral!"
          icon={Target}
          gradient="from-pink-500/20 to-purple-500/20"
          primaryAction={
            <Link
              to="/partners/join"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold text-sm flex items-center gap-1"
            >
              <DollarSign className="w-4 h-4" />
              Become a Partner
            </Link>
          }
          secondaryAction={
            <Link
              to="/commission-rates"
              className="px-4 py-2 backdrop-blur-md bg-white/10 text-white rounded-lg border border-white/20 text-sm font-medium"
            >
              <Percent className="w-4 h-4" />
              View Rates
            </Link>
          }
        />

        {/* Commission Info */}
        <GlassCard className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
              <Percent className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Commission Structure</h3>
              <p className="text-gray-300 text-xs">Earn based on your performance tier</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="text-xs text-gray-300">Bronze Tier</div>
              <div className="text-sm font-bold text-white">5% Commission</div>
            </div>
            <div className="p-2 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="text-xs text-gray-300">Silver Tier</div>
              <div className="text-sm font-bold text-white">8% Commission</div>
            </div>
            <div className="p-2 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="text-xs text-gray-300">Gold Tier</div>
              <div className="text-sm font-bold text-white">12% Commission</div>
            </div>
            <div className="p-2 backdrop-blur-md bg-white/5 rounded-lg">
              <div className="text-xs text-gray-300">Platinum Tier</div>
              <div className="text-sm font-bold text-white">15% Commission</div>
            </div>
          </div>
        </GlassCard>
      </MainContainer>

      {/* Add these imports at the top */}
      {/* Add BottomNavigation */}
      <BottomNavigation
        tabs={[
          { id: "home", label: "Home", icon: Home, path: "/" },
          { id: "raffles", label: "Raffles", icon: Gift, path: "/raffles" },
          { id: "partners", label: "Partners", icon: Users, path: "/partners" },
          { id: "leaderboard", label: "Top", icon: Trophy, path: "/leaderboard" },
          { id: "profile", label: "Profile", icon: User, path: "/profile" }
        ]}
      />
    </GradientBackground>
  );
};

// Main App Component that includes routes
const InfluencerApp = () => {
  return (
    <Routes>
      <Route path="/" element={<RafflePartnersList />} />
      <Route path="/partners" element={<RafflePartnersList />} />
      <Route 
        path="/share/:referralCode" 
        element={<PartnerShareToolkit />} 
      />
      <Route 
        path="/partner/:username/share" 
        element={<PartnerShareToolkit />} 
      />
    </Routes>
  );
};

export default InfluencerApp;