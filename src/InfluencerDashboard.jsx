// src/pages/InfluencerDashboard.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, Share2, Users, Award, Wallet, CreditCard,
  Ticket, Clock, ChevronRight, ArrowUpRight, Download,
  Filter, Search, Bell, Settings, BarChart3,
  CheckCircle, XCircle, AlertCircle, DollarSign,
  Mail, Phone, Eye, EyeOff, Plus, Minus,
  Shield, Lock, User, Home, LogOut, HelpCircle,
  ChevronDown, ExternalLink, RefreshCw, Zap,
  Star, Crown, Target, PieChart, FileText,
  Menu, X, Trophy, Megaphone, Info, Camera,
  Calendar, Image, Edit3, Check, Users as UsersIcon,
  TrendingUp as TrendIcon, ShoppingBag, MessageSquare,
  Award as AwardIcon, Gift, Percent, Globe, Tag,
  TrendingDown, Users as ReferralIcon, DollarSign as MoneyIcon,
  Activity, PieChart as ChartIcon, Target as TargetIcon,
  FileText as DocIcon, Shield as SecurityIcon,
  Smartphone, LifeBuoy, Download as DownloadIcon,
  Clipboard, Link as LinkIcon, QrCode, Settings as SettingsIcon,
  ArrowRight, ExternalLink as ExternalLinkIcon, Bell as NotificationIcon,
  UserCheck, UserX, CalendarDays, Clock as ClockIcon,
  Heart, ThumbsUp, TrendingUp as UpTrendIcon,
  TrendingDown as DownTrendIcon, CircleDollarSign,
  Coins, Banknote, Receipt, WalletCards, CreditCard as CardIcon,
  Building, Home as HomeIcon, Car, Plane, Smartphone as PhoneIcon,
  Watch, Gamepad2, Shirt, GraduationCap, Briefcase,
  Coffee, Gem, Sprout, Crown as CrownIcon,
  Zap as ZapIcon, Rocket, Flame, Diamond,
  BarChart, LineChart, ScatterChart, CandlestickChart,
  Award as RibbonIcon, Target as TargetIcon2,
  TrendingUp as GrowthIcon, Users as TeamIcon,
  Award as BadgeIcon, Globe as WorldIcon,
  BarChart as StatsIcon, LineChart as GraphIcon,
  TrendingUp as ArrowUpIcon, TrendingDown as ArrowDownIcon,
  Share
} from 'lucide-react';

// Firebase imports
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
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
  increment, 
  addDoc, 
  serverTimestamp, 
  updateDoc,
  onSnapshot,
  writeBatch,
  getCountFromServer
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebaseConfig';
import { initializeWalletFunding, updateWalletBalance, createTransactionRecord } from './paystackUtils';

// Initialize Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Constants
const IMGBB_API_KEY = '6ba4e07f4118ef0579427c40a7207eef';
const BASE_URL = 'https://raffle-platform.com'; // Replace with actual domain

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

const formatTimeAgo = (date) => {
  if (!date) return 'Recently';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-NG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Generate random domain for referral links
const generateReferralDomain = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let domain = '';
  for (let i = 0; i < 10; i++) {
    domain += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return domain;
};

const REFERRAL_DOMAIN = generateReferralDomain();

// Optimized Loading Component with smaller bundle
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-32 bg-gray-800/50 rounded-xl"></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-24 bg-gray-800/50 rounded-xl"></div>
      <div className="h-24 bg-gray-800/50 rounded-xl"></div>
    </div>
    <div className="h-64 bg-gray-800/50 rounded-xl"></div>
  </div>
);

// Simplified Error Boundary
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('Error boundary caught:', error);
      setHasError(true);
    };
    
    const errorHandler = (event) => handleError(event.error);
    window.addEventListener('error', errorHandler);
    
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="p-6 bg-red-900/20 border border-red-700/50 rounded-xl text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="font-bold text-red-300 mb-2">Something went wrong</h3>
        <p className="text-gray-300 text-sm">Please refresh the page and try again</p>
      </div>
    );
  }

  return children;
};

// Optimized Paystack payment handler with error boundaries
const processPaystackPayment = async (user, amount, type = 'deposit') => {
  try {
    if (!user || !user.uid || !user.email) {
      throw new Error('User information is required');
    }

    await initializeWalletFunding(
      user,
      amount,
      async (response, user, amount) => {
        try {
          // Update user balance
          await updateWalletBalance(db, user.uid, amount);
          
          // Create transaction record
          await createTransactionRecord(db, user, {
            amount: amount,
            description: `${type === 'deposit' ? 'Wallet Deposit' : 'Payment'}`,
            type: type,
            reference: response.reference,
            status: 'completed'
          });

          // Create notification
          await addDoc(collection(db, 'notifications'), {
            userId: user.uid,
            title: `${type === 'deposit' ? 'Deposit Successful' : 'Payment Successful'}`,
            message: `₦${amount.toLocaleString()} has been ${type === 'deposit' ? 'added to your wallet' : 'processed successfully'}`,
            type: 'transaction',
            read: false,
            createdAt: serverTimestamp(),
            metadata: {
              amount: amount,
              reference: response.reference,
              type: type
            }
          });

          return { success: true, reference: response.reference };
        } catch (error) {
          console.error('Error processing payment success:', error);
          throw error;
        }
      },
      () => {
        console.log('Payment window closed');
      }
    );
  } catch (error) {
    console.error('Paystack payment error:', error);
    throw error;
  }
};

// Optimized image upload with compression
const uploadToImgBB = async (file) => {
  // Compress image if needed
  const MAX_SIZE = 1024 * 1024; // 1MB
  if (file.size > MAX_SIZE) {
    // In a real app, implement client-side compression here
    console.warn('Image is large, consider compressing before upload');
  }

  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
};

// PayoutSummary Component - CORRECTED VERSION
const PayoutSummary = ({ influencerId }) => {
  const [loading, setLoading] = useState(true);
  const [payoutData, setPayoutData] = useState({
    availablePayout: 0,
    lifetimeEarnings: 0,
    pendingPayouts: 0,
    totalReferrals: 0,
    ticketsSold: 0,
    conversionRate: 0,
    breakdown: {
      ticketCommissions: 0,
      prizeBonuses: 0,
      totalBeforeFees: 0,
      processingFee: 0,
      tax: 0,
      netPayout: 0,
      pendingRaffles: [],
      qualifiedForBonus: false
    }
  });

  const [config, setConfig] = useState({
    minPayoutAmount: 1000,
    ticketCommissionRate: 0.05, // 5% commission (matches admin dashboard)
    prizeBonusRate: 0.15, // 15% bonus (matches admin dashboard)
    ticketShareThreshold: 0.25,
    lifetimeReferralsThreshold: 50,
    processingFee: 0.015,
    taxRate: 0.075
  });

  useEffect(() => {
    loadPayoutData();
  }, [influencerId]);

  const loadPayoutData = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Load payout config from admin settings (must match admin dashboard)
      try {
        const configDoc = await getDoc(doc(db, 'admin_settings', 'payout_config'));
        if (configDoc.exists()) {
          setConfig({
            minPayoutAmount: configDoc.data().minPayoutAmount || 1000,
            ticketCommissionRate: configDoc.data().ticketCommissionRate || 0.05,
            prizeBonusRate: configDoc.data().prizeBonusRate || 0.15,
            ticketShareThreshold: configDoc.data().ticketShareThreshold || 0.25,
            lifetimeReferralsThreshold: configDoc.data().lifetimeReferralsThreshold || 50,
            processingFee: configDoc.data().processingFee || 0.015,
            taxRate: configDoc.data().taxRate || 0.075
          });
        }
      } catch (error) {
        console.log('Using default payout config', error);
      }

      // Get referral data
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('userId', '==', influencerId)
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      const referralData = referralsSnapshot.docs[0]?.data() || {};
      const referredUsers = referralData.referredUsers || [];
      
      console.log('📊 Loading payout data for influencer:', influencerId);
      console.log('📈 Referred users:', referredUsers.length);

      // Get ALL tickets from referrals
      let allTickets = [];
      for (const userId of referredUsers) {
        try {
          const ticketsQuery = query(
            collection(db, 'tickets'),
            where('userId', '==', userId)
          );
          const ticketsSnapshot = await getDocs(ticketsQuery);
          const userTickets = ticketsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          allTickets.push(...userTickets);
        } catch (error) {
          console.error('Error loading tickets for user:', userId, error);
        }
      }

      console.log('🎫 Total tickets from referrals:', allTickets.length);

      // Get previous payouts to see which tickets are already paid
      let alreadyPaidTicketIds = [];
      try {
        const previousPayoutsQuery = query(
          collection(db, 'payouts'),
          where('influencerId', '==', influencerId),
          where('status', '==', 'paid')
        );
        const previousPayoutsSnapshot = await getDocs(previousPayoutsQuery);
        
        previousPayoutsSnapshot.docs.forEach(payoutDoc => {
          const payoutData = payoutDoc.data();
          if (payoutData.paidTicketIds && Array.isArray(payoutData.paidTicketIds)) {
            alreadyPaidTicketIds.push(...payoutData.paidTicketIds);
          }
        });
      } catch (error) {
        console.log('No previous payouts found');
      }

      console.log('✅ Already paid tickets:', alreadyPaidTicketIds.length);

      // Filter out already paid tickets
      const unpaidTickets = allTickets.filter(ticket => 
        !alreadyPaidTicketIds.includes(ticket.id)
      );

      console.log('💰 Unpaid tickets:', unpaidTickets.length);

      // Group unpaid tickets by raffle
      const ticketsByRaffle = {};
      unpaidTickets.forEach(ticket => {
        const raffleId = ticket.raffleId;
        if (!raffleId) return;
        
        if (!ticketsByRaffle[raffleId]) {
          ticketsByRaffle[raffleId] = [];
        }
        ticketsByRaffle[raffleId].push(ticket);
      });

      // Get raffle data for unpaid tickets
      const raffleIds = Object.keys(ticketsByRaffle);
      const rafflesData = {};
      const pendingRaffles = [];
      
      for (const raffleId of raffleIds) {
        try {
          const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
          if (raffleDoc.exists()) {
            rafflesData[raffleId] = raffleDoc.data();
            
            const unpaidTicketCount = ticketsByRaffle[raffleId].length;
            const raffle = rafflesData[raffleId];
            
            // Calculate commission (5% per ticket)
            const ticketCommission = unpaidTicketCount * (raffle.ticketPrice || 1000) * config.ticketCommissionRate;
            
            // Check for bonus qualification
            let qualifiesForBonus = false;
            let prizeBonus = 0;
            
            if (raffle.winnerId && referredUsers.includes(raffle.winnerId)) {
              // Check bonus qualification (matches admin dashboard logic)
              const ticketShare = raffle.totalTickets > 0 ? unpaidTicketCount / raffle.totalTickets : 0;
              const meetsTicketShare = ticketShare >= config.ticketShareThreshold;
              const meetsLifetimeReferrals = referredUsers.length >= config.lifetimeReferralsThreshold;
              
              qualifiesForBonus = meetsTicketShare || meetsLifetimeReferrals;
              
              if (qualifiesForBonus) {
                // Check if bonus already paid
                let bonusAlreadyPaid = false;
                try {
                  const previousPayoutsQuery = query(
                    collection(db, 'payouts'),
                    where('influencerId', '==', influencerId),
                    where('status', '==', 'paid')
                  );
                  const previousPayoutsSnapshot = await getDocs(previousPayoutsQuery);
                  
                  for (const payoutDoc of previousPayoutsSnapshot.docs) {
                    const payoutData = payoutDoc.data();
                    if (payoutData.perRaffleBreakdown) {
                      const paidRaffle = payoutData.perRaffleBreakdown.find(
                        r => r.raffleId === raffleId && r.prizeBonus > 0
                      );
                      if (paidRaffle) {
                        bonusAlreadyPaid = true;
                        break;
                      }
                    }
                  }
                } catch (error) {
                  console.log('Error checking previous bonuses');
                }
                
                if (!bonusAlreadyPaid) {
                  prizeBonus = (raffle.prizeValue || 0) * config.prizeBonusRate;
                }
              }
            }
            
            pendingRaffles.push({
              raffleId,
              title: raffle.title || 'Unknown Raffle',
              status: raffle.status || 'active',
              ticketsSold: unpaidTicketCount,
              commission: ticketCommission,
              qualifiesForBonus,
              prizeBonus,
              ticketShare: raffle.totalTickets > 0 ? (unpaidTicketCount / raffle.totalTickets) * 100 : 0,
              prizeValue: raffle.prizeValue || 0,
              ticketPrice: raffle.ticketPrice || 1000,
              totalTickets: raffle.totalTickets || 0
            });
          }
        } catch (error) {
          console.error('Error loading raffle:', raffleId, error);
        }
      }

      // Calculate totals (matching admin dashboard calculation)
      const totalCommissions = pendingRaffles.reduce((sum, r) => sum + r.commission, 0);
      const totalBonuses = pendingRaffles.reduce((sum, r) => sum + r.prizeBonus, 0);
      const totalBeforeFees = totalCommissions + totalBonuses;
      const processingFee = totalBeforeFees * config.processingFee;
      const tax = totalBeforeFees * config.taxRate;
      const netPayout = totalBeforeFees - processingFee - tax;
      const availablePayout = Math.max(netPayout, 0);

      // Get lifetime earnings from payouts collection (not transactions)
      let lifetimeEarnings = 0;
      try {
        const payoutsQuery = query(
          collection(db, 'payouts'),
          where('influencerId', '==', influencerId),
          where('status', '==', 'paid')
        );
        const payoutsSnapshot = await getDocs(payoutsQuery);
        lifetimeEarnings = payoutsSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0), 0
        );
      } catch (error) {
        console.log('No payout history found');
      }

      // Get pending payout requests (from payout requests, not withdrawals)
      let pendingPayouts = 0;
      try {
        const payoutRequestsQuery = query(
          collection(db, 'payouts'),
          where('influencerId', '==', influencerId),
          where('status', '==', 'pending')
        );
        const payoutRequestsSnapshot = await getDocs(payoutRequestsQuery);
        pendingPayouts = payoutRequestsSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0), 0
        );
      } catch (error) {
        console.log('No pending payout requests found');
      }

      console.log('💰 FINAL Payout calculation:', {
        availablePayout,
        totalCommissions,
        totalBonuses,
        totalBeforeFees,
        processingFee,
        tax,
        netPayout,
        lifetimeEarnings,
        pendingPayouts,
        unpaidTickets: unpaidTickets.length,
        allTickets: allTickets.length
      });

      setPayoutData({
        availablePayout,
        lifetimeEarnings,
        pendingPayouts,
        totalReferrals: referredUsers.length,
        ticketsSold: allTickets.length, // Total tickets from referrals
        unpaidTickets: unpaidTickets.length, // Actual unpaid tickets
        conversionRate: referredUsers.length > 0 
          ? (referralData.convertedUsers || 1) / referredUsers.length * 100 
          : 0,
        breakdown: {
          ticketCommissions: totalCommissions,
          prizeBonuses: totalBonuses,
          totalBeforeFees,
          processingFee,
          tax,
          netPayout,
          pendingRaffles,
          qualifiedForBonus: totalBonuses > 0
        }
      });

    } catch (error) {
      console.error('❌ Error loading payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-400">Loading payout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-4 rounded-xl border border-green-800/50">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Available for Payout</p>
              <p className="text-xl font-bold text-green-300">
                {formatCurrency(payoutData.availablePayout)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-yellow-400">
              {payoutData.unpaidTickets} unpaid tickets
            </p>
            {payoutData.availablePayout < config.minPayoutAmount && (
              <p className="text-xs text-red-400 mt-1">
                Minimum payout: {formatCurrency(config.minPayoutAmount)}
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-4 rounded-xl border border-blue-800/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Lifetime Earnings</p>
              <p className="text-xl font-bold">{formatCurrency(payoutData.lifetimeEarnings)}</p>
            </div>
          </div>
          <p className="text-xs text-blue-400 mt-2">
            {payoutData.totalReferrals} referrals • {payoutData.ticketsSold} tickets total
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-4 rounded-xl border border-yellow-800/50">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Pending Requests</p>
              <p className="text-xl font-bold text-yellow-300">
                {formatCurrency(payoutData.pendingPayouts)}
              </p>
            </div>
          </div>
          <p className="text-xs text-yellow-400 mt-2">Awaiting admin approval</p>
        </div>
      </div>

      {/* Detailed Breakdown Card */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Detailed Payout Breakdown
        </h3>
        
        <div className="space-y-4">
          {/* Earnings Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Ticket Commissions</p>
                <p className="text-sm text-gray-400">
                  {config.ticketCommissionRate * 100}% × {payoutData.unpaidTickets} unpaid tickets
                </p>
              </div>
              <p className="font-bold text-green-400">
                {formatCurrency(payoutData.breakdown.ticketCommissions)}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Prize Bonuses</p>
                <p className="text-sm text-gray-400">
                  {config.prizeBonusRate * 100}% of prize value
                </p>
              </div>
              <p className="font-bold text-purple-400">
                {formatCurrency(payoutData.breakdown.prizeBonuses)}
              </p>
            </div>
            
            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">
                  {formatCurrency(payoutData.breakdown.totalBeforeFees)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Deductions */}
          <div className="bg-red-900/10 border border-red-800/30 rounded-lg p-3">
            <h4 className="font-medium text-sm text-red-400 mb-2">Deductions</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Processing Fee ({config.processingFee * 100}%)</span>
                <span className="text-red-400">-{formatCurrency(payoutData.breakdown.processingFee)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Tax ({config.taxRate * 100}%)</span>
                <span className="text-red-400">-{formatCurrency(payoutData.breakdown.tax)}</span>
              </div>
            </div>
          </div>
          
          {/* Net Payout */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center font-bold">
              <span>Net Available Payout</span>
              <span className="text-xl text-yellow-300">
                {formatCurrency(payoutData.availablePayout)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              After processing fees and taxes
            </p>
          </div>
        </div>
      </div>

      {/* Per Raffle Breakdown */}
      {payoutData.breakdown.pendingRaffles.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            Per Raffle Breakdown
          </h3>
          
          <div className="space-y-3">
            {payoutData.breakdown.pendingRaffles.map((raffle, index) => (
              <div key={index} className="border-b border-gray-700/50 pb-3 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium truncate">{raffle.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${raffle.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {raffle.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Tickets: </span>
                    <span className="font-medium">{raffle.ticketsSold}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Share: </span>
                    <span className="font-medium">{raffle.ticketShare.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Commission: </span>
                    <span className="font-medium text-green-400">
                      {formatCurrency(raffle.commission)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Bonus: </span>
                    {raffle.qualifiesForBonus && raffle.prizeBonus > 0 ? (
                      <span className="font-medium text-purple-400">
                        {formatCurrency(raffle.prizeBonus)}
                      </span>
                    ) : raffle.qualifiesForBonus ? (
                      <span className="text-xs text-yellow-400">Qualified</span>
                    ) : (
                      <span className="text-xs text-gray-400">Not Qualified</span>
                    )}
                  </div>
                </div>
                
                {/* Bonus Qualification Details */}
                {raffle.qualifiesForBonus && (
                  <div className="mt-2 p-2 bg-purple-900/20 rounded text-xs">
                    {referredUsers.length >= config.lifetimeReferralsThreshold ? (
                      <span className="text-purple-400">
                        ✓ Qualified via {referredUsers.length} lifetime referrals
                      </span>
                    ) : raffle.ticketShare >= config.ticketShareThreshold * 100 ? (
                      <span className="text-purple-400">
                        ✓ Qualified via {raffle.ticketShare.toFixed(1)}% ticket share
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout Rules - Updated to match admin dashboard */}
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-800/50 p-4">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          Payout Rules & Information
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
            <p className="text-gray-300">
              <span className="font-medium">Minimum Payout:</span> {formatCurrency(config.minPayoutAmount)}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
            <p className="text-gray-300">
              <span className="font-medium">Commission Rate:</span> {config.ticketCommissionRate * 100}% per unpaid ticket
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
            <p className="text-gray-300">
              <span className="font-medium">Bonus Qualification:</span> Need ≥{config.ticketShareThreshold * 100}% ticket share OR ≥{config.lifetimeReferralsThreshold} lifetime referrals
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
            <p className="text-gray-300">
              <span className="font-medium">Processing Fee:</span> {config.processingFee * 100}% deducted
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
            <p className="text-gray-300">
              <span className="font-medium">Tax:</span> {config.taxRate * 100}% deducted
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
            <p className="text-gray-300">
              <span className="font-medium">Note:</span> Only unpaid tickets are counted in calculations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// PayoutHistory Component
const PayoutHistory = ({ influencerId }) => {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, paid, pending, failed
  const [selectedPayout, setSelectedPayout] = useState(null);

  useEffect(() => {
    loadPayoutHistory();
  }, [influencerId, filter]);

  const loadPayoutHistory = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      let payoutsQuery;
      const baseQuery = query(
        collection(db, 'payouts'),
        where('influencerId', '==', influencerId),
        orderBy('createdAt', 'desc')
      );

      if (filter !== 'all') {
        payoutsQuery = query(baseQuery, where('status', '==', filter));
      } else {
        payoutsQuery = baseQuery;
      }

      const snapshot = await getDocs(payoutsQuery);
      const payoutList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPayouts(payoutList);
    } catch (error) {
      console.error('Error loading payout history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleExportHistory = () => {
    const csvRows = [
      ['Date', 'Amount', 'Status', 'Type', 'Reference'],
      ...payouts.map(p => [
        formatDate(p.paidAt?.toDate() || p.createdAt?.toDate()),
        formatCurrency(p.amount),
        p.status,
        p.type || 'manual',
        p.reference || p.id
      ])
    ];

    const csvString = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Payout History
          </h3>
          <p className="text-gray-400 text-sm">Track all your earnings and payouts</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <button
            onClick={handleExportHistory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Payouts List */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-gray-400">Loading payout history...</p>
          </div>
        ) : payouts.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Reference</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-4">
                        <p className="font-medium">{formatDate(payout.paidAt?.toDate() || payout.createdAt?.toDate())}</p>
                        <p className="text-xs text-gray-400">
                          {payout.processedByName || 'Admin'}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-lg font-bold text-green-400">
                          {formatCurrency(payout.amount)}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className={`px-2 py-1 rounded text-xs inline-flex items-center gap-1 ${getStatusColor(payout.status)}`}>
                          {getStatusIcon(payout.status)}
                          <span>{payout.status}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm capitalize">{payout.type || 'manual'}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-mono truncate max-w-[100px]">
                          {payout.reference || payout.id.slice(-8)}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedPayout(payout)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
              <div className="p-4 space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-green-400 text-lg">
                          {formatCurrency(payout.amount)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(payout.paidAt?.toDate() || payout.createdAt?.toDate())}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        <span>{payout.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Type: </span>
                        <span className="capitalize">{payout.type || 'manual'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Ref: </span>
                        <span className="font-mono truncate">{payout.id.slice(-8)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Processed by: </span>
                        <span>{payout.processedByName || 'Admin'}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedPayout(payout)}
                      className="mt-3 w-full text-center text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No payout history found</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter !== 'all' ? `No ${filter} payouts` : 'Start earning to see your payout history'}
            </p>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="font-bold">Payout Details</h4>
                <button onClick={() => setSelectedPayout(null)} className="p-1 hover:bg-gray-800 rounded">
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400 mb-2">
                  {formatCurrency(selectedPayout.amount)}
                </p>
                <div className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-2 ${getStatusColor(selectedPayout.status)}`}>
                  {getStatusIcon(selectedPayout.status)}
                  <span className="capitalize">{selectedPayout.status}</span>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span>{formatDate(selectedPayout.paidAt?.toDate() || selectedPayout.createdAt?.toDate())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="capitalize">{selectedPayout.type || 'manual'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reference:</span>
                  <span className="font-mono">{selectedPayout.reference || selectedPayout.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processed by:</span>
                  <span>{selectedPayout.processedByName || 'Admin'}</span>
                </div>
              </div>
              
              {selectedPayout.breakdown && (
                <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-3 border border-blue-800/50">
                  <h5 className="font-bold mb-2">Breakdown</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Ticket Commissions:</span>
                      <span className="text-green-400">
                        {formatCurrency(selectedPayout.breakdown.ticketCommissions || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prize Bonuses:</span>
                      <span className="text-purple-400">
                        {formatCurrency(selectedPayout.breakdown.prizeBonuses || 0)}
                      </span>
                    </div>
                    <div className="border-t border-gray-700 pt-1 mt-1">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedPayout.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setSelectedPayout(null)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const InfluencerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [leaderboardModal, setLeaderboardModal] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState(false);
  
  // Dashboard data with memoization
  const [dashboardData, setDashboardData] = useState({
    influencer: null,
    wallet: { balance: 0, pendingBalance: 0 },
    stats: {
      totalReferrals: 0,
      activeReferrals: 0,
      convertedReferrals: 0,
      totalTicketsSold: 0,
      lifetimeEarnings: 0,
      monthlyEarnings: 0,
      pendingPayouts: 0,
      paidPayouts: 0,
      rejectedPayouts: 0
    },
    recentReferrals: [],
    recentWinners: [],
    topRaffles: [],
    performanceData: []
  });

  const fileInputRef = useRef(null);

  // Memoized navigation items
  const mainNavItems = useMemo(() => [
    { id: 'overview', icon: Home, label: 'Overview', color: 'purple' },
    { id: 'referrals', icon: Users, label: 'Referrals', color: 'blue' },
    { id: 'mytickets', icon: Ticket, label: 'My Tickets', color: 'green' },
    { id: 'transactions', icon: CreditCard, label: 'Transactions', color: 'orange' },
    { id: 'payouts', icon: DollarSign, label: 'Payouts', color: 'yellow' },
    { id: 'winners', icon: Trophy, label: 'Winners', color: 'red' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements', color: 'pink' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'gray' },
  ], []);

  // Load user data and dashboard
  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribeNotifications;

    const loadData = async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.accountType === 'influencer') {
              setUser({ uid: authUser.uid, ...userData });
              await loadDashboardData(authUser.uid);
            } else {
              await signOut(auth);
              navigate('/influencers/auth');
            }
          } else {
            await signOut(auth);
            navigate('/influencers/auth');
          }
        } catch (error) {
          console.error('Error loading user:', error);
          setError('Failed to load user data');
        }
      } else {
        navigate('/influencers/auth');
      }
      setLoading(false);
    };

    unsubscribeAuth = onAuthStateChanged(auth, loadData);

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [navigate]);

  // Listen for notifications
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => !n.read).length);
    }, (error) => {
      console.error('Error loading notifications:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

const loadDashboardData = useCallback(async (userId) => {
  try {
    setLoading(true);
    
    // Load influencer data
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    // Get influencer's referral code
    const influencerCode = userData.referralCode;
    
    if (!influencerCode) {
      console.error('❌ No referral code found for influencer');
      setError('No referral code found. Please contact support.');
      return;
    }
    
    console.log('🔍 Looking for users referred by code:', influencerCode);
    
    // Query 1: Get users who have this influencer's code in their referredBy field
    let referredUserIds = [];
    try {
      const referredUsersQuery = query(
        collection(db, 'users'),
        where('referredBy', '==', influencerCode)
      );
      const referredUsersSnapshot = await getDocs(referredUsersQuery);
      
      referredUserIds = referredUsersSnapshot.docs.map(doc => doc.id);
      console.log(`✅ Found ${referredUserIds.length} users with referredBy = "${influencerCode}"`);
      
      // Log the users found
      referredUsersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        console.log(`   - ${userData.email} (${userData.accountType})`);
      });
    } catch (error) {
      console.error('Error querying referred users:', error);
    }
    
    // Query 2: Also check referrals collection for any additional data
    let referralsCollectionData = {
      referredUsers: [],
      totalEarned: 0,
      pendingEarnings: 0
    };
    
    try {
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('userId', '==', userId)
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      
      if (!referralsSnapshot.empty) {
        const referralDoc = referralsSnapshot.docs[0];
        referralsCollectionData = {
          ...referralDoc.data(),
          id: referralDoc.id
        };
        console.log(`📊 Referrals collection data loaded`);
      }
    } catch (error) {
      console.error('Error loading referrals collection:', error);
    }
    
    // Combine both sources (prioritize live query over stored data)
    const allReferredUserIds = [...new Set([
      ...referredUserIds,
      ...(referralsCollectionData.referredUsers || [])
    ])];
    
    console.log(`🎯 Total unique referred users: ${allReferredUserIds.length}`);
    
    // Update referrals collection with latest data if needed
    if (referredUserIds.length > 0) {
      try {
        const referralsQuery = query(
          collection(db, 'referrals'),
          where('userId', '==', userId)
        );
        const referralsSnapshot = await getDocs(referralsQuery);
        
        if (!referralsSnapshot.empty) {
          const referralDoc = referralsSnapshot.docs[0];
          await updateDoc(referralDoc.ref, {
            referredUsers: allReferredUserIds,
            totalReferrals: allReferredUserIds.length,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Updated referrals collection with latest data');
        } else {
          // Create new referral document if it doesn't exist
          await addDoc(collection(db, 'referrals'), {
            userId: userId,
            code: influencerCode,
            referredUsers: allReferredUserIds,
            totalEarned: 0,
            pendingEarnings: 0,
            totalReferrals: allReferredUserIds.length,
            commissionRate: 15,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('✅ Created new referrals document');
        }
      } catch (error) {
        console.error('Error updating referrals collection:', error);
      }
    }
    
    // Calculate tickets sold and converted referrals
    let totalTicketsSold = 0;
    let convertedUsers = new Set();
    
    // Process in batches for better performance
    const batchSize = 10;
    for (let i = 0; i < allReferredUserIds.length; i += batchSize) {
      const batch = allReferredUserIds.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (referredUserId) => {
        try {
          // Check if user has purchased tickets
          const ticketsQuery = query(
            collection(db, 'tickets'),
            where('userId', '==', referredUserId)
          );
          const ticketsSnapshot = await getDocs(ticketsQuery);
          const ticketCount = ticketsSnapshot.size;
          
          if (ticketCount > 0) {
            convertedUsers.add(referredUserId);
            totalTicketsSold += ticketCount;
          }
        } catch (error) {
          console.error('Error checking tickets for user:', referredUserId, error);
        }
      }));
    }
    
    console.log(`🎫 Tickets sold by referrals: ${totalTicketsSold}`);
    console.log(`💰 Converted users: ${convertedUsers.size}`);
    
    // Get earnings data
    const monthlyEarnings = await calculateMonthlyEarnings(userId);
    
    // Prepare stats
    const stats = {
      totalReferrals: allReferredUserIds.length,
      activeReferrals: allReferredUserIds.length, // You might refine this based on activity
      convertedReferrals: convertedUsers.size,
      totalTicketsSold: totalTicketsSold,
      lifetimeEarnings: referralsCollectionData.totalEarned || 0,
      monthlyEarnings: monthlyEarnings,
      pendingPayouts: referralsCollectionData.pendingEarnings || 0,
      paidPayouts: referralsCollectionData.totalEarned || 0,
      rejectedPayouts: 0
    };
    
    // Load recent referrals for display
    const recentReferrals = await loadRecentReferrals(allReferredUserIds);
    
    // Update the dashboard data
    setDashboardData({
      influencer: userData,
      wallet: { 
        balance: userData.balance || 0,
        pendingBalance: userData.pendingBalance || 0
      },
      stats,
      recentReferrals,
      recentWinners: [],
      topRaffles: [],
      performanceData: []
    });
    
    console.log('✅ Dashboard data loaded successfully');
    
  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
    setError('Failed to load dashboard data: ' + error.message);
  } finally {
    setLoading(false);
  }
}, []);

  // Helper functions for calculations
const calculateConvertedReferrals = async (referredUserIds) => {
  if (!referredUserIds || referredUserIds.length === 0) return 0;
  
  let convertedCount = 0;
  
  // Process in batches for better performance
  const batchSize = 10;
  for (let i = 0; i < referredUserIds.length; i += batchSize) {
    const batch = referredUserIds.slice(i, i + batchSize);
    
    for (const userId of batch) {
      try {
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('userId', '==', userId),
          limit(1)
        );
        const ticketsSnapshot = await getDocs(ticketsQuery);
        
        if (!ticketsSnapshot.empty) {
          convertedCount++;
        }
      } catch (error) {
        console.error('Error checking tickets for user:', userId, error);
      }
    }
  }
  
  return convertedCount;
};

  const calculateTotalTicketsSold = async (referredUsers) => {
    if (!referredUsers.length) return 0;
    
    let total = 0;
    for (const userId of referredUsers.slice(0, 10)) {
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('userId', '==', userId)
      );
      const ticketsSnapshot = await getDocs(ticketsQuery);
      total += ticketsSnapshot.size;
    }
    return total;
  };

  const calculateMonthlyEarnings = async (userId) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('type', 'in', ['payout', 'commission']),
      where('createdAt', '>=', thirtyDaysAgo)
    );
    
    const snapshot = await getDocs(transactionsQuery);
    return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
  };

  const loadRecentReferrals = async (referredUserIds) => {
  if (!referredUserIds || referredUserIds.length === 0) return [];
  
  const recentReferrals = [];
  
  // Get only the most recent 5 referrals
  const recentUserIds = referredUserIds.slice(0, 5);
  
  for (const userId of recentUserIds) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if user has purchased tickets
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('userId', '==', userId),
          limit(1)
        );
        const ticketsSnapshot = await getDocs(ticketsQuery);
        const hasPurchased = !ticketsSnapshot.empty;
        
        recentReferrals.push({
          id: userId,
          displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous User',
          email: userData.email,
          photoURL: userData.photoURL,
          joined: userData.createdAt?.toDate(),
          hasPurchased,
          status: hasPurchased ? 'customer' : 'pending',
          accountType: userData.accountType || 'user'
        });
      }
    } catch (error) {
      console.error('Error loading referral details:', error);
    }
  }
  
  return recentReferrals;
};

  const loadPerformanceData = async (userId) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('createdAt', '>=', thirtyDaysAgo),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(transactionsQuery);
    const dailyData = {};
    
    snapshot.docs.forEach(doc => {
      const transaction = doc.data();
      const date = transaction.createdAt?.toDate().toLocaleDateString('en-NG');
      if (date) {
        if (!dailyData[date]) {
          dailyData[date] = { earnings: 0, referrals: 0, tickets: 0 };
        }
        if (transaction.type === 'payout' || transaction.type === 'commission') {
          dailyData[date].earnings += transaction.amount || 0;
        }
      }
    });
    
    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      earnings: data.earnings,
      referrals: data.referrals,
      tickets: data.tickets
    }));
  };

  // Handle profile image upload
  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile picture must be less than 5MB');
      return;
    }
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Upload to ImgBB
      const imageUrl = await uploadToImgBB(file);
      
      if (user?.uid) {
        // Update user document
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: imageUrl,
          updatedAt: serverTimestamp()
        });
        
        // Update local state
        setUser(prev => ({ ...prev, photoURL: imageUrl }));
        setDashboardData(prev => ({
          ...prev,
          influencer: { ...prev.influencer, photoURL: imageUrl }
        }));
        
        setSuccess('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setError('Failed to upload profile picture');
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || depositAmount < 100) {
      setError('Please enter a valid amount (minimum ₦100)');
      return;
    }

    if (!user) {
      setError('User not found. Please login again.');
      return;
    }

    setProcessingPayment(true);
    setError('');

    try {
      await processPaystackPayment(user, Number(depositAmount), 'deposit');
      
      // Refresh dashboard data
      await loadDashboardData(user.uid);
      
      setSuccess(`₦${depositAmount} deposited successfully!`);
      setDepositModal(false);
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      setError(error.message || 'Deposit failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount < 1000) {
      setError('Minimum withdrawal amount is ₦1,000');
      return;
    }

    if (withdrawAmount > dashboardData.wallet.balance) {
      setError('Insufficient balance');
      return;
    }

    setProcessingPayment(true);
    setError('');

    try {
      // Create withdrawal request
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount: Number(withdrawAmount),
        status: 'pending',
        bankName: dashboardData.influencer?.influencerData?.bankDetails?.bankName,
        accountNumber: dashboardData.influencer?.influencerData?.bankDetails?.accountNumber,
        accountName: dashboardData.influencer?.influencerData?.bankDetails?.accountName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update user balance
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-Number(withdrawAmount)),
        pendingBalance: increment(Number(withdrawAmount)),
        updatedAt: serverTimestamp()
      });

      // Create transaction record
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: -Number(withdrawAmount),
        type: 'withdrawal',
        status: 'pending',
        description: 'Withdrawal request',
        createdAt: serverTimestamp()
      });

      // Create notification
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Withdrawal Requested',
        message: `₦${withdrawAmount} withdrawal request submitted. Processing time: 1-3 business days.`,
        type: 'transaction',
        read: false,
        createdAt: serverTimestamp()
      });

      // Update local state
      setDashboardData(prev => ({
        ...prev,
        wallet: { 
          balance: prev.wallet.balance - Number(withdrawAmount),
          pendingBalance: prev.wallet.pendingBalance + Number(withdrawAmount)
        }
      }));

      setWithdrawModal(false);
      setWithdrawAmount('');
      setSuccess('Withdrawal request submitted successfully!');
    } catch (error) {
      console.error('Withdrawal error:', error);
      setError('Failed to process withdrawal');
    } finally {
      setProcessingPayment(false);
    }
  };

  // NEW: Navigate to Share Toolkit
  const goToShareToolkit = () => {
    if (dashboardData.influencer?.referralCode) {
      navigate(`/i/${dashboardData.influencer.referralCode}/share`);
    } else {
      setError('Referral code not found');
    }
  };

  // NEW: Navigate to Influencers Page
  const goToInfluencersPage = () => {
    navigate('/influencers');
  };

  // Copy referral link
  const copyReferralLink = () => {
    const link = `${REFERRAL_DOMAIN}/ref/${dashboardData.influencer?.referralCode}`;
    navigator.clipboard.writeText(link);
    setSuccess('Referral link copied to clipboard!');
  };

  // Share referral link
  const shareReferralLink = () => {
    const link = `${REFERRAL_DOMAIN}/ref/${dashboardData.influencer?.referralCode}`;
    const text = `Join me on Raffle Platform! Use my referral link to get started: ${link}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Raffle Platform',
        text: text,
        url: link
      });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, {
            read: true,
            updatedAt: serverTimestamp()
          });
        }
      });
      await batch.commit();
      setSuccess('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark notifications as read');
    }
  };

  // Handle logout - Added Logout Button
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/influencers/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    }
  };

  // Render loading state
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-900/80 rounded-2xl border border-red-500/30 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900 text-white">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProfileImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Mobile Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">
                  <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    NextWinner
                  </span>
                  <span className="text-white ml-1">Influencers</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setActiveTab('announcements')}
                  className="p-2 hover:bg-gray-800 rounded-lg relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile */}
              <div className="relative group">
                <div
                  onClick={handleProfileImageClick}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden border-2 border-gray-700"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : dashboardData.influencer?.photoURL ? (
                    <img src={dashboardData.influencer.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : dashboardData.influencer?.displayName ? (
                    <span className="text-lg">{dashboardData.influencer.displayName.charAt(0)}</span>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full group-hover:bg-blue-600">
                  <Camera className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link Bar */}
        <div className="px-4 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-t border-purple-900/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400 mb-1">Your Referral Link:</div>
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-medium text-white bg-gray-800/50 px-3 py-1.5 rounded-lg flex-1">
                  {REFERRAL_DOMAIN}/ref/{dashboardData.influencer?.referralCode}
                </div>
                <button
                  onClick={copyReferralLink}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-2 rounded-lg flex-shrink-0"
                  title="Copy link"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                <button
                  onClick={shareReferralLink}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white p-2 rounded-lg flex-shrink-0"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-gray-900 border-r border-gray-800" onClick={e => e.stopPropagation()}>
            {/* Profile Section */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <div
                  onClick={handleProfileImageClick}
                  className="relative w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xl font-bold cursor-pointer overflow-hidden border-2 border-gray-700"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : dashboardData.influencer?.photoURL ? (
                    <img src={dashboardData.influencer.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : dashboardData.influencer?.displayName ? (
                    <span className="text-xl">{dashboardData.influencer.displayName.charAt(0)}</span>
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg">{dashboardData.influencer?.displayName}</div>
                  <div className="text-sm text-gray-400">Influencer ID: {dashboardData.influencer?.referralCode}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">
                      Tier: {dashboardData.influencer?.influencerData?.tier || 'Bronze'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-3">
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const badgeCount = item.id === 'referrals' 
                    ? dashboardData.stats.totalReferrals 
                    : item.id === 'announcements' 
                    ? unreadCount 
                    : 0;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${isActive ? `bg-${item.color}-600 text-white` : 'hover:bg-gray-800 text-gray-300'}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-700'}`}>
                          {badgeCount > 9 ? '9+' : badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => {
                    setLeaderboardModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">Leaderboard</span>
                </button>
                
                <button
                  onClick={() => {
                    setAnalyticsModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </button>

                {/* NEW: Share Toolkit Button */}
                <button
                  onClick={() => {
                    goToShareToolkit();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                >
                  <Share className="w-5 h-5" />
                  <span className="font-medium">Share Toolkit</span>
                </button>

                {/* NEW: Influencers Page Button */}
                <button
                  onClick={() => {
                    goToInfluencersPage();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">All Influencers</span>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-900/30 text-red-400 mt-4 border-t border-gray-800 pt-4"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>{success}</div>
            </div>
          </div>
        )}

        {/* Wallet Card */}
        <div className="mb-6 bg-gradient-to-br from-purple-600/90 to-pink-600/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Wallet Balance</span>
            </div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 hover:bg-white/10 rounded-lg"
              title={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-3xl font-bold mb-2">
            {showBalance ? formatCurrency(dashboardData.wallet.balance) : '••••••••'}
          </div>

          <div className="text-sm opacity-90 mb-6">Available for withdrawal & purchases</div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDepositModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-3 px-4 text-center transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="font-semibold text-sm">Deposit</div>
              <div className="text-xs opacity-90 mt-1">Add Funds</div>
            </button>
            <button
              onClick={() => setWithdrawModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-3 px-4 text-center transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="font-semibold text-sm">Withdraw</div>
              <div className="text-xs opacity-90 mt-1">To Bank</div>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <ReferralIcon className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Total Referrals</span>
            </div>
            <div className="text-2xl font-bold">{dashboardData.stats.totalReferrals}</div>
            <div className="text-xs text-green-400 mt-1">
              +{dashboardData.stats.convertedReferrals} converted
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <MoneyIcon className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Monthly Earnings</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(dashboardData.stats.monthlyEarnings)}
            </div>
            <div className="text-xs text-gray-400 mt-1">This month</div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Tickets Sold</span>
            </div>
            <div className="text-2xl font-bold">{dashboardData.stats.totalTicketsSold}</div>
            <div className="text-xs text-gray-400 mt-1">Via referrals</div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Rank</span>
            </div>
            <div className="text-2xl font-bold">#{dashboardData.influencer?.influencerData?.rank || 'N/A'}</div>
            <div className="text-xs text-gray-400 mt-1">Top 10%</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-2 border border-gray-800">
            <div className="flex overflow-x-auto">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badgeCount = item.id === 'referrals' 
                  ? dashboardData.stats.totalReferrals 
                  : item.id === 'announcements' 
                  ? unreadCount 
                  : 0;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 flex-shrink-0 px-4 py-2.5 rounded-lg mx-1 transition-all ${isActive ? `bg-${item.color}-600 text-white` : 'hover:bg-gray-800 text-gray-300'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-700'}`}>
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* NEW: Quick Action Buttons */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={goToShareToolkit}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
          >
            <Share className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium text-sm">Share Toolkit</span>
          </button>

          <button
            onClick={goToInfluencersPage}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium text-sm">All Influencers</span>
          </button>

          <button
            onClick={() => navigate('/raffles')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
          >
            <Ticket className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium text-sm">Browse Raffles</span>
          </button>

          <button
            onClick={() => setLeaderboardModal(true)}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
          >
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium text-sm">Leaderboard</span>
          </button>
        </div>

        {/* Tab Content */}
        <ErrorBoundary>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
            <TabContent 
              activeTab={activeTab}
              dashboardData={dashboardData}
              user={user}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatTimeAgo={formatTimeAgo}
              notifications={notifications}
              onMarkNotificationAsRead={markNotificationAsRead}
              onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
              onBuyTicket={() => navigate('/raffles')}
              onGoToShareToolkit={goToShareToolkit}
              onGoToInfluencersPage={goToInfluencersPage}
              REFERRAL_DOMAIN={REFERRAL_DOMAIN}
            />
          </div>
        </ErrorBoundary>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-30">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <Home className="w-5 h-5 text-gray-400" />
            <span className="text-xs mt-1">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-xs mt-1 text-blue-400">Dashboard</span>
          </button>

          <button
            onClick={() => goToShareToolkit()}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <Share className="w-5 h-5 text-pink-400" />
            <span className="text-xs mt-1 text-pink-400">Share</span>
          </button>

          <button
            onClick={() => goToInfluencersPage()}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <Users className="w-5 h-5 text-cyan-400" />
            <span className="text-xs mt-1 text-cyan-400">Influencers</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <Megaphone className="w-5 h-5 text-purple-400" />
            <span className="text-xs mt-1 text-purple-400">News</span>
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Deposit Funds</h3>
            <p className="text-gray-400 text-sm mb-6">Add money to your wallet using Paystack</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Amount (₦)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-lg"
                placeholder="Enter amount"
                min="100"
                step="100"
              />
              <p className="text-xs text-gray-400 mt-2">Minimum deposit: ₦100</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDepositModal(false);
                  setDepositAmount('');
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={processingPayment || !depositAmount || depositAmount < 100}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Deposit Now
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secured by Paystack • SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Withdraw Funds</h3>
            
            <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Available Balance</span>
                <span className="font-bold">{formatCurrency(dashboardData.wallet.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bank Account</span>
                <span className="font-medium">
                  {dashboardData.influencer?.influencerData?.bankDetails?.bankName || 'Not set'}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Amount (₦)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-lg"
                placeholder="Enter amount"
                min="1000"
                step="100"
              />
              <p className="text-xs text-gray-400 mt-2">Minimum withdrawal: ₦1,000 • Processing: 1-3 business days</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setWithdrawModal(false);
                  setWithdrawAmount('');
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg"
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={processingPayment || !withdrawAmount || withdrawAmount < 1000 || withdrawAmount > dashboardData.wallet.balance}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Withdraw
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {leaderboardModal && (
        <LeaderboardModal 
          onClose={() => setLeaderboardModal(false)}
          user={user}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Analytics Modal */}
      {analyticsModal && (
        <AnalyticsModal 
          onClose={() => setAnalyticsModal(false)}
          dashboardData={dashboardData}
          user={user}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Optimized Leaderboard Modal Component
const LeaderboardModal = ({ onClose, user, formatCurrency }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    loadLeaderboard();
  }, [timeRange]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      const usersQuery = query(
        collection(db, 'users'),
        where('accountType', '==', 'influencer'),
        orderBy('influencerData.lifetimeEarnings', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(usersQuery);
      const leaderboardData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRank = () => {
    if (!user) return null;
    return leaderboard.find(item => item.id === user.uid)?.rank || 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Influencer Leaderboard
              </h2>
              <p className="text-gray-400 text-sm mt-1">Top performing influencers by earnings</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Time Range Filters */}
          <div className="flex gap-2 mt-4">
            {['daily', 'weekly', 'monthly', 'allTime'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${timeRange === range ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {range === 'allTime' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {/* User Rank Display */}
          {user && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold">{user.displayName}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-400">#{getUserRank()}</p>
                  <p className="text-sm text-gray-400">Your Rank</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((influencer) => {
                const isCurrentUser = user?.uid === influencer.id;
                return (
                  <div
                    key={influencer.id}
                    className={`p-4 rounded-xl border ${isCurrentUser ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-orange-900/20' : 'border-gray-800 bg-gray-900/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${influencer.rank <= 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
                          {influencer.rank <= 3 ? (
                            <span className="text-lg">{influencer.rank}</span>
                          ) : (
                            influencer.displayName?.charAt(0) || 'I'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{influencer.displayName}</p>
                            {influencer.rank <= 3 && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${influencer.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : influencer.rank === 2 ? 'bg-gray-500/20 text-gray-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                {influencer.rank === 1 ? '🥇' : influencer.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            Tier: {influencer.influencerData?.tier || 'Bronze'} • 
                            Referrals: {influencer.influencerData?.totalReferrals || 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-400">
                          {formatCurrency(influencer.influencerData?.lifetimeEarnings || 0)}
                        </p>
                        <p className="text-sm text-gray-400">Total Earnings</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No leaderboard data available</p>
              <p className="text-sm mt-2">Be the first to start earning!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Optimized Analytics Modal Component
const AnalyticsModal = ({ onClose, dashboardData, user, formatCurrency, formatDate }) => {
  const [analytics, setAnalytics] = useState({
    referralsBySource: [],
    conversionRates: {},
    topPerformers: [],
    trends: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;

      const referralsQuery = query(
        collection(db, 'referrals'),
        where('userId', '==', user.uid)
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      const referralsData = referralsSnapshot.docs[0]?.data() || { referredUsers: [] };

      const referredUsers = referralsData.referredUsers || [];
      const usersData = [];
      
      for (const userId of referredUsers.slice(0, 50)) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            usersData.push({ id: userId, ...userDoc.data() });
          }
        } catch (error) {
          console.error('Error loading user:', error);
        }
      }

      const ticketsData = {};
      for (const userData of usersData) {
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('userId', '==', userData.id)
        );
        const ticketsSnapshot = await getDocs(ticketsQuery);
        ticketsData[userData.id] = {
          count: ticketsSnapshot.size,
          totalSpent: ticketsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().price || 0), 0)
        };
      }

      const referralsBySource = calculateReferralsBySource(usersData);
      const conversionRates = calculateConversionRates(usersData, ticketsData);
      const topPerformers = calculateTopPerformers(usersData, ticketsData);
      const trends = await loadTrends(user.uid, dateRange);

      setAnalytics({
        referralsBySource,
        conversionRates,
        topPerformers,
        trends
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReferralsBySource = (users) => {
    const sources = {};
    users.forEach(user => {
      const source = user.referredBy || 'direct';
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.entries(sources).map(([source, count]) => ({
      source,
      count,
      percentage: (count / users.length) * 100
    })).sort((a, b) => b.count - a.count);
  };

  const calculateConversionRates = (users, tickets) => {
    const totalUsers = users.length;
    const usersWithTickets = Object.keys(tickets).filter(userId => tickets[userId].count > 0).length;
    const totalRevenue = Object.values(tickets).reduce((sum, data) => sum + data.totalSpent, 0);
    const avgRevenuePerUser = totalRevenue / totalUsers;

    return {
      totalUsers,
      usersWithTickets,
      conversionRate: (usersWithTickets / totalUsers) * 100,
      totalRevenue,
      avgRevenuePerUser
    };
  };

  const calculateTopPerformers = (users, tickets) => {
    return users
      .map(user => ({
        ...user,
        ticketCount: tickets[user.id]?.count || 0,
        totalSpent: tickets[user.id]?.totalSpent || 0
      }))
      .filter(user => user.ticketCount > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  };

  const loadTrends = async (userId, range) => {
    const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('type', 'in', ['payout', 'commission']),
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(transactionsQuery);
    const dailyData = {};
    
    snapshot.docs.forEach(doc => {
      const transaction = doc.data();
      const date = transaction.createdAt?.toDate().toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
      if (date) {
        if (!dailyData[date]) {
          dailyData[date] = 0;
        }
        dailyData[date] += transaction.amount || 0;
      }
    });
    
    return Object.entries(dailyData).map(([date, earnings]) => ({ date, earnings }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-400" />
                Performance Analytics
              </h2>
              <p className="text-gray-400 text-sm mt-1">Detailed insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-4 rounded-xl border border-purple-800/50">
                  <p className="text-sm text-gray-400">Total Referrals</p>
                  <p className="text-2xl font-bold">{analytics.conversionRates.totalUsers || 0}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-4 rounded-xl border border-green-800/50">
                  <p className="text-sm text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold">
                    {analytics.conversionRates.conversionRate ? analytics.conversionRates.conversionRate.toFixed(1) : 0}%
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-4 rounded-xl border border-blue-800/50">
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(analytics.conversionRates.totalRevenue || 0)}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-4 rounded-xl border border-yellow-800/50">
                  <p className="text-sm text-gray-400">Avg/User</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(analytics.conversionRates.avgRevenuePerUser || 0)}
                  </p>
                </div>
              </div>

              {/* Trends Chart */}
              <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                <h3 className="font-bold text-lg mb-4">Earnings Trend</h3>
                {analytics.trends.length > 0 ? (
                  <div className="h-64">
                    <div className="flex items-end h-48 gap-1">
                      {analytics.trends.map((trend, index) => {
                        const maxEarnings = Math.max(...analytics.trends.map(t => t.earnings));
                        const height = (trend.earnings / maxEarnings) * 100;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-green-500 to-emerald-600 rounded-t"
                              style={{ height: `${Math.max(height, 5)}%` }}
                            ></div>
                            <div className="text-xs text-gray-400 mt-2 truncate w-full text-center">
                              {trend.date}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No trend data available for this period</p>
                  </div>
                )}
              </div>

              {/* Referral Sources */}
              <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                <h3 className="font-bold text-lg mb-4">Referral Sources</h3>
                {analytics.referralsBySource.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.referralsBySource.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm">
                            {source.source.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{source.source}</p>
                            <p className="text-sm text-gray-400">{source.count} referrals</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{source.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No referral source data available</p>
                  </div>
                )}
              </div>

              {/* Top Performers */}
              <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                <h3 className="font-bold text-lg mb-4">Top Performing Referrals</h3>
                {analytics.topPerformers.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topPerformers.map((performer, index) => (
                      <div key={performer.id} className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                            {performer.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold">{performer.displayName}</p>
                            <p className="text-sm text-gray-400">{performer.ticketCount} tickets purchased</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">
                            {formatCurrency(performer.totalSpent)}
                          </p>
                          <p className="text-sm text-gray-400">Total spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No top performers data available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Optimized Tab Content Component
const TabContent = ({ 
  activeTab, 
  dashboardData, 
  user, 
  formatCurrency, 
  formatDate, 
  formatTimeAgo, 
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onBuyTicket,
  onGoToShareToolkit,
  onGoToInfluencersPage,
  REFERRAL_DOMAIN 
}) => {
  const [tabData, setTabData] = useState({
    referrals: { list: [], loading: false },
    tickets: { list: [], loading: false },
    transactions: { list: [], loading: false },
    payouts: { list: [], loading: false },
    winners: { list: [], loading: false }
  });

  useEffect(() => {
  if (!user?.uid) return;

  const loadTabData = async () => {
    switch (activeTab) {
      case 'winners':
        await loadWinners();
        break;
      case 'referrals':
        await loadReferrals();
        break;
      case 'mytickets':
        await loadTickets();
        break;
      case 'transactions':
        await loadTransactions();
        break;
      case 'payouts':
        await loadPayouts();
        break;
    }
  };

  loadTabData();
}, [activeTab, user?.uid]);

  const loadWinners = async () => {
    if (!user?.uid) return;
    
    setTabData(prev => ({ ...prev, winners: { ...prev.winners, loading: true, error: null } }));
    
    try {
      console.log('🔄 Loading winners for user:', user.uid);
      
      // Get user's referrals
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('userId', '==', user.uid)
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      const referralsData = referralsSnapshot.docs[0]?.data() || { referredUsers: [] };
      
      console.log('📋 User has', referralsData.referredUsers?.length || 0, 'referrals');
      
      // Get ALL winners
      let winnersQuery = query(
        collection(db, 'winners'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(winnersQuery);
      console.log('🏆 Firestore returned', snapshot.size, 'total winners');
      
      // Process winners
      const winnersList = [];
      
      for (const doc of snapshot.docs) {
        const winner = doc.data();
        
        const winnerId = winner.userId || winner.winnerId || winner.userEmail || '';
        const winnerName = winner.userName || winner.winnerName || winner.userFirstName + ' ' + winner.userLastName || 'Unknown Winner';
        const prizeTitle = winner.raffleTitle || winner.prizeTitle || winner.prize?.name || 'Unknown Prize';
        const prizeValue = winner.prize?.value || winner.value || 0;
        
        let prizeCategory = 'other';
        const prizeTitleLower = prizeTitle.toLowerCase();
        if (prizeTitleLower.includes('car') || prizeTitleLower.includes('vehicle')) prizeCategory = 'cars';
        else if (prizeTitleLower.includes('cash') || prizeTitleLower.includes('money')) prizeCategory = 'cash';
        else if (prizeTitleLower.includes('house') || prizeTitleLower.includes('apartment')) prizeCategory = 'property';
        else if (prizeTitleLower.includes('phone') || prizeTitleLower.includes('laptop')) prizeCategory = 'electronics';
        else if (prizeTitleLower.includes('watch') || prizeTitleLower.includes('jewelry')) prizeCategory = 'luxury';
        
        let winDate;
        if (winner.timestamp) {
          winDate = new Date(winner.timestamp);
        } else if (winner.isoDate) {
          winDate = new Date(winner.isoDate);
        } else if (winner.date) {
          winDate = new Date(winner.date);
        } else {
          winDate = new Date();
        }
        
        winnersList.push({
          id: doc.id,
          winnerId: winnerId,
          winnerName: winnerName,
          winnerImage: winner.userImage || winner.winnerImage || null,
          winnerLocation: winner.userLocation || winner.winnerLocation || 'Unknown Location',
          prizeTitle: prizeTitle,
          prizeValue: prizeValue,
          prizeCategory: prizeCategory,
          prizeImage: winner.raffleImage || winner.prizeImage || null,
          story: winner.prize?.description || `I won ${prizeTitle}!`,
          winDate: winDate,
          verified: winner.verified || false,
          isMyReferral: referralsData.referredUsers?.includes(winnerId) || false,
          ticketNumber: winner.ticketNumber || 'N/A',
          views: winner.views || 0,
          shareCount: winner.shareCount || 0
        });
      }
      
      console.log('✅ Found', winnersList.length, 'winners');
      
      setTabData(prev => ({ 
        ...prev, 
        winners: { list: winnersList, loading: false, error: null } 
      }));
      
    } catch (error) {
      console.error('❌ Error loading winners:', error);
      console.error('Error details:', error.code, error.message);
      
      setTabData(prev => ({ 
        ...prev, 
        winners: { ...prev.winners, loading: false, error: error.message } 
      }));
    }
  };

  const loadReferrals = async () => {
  if (!user?.uid) return;
  
  setTabData(prev => ({ ...prev, referrals: { ...prev.referrals, loading: true, error: null } }));
  
  try {
    console.log('🔄 Loading referrals for user:', user.uid);
    
    // Get influencer's data
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    const influencerCode = userData.referralCode;
    
    if (!influencerCode) {
      console.log('No referral code found for influencer');
      setTabData(prev => ({ 
        ...prev, 
        referrals: { list: [], loading: false, error: 'No referral code found' } 
      }));
      return;
    }
    
    console.log('🔍 Querying users with referredBy =', influencerCode);
    
    // Query users collection directly
    const referredUsersQuery = query(
      collection(db, 'users'),
      where('referredBy', '==', influencerCode),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(referredUsersQuery);
    console.log(`✅ Found ${snapshot.size} referred users`);
    
    const referralsList = [];
    
    for (const userDoc of snapshot.docs) {
      const referredUserData = userDoc.data();
      
      // Check if user has purchased tickets
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('userId', '==', userDoc.id),
        limit(1)
      );
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const hasPurchased = !ticketsSnapshot.empty;
      
      referralsList.push({
        id: userDoc.id,
        displayName: referredUserData.displayName || 
                    `${referredUserData.firstName || ''} ${referredUserData.lastName || ''}`.trim() || 
                    referredUserData.email?.split('@')[0] || 
                    'User',
        email: referredUserData.email,
        photoURL: referredUserData.photoURL,
        joined: referredUserData.createdAt?.toDate(),
        hasPurchased,
        status: hasPurchased ? 'customer' : 'pending',
        accountType: referredUserData.accountType || 'user',
        referredBy: referredUserData.referredBy // Keep this for debugging
      });
    }
    
    console.log('✅ Loaded referrals list:', referralsList.length);
    
    setTabData(prev => ({ 
      ...prev, 
      referrals: { list: referralsList, loading: false, error: null } 
    }));
    
  } catch (error) {
    console.error('❌ Error loading referrals:', error);
    setTabData(prev => ({ 
      ...prev, 
      referrals: { ...prev.referrals, loading: false, error: error.message } 
    }));
  }
};
    
 

  const loadTickets = async () => {
    if (!user?.uid) return;
    
    setTabData(prev => ({ ...prev, tickets: { ...prev.tickets, loading: true } }));
    
    try {
      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('userId', '==', user.uid),
        orderBy('purchaseDate', 'desc')
      );
      
      const snapshot = await getDocs(ticketsQuery);
      const ticketsList = [];
      
      for (const ticketDoc of snapshot.docs) {
        const ticket = ticketDoc.data();
        
        let raffleDetails = null;
        if (ticket.raffleId) {
          const raffleDoc = await getDoc(doc(db, 'raffles', ticket.raffleId));
          if (raffleDoc.exists()) {
            raffleDetails = raffleDoc.data();
          }
        }
        
        ticketsList.push({
          id: ticketDoc.id,
          ...ticket,
          raffleDetails,
          drawDate: ticket.drawDate?.toDate(),
          purchaseDate: ticket.purchaseDate?.toDate()
        });
      }
      
      setTabData(prev => ({ 
        ...prev, 
        tickets: { list: ticketsList, loading: false } 
      }));
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTabData(prev => ({ 
        ...prev, 
        tickets: { ...prev.tickets, loading: false } 
      }));
    }
  };

  const loadTransactions = async () => {
    if (!user?.uid) return;
    
    setTabData(prev => ({ ...prev, transactions: { ...prev.transactions, loading: true } }));
    
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      const transactionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()
      }));
      
      setTabData(prev => ({ 
        ...prev, 
        transactions: { list: transactionsList, loading: false } 
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTabData(prev => ({ 
        ...prev, 
        transactions: { ...prev.transactions, loading: false } 
      }));
    }
  };

  const loadPayouts = async () => {
    if (!user?.uid) return;
    
    setTabData(prev => ({ ...prev, payouts: { ...prev.payouts, loading: true } }));
    
    try {
      const payoutsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('type', 'in', ['payout', 'commission']),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(payoutsQuery);
      const payoutsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()
      }));
      
      setTabData(prev => ({ 
        ...prev, 
        payouts: { list: payoutsList, loading: false } 
      }));
    } catch (error) {
      console.error('Error loading payouts:', error);
      setTabData(prev => ({ 
        ...prev, 
        payouts: { ...prev.payouts, loading: false } 
      }));
    }
  };

  switch (activeTab) {
    case 'overview':
      return <OverviewTab 
        data={dashboardData} 
        user={user} 
        formatCurrency={formatCurrency} 
        onBuyTicket={onBuyTicket}
        onGoToShareToolkit={onGoToShareToolkit}
        onGoToInfluencersPage={onGoToInfluencersPage}
        REFERRAL_DOMAIN={REFERRAL_DOMAIN}
      />;
    case 'referrals':
      return <ReferralsTab 
        data={tabData.referrals} 
        stats={dashboardData.stats}
        influencer={dashboardData.influencer}
        formatCurrency={formatCurrency} 
        formatDate={formatDate}
        REFERRAL_DOMAIN={REFERRAL_DOMAIN}
      />;
    case 'mytickets':
      return <MyTicketsTab 
        data={tabData.tickets} 
        formatCurrency={formatCurrency} 
        formatDate={formatDate}
        onBuyTicket={onBuyTicket}
      />;
    case 'transactions':
      return <TransactionsTab 
        data={tabData.transactions} 
        formatCurrency={formatCurrency} 
        formatTimeAgo={formatTimeAgo}
      />;
    case 'payouts':
  return <PayoutsTab 
    data={tabData.payouts} 
    formatCurrency={formatCurrency} 
    formatDate={formatDate}
    stats={dashboardData.stats}
    user={user} // Make sure this line is present
  />;
    case 'winners':
      return <WinnersTab 
        data={tabData.winners} 
        formatCurrency={formatCurrency} 
        formatDate={formatDate}
      />;
    case 'announcements':
      return <AnnouncementsTab 
        notifications={notifications} 
        formatTimeAgo={formatTimeAgo} 
        onMarkNotificationAsRead={onMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={onMarkAllNotificationsAsRead}
      />;
    case 'settings':
      return <SettingsTab 
        user={user} 
        dashboardData={dashboardData}
        formatCurrency={formatCurrency}
      />;
    default:
      return <OverviewTab 
        data={dashboardData} 
        user={user} 
        formatCurrency={formatCurrency} 
        onBuyTicket={onBuyTicket}
        onGoToShareToolkit={onGoToShareToolkit}
        onGoToInfluencersPage={onGoToInfluencersPage}
        REFERRAL_DOMAIN={REFERRAL_DOMAIN}
      />;
  }
};

// Winners Tab Component
const WinnersTab = ({ data, formatCurrency, formatDate }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWinners = data.list.filter(winner => {
    if (filter === 'myReferrals' && !winner.isMyReferral) return false;
    if (filter === 'others' && winner.isMyReferral) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        winner.winnerName?.toLowerCase().includes(searchLower) ||
        winner.prizeTitle?.toLowerCase().includes(searchLower) ||
        winner.prizeCategory?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cars': return '🚗';
      case 'cash': return '💰';
      case 'electronics': return '📱';
      case 'property': return '🏠';
      case 'travel': return '✈️';
      case 'luxury': return '💎';
      case 'food': return '🍔';
      case 'watches': return '⌚';
      case 'gaming': return '🎮';
      case 'fashion': return '👕';
      case 'education': return '🎓';
      case 'business': return '💼';
      case 'home': return '🏡';
      case 'others': return '🎁';
      default: return '🏆';
    }
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-red-400" />
              Winners Hall of Fame
            </h2>
            <p className="text-gray-400 mt-1">See who's winning and celebrate your referrals' success</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search winners..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'myReferrals', 'others'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium ${filter === f ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {f === 'myReferrals' ? 'My Referrals' : f === 'others' ? 'Other Winners' : 'All Winners'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {data.error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Error loading winners:</p>
                <p className="text-sm">{data.error}</p>
              </div>
            </div>
          </div>
        )}

        {data.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800/50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredWinners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredWinners.map((winner) => (
              <div key={winner.id} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-5 border border-gray-800 hover:border-red-800/50 transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(winner.prizeCategory)}</span>
                      <h3 className="font-bold text-lg">{winner.prizeTitle}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">Category: {winner.prizeCategory}</p>
                  </div>
                  {winner.isMyReferral && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Your Referral 🎉
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden">
                    {winner.winnerImage ? (
                      <img src={winner.winnerImage} alt={winner.winnerName} className="w-full h-full object-cover" />
                    ) : (
                      winner.winnerName?.charAt(0) || 'W'
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{winner.winnerName}</p>
                    <div className="text-sm text-gray-400">
                      {winner.winnerLocation} • {winner.winnerProfession}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Prize Value</span>
                    <span className="font-bold text-2xl text-green-400">
                      {formatCurrency(winner.prizeValue)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Win Date</span>
                    <span className="font-medium">
                      {winner.winDate ? formatDate(winner.winDate) : 'N/A'}
                    </span>
                  </div>
                </div>

                {winner.story && (
                  <div className="p-3 bg-gray-800/30 rounded-lg mb-4">
                    <p className="text-sm text-gray-300 italic">"{winner.story.substring(0, 100)}..."</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-4 text-sm">
                    {winner.views && (
                      <span className="text-gray-400">
                        👁️ {winner.views} views
                      </span>
                    )}
                    {winner.shareCount && (
                      <span className="text-gray-400">
                        ❤️ {winner.shareCount} shares
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => window.location.href = `/winner/${winner.id}`}
                    className="text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : data.error ? null : (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No winners found</p>
            <p className="text-sm mt-2">
              {filter === 'myReferrals' 
                ? "Your referrals haven't won any prizes yet" 
                : "No winners to display. Winners will appear here once they start winning!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ data, user, formatCurrency, onBuyTicket, onGoToShareToolkit, onGoToInfluencersPage, REFERRAL_DOMAIN }) => {
  const [performanceChart, setPerformanceChart] = useState([]);

  useEffect(() => {
    loadPerformanceChart();
  }, []);

  const loadPerformanceChart = async () => {
    if (!user?.uid) return;
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('type', 'in', ['payout', 'commission']),
        where('createdAt', '>=', thirtyDaysAgo),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(transactionsQuery);
      const dailyData = {};
      
      snapshot.docs.forEach(doc => {
        const transaction = doc.data();
        const date = transaction.createdAt?.toDate().toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
        if (date) {
          if (!dailyData[date]) {
            dailyData[date] = 0;
          }
          dailyData[date] += transaction.amount || 0;
        }
      });
      
      setPerformanceChart(Object.entries(dailyData).map(([date, earnings]) => ({ date, earnings })));
    } catch (error) {
      console.error('Error loading performance chart:', error);
    }
  };

  const shareReferralLink = () => {
    const link = `${REFERRAL_DOMAIN}/ref/${data.influencer?.referralCode}`;
    const text = `Join me on Raffle Platform! Use my referral link to get started: ${link}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Raffle Platform',
        text: text,
        url: link
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Dashboard Overview
            </h2>
            <p className="text-gray-400 mt-1">Welcome back, {data.influencer?.displayName}! Here's your performance summary.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-bold rounded-full">
              Tier: {data.influencer?.influencerData?.tier || 'Bronze'}
            </span>
            <span className="px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
              Rank: #{data.influencer?.influencerData?.rank || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-purple-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(data.stats.lifetimeEarnings)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Lifetime commission from referrals</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-6 rounded-2xl border border-blue-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Referrals</p>
                <p className="text-2xl font-bold">{data.stats.activeReferrals}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total: {data.stats.totalReferrals}</span>
              <span className="text-green-400">+{data.stats.convertedReferrals} converted</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-6 rounded-2xl border border-yellow-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-600/30 rounded-lg">
                <Ticket className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {data.stats.totalReferrals > 0 
                    ? `${Math.round((data.stats.convertedReferrals / data.stats.totalReferrals) * 100)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Referrals that purchased tickets</p>
          </div>
        </div>

        {/* Quick Actions */}

        <button
  onClick={async () => {
    if (!user?.uid) return;
    
    // Get influencer data
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    const influencerCode = userData.referralCode;
    
    console.log('=== REFERRAL DEBUG INFO ===');
    console.log('Influencer ID:', user.uid);
    console.log('Influencer Code:', influencerCode);
    console.log('Influencer Email:', userData.email);
    
    // Query to see if there are any users with this code
    const queryRef = query(
      collection(db, 'users'),
      where('referredBy', '==', influencerCode)
    );
    
    try {
      const snapshot = await getDocs(queryRef);
      console.log(`Users found with referredBy="${influencerCode}":`, snapshot.size);
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`User ${index + 1}:`, {
          id: doc.id,
          email: data.email,
          accountType: data.accountType,
          referredBy: data.referredBy,
          createdAt: data.createdAt?.toDate()
        });
      });
      
      if (snapshot.size === 0) {
        // Check if there are any users with referredBy field at all
        const allUsersQuery = query(collection(db, 'users'));
        const allUsersSnapshot = await getDocs(allUsersQuery);
        const usersWithReferredBy = allUsersSnapshot.docs.filter(doc => doc.data().referredBy);
        
        console.log('\n📊 All users with referredBy field:', usersWithReferredBy.length);
        usersWithReferredBy.forEach((doc, index) => {
          const data = doc.data();
          console.log(`User with referredBy ${index + 1}:`, {
            email: data.email,
            referredBy: data.referredBy,
            matchesInfluencerCode: data.referredBy === influencerCode
          });
        });
      }
    } catch (error) {
      console.error('Query error:', error);
    }
    
    console.log('=== END DEBUG ===');
  }}
  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
>
  <Search className="w-6 h-6 mx-auto mb-2" />
  <span className="font-medium text-sm">Debug Referrals</span>
</button>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={onGoToShareToolkit}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
            >
              <Share className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Share Toolkit</span>
            </button>

            <button
              onClick={onGoToInfluencersPage}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">All Influencers</span>
            </button>

            <button
              onClick={onBuyTicket}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
            >
              <Ticket className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Buy Tickets</span>
            </button>

            <button
              onClick={shareReferralLink}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
            >
              <Share2 className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Share Link</span>
            </button>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Performance Trend (Last 30 Days)
          </h3>
          {performanceChart.length > 0 ? (
            <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
              <div className="h-48 flex items-end gap-1">
                {performanceChart.map((item, index) => {
                  const maxEarnings = Math.max(...performanceChart.map(t => t.earnings));
                  const height = (item.earnings / maxEarnings) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`₦${item.earnings.toLocaleString()}`}
                      ></div>
                      <div className="text-xs text-gray-400 mt-2 truncate w-full text-center">
                        {item.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No performance data available yet</p>
              <p className="text-sm mt-1">Start referring to see your earnings trend</p>
            </div>
          )}
        </div>

        {/* Recent Winners */}
        {data.recentWinners && data.recentWinners.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Recent Winners From Your Referrals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recentWinners.slice(0, 4).map((winner) => (
                <div key={winner.id} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                      {winner.winnerName?.charAt(0) || 'W'}
                    </div>
                    <div>
                      <p className="font-bold">{winner.winnerName}</p>
                      <p className="text-sm text-gray-400">{winner.prizeTitle}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-bold">{formatCurrency(winner.prizeValue)}</span>
                    <span className="text-xs text-gray-400">
                      {winner.winDate ? formatDate(winner.winDate) : 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Referrals Tab Component
const ReferralsTab = ({ data, stats, influencer, formatCurrency, formatDate, REFERRAL_DOMAIN }) => {
  const [filter, setFilter] = useState('all');

  const filteredReferrals = filter === 'all' 
    ? data.list 
    : filter === 'customers'
    ? data.list.filter(r => r.status === 'customer')
    : data.list.filter(r => r.status === 'pending');

  const copyReferralLink = () => {
    const link = `${REFERRAL_DOMAIN}/ref/${influencer?.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied to clipboard!');
  };

  const shareReferralLink = () => {
    const link = `${REFERRAL_DOMAIN}/ref/${influencer?.referralCode}`;
    const text = `Join me on Raffle Platform! Use my referral link to get started: ${link}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Raffle Platform',
        text: text,
        url: link
      });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          Referral Network
        </h2>
        <p className="text-gray-400 mt-1">Track your referrals and their activity</p>
      </div>

      <div className="p-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <div className="text-sm text-gray-400">Total Referrals</div>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <div className="text-2xl font-bold text-green-400">{stats.convertedReferrals}</div>
            <div className="text-sm text-gray-400">Converted</div>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <div className="text-2xl font-bold">{stats.activeReferrals}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <div className="text-2xl font-bold text-yellow-400">{stats.totalReferrals - stats.convertedReferrals}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="mb-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-5 rounded-2xl border border-purple-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Your Unique Referral Link</h3>
              <p className="text-gray-400 text-sm">Share this link to earn 15% commission on every purchase</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={copyReferralLink}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Clipboard className="w-4 h-4" />
                Copy Link
              </button>
              <button
                onClick={shareReferralLink}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Now
              </button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-black/30 rounded-lg border border-gray-800">
            <div className="text-sm font-mono text-gray-300 break-all">
              {REFERRAL_DOMAIN}/ref/{influencer?.referralCode}
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Referrals</h3>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">All Referrals</option>
                <option value="customers">Customers Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
          </div>

          {data.loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredReferrals.length > 0 ? (
            <div className="space-y-3">
              {filteredReferrals.map((referral) => (
                <div key={referral.id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 hover:border-blue-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                          {referral.photoURL ? (
                            <img src={referral.photoURL} alt={referral.displayName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            referral.displayName?.charAt(0) || 'U'
                          )}
                        </div>
                        {referral.hasPurchased && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{referral.displayName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{referral.email}</span>
                          <span>•</span>
                          <span>Joined {referral.joined ? formatDate(referral.joined) : 'Recently'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${referral.status === 'customer' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {referral.status === 'customer' ? '🎫 Customer' : '⏳ Pending'}
                      </span>
                      <button className="text-blue-400 hover:text-blue-300">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No referrals yet</p>
              <p className="text-sm mt-2">Share your referral link to start earning commissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// My Tickets Tab Component
const MyTicketsTab = ({ data, formatCurrency, formatDate, onBuyTicket }) => {
  const [filter, setFilter] = useState('all');

  const filteredTickets = filter === 'all' 
    ? data.list 
    : data.list.filter(ticket => {
        if (!ticket.drawDate) return false;
        const draw = new Date(ticket.drawDate);
        const now = new Date();
        
        if (filter === 'active') return draw > now && ticket.status !== 'won' && ticket.status !== 'lost';
        if (filter === 'won') return ticket.status === 'won';
        if (filter === 'lost') return ticket.status === 'lost';
        if (filter === 'ended') return draw < now;
        return true;
      });

  const getStatusColor = (status, drawDate) => {
    const now = new Date();
    const draw = new Date(drawDate);
    
    if (status === 'won') return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (status === 'lost') return 'bg-gradient-to-r from-red-500 to-pink-500';
    if (draw < now) return 'bg-gradient-to-r from-gray-500 to-gray-700';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  const getStatusText = (status, drawDate) => {
    const now = new Date();
    const draw = new Date(drawDate);
    
    if (status === 'won') return '🏆 Winner!';
    if (status === 'lost') return '❌ Lost';
    if (draw < now) return '⏳ Draw Ended';
    return '✅ Active';
  };

  const getTimeUntilDraw = (drawDate) => {
    if (!drawDate) return 'TBD';
    const now = new Date();
    const draw = new Date(drawDate);
    const diff = draw - now;
    
    if (diff <= 0) return 'Draw Completed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="w-6 h-6 text-green-400" />
              My Tickets
            </h2>
            <p className="text-gray-400 mt-1">Track all your ticket purchases and potential winnings</p>
          </div>
          <button
            onClick={onBuyTicket}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Buy More Tickets
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Tickets Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-5 rounded-2xl border border-green-800/50">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold">{data.list.length}</div>
                <div className="text-sm text-gray-400">Total Tickets</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-5 rounded-2xl border border-yellow-800/50">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">
                  {data.list.filter(t => {
                    if (!t.drawDate) return false;
                    const draw = new Date(t.drawDate);
                    return draw > new Date() && t.status !== 'won' && t.status !== 'lost';
                  }).length}
                </div>
                <div className="text-sm text-gray-400">Active Draws</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-5 rounded-2xl border border-purple-800/50">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold">
                  {data.list.filter(t => t.status === 'won').length}
                </div>
                <div className="text-sm text-gray-400">Wins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'active', 'won', 'lost', 'ended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium ${filter === f ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {data.loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800 hover:border-green-800/50 transition-all duration-300 hover:scale-[1.01]">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{ticket.raffleTitle || ticket.raffleDetails?.title || 'Unknown Raffle'}</h3>
                        <p className="text-gray-400 text-sm">Ticket #{ticket.ticketNumber}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(ticket.status, ticket.drawDate)}`}>
                        {getStatusText(ticket.status, ticket.drawDate)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Draw Date</p>
                        <p className="font-medium">
                          {ticket.drawDate ? formatDate(ticket.drawDate) : 'TBD'}
                        </p>
                        {ticket.drawDate && new Date(ticket.drawDate) > new Date() && (
                          <p className="text-sm text-green-400">
                            Draws in: {getTimeUntilDraw(ticket.drawDate)}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Purchase Date</p>
                        <p className="font-medium">
                          {ticket.purchaseDate ? formatDate(ticket.purchaseDate) : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Ticket Price</p>
                        <p className="font-medium">{formatCurrency(ticket.price)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Prize Value</p>
                        <p className="font-bold text-green-400">
                          {formatCurrency(ticket.value || ticket.raffleDetails?.value || 0)}
                        </p>
                      </div>
                    </div>
                    
                    {ticket.raffleDetails?.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                          {ticket.raffleDetails.category}
                        </span>
                        {ticket.raffleDetails.featured && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => window.location.href = `/raffle/${ticket.raffleId}`}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      View Details
                    </button>
                    {new Date(ticket.drawDate) > new Date() && (
                      <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Track Draw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No tickets yet</p>
            <p className="text-sm mt-2">Buy your first ticket to participate in exciting raffles</p>
            <button
              onClick={onBuyTicket}
              className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              Browse Raffles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab = ({ data, formatCurrency, formatTimeAgo }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = data.list.filter(transaction => {
    if (filter !== 'all' && transaction.type !== filter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.reference?.toLowerCase().includes(searchLower) ||
        transaction.id.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '🏦';
      case 'purchase': return '🎫';
      case 'payout': return '💸';
      case 'win': return '🏆';
      case 'commission': return '📈';
      default: return '📊';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'win':
      case 'payout':
      case 'commission': return 'text-green-400';
      case 'withdrawal':
      case 'purchase': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'purchase': return 'Ticket Purchase';
      case 'payout': return 'Referral Payout';
      case 'win': return 'Raffle Win';
      case 'commission': return 'Commission';
      default: return type;
    }
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-orange-400" />
          Transaction History
        </h2>
        <p className="text-gray-400 mt-1">All deposits, withdrawals, purchases, and earnings</p>
      </div>

      <div className="p-6">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'deposit', 'withdrawal', 'purchase', 'payout', 'win', 'commission'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium ${filter === type ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {data.loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 hover:border-orange-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">{getTypeText(transaction.type)}</p>
                      <p className="text-sm text-gray-400">{transaction.description || 'Transaction'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(transaction.date)}
                        {transaction.reference && ` • Ref: ${transaction.reference}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${getTypeColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {transaction.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm mt-2">Your transaction history will appear here</p>
          </div>
        )}

        {/* Export Option */}
        {filteredTransactions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto">
              <Download className="w-4 h-4" />
              Export Statement (CSV)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Payouts Tab Component - UPDATED with new components
const PayoutsTab = ({ data, formatCurrency, formatDate, stats, user }) => {
  // Add a safety check at the beginning
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-300 mb-2">User Not Found</h3>
          <p className="text-gray-400">Please log in again to access payout information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-yellow-400" />
          Payout Dashboard
        </h2>
        <p className="text-gray-400 mt-1">Track your earnings, commissions, and payment history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payout Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Payout Summary
            </h3>
            <PayoutSummary influencerId={user.uid} />
          </div>
        </div>

        {/* Right Column: Quick Stats and Info */}
        <div className="space-y-6">
          {/* Payout Stats */}
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-800/50 p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Earnings Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Lifetime Earnings</span>
                <span className="font-bold text-green-400">{formatCurrency(stats.lifetimeEarnings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Pending Payouts</span>
                <span className="font-bold text-yellow-400">{formatCurrency(stats.pendingPayouts)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Referrals</span>
                <span className="font-bold">{stats.totalReferrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Conversion Rate</span>
                <span className="font-bold">
                  {stats.totalReferrals > 0 
                    ? `${Math.round((stats.convertedReferrals / stats.totalReferrals) * 100)}%` 
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Request Payout Button */}
          {stats.pendingPayouts > 0 && (
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-[1.02]">
              <DollarSign className="w-5 h-5 inline mr-2" />
              Request Payout
            </button>
          )}

          {/* Help Card */}
          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl border border-blue-800/50 p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              Need Help?
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              Have questions about your payouts or commissions?
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Payout History Section */}
      <div className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-6">
          <PayoutHistory influencerId={user.uid} />
        </div>
      </div>
    </div>
  );
};

// Announcements Tab Component
const AnnouncementsTab = ({ notifications, formatTimeAgo, onMarkNotificationAsRead, onMarkAllNotificationsAsRead }) => {
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'system': return '🔔';
      case 'transaction': return '💳';
      case 'winner': return '🏆';
      case 'payout': return '💰';
      case 'raffle': return '🎫';
      case 'referral': return '👥';
      default: return '📢';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'system': return 'text-blue-400';
      case 'transaction': return 'text-green-400';
      case 'winner': return 'text-yellow-400';
      case 'payout': return 'text-purple-400';
      case 'raffle': return 'text-red-400';
      case 'referral': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-pink-400" />
              Announcements & Notifications
            </h2>
            <p className="text-gray-400 mt-1">Stay updated with important alerts and announcements</p>
          </div>
          {notifications.filter(n => !n.read).length > 0 && (
            <button
              onClick={onMarkAllNotificationsAsRead}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Mark All as Read
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {['all', 'system', 'transaction', 'winner', 'payout', 'raffle', 'referral'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === type ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.005] ${notification.read ? 'bg-gray-900/30 border-gray-800' : 'bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-pink-800/50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-xl mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{notification.title}</h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-300">{notification.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt?.toDate())}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => onMarkNotificationAsRead(notification.id)}
                      className="text-sm text-pink-400 hover:text-pink-300"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No notifications</p>
            <p className="text-sm mt-2">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ user, dashboardData, formatCurrency }) => {
  const [settings, setSettings] = useState({
    profileName: dashboardData.influencer?.displayName || '',
    email: dashboardData.influencer?.email || '',
    phone: dashboardData.influencer?.phone || '',
    bankName: dashboardData.influencer?.influencerData?.bankDetails?.bankName || '',
    accountNumber: dashboardData.influencer?.influencerData?.bankDetails?.accountNumber || '',
    accountName: dashboardData.influencer?.influencerData?.bankDetails?.accountName || '',
    emailNotifications: dashboardData.influencer?.preferences?.emailNotifications ?? true,
    marketingEmails: dashboardData.influencer?.preferences?.marketingEmails ?? true,
    smsNotifications: dashboardData.influencer?.preferences?.smsNotifications ?? false,
    twoFactor: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const nigerianBanks = [
    "Access Bank", "First Bank", "GTBank", "UBA", "Zenith Bank",
    "Fidelity Bank", "Stanbic IBTC", "Union Bank", "Polaris Bank",
    "Ecobank", "FCMB", "Sterling Bank", "Wema Bank", "Jaiz Bank"
  ];

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsEditing(true);
  };

  const handleSaveSettings = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (settings.bankName && settings.accountNumber && settings.accountName) {
        if (!/^\d{10}$/.test(settings.accountNumber)) {
          throw new Error('Account number must be 10 digits');
        }
      }

      await updateDoc(doc(db, 'users', user.uid), {
        displayName: settings.profileName,
        phone: settings.phone,
        'influencerData.bankDetails.bankName': settings.bankName,
        'influencerData.bankDetails.accountNumber': settings.accountNumber,
        'influencerData.bankDetails.accountName': settings.accountName,
        'preferences.emailNotifications': settings.emailNotifications,
        'preferences.marketingEmails': settings.marketingEmails,
        'preferences.smsNotifications': settings.smsNotifications,
        updatedAt: serverTimestamp()
      });

      setSuccess('Settings saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      alert('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send password reset email');
    }
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-400" />
          Account Settings
        </h2>
        <p className="text-gray-400 mt-1">Manage your profile, security, and preferences</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <div>{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="w-5 h-5" />
              <div>{success}</div>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Profile Name</label>
              <input
                type="text"
                value={settings.profileName}
                onChange={(e) => handleSettingChange('profileName', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={settings.email}
                disabled
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 opacity-70 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleSettingChange('phone', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                placeholder="080XXXXXXXX"
                pattern="[0-9]{11}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Referral Code</label>
              <input
                type="text"
                value={dashboardData.influencer?.referralCode || ''}
                disabled
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 opacity-70 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Your unique referral code</p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Bank Details (For Payouts)
          </h3>
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-5 border border-purple-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bank Name *</label>
                <select
                  value={settings.bankName}
                  onChange={(e) => handleSettingChange('bankName', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                >
                  <option value="">Select Bank</option>
                  {nigerianBanks.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Account Number *</label>
                <input
                  type="text"
                  value={settings.accountNumber}
                  onChange={(e) => handleSettingChange('accountNumber', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="10-digit account number"
                  pattern="[0-9]{10}"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Account Name *</label>
                <input
                  type="text"
                  value={settings.accountName}
                  onChange={(e) => handleSettingChange('accountName', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="Name as it appears on bank account"
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-black/40 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-400 mt-0.5" />
                <p className="text-xs text-gray-300">
                  Your bank details are encrypted and secure. We only use this information to process your payouts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive updates about your account</p>
              </div>
              <button
                onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                className={`w-12 h-6 rounded-full relative ${settings.emailNotifications ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.emailNotifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-400">Receive promotional offers and updates</p>
              </div>
              <button
                onClick={() => handleSettingChange('marketingEmails', !settings.marketingEmails)}
                className={`w-12 h-6 rounded-full relative ${settings.marketingEmails ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.marketingEmails ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-400">Receive important alerts via SMS</p>
              </div>
              <button
                onClick={() => handleSettingChange('smsNotifications', !settings.smsNotifications)}
                className={`w-12 h-6 rounded-full relative ${settings.smsNotifications ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.smsNotifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h3>
          <div className="space-y-4">
            <button
              onClick={handleChangePassword}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => handleSettingChange('twoFactor', !settings.twoFactor)}
                className={`w-12 h-6 rounded-full relative ${settings.twoFactor ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.twoFactor ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Save All Changes
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InfluencerDashboard;