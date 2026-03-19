// src/pages/InfluencerShareToolkit.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Share2, Copy, Link as LinkIcon, MessageSquare,
  Twitter, Instagram, Facebook, Download, BarChart3,
  TrendingUp, Users, Ticket, Trophy, Zap, Sparkles,
  RefreshCw, QrCode, Clock, Target, Globe, Image,
  ChevronRight, Check, AlertCircle, Home, ArrowLeft,
  DollarSign, Eye, ExternalLink, Mail, Smartphone,
  ThumbsUp, Heart, Star, Award, TrendingDown, Filter,
  Search, Settings, Bell, Camera, Plus, Minus,
  Shield, Lock, User, LogOut, HelpCircle, Calendar,
  FileText, Megaphone, Info, Edit3, X, Menu,
  ShoppingBag, Gift, Percent, Tag, Activity, PieChart,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Firebase imports
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, collection, query, where, 
  getDocs, doc, getDoc, updateDoc, increment,
  serverTimestamp, addDoc, orderBy, limit
} from 'firebase/firestore';
import { app } from './firebaseConfig';

// Initialize Firebase
const db = getFirestore(app);

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

// Add Send icon component
const Send = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading your share toolkit...</p>
    </div>
  </div>
);

// Error Component
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 flex items-center justify-center">
    <div className="text-center p-8 bg-gray-900/80 rounded-2xl border border-red-500/30 max-w-md">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Error</h2>
      <p className="text-gray-300 mb-6">{error || 'Failed to load toolkit'}</p>
      <div className="flex gap-3">
        <Link
          to="/influencers"
          className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg inline-block"
        >
          Go Back
        </Link>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  </div>
);

// Social Templates - Memoized to prevent re-renders
const useSocialTemplates = () => useMemo(() => ({
  general: [
    {
      id: 1,
      text: `🚀 Join me on NextWinner! Use my referral link to access amazing raffles and win big prizes: {REFERRAL_LINK}`,
      platform: 'all',
      hashtags: '#NextWinner #Raffle #WinBig'
    },
    {
      id: 2,
      text: `🎯 Want to win incredible prizes? Join through my link and get started today: {REFERRAL_LINK}`,
      platform: 'all',
      hashtags: '#Giveaway #Contest #Winning'
    },
    {
      id: 3,
      text: `🌟 Sharing my NextWinner referral link! Let's win together and share the excitement: {REFERRAL_LINK}`,
      platform: 'all',
      hashtags: '#WinTogether #RafflePlatform'
    },
    {
      id: 4,
      text: `💰 Win cash prizes, cars, phones, and more! Join via my link: {REFERRAL_LINK}`,
      platform: 'all',
      hashtags: '#CashPrizes #Luxury #Gaming'
    },
    {
      id: 5,
      text: `🔥 Limited time offer! Join NextWinner through my referral for exclusive access to premium raffles: {REFERRAL_LINK}`,
      platform: 'all',
      hashtags: '#LimitedTime #Exclusive #Premium'
    },
    {
      id: 6,
      text: `👑 Become a winner today! Use my NextWinner link to join the community: {REFERRAL_LINK}`,
      platform: 'all',
      hashtags: '#Winner #Community #JoinNow'
    },
    {
      id: 7,
      text: `🎁 Amazing prizes are waiting for you! Click my link to start your winning journey: {REFERRAL_LINK}`,
      platform: 'all',
      hashtags: '#Prizes #Journey #StartNow'
    }
  ],
  twitter: [
    {
      id: 8,
      text: `🚀 Just joined @NextWinner - the hottest raffle platform! Use my link to join and win amazing prizes: {REFERRAL_LINK}`,
      platform: 'twitter',
      hashtags: '#NextWinner #Raffle #WinBig #Giveaway'
    },
    {
      id: 9,
      text: `🎯 Ready to win? Join me on @NextWinner! My referral link gets you started: {REFERRAL_LINK}`,
      platform: 'twitter',
      hashtags: '#Winning #Contest #RaffleTime'
    },
    {
      id: 10,
      text: `🔥 WINNING ALERT! Join @NextWinner through my link for exclusive raffles: {REFERRAL_LINK}`,
      platform: 'twitter',
      hashtags: '#WinningAlert #Exclusive #Trending'
    },
    {
      id: 11,
      text: `💰 Cash prizes, luxury items, and more! Join @NextWinner via my link: {REFERRAL_LINK}`,
      platform: 'twitter',
      hashtags: '#Cash #Luxury #Prizes'
    },
    {
      id: 12,
      text: `🌟 Sharing is caring! My @NextWinner referral link for you: {REFERRAL_LINK}`,
      platform: 'twitter',
      hashtags: '#Sharing #Caring #Community'
    },
    {
      id: 13,
      text: `🎁 Who doesn't love free prizes? Join @NextWinner with my link: {REFERRAL_LINK}`,
      platform: 'twitter',
      hashtags: '#FreePrizes #Love #JoinUs'
    },
    {
      id: 14,
      text: `👑 Become royalty in the raffle world! @NextWinner link: {REFERRAL_LINK}`,
      platform: 'twitter',
      hashtags: '#Royalty #RaffleKing #RaffleQueen'
    }
  ],
  whatsapp: [
    {
      id: 15,
      text: `Hey! Join me on NextWinner - an amazing raffle platform! Use my link to sign up: {REFERRAL_LINK}`,
      platform: 'whatsapp',
      hashtags: ''
    },
    {
      id: 16,
      text: `Want to win big prizes? Join NextWinner through my referral link: {REFERRAL_LINK}`,
      platform: 'whatsapp',
      hashtags: ''
    },
    {
      id: 17,
      text: `Check out NextWinner! Amazing raffles with my referral: {REFERRAL_LINK}`,
      platform: 'whatsapp',
      hashtags: ''
    },
    {
      id: 18,
      text: `Let's win together! Join NextWinner via my link: {REFERRAL_LINK}`,
      platform: 'whatsapp',
      hashtags: ''
    },
    {
      id: 19,
      text: `Exclusive raffle access! My NextWinner referral: {REFERRAL_LINK}`,
      platform: 'whatsapp',
      hashtags: ''
    },
    {
      id: 20,
      text: `Win cash and prizes! Join NextWinner here: {REFERRAL_LINK}`,
      platform: 'whatsapp',
      hashtags: ''
    },
    {
      id: 21,
      text: `Amazing platform for raffles! Use my link to join: {REFERRAL_LINK}`,
      platform: 'whatsapp',
      hashtags: ''
    }
  ],
  instagram: [
    {
      id: 22,
      text: `🚀 Join me on @NextWinner! Use my link in bio to access amazing raffles and win big! 🔥\n\n{REFERRAL_LINK}`,
      platform: 'instagram',
      hashtags: '#NextWinner #Raffle #WinBig #Giveaway #Contest #Winning #Prizes'
    },
    {
      id: 23,
      text: `🎯 Ready to win incredible prizes? Join through my link in bio! ✨\n\n{REFERRAL_LINK}`,
      platform: 'instagram',
      hashtags: '#Win #Contest #Raffle #Giveaway #Prize #Exclusive'
    },
    {
      id: 24,
      text: `🌟 Let's win together! Sharing my @NextWinner referral link in bio 👇\n\n{REFERRAL_LINK}`,
      platform: 'instagram',
      hashtags: '#WinTogether #Community #Sharing #RaffleLove'
    },
    {
      id: 25,
      text: `💰 Cash prizes, luxury items, electronics! Join via link in bio 💎\n\n{REFERRAL_LINK}`,
      platform: 'instagram',
      hashtags: '#CashPrizes #Luxury #Electronics #Gaming #Fashion'
    },
    {
      id: 26,
      text: `🔥 EXCLUSIVE ACCESS! Limited time offer through my link in bio ⏳\n\n{REFERRAL_LINK}`,
      platform: 'instagram',
      hashtags: '#Exclusive #LimitedTime #Offer #SpecialAccess'
    },
    {
      id: 27,
      text: `👑 Become a winner with @NextWinner! Link in bio to join royalty 🏆\n\n{REFERRAL_LINK}`,
      platform: 'instagram',
      hashtags: '#Winner #Royalty #Champion #TopTier'
    },
    {
      id: 28,
      text: `🎁 Amazing prizes waiting! Click link in bio to start winning journey 🚀\n\n{REFERRAL_LINK}`,
      platform: 'instagram',
      hashtags: '#Prizes #Journey #StartNow #NewBeginnings'
    }
  ],
  facebook: [
    {
      id: 29,
      text: `Join me on NextWinner! An amazing platform for raffles and giveaways. Use my referral link to get started: {REFERRAL_LINK}`,
      platform: 'facebook',
      hashtags: '#NextWinner #Raffle #Giveaway #WinBig #Contest'
    },
    {
      id: 30,
      text: `Win incredible prizes on NextWinner! Join through my referral link: {REFERRAL_LINK}`,
      platform: 'facebook',
      hashtags: '#Win #Prizes #Raffle #Contest #Giveaway'
    },
    {
      id: 31,
      text: `Sharing my NextWinner referral link! Let's win together: {REFERRAL_LINK}`,
      platform: 'facebook',
      hashtags: '#Share #WinTogether #Community #Friends'
    },
    {
      id: 32,
      text: `Cash prizes, luxury items, and more on NextWinner! Join via my link: {REFERRAL_LINK}`,
      platform: 'facebook',
      hashtags: '#Cash #Luxury #Items #Prizes #Rewards'
    },
    {
      id: 33,
      text: `Exclusive access to premium raffles! My NextWinner referral: {REFERRAL_LINK}`,
      platform: 'facebook',
      hashtags: '#Exclusive #Premium #Access #Special'
    },
    {
      id: 34,
      text: `Become a winner with NextWinner! Use my link to join: {REFERRAL_LINK}`,
      platform: 'facebook',
      hashtags: '#Winner #Success #Achievement #Goals'
    },
    {
      id: 35,
      text: `Amazing prizes are waiting! Start your winning journey here: {REFERRAL_LINK}`,
      platform: 'facebook',
      hashtags: '#Journey #Start #Beginnings #Opportunity'
    }
  ],
  telegram: [
    {
      id: 36,
      text: `Join me on NextWinner - amazing raffle platform! Use my link: {REFERRAL_LINK}`,
      platform: 'telegram',
      hashtags: ''
    },
    {
      id: 37,
      text: `Win big prizes on NextWinner! My referral link: {REFERRAL_LINK}`,
      platform: 'telegram',
      hashtags: ''
    },
    {
      id: 38,
      text: `NextWinner referral - join for amazing raffles: {REFERRAL_LINK}`,
      platform: 'telegram',
      hashtags: ''
    },
    {
      id: 39,
      text: `Let's win together on NextWinner! Link: {REFERRAL_LINK}`,
      platform: 'telegram',
      hashtags: ''
    },
    {
      id: 40,
      text: `Exclusive raffle access via NextWinner: {REFERRAL_LINK}`,
      platform: 'telegram',
      hashtags: ''
    },
    {
      id: 41,
      text: `Win cash and luxury items! NextWinner link: {REFERRAL_LINK}`,
      platform: 'telegram',
      hashtags: ''
    },
    {
      id: 42,
      text: `Amazing platform for winning! Join here: {REFERRAL_LINK}`,
      platform: 'telegram',
      hashtags: ''
    }
  ],
  email: [
    {
      id: 43,
      text: `Subject: Join me on NextWinner - Win Amazing Prizes!\n\nHi,\n\nI wanted to share NextWinner with you - it's an incredible raffle platform where you can win cash prizes, luxury items, electronics, and more!\n\nUse my referral link to join: {REFERRAL_LINK}\n\nLet's win together!\n\nBest regards,`,
      platform: 'email',
      hashtags: ''
    },
    {
      id: 44,
      text: `Subject: Exclusive Raffle Access - NextWinner Referral\n\nHello,\n\nI'm sharing my exclusive NextWinner referral link with you. This platform offers amazing raffles with incredible prizes.\n\nJoin here: {REFERRAL_LINK}\n\nLooking forward to winning together!\n\nWarmly,`,
      platform: 'email',
      hashtags: ''
    },
    {
      id: 45,
      text: `Subject: Let's Win Together on NextWinner!\n\nDear Friend,\n\nI wanted to invite you to join NextWinner, a fantastic raffle platform. The prizes are amazing and the community is great!\n\nUse my link to sign up: {REFERRAL_LINK}\n\nHope to see you there!\n\nCheers,`,
      platform: 'email',
      hashtags: ''
    },
    {
      id: 46,
      text: `Subject: NextWinner Referral - Win Big Prizes\n\nHi there,\n\nCheck out NextWinner - a platform where you can win incredible prizes through raffles.\n\nMy referral link: {REFERRAL_LINK}\n\nJoin and let's start winning!\n\nBest,`,
      platform: 'email',
      hashtags: ''
    },
    {
      id: 47,
      text: `Subject: Amazing Raffle Platform - NextWinner\n\nHello,\n\nI'm excited to share NextWinner with you. It's a premium raffle platform with amazing prizes.\n\nJoin via my link: {REFERRAL_LINK}\n\nCan't wait to win together!\n\nSincerely,`,
      platform: 'email',
      hashtags: ''
    },
    {
      id: 48,
      text: `Subject: Your Ticket to Winning - NextWinner\n\nHi,\n\nWant to win amazing prizes? Join NextWinner through my referral link!\n\n{REFERRAL_LINK}\n\nThe prizes are incredible - let's win them together!\n\nRegards,`,
      platform: 'email',
      hashtags: ''
    },
    {
      id: 49,
      text: `Subject: Join NextWinner - Premium Raffle Experience\n\nDear,\n\nI'm inviting you to join NextWinner, a top-tier raffle platform with exclusive prizes.\n\nSign up here: {REFERRAL_LINK}\n\nLooking forward to celebrating wins together!\n\nBest wishes,`,
      platform: 'email',
      hashtags: ''
    }
  ]
}), []);

// Main Component
const InfluencerShareToolkit = () => {
  const { referralCode } = useParams(); // Changed from username to referralCode for consistency
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('general');
  const [showQR, setShowQR] = useState(false);
  const [shareStats, setShareStats] = useState({
    totalShares: 0,
    linkClicks: 0,
    conversions: 0,
    recentActivity: []
  });

  const socialTemplates = useSocialTemplates();

  // Platform data for quick share buttons
  const platforms = useMemo(() => [
    { name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500 hover:bg-green-600', platform: 'whatsapp' },
    { name: 'Twitter', icon: Twitter, color: 'bg-blue-400 hover:bg-blue-500', platform: 'twitter' },
    { name: 'Instagram', icon: Instagram, color: 'bg-pink-600 hover:bg-pink-700', platform: 'instagram' },
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700', platform: 'facebook' },
    { name: 'Telegram', icon: Send, color: 'bg-blue-500 hover:bg-blue-600', platform: 'telegram' },
    { name: 'Email', icon: Mail, color: 'bg-gray-700 hover:bg-gray-800', platform: 'email' },
    { name: 'Copy Link', icon: Copy, color: 'bg-purple-600 hover:bg-purple-700', platform: 'copy' }
  ], []);

  useEffect(() => {
    console.log('🔍 Checking authentication for Share Toolkit...');
    console.log('📝 Referral code from params:', referralCode);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Current user:', user);
      console.log('User UID:', user?.uid);
      
      if (!user) {
        console.log('❌ No user found, redirecting to influencer auth');
        navigate('/influencer-auth');
        return;
      }
      
      setCurrentUser(user);
      
      // Load influencer data after user is set
      await loadInfluencerData(user);
    });

    return () => unsubscribe();
  }, [auth, navigate, referralCode]);

  // Load influencer data with proper error handling
  const loadInfluencerData = useCallback(async (user) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 Loading influencer data for user:', user.uid);
      
      // First check if user is an influencer
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setError('User not found');
        navigate('/influencer-auth');
        return;
      }
      
      const userData = userDoc.data();
      
      if (userData.accountType !== 'influencer') {
        setError('You need an influencer account to access this page');
        navigate('/influencer-auth');
        return;
      }
      
      // Set influencer data
      setInfluencer({
        id: userDoc.id,
        ...userData
      });
      
      // Verify referral code matches
      if (referralCode && referralCode !== userData.referralCode) {
        console.warn('⚠️ Referral code mismatch, but allowing access for owner');
      }
      
      // Load share stats
      await loadShareStats(user.uid);
      
    } catch (error) {
      console.error('❌ Error loading influencer data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [referralCode, navigate]);

  const loadShareStats = useCallback(async (influencerId) => {
    try {
      // Load share events
      const sharesQuery = query(
        collection(db, 'shareEvents'),
        where('influencerId', '==', influencerId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      const sharesSnapshot = await getDocs(sharesQuery);
      const recentActivity = sharesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      setShareStats(prev => ({
        ...prev,
        totalShares: sharesSnapshot.size,
        recentActivity
      }));

    } catch (error) {
      console.error('Error loading share stats:', error);
    }
  }, []);

  // Get referral link - optimized
  const getReferralLink = useCallback(() => {
    if (!influencer?.referralCode) return '';
    return `http://localhost:5173/i/${influencer.referralCode}`;
  }, [influencer]);

  // Copy to clipboard with event logging
  const copyToClipboard = useCallback(async (text) => {
    try {
      const referralLink = getReferralLink();
      const link = text.replace(/{REFERRAL_LINK}/g, referralLink);
      await navigator.clipboard.writeText(link);
      setCopied(true);
      
      // Log the copy event
      await logShareEvent('copy', 'text_copy');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setError('Failed to copy to clipboard');
    }
  }, [getReferralLink]);

  // Share to platform
  const shareToPlatform = useCallback((platform, templateId) => {
    const referralLink = getReferralLink();
    
    switch (platform) {
      case 'whatsapp':
        const whatsappText = encodeURIComponent(`Join me on NextWinner! ${referralLink}`);
        window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
        break;
      case 'twitter':
        const twitterText = encodeURIComponent(`Join me on NextWinner! ${referralLink} #NextWinner #Raffle`);
        window.open(`https://twitter.com/intent/tweet?text=${twitterText}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
        break;
      case 'telegram':
        const telegramText = encodeURIComponent(`Join NextWinner: ${referralLink}`);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${telegramText}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Join me on NextWinner&body=Check out this amazing raffle platform: ${referralLink}`);
        break;
      default:
        break;
    }
    
    // Log the share event
    logShareEvent('share', platform);
  }, [getReferralLink]);

  // Log share event
  const logShareEvent = useCallback(async (action, platform) => {
    if (!currentUser?.uid) return;
    
    try {
      await addDoc(collection(db, 'shareEvents'), {
        influencerId: currentUser.uid,
        action,
        platform,
        referralCode: influencer?.referralCode,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging share event:', error);
    }
  }, [currentUser, influencer]);

  // Generate template with link
  const generateTemplateWithLink = useCallback((template) => {
    const referralLink = getReferralLink();
    return template.replace(/{REFERRAL_LINK}/g, referralLink);
  }, [getReferralLink]);

  // Handle platform quick share
  const handlePlatformShare = useCallback((platform) => {
    if (platform === 'copy') {
      copyToClipboard(getReferralLink());
    } else {
      shareToPlatform(platform, 0);
    }
  }, [copyToClipboard, getReferralLink, shareToPlatform]);

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error || !influencer) {
    return <ErrorDisplay 
      error={error || 'Failed to load toolkit'} 
      onRetry={() => window.location.reload()} 
    />;
  }

  const displayName = influencer.influencerData?.stageName || influencer.displayName || 'Influencer';
  const referralLink = getReferralLink();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              to="/influencer-dashboard" 
              className="flex items-center gap-2 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold">Share Toolkit</h1>
              <p className="text-sm text-gray-400">Amplify your reach</p>
            </div>
            <div className="w-20"></div> {/* Spacer for balance */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-0.5">
                <div className="w-full h-full rounded-xl bg-gray-900 overflow-hidden">
                  {influencer.photoURL ? (
                    <img 
                      src={influencer.photoURL} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                <Share2 className="w-3 h-3" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">Welcome, {displayName}!</h2>
              <p className="text-gray-300 mb-4">Share your referral link and win together with your community</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-800">
                  <div className="text-lg font-bold text-purple-400">
                    {formatNumber(influencer.influencerData?.totalReferrals || 0)}
                  </div>
                  <div className="text-xs text-gray-400">Total Referrals</div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-800">
                  <div className="text-lg font-bold text-blue-400">
                    {formatNumber(influencer.influencerData?.totalTicketsReferred || 0)}
                  </div>
                  <div className="text-xs text-gray-400">Tickets Referred</div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-800">
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(influencer.influencerData?.lifetimeEarnings || 0)}
                  </div>
                  <div className="text-xs text-gray-400">Total Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Share Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Share
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {platforms.map(({ name, icon: Icon, color, platform }) => (
              <button
                key={name}
                onClick={() => handlePlatformShare(platform)}
                className={`${color} text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="mb-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-800/50 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Your Referral Link
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 bg-gray-900/50 p-3 rounded-xl border border-gray-800">
              <p className="font-mono text-sm break-all">{referralLink}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                <QrCode className="w-5 h-5" />
                QR Code
              </button>
            </div>
          </div>
          
          {showQR && (
            <div className="mt-6 pt-6 border-t border-purple-800/50 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl mb-4">
                <QRCodeSVG 
                  value={referralLink}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#111827"
                  level="H"
                />
              </div>
              <p className="text-sm text-gray-400">Scan to share your referral link</p>
            </div>
          )}
        </div>

        {/* Social Templates Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Social Media Templates
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.keys(socialTemplates).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTemplate(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTemplate === category ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialTemplates[activeTemplate]?.slice(0, 6).map((template) => (
              <div key={template.id} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-5 hover:border-purple-800/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {template.platform === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                    {template.platform === 'whatsapp' && <MessageSquare className="w-4 h-4 text-green-400" />}
                    {template.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-400" />}
                    {template.platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
                    {template.platform === 'email' && <Mail className="w-4 h-4 text-gray-400" />}
                    {template.platform === 'telegram' && <Send className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm text-gray-400 capitalize">
                      {template.platform === 'all' ? 'All Platforms' : template.platform}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(template.text)}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Copy template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mb-4 max-h-32 overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-line text-sm">
                    {generateTemplateWithLink(template.text)}
                  </p>
                  {template.hashtags && (
                    <p className="text-blue-400 text-sm mt-2">{template.hashtags}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(template.text)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Copy Text
                  </button>
                  {template.platform !== 'email' && template.platform !== 'all' && (
                    <button
                      onClick={() => shareToPlatform(template.platform, template.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Share Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Showing 6 of {socialTemplates[activeTemplate]?.length || 0} templates for {activeTemplate}
            </p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Sharing Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-5 hover:border-purple-800/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-600/30 rounded-lg">
                  <Share2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{shareStats.totalShares}</div>
                  <div className="text-sm text-gray-400">Total Shares</div>
                </div>
              </div>
              <p className="text-sm text-gray-400">Times you've shared your link</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-5 hover:border-blue-800/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{influencer.influencerData?.totalReferrals || 0}</div>
                  <div className="text-sm text-gray-400">Referrals Generated</div>
                </div>
              </div>
              <p className="text-sm text-gray-400">People who joined via your link</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-5 hover:border-green-800/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-600/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(influencer.influencerData?.pendingEarnings || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Pending Earnings</div>
                </div>
              </div>
              <p className="text-sm text-gray-400">From your referrals' activity</p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mb-8 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-800/30 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Sharing Tips & Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 p-4 rounded-xl hover:bg-black/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold">Target Your Audience</h4>
              </div>
              <p className="text-sm text-gray-300">
                Share templates that match your niche. Gaming influencers should use gaming-specific templates.
              </p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-xl hover:bg-black/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-400" />
                <h4 className="font-bold">Perfect Timing</h4>
              </div>
              <p className="text-sm text-gray-300">
                Post during peak hours: 7-9 PM weekdays, 10 AM-2 PM weekends for maximum engagement.
              </p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-xl hover:bg-black/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold">Visual Content</h4>
              </div>
              <p className="text-sm text-gray-300">
                Always include images or videos when sharing. Visual posts get 3x more engagement.
              </p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-xl hover:bg-black/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <h4 className="font-bold">Track Performance</h4>
              </div>
              <p className="text-sm text-gray-300">
                Monitor which templates work best and double down on successful strategies.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Grow Your Referrals?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Use these tools to share your referral link and start earning more commissions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => copyToClipboard(referralLink)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <Copy className="w-5 h-5" />
              Copy Your Link
            </button>
            <Link
              to="/influencer-dashboard"
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl text-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} NextWinner. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/support" className="text-sm text-gray-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerShareToolkit;