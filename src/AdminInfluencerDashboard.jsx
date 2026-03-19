// src/pages/AdminInfluencerDashboard.jsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, DollarSign, BarChart3, PieChart, Settings,
  RefreshCw, MoreVertical, Search, Download, XCircle,
  Eye, Check, Ban, Trash2, AlertCircle, CheckCircle,
  Trophy, Clock, TrendingUp, Award, Filter, Calendar,
  UserCheck, Percent, Ticket, Gift, TrendingDown, Database
} from 'lucide-react';
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { app } from './firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

// Helper Functions
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
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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

// Main Dashboard Component
const AdminInfluencerDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalInfluencers: 0,
      activeInfluencers: 0,
      pendingPayouts: 0,
      totalPaidOut: 0,
      totalReferrals: 0,
      totalTicketSales: 0,
      totalRevenue: 0,
      thisMonthPayouts: 0,
      pendingApprovals: 0,
      totalRaffles: 0,
      activeRaffles: 0
    },
    influencers: [],
    pendingPayouts: [],
    recentActivity: [],
    analytics: {
      topPerformers: [],
      conversionRates: [],
      monthlyTrends: [],
      tierDistribution: []
    },
    raffles: []
  });

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [payoutConfig, setPayoutConfig] = useState({
    ticketCommissionRate: 0.05,
    prizeBonusRate: 0.15,
    ticketShareThreshold: 0.25,
    lifetimeReferralsThreshold: 50,
    processingFee: 0.015,
    taxRate: 0.075,
    minPayoutAmount: 1000
  });

  // Check admin authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          if (userData.accountType === 'super_admin' || userData.accountType === 'admin') {
            const adminData = { uid: user.uid, ...userData };
            setAdmin(adminData);
            await loadPayoutConfig(adminData.uid);
            await loadDashboardData();
          } else {
            await signOut(auth);
            navigate('/admin-login');
          }
        } catch (error) {
          console.error('Auth error:', error);
          await signOut(auth);
          navigate('/admin-login');
        }
      } else {
        navigate('/admin-login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadPayoutConfig = async (adminUid) => {
    try {
      const configDoc = await getDoc(doc(db, 'admin_settings', 'payout_config'));
      if (configDoc.exists()) {
        const configData = configDoc.data();
        const completeConfig = {
          ticketCommissionRate: configData.ticketCommissionRate || 0.05,
          prizeBonusRate: configData.prizeBonusRate || 0.15,
          ticketShareThreshold: configData.ticketShareThreshold || 0.25,
          lifetimeReferralsThreshold: configData.lifetimeReferralsThreshold || 50,
          processingFee: configData.processingFee || 0.015,
          taxRate: configData.taxRate || 0.075,
          minPayoutAmount: configData.minPayoutAmount || 1000
        };
        setPayoutConfig(completeConfig);
      } else {
        const defaultConfig = {
          ticketCommissionRate: 0.05,
          prizeBonusRate: 0.15,
          ticketShareThreshold: 0.25,
          lifetimeReferralsThreshold: 50,
          processingFee: 0.015,
          taxRate: 0.075,
          minPayoutAmount: 1000,
          updatedAt: serverTimestamp(),
          updatedBy: adminUid || 'system'
        };
        
        await setDoc(doc(db, 'admin_settings', 'payout_config'), defaultConfig);
        setPayoutConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading payout config:', error);
      const defaultConfig = {
        ticketCommissionRate: 0.05,
        prizeBonusRate: 0.15,
        ticketShareThreshold: 0.25,
        lifetimeReferralsThreshold: 50,
        processingFee: 0.015,
        taxRate: 0.075,
        minPayoutAmount: 1000
      };
      setPayoutConfig(defaultConfig);
    }
  };

  const savePayoutConfig = async (config) => {
    try {
      if (!admin || !admin.uid) {
        throw new Error('Admin not authenticated');
      }
      
      await setDoc(doc(db, 'admin_settings', 'payout_config'), {
        ...config,
        updatedAt: serverTimestamp(),
        updatedBy: admin.uid
      });
      setPayoutConfig(config);
      setSuccess('Payout settings saved successfully!');
      return true;
    } catch (error) {
      console.error('Error saving payout config:', error);
      setError(`Failed to save payout settings: ${error.message}`);
      return false;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all influencers
      const influencersQuery = query(
        collection(db, 'users'),
        where('accountType', '==', 'influencer'),
        orderBy('createdAt', 'desc')
      );
      
      const influencersSnapshot = await getDocs(influencersQuery);
      const influencersList = influencersSnapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data()
      }));

      // Load all raffles
      const rafflesQuery = query(
        collection(db, 'raffles'),
        orderBy('createdAt', 'desc')
      );
      const rafflesSnapshot = await getDocs(rafflesQuery);
      const rafflesList = rafflesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate summary statistics
      let totalReferrals = 0;
      let totalTicketSales = 0;
      let totalRevenue = 0;
      let totalPaidOut = 0;
      let pendingPayouts = 0;
      let pendingApprovals = 0;

      const influencersWithDetails = await Promise.all(
        influencersList.map(async (influencer) => {
          // Get referral data
          const referralsQuery = query(
            collection(db, 'referrals'),
            where('userId', '==', influencer.id)
          );
          const referralsSnapshot = await getDocs(referralsQuery);
          const referralData = referralsSnapshot.docs[0]?.data() || {};
          const referredUsers = referralData.referredUsers || [];

          // Calculate ticket sales by referrals
          let totalTicketsSold = 0;
          const userTicketsMap = new Map();

          for (const userId of referredUsers) {
            const ticketsQuery = query(
              collection(db, 'tickets'),
              where('userId', '==', userId)
            );
            const ticketsSnapshot = await getDocs(ticketsQuery);
            const ticketCount = ticketsSnapshot.size;
            totalTicketsSold += ticketCount;
            
            userTicketsMap.set(userId, ticketCount);
          }

          // Calculate lifetime earnings from payouts
          const payoutsQuery = query(
            collection(db, 'payouts'),
            where('influencerId', '==', influencer.id),
            where('status', '==', 'paid')
          );
          
          const payoutsSnapshot = await getDocs(payoutsQuery);
          const lifetimeEarnings = payoutsSnapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().amount || 0), 0
          );

          // Calculate pending payouts
          const calculatedPayout = await calculateInfluencerPayout(influencer.id, userTicketsMap);
          
          totalReferrals += referredUsers.length;
          totalTicketSales += totalTicketsSold;
          totalRevenue += calculatedPayout.totalPayout;
          totalPaidOut += lifetimeEarnings;
          pendingPayouts += calculatedPayout.totalPayout;
          
          if (influencer.influencerData?.status === 'pending_approval') {
            pendingApprovals++;
          }

          return {
            ...influencer,
            referralData,
            stats: {
              totalReferrals: referredUsers.length,
              ticketsSold: totalTicketsSold,
              lifetimeEarnings: lifetimeEarnings,
              pendingPayout: calculatedPayout.totalPayout,
              conversionRate: referredUsers.length > 0 
                ? (referralData.convertedUsers || 0) / referredUsers.length * 100 
                : 0
            },
            calculatedPayout
          };
        })
      );

      // Get pending payout requests
      const pendingPayoutsQuery = query(
        collection(db, 'payouts'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const pendingPayoutsSnapshot = await getDocs(pendingPayoutsQuery);
      const pendingPayoutsList = pendingPayoutsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get recent activity
      const activityQuery = query(
        collection(db, 'admin_logs'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      
      const activitySnapshot = await getDocs(activityQuery);
      const recentActivity = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get top performers
      const topPerformers = influencersWithDetails
        .sort((a, b) => (b.stats?.pendingPayout || 0) - (a.stats?.pendingPayout || 0))
        .slice(0, 10);

      // Calculate conversion rates
      const conversionRates = calculateConversionRates(influencersWithDetails);

      // Calculate tier distribution
      const tierDistribution = calculateTierDistribution(influencersWithDetails);

      // Update dashboard data
      setDashboardData({
        summary: {
          totalInfluencers: influencersList.length,
          activeInfluencers: influencersWithDetails.filter(i => 
            i.influencerData?.status === 'active'
          ).length,
          pendingPayouts: pendingPayouts,
          totalPaidOut: totalPaidOut,
          totalReferrals: totalReferrals,
          totalTicketSales: totalTicketSales,
          totalRevenue: totalRevenue,
          thisMonthPayouts: await calculateThisMonthPayouts(),
          pendingApprovals: pendingApprovals,
          totalRaffles: rafflesList.length,
          activeRaffles: rafflesList.filter(r => r.status === 'active').length
        },
        influencers: influencersWithDetails,
        pendingPayouts: pendingPayoutsList,
        recentActivity: recentActivity,
        raffles: rafflesList,
        analytics: {
          topPerformers: topPerformers,
          conversionRates: conversionRates,
          monthlyTrends: await loadMonthlyTrends(),
          tierDistribution: tierDistribution
        }
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

 const calculateInfluencerPayout = async (influencerId) => {
  try {
    console.log('🔍 Calculating payout for:', influencerId);
    
    // 1. Get influencer's referrals
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('userId', '==', influencerId)
    );
    const referralsSnapshot = await getDocs(referralsQuery);
    
    if (referralsSnapshot.empty) {
      console.log('No referrals found');
      return { 
        totalPayout: 0, 
        breakdown: {
          ticketCommissions: 0,
          prizeBonuses: 0,
          totalBeforeFees: 0,
          processingFee: 0,
          tax: 0,
          netPayout: 0
        }, 
        qualifiedForBonus: false, 
        perRaffleBreakdown: [] 
      };
    }
    
    const referralData = referralsSnapshot.docs[0].data();
    const referredUsers = referralData.referredUsers || [];
    console.log('Referred users:', referredUsers.length);
    
    if (referredUsers.length === 0) {
      console.log('No referred users');
      return { 
        totalPayout: 0, 
        breakdown: {
          ticketCommissions: 0,
          prizeBonuses: 0,
          totalBeforeFees: 0,
          processingFee: 0,
          tax: 0,
          netPayout: 0
        }, 
        qualifiedForBonus: false, 
        perRaffleBreakdown: [] 
      };
    }
    
    // 2. Get ALL tickets bought by referred users
    const allTickets = [];
    for (const userId of referredUsers) {
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
    }
    
    console.log('Total tickets from referrals:', allTickets.length);
    
    if (allTickets.length === 0) {
      console.log('No tickets found');
      return { 
        totalPayout: 0, 
        breakdown: {
          ticketCommissions: 0,
          prizeBonuses: 0,
          totalBeforeFees: 0,
          processingFee: 0,
          tax: 0,
          netPayout: 0
        }, 
        qualifiedForBonus: false, 
        perRaffleBreakdown: [] 
      };
    }
    
    // 3. Get ALL previous payouts to see which tickets are already paid
    const previousPayoutsQuery = query(
      collection(db, 'payouts'),
      where('influencerId', '==', influencerId),
      where('status', '==', 'paid')
    );
    const previousPayoutsSnapshot = await getDocs(previousPayoutsQuery);
    const previousPayouts = previousPayoutsSnapshot.docs.map(doc => doc.data());
    
    // Collect all already paid ticket IDs
    const alreadyPaidTicketIds = [];
    previousPayouts.forEach(payout => {
      if (payout.paidTicketIds && Array.isArray(payout.paidTicketIds)) {
        alreadyPaidTicketIds.push(...payout.paidTicketIds);
      }
    });
    
    console.log('Already paid ticket IDs:', alreadyPaidTicketIds.length);
    console.log('Previous payouts:', previousPayouts.length);
    
    // 4. Filter out already paid tickets
    const unpaidTickets = allTickets.filter(ticket => 
      !alreadyPaidTicketIds.includes(ticket.id)
    );
    
    console.log('Unpaid tickets:', unpaidTickets.length);
    
    // 5. Group unpaid tickets by raffle
    const ticketsByRaffle = {};
    unpaidTickets.forEach(ticket => {
      const raffleId = ticket.raffleId;
      if (!raffleId) return;
      
      if (!ticketsByRaffle[raffleId]) {
        ticketsByRaffle[raffleId] = [];
      }
      ticketsByRaffle[raffleId].push(ticket);
    });
    
    console.log('Raffles with unpaid tickets:', Object.keys(ticketsByRaffle).length);
    
    // 6. Get raffle data
    const raffleIds = Object.keys(ticketsByRaffle);
    const rafflesData = {};
    
    for (const raffleId of raffleIds) {
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (raffleDoc.exists()) {
        rafflesData[raffleId] = raffleDoc.data();
      }
    }
    
    // 7. Calculate payout
    let totalTicketCommissions = 0;
    let totalPrizeBonuses = 0;
    let qualifiedForBonus = false;
    const perRaffleBreakdown = [];
    
    for (const [raffleId, tickets] of Object.entries(ticketsByRaffle)) {
      const raffle = rafflesData[raffleId];
      if (!raffle) continue;
      
      const unpaidTicketCount = tickets.length;
      
      // Calculate commission
      const ticketCommission = unpaidTicketCount * raffle.ticketPrice * payoutConfig.ticketCommissionRate;
      totalTicketCommissions += ticketCommission;
      
      // Check for bonus
      let prizeBonus = 0;
      let qualifiesForBonus = false;
      
      if (raffle.winnerId && referredUsers.includes(raffle.winnerId)) {
        // Check if qualifies
        const ticketShare = raffle.totalTickets > 0 ? unpaidTicketCount / raffle.totalTickets : 0;
        const meetsTicketShare = ticketShare >= payoutConfig.ticketShareThreshold;
        const meetsLifetimeReferrals = referredUsers.length >= payoutConfig.lifetimeReferralsThreshold;
        
        qualifiesForBonus = meetsTicketShare || meetsLifetimeReferrals;
        
        if (qualifiesForBonus) {
          // Check if bonus already paid
          let bonusAlreadyPaid = false;
          for (const payout of previousPayouts) {
            if (payout.perRaffleBreakdown) {
              const paidRaffle = payout.perRaffleBreakdown.find(
                r => r.raffleId === raffleId && r.prizeBonus > 0
              );
              if (paidRaffle) {
                bonusAlreadyPaid = true;
                break;
              }
            }
          }
          
          if (!bonusAlreadyPaid) {
            prizeBonus = raffle.prizeValue * payoutConfig.prizeBonusRate;
            totalPrizeBonuses += prizeBonus;
            qualifiedForBonus = true;
          }
        }
      }
      
      perRaffleBreakdown.push({
        raffleId: raffleId,
        raffleTitle: raffle.title || 'Unknown Raffle',
        raffleStatus: raffle.status,
        ticketsSold: unpaidTicketCount,
        ticketCommission: ticketCommission,
        qualifiesForBonus: qualifiesForBonus,
        prizeBonus: prizeBonus,
        ticketShare: raffle.totalTickets > 0 ? (unpaidTicketCount / raffle.totalTickets) * 100 : 0,
        ticketIds: tickets.map(t => t.id) // Store which specific tickets
      });
    }
    
    // Calculate final amounts
    const totalBeforeFees = totalTicketCommissions + totalPrizeBonuses;
    const processingFee = totalBeforeFees * payoutConfig.processingFee;
    const tax = totalBeforeFees * payoutConfig.taxRate;
    const netPayout = totalBeforeFees - processingFee - tax;
    
    console.log('✅ FINAL RESULT:');
    console.log('Total tickets from referrals:', allTickets.length);
    console.log('Already paid tickets:', alreadyPaidTicketIds.length);
    console.log('Unpaid tickets:', unpaidTickets.length);
    console.log('Commissions:', formatCurrency(totalTicketCommissions));
    console.log('Bonuses:', formatCurrency(totalPrizeBonuses));
    console.log('Total before fees:', formatCurrency(totalBeforeFees));
    console.log('Net payout:', formatCurrency(netPayout));
    
    return {
      totalPayout: Math.max(netPayout, 0),
      breakdown: {
        ticketCommissions: totalTicketCommissions,
        prizeBonuses: totalPrizeBonuses,
        totalBeforeFees: totalBeforeFees,
        processingFee: processingFee,
        tax: tax,
        netPayout: netPayout
      },
      qualifiedForBonus: qualifiedForBonus,
      perRaffleBreakdown: perRaffleBreakdown,
      unpaidTicketIds: unpaidTickets.map(t => t.id) // Return unpaid ticket IDs
    };
    
  } catch (error) {
    console.error('Error calculating payout:', error);
    return { 
      totalPayout: 0, 
      breakdown: {
        ticketCommissions: 0,
        prizeBonuses: 0,
        totalBeforeFees: 0,
        processingFee: 0,
        tax: 0,
        netPayout: 0
      }, 
      qualifiedForBonus: false, 
      perRaffleBreakdown: [] 
    };
  }

};

  const calculateThisMonthPayouts = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const payoutsQuery = query(
      collection(db, 'payouts'),
      where('status', '==', 'paid'),
      where('paidAt', '>=', startOfMonth)
    );

    const snapshot = await getDocs(payoutsQuery);
    return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
  };

  const calculateConversionRates = (influencers) => {
    const rates = {
      bronze: { total: 0, converted: 0 },
      silver: { total: 0, converted: 0 },
      gold: { total: 0, converted: 0 },
      platinum: { total: 0, converted: 0 },
      diamond: { total: 0, converted: 0 }
    };

    influencers.forEach(influencer => {
      const tier = influencer.influencerData?.tier?.toLowerCase() || 'bronze';
      if (rates[tier]) {
        rates[tier].total++;
        if (influencer.stats?.conversionRate > 10) {
          rates[tier].converted++;
        }
      }
    });

    return Object.entries(rates).map(([tier, data]) => ({
      tier: tier.charAt(0).toUpperCase() + tier.slice(1),
      conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
      total: data.total
    }));
  };

  const calculateTierDistribution = (influencers) => {
    const distribution = {
      Bronze: 0,
      Silver: 0,
      Gold: 0,
      Platinum: 0,
      Diamond: 0
    };

    influencers.forEach(influencer => {
      const tier = influencer.influencerData?.tier || 'Bronze';
      if (distribution[tier] !== undefined) {
        distribution[tier]++;
      }
    });

    return Object.entries(distribution).map(([tier, count]) => ({
      tier,
      count,
      percentage: influencers.length > 0 ? (count / influencers.length) * 100 : 0
    }));
  };

  const loadMonthlyTrends = async () => {
    const trends = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const payoutsQuery = query(
        collection(db, 'payouts'),
        where('status', '==', 'paid'),
        where('paidAt', '>=', month),
        where('paidAt', '<', nextMonth)
      );

      const snapshot = await getDocs(payoutsQuery);
      const totalPayouts = snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

      // Count unique influencers paid this month
      const influencerIds = new Set();
      snapshot.docs.forEach(doc => {
        influencerIds.add(doc.data().influencerId);
      });

      trends.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        payouts: totalPayouts,
        influencers: influencerIds.size,
        transactions: snapshot.docs.length
      });
    }

    return trends;
  };

 const handleProcessPayout = async (influencerId, amount, type = 'manual') => {
  if (!amount || isNaN(amount) || amount < payoutConfig.minPayoutAmount) {
    setError(`Minimum payout amount is ${formatCurrency(payoutConfig.minPayoutAmount)}`);
    return;
  }

  setProcessingPayout(true);
  setError('');

  try {
    const influencer = dashboardData.influencers.find(i => i.id === influencerId);
    if (!influencer) {
      throw new Error('Influencer not found');
    }

    // IMPORTANT: Recalculate payout fresh to get accurate data
    const payoutData = await calculateInfluencerPayout(influencerId);
    const availablePayout = payoutData.totalPayout;

    if (amount > availablePayout) {
      throw new Error(`Cannot payout more than available: ${formatCurrency(availablePayout)}`);
    }

    // Create payout record
    const payoutRef = doc(collection(db, 'payouts'));
    const payoutId = payoutRef.id;
    const timestamp = serverTimestamp();

    // CRITICAL FIX: We need to store which specific tickets are being paid for
    // Let's get the actual ticket IDs that are being paid for this payout
    const ticketsBeingPaid = [];
    
    // Get referral data
    const referralsQuery = query(
      collection(db, 'referrals'),
      where('userId', '==', influencerId)
    );
    const referralsSnapshot = await getDocs(referralsQuery);
    const referralData = referralsSnapshot.docs[0]?.data() || {};
    const referredUsers = referralData.referredUsers || [];
    
    // For each raffle in the payout breakdown, get the actual ticket IDs
    for (const raffleBreakdown of payoutData.perRaffleBreakdown) {
      const raffleId = raffleBreakdown.raffleId;
      const ticketsToPay = raffleBreakdown.ticketsSold;
      
      if (ticketsToPay > 0) {
        // Get tickets from referred users for this specific raffle
        for (const userId of referredUsers) {
          const ticketsQuery = query(
            collection(db, 'tickets'),
            where('userId', '==', userId),
            where('raffleId', '==', raffleId)
          );
          const ticketsSnapshot = await getDocs(ticketsQuery);
          const tickets = ticketsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Get previous payouts to see which tickets are already paid
          const previousPayoutsQuery = query(
            collection(db, 'payouts'),
            where('influencerId', '==', influencerId),
            where('status', '==', 'paid')
          );
          const previousPayoutsSnapshot = await getDocs(previousPayoutsQuery);
          
          const alreadyPaidTicketIds = [];
          previousPayoutsSnapshot.docs.forEach(payoutDoc => {
            const payoutData = payoutDoc.data();
            if (payoutData.paidTicketIds) {
              alreadyPaidTicketIds.push(...payoutData.paidTicketIds);
            }
          });
          
          // Filter out already paid tickets
          const unpaidTickets = tickets.filter(ticket => 
            !alreadyPaidTicketIds.includes(ticket.id)
          );
          
          // Take only the number of tickets we need to pay
          const ticketsForThisPayout = unpaidTickets.slice(0, ticketsToPay);
          ticketsBeingPaid.push(...ticketsForThisPayout.map(t => t.id));
        }
      }
    }

    console.log('💰 PAYOUT DETAILS:');
    console.log('Amount:', formatCurrency(amount));
    console.log('Tickets being paid for:', ticketsBeingPaid.length);
    console.log('Per raffle breakdown:', payoutData.perRaffleBreakdown);

    await runTransaction(db, async (transaction) => {
      // Create payout record WITH ticket IDs
      transaction.set(payoutRef, {
        id: payoutId,
        influencerId: influencerId,
        influencerName: influencer.displayName,
        amount: amount,
        type: type,
        status: 'paid',
        breakdown: payoutData.breakdown,
        perRaffleBreakdown: payoutData.perRaffleBreakdown,
        qualifiedForBonus: payoutData.qualifiedForBonus,
        paidTicketIds: ticketsBeingPaid, // CRITICAL: Store which tickets are paid
        processedBy: admin.uid,
        processedByName: admin.displayName,
        paidAt: timestamp,
        createdAt: timestamp
      });

      // Update influencer's last payout date and total payouts
      const influencerRef = doc(db, 'users', influencerId);
      transaction.update(influencerRef, {
        'influencerData.lastPayout': timestamp,
        'influencerData.totalPayouts': increment(amount),
        updatedAt: timestamp
      });

      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      transaction.set(transactionRef, {
        type: 'payout',
        payoutId: payoutId,
        influencerId: influencerId,
        influencerName: influencer.displayName,
        amount: amount,
        status: 'completed',
        reference: `PAYOUT-${Date.now()}`,
        createdAt: timestamp,
        metadata: {
          breakdown: payoutData.breakdown,
          type: type,
          paidTicketIds: ticketsBeingPaid
        }
      });

      // Create admin log
      const logRef = doc(collection(db, 'admin_logs'));
      transaction.set(logRef, {
        action: 'payout_processed',
        adminId: admin.uid,
        adminName: admin.displayName,
        influencerId: influencerId,
        influencerName: influencer.displayName,
        amount: amount,
        payoutId: payoutId,
        ticketsPaid: ticketsBeingPaid.length,
        timestamp: timestamp,
        details: `${type} payout processed for ${ticketsBeingPaid.length} tickets`
      });
    });

    // Send notification to influencer
    await sendInfluencerNotification(influencerId, 'payout_processed', {
      amount: amount,
      type: type,
      reference: `PAYOUT-${Date.now()}`
    });

    // Refresh dashboard - CRITICAL: Wait a bit to ensure data is written
    setTimeout(async () => {
      await loadDashboardData();
      
      setSuccess(`Payout of ${formatCurrency(amount)} processed successfully for ${ticketsBeingPaid.length} tickets!`);
      setShowPayoutModal(false);
      setPayoutAmount('');
      setSelectedInfluencer(null);
    }, 1000);

  } catch (error) {
    console.error('Payout error:', error);
    setError(`Failed to process payout: ${error.message}`);
  } finally {
    setProcessingPayout(false);
  }
};
  const sendInfluencerNotification = async (influencerId, type, data) => {
    try {
      await setDoc(doc(collection(db, 'notifications')), {
        userId: influencerId,
        title: getNotificationTitle(type),
        message: getNotificationMessage(type, data),
        type: 'payout',
        read: false,
        createdAt: serverTimestamp(),
        metadata: data
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'payout_processed': return 'Payout Processed!';
      case 'account_approved': return 'Account Approved';
      case 'account_rejected': return 'Account Review Required';
      default: return 'Admin Notification';
    }
  };

  const getNotificationMessage = (type, data) => {
    switch (type) {
      case 'payout_processed':
        return `Your payout of ${formatCurrency(data.amount)} has been processed.`;
      case 'account_approved':
        return 'Your influencer account has been approved! Start sharing your referral link to earn commissions.';
      case 'account_rejected':
        return 'Your influencer application requires additional review. Please update your profile information.';
      default:
        return 'You have a new notification from the admin team.';
    }
  };

  const handleApproveInfluencer = async (influencerId) => {
    try {
      const influencerRef = doc(db, 'users', influencerId);
      await updateDoc(influencerRef, {
        'influencerData.status': 'active',
        'influencerData.approvedAt': serverTimestamp(),
        'influencerData.approvedBy': admin.uid,
        updatedAt: serverTimestamp()
      });

      // Send notification
      await sendInfluencerNotification(influencerId, 'account_approved', {});

      // Create admin log
      await setDoc(doc(collection(db, 'admin_logs')), {
        action: 'influencer_approved',
        adminId: admin.uid,
        adminName: admin.displayName,
        influencerId: influencerId,
        timestamp: serverTimestamp(),
        details: 'Influencer account approved'
      });

      await loadDashboardData();
      setSuccess('Influencer approved successfully!');
    } catch (error) {
      console.error('Error approving influencer:', error);
      setError('Failed to approve influencer');
    }
  };

  const handleRejectInfluencer = async (influencerId, reason) => {
    try {
      const influencerRef = doc(db, 'users', influencerId);
      await updateDoc(influencerRef, {
        'influencerData.status': 'rejected',
        'influencerData.rejectionReason': reason,
        'influencerData.rejectedAt': serverTimestamp(),
        'influencerData.rejectedBy': admin.uid,
        updatedAt: serverTimestamp()
      });

      // Send notification
      await sendInfluencerNotification(influencerId, 'account_rejected', { reason });

      // Create admin log
      await setDoc(doc(collection(db, 'admin_logs')), {
        action: 'influencer_rejected',
        adminId: admin.uid,
        adminName: admin.displayName,
        influencerId: influencerId,
        reason: reason,
        timestamp: serverTimestamp(),
        details: 'Influencer account rejected'
      });

      await loadDashboardData();
      setSuccess('Influencer rejected successfully!');
    } catch (error) {
      console.error('Error rejecting influencer:', error);
      setError('Failed to reject influencer');
    }
  };

  const handleSuspendInfluencer = async (influencerId, reason) => {
    try {
      const influencerRef = doc(db, 'users', influencerId);
      await updateDoc(influencerRef, {
        'influencerData.status': 'suspended',
        'influencerData.suspensionReason': reason,
        'influencerData.suspendedAt': serverTimestamp(),
        'influencerData.suspendedBy': admin.uid,
        updatedAt: serverTimestamp()
      });

      // Create admin log
      await setDoc(doc(collection(db, 'admin_logs')), {
        action: 'influencer_suspended',
        adminId: admin.uid,
        adminName: admin.displayName,
        influencerId: influencerId,
        reason: reason,
        timestamp: serverTimestamp(),
        details: 'Influencer account suspended'
      });

      await loadDashboardData();
      setSuccess('Influencer suspended successfully!');
    } catch (error) {
      console.error('Error suspending influencer:', error);
      setError('Failed to suspend influencer');
    }
  };

  const handleDeleteInfluencer = async (influencerId) => {
    if (!window.confirm('Are you sure you want to delete this influencer? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete influencer document
      await deleteDoc(doc(db, 'users', influencerId));

      // Delete related referrals
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('userId', '==', influencerId)
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      
      const batch = writeBatch(db);
      referralsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete related payouts
      const payoutsQuery = query(
        collection(db, 'payouts'),
        where('influencerId', '==', influencerId)
      );
      const payoutsSnapshot = await getDocs(payoutsQuery);
      payoutsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();

      // Create admin log
      await setDoc(doc(collection(db, 'admin_logs')), {
        action: 'influencer_deleted',
        adminId: admin.uid,
        adminName: admin.displayName,
        influencerId: influencerId,
        timestamp: serverTimestamp(),
        details: 'Influencer account permanently deleted'
      });

      await loadDashboardData();
      setSuccess('Influencer deleted successfully!');
    } catch (error) {
      console.error('Error deleting influencer:', error);
      setError('Failed to delete influencer');
    }
  };

  const handleExportData = async (type) => {
    try {
      setExporting(true);
      
      let data = [];
      let filename = '';
      
      switch (type) {
        case 'influencers':
          data = dashboardData.influencers.map(influencer => ({
            'ID': influencer.id,
            'Name': influencer.displayName,
            'Email': influencer.email,
            'Phone': influencer.phone || 'N/A',
            'Tier': influencer.influencerData?.tier || 'Bronze',
            'Status': influencer.influencerData?.status || 'pending',
            'Referral Code': influencer.influencerData?.referralCode || 'N/A',
            'Total Referrals': influencer.stats?.totalReferrals || 0,
            'Tickets Sold': influencer.stats?.ticketsSold || 0,
            'Lifetime Earnings': formatCurrency(influencer.stats?.lifetimeEarnings || 0),
            'Pending Payout': formatCurrency(influencer.stats?.pendingPayout || 0),
            'Conversion Rate': `${(influencer.stats?.conversionRate || 0).toFixed(1)}%`,
            'Joined Date': formatDate(influencer.createdAt?.toDate()),
            'Last Payout': influencer.influencerData?.lastPayout ? formatDate(influencer.influencerData.lastPayout.toDate()) : 'Never'
          }));
          filename = `influencers_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'payouts':
          const allPayoutsQuery = query(
            collection(db, 'payouts'),
            orderBy('createdAt', 'desc'),
            limit(1000)
          );
          const allPayoutsSnapshot = await getDocs(allPayoutsQuery);
          data = allPayoutsSnapshot.docs.map(doc => {
            const payout = doc.data();
            return {
              'Payout ID': payout.id,
              'Influencer ID': payout.influencerId,
              'Influencer Name': payout.influencerName,
              'Amount': formatCurrency(payout.amount),
              'Status': payout.status,
              'Type': payout.type,
              'Processed By': payout.processedByName || 'N/A',
              'Paid At': payout.paidAt ? formatDate(payout.paidAt.toDate()) : 'N/A',
              'Created At': formatDate(payout.createdAt?.toDate())
            };
          });
          filename = `payouts_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'transactions':
          const transactionsQuery = query(
            collection(db, 'transactions'),
            where('type', '==', 'payout'),
            orderBy('createdAt', 'desc'),
            limit(1000)
          );
          const transactionsSnapshot = await getDocs(transactionsQuery);
          data = transactionsSnapshot.docs.map(doc => {
            const transaction = doc.data();
            return {
              'Transaction ID': doc.id,
              'Payout ID': transaction.payoutId,
              'Influencer ID': transaction.influencerId,
              'Amount': formatCurrency(transaction.amount),
              'Type': transaction.type,
              'Status': transaction.status,
              'Reference': transaction.reference || 'N/A',
              'Created At': formatDate(transaction.createdAt?.toDate())
            };
          });
          filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
          break;
          
        case 'raffles':
          data = dashboardData.raffles.map(raffle => ({
            'Raffle ID': raffle.id,
            'Title': raffle.title,
            'Prize Value': formatCurrency(raffle.prizeValue),
            'Ticket Price': formatCurrency(raffle.ticketPrice),
            'Total Tickets': raffle.totalTickets || 0,
            'Tickets Sold': raffle.ticketsSold || 0,
            'Status': raffle.status,
            'Winner ID': raffle.winnerId || 'N/A',
            'Start Date': formatDate(raffle.startDate?.toDate()),
            'End Date': formatDate(raffle.endDate?.toDate()),
            'Created At': formatDate(raffle.createdAt?.toDate())
          }));
          filename = `raffles_${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }
      
      if (data.length === 0) {
        data = [{'No Data': 'No records found'}];
      }
      
      const headers = Object.keys(data[0] || {});
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          }).join(',')
        )
      ];
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`${type} data exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // Filter influencers based on search and filters
  const filteredInfluencers = useMemo(() => {
    return dashboardData.influencers.filter(influencer => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          influencer.displayName?.toLowerCase().includes(searchLower) ||
          influencer.email?.toLowerCase().includes(searchLower) ||
          influencer.phone?.toLowerCase().includes(searchLower) ||
          influencer.influencerData?.referralCode?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        if (influencer.influencerData?.status !== statusFilter) return false;
      }
      
      return true;
    });
  }, [dashboardData.influencers, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-xl">Influencer Management</h1>
                <p className="text-sm text-gray-400">Admin Dashboard • NEXTWINNER</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="font-medium">{admin?.displayName}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              
              {/* QUICK PAYOUT BUTTON IN HEADER */}
              {dashboardData.pendingPayouts.length > 0 && (
                <button
                  onClick={() => setActiveTab('payouts')}
                  className="relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Payouts
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {dashboardData.pendingPayouts.length}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => signOut(auth).then(() => navigate('/admin-login'))}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-[calc(100vh-73px)] p-4 hidden md:block">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('influencers')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg ${activeTab === 'influencers' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <Users className="w-5 h-5" />
              <span>Influencers</span>
              {dashboardData.summary.pendingApprovals > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {dashboardData.summary.pendingApprovals}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('payouts')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg ${activeTab === 'payouts' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Payouts</span>
              {dashboardData.pendingPayouts.length > 0 && (
                <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {dashboardData.pendingPayouts.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('raffles')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg ${activeTab === 'raffles' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <Ticket className="w-5 h-5" />
              <span>Raffles</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            >
              <PieChart className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={loadDashboardData}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-300"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh Data</span>
              </button>
              
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-300"
              >
                <Settings className="w-5 h-5" />
                <span>Payout Settings</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 md:hidden z-40">
          <div className="flex justify-around p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center p-2 ${activeTab === 'overview' ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs mt-1">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('influencers')}
              className={`flex flex-col items-center p-2 ${activeTab === 'influencers' ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs mt-1">Influencers</span>
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`flex flex-col items-center p-2 ${activeTab === 'payouts' ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-xs mt-1">Payouts</span>
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs mt-1">Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <div>{error}</div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <div>{success}</div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OverviewTab 
              summary={dashboardData.summary}
              topPerformers={dashboardData.analytics.topPerformers}
              pendingPayouts={dashboardData.pendingPayouts}
              recentActivity={dashboardData.recentActivity}
              influencers={dashboardData.influencers}
              payoutConfig={payoutConfig}
              onProcessPayout={(influencer) => {
                setSelectedInfluencer(influencer);
                setPayoutAmount(influencer.stats?.pendingPayout?.toString() || '');
                setShowPayoutModal(true);
              }}
              onViewPayouts={() => setActiveTab('payouts')}
            />
          )}
          
          {activeTab === 'influencers' && (
            <InfluencersTab 
              influencers={filteredInfluencers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              payoutConfig={payoutConfig}
              onApprove={handleApproveInfluencer}
              onReject={handleRejectInfluencer}
              onSuspend={handleSuspendInfluencer}
              onDelete={handleDeleteInfluencer}
              onViewDetails={(influencer) => {
                setSelectedInfluencer(influencer);
                setShowDetailsModal(true);
              }}
              onProcessPayout={(influencer) => {
                setSelectedInfluencer(influencer);
                setPayoutAmount(influencer.stats?.pendingPayout?.toString() || '');
                setShowPayoutModal(true);
              }}
              onExport={() => handleExportData('influencers')}
              exporting={exporting}
            />
          )}
          
          {activeTab === 'payouts' && (
            <PayoutsTab 
              pendingPayouts={dashboardData.pendingPayouts}
              influencers={dashboardData.influencers}
              onProcessPayout={handleProcessPayout}
              onExport={() => handleExportData('payouts')}
              exporting={exporting}
            />
          )}
          
          {activeTab === 'raffles' && (
            <RafflesTab 
              raffles={dashboardData.raffles}
              onViewRaffle={(raffle) => {
                setSelectedRaffle(raffle);
                setShowRaffleModal(true);
              }}
              onExport={() => handleExportData('raffles')}
              exporting={exporting}
            />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsTab 
              analytics={dashboardData.analytics}
              summary={dashboardData.summary}
              onViewDetails={() => setShowAnalyticsModal(true)}
              onExport={() => handleExportData('transactions')}
              exporting={exporting}
            />
          )}
        </main>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && selectedInfluencer && (
        <PayoutModal 
          influencer={selectedInfluencer}
          payoutAmount={payoutAmount}
          setPayoutAmount={setPayoutAmount}
          payoutConfig={payoutConfig}
          onClose={() => {
            setShowPayoutModal(false);
            setSelectedInfluencer(null);
            setPayoutAmount('');
          }}
          onProcess={handleProcessPayout}
          processing={processingPayout}
          calculatePayout={calculateInfluencerPayout}
        />
      )}
      

      {/* Influencer Details Modal */}
      {showDetailsModal && selectedInfluencer && (
        <InfluencerDetailsModal 
          influencer={selectedInfluencer}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedInfluencer(null);
          }}
          onApprove={handleApproveInfluencer}
          onReject={handleRejectInfluencer}
          onSuspend={handleSuspendInfluencer}
          onDelete={handleDeleteInfluencer}
          calculatePayout={calculateInfluencerPayout}
          payoutConfig={payoutConfig}
          onProcessPayout={(influencer) => {
            setSelectedInfluencer(influencer);
            setPayoutAmount(influencer.stats?.pendingPayout?.toString() || '');
            setShowPayoutModal(true);
          }}
        />
      )}

      {/* Raffle Details Modal */}
      {showRaffleModal && selectedRaffle && (
        <RaffleDetailsModal 
          raffle={selectedRaffle}
          onClose={() => {
            setShowRaffleModal(false);
            setSelectedRaffle(null);
          }}
        />
      )}

      {/* Payout Settings Modal */}
      {showSettingsModal && (
        <PayoutSettingsModal 
          payoutConfig={payoutConfig}
          onClose={() => setShowSettingsModal(false)}
          onSave={savePayoutConfig}
        />
      )}

      {/* Analytics Details Modal */}
      {showAnalyticsModal && (
        <AnalyticsDetailsModal 
          analytics={dashboardData.analytics}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}

      {/* FLOATING PAYOUT BUTTON */}
      {dashboardData.influencers.filter(i => 
        (i.stats?.pendingPayout || 0) >= payoutConfig.minPayoutAmount
      ).length > 0 && (
        <button
          onClick={() => {
            const eligible = dashboardData.influencers.filter(i => 
              (i.stats?.pendingPayout || 0) >= payoutConfig.minPayoutAmount
            );
            if (eligible.length > 0) {
              setSelectedInfluencer(eligible[0]);
              setPayoutAmount(eligible[0].stats?.pendingPayout?.toString() || '');
              setShowPayoutModal(true);
            }
          }}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-full shadow-lg z-50 flex items-center gap-2"
        >
          <DollarSign className="w-6 h-6" />
          <span className="hidden md:inline font-medium">Pay Influencer</span>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-bold">
            {dashboardData.influencers.filter(i => 
              (i.stats?.pendingPayout || 0) >= payoutConfig.minPayoutAmount
            ).length}
          </span>
        </button>
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ summary, topPerformers, pendingPayouts, recentActivity, influencers, payoutConfig, onProcessPayout, onViewPayouts }) => {
  const eligibleInfluencers = influencers.filter(i => 
    (i.stats?.pendingPayout || 0) >= payoutConfig.minPayoutAmount
  );
  const totalPendingPayout = influencers.reduce((sum, i) => sum + (i.stats?.pendingPayout || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-4 rounded-xl border border-blue-800/50">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Influencers</p>
              <p className="text-xl md:text-2xl font-bold">{summary.totalInfluencers}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-green-400">{summary.activeInfluencers} active</span>
            {summary.pendingApprovals > 0 && (
              <span className="text-xs text-yellow-400">{summary.pendingApprovals} pending</span>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-4 rounded-xl border border-purple-800/50">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Total Paid Out</p>
              <p className="text-xl md:text-2xl font-bold">{formatCurrency(summary.totalPaidOut)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-yellow-400">{formatCurrency(summary.pendingPayouts)} pending</span>
            <span className="text-xs text-blue-400">{formatCurrency(summary.thisMonthPayouts)} this month</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-4 rounded-xl border border-green-800/50">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total Referrals</p>
              <p className="text-xl md:text-2xl font-bold">{summary.totalReferrals.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-green-400 mt-2">
            {summary.totalTicketSales.toLocaleString()} tickets sold
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-4 rounded-xl border border-yellow-800/50">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Total Raffles</p>
              <p className="text-xl md:text-2xl font-bold">{summary.totalRaffles}</p>
            </div>
          </div>
          <p className="text-xs text-yellow-400 mt-2">
            {summary.activeRaffles} active
          </p>
        </div>
      </div>

      {/* Payout Summary Card */}
      <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 p-5 rounded-2xl border border-yellow-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Available for Payout</p>
              <p className="text-2xl font-bold text-yellow-300">
                {formatCurrency(totalPendingPayout)}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <div className="flex gap-3">
              <button
                onClick={onViewPayouts}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                View Payouts
              </button>
              {eligibleInfluencers.length > 0 && (
                <button
                  onClick={() => {
                    if (eligibleInfluencers.length > 0) {
                      onProcessPayout(eligibleInfluencers[0]);
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Process Payout
                </button>
              )}
            </div>
            <p className="text-sm text-gray-400">
              {eligibleInfluencers.length} influencers eligible for payout
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-yellow-900/30 rounded-lg">
            <p className="text-sm text-gray-400">Minimum Payout</p>
            <p className="font-bold">{formatCurrency(payoutConfig.minPayoutAmount)}</p>
          </div>
          <div className="p-3 bg-yellow-900/30 rounded-lg">
            <p className="text-sm text-gray-400">Commission Rate</p>
            <p className="font-bold">{payoutConfig.ticketCommissionRate * 100}% per ticket</p>
          </div>
          <div className="p-3 bg-yellow-900/30 rounded-lg">
            <p className="text-sm text-gray-400">Bonus Rate</p>
            <p className="font-bold">{payoutConfig.prizeBonusRate * 100}% of prize</p>
          </div>
          <div className="p-3 bg-yellow-900/30 rounded-lg">
            <p className="text-sm text-gray-400">Processing Fee</p>
            <p className="font-bold">{payoutConfig.processingFee * 100}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Performers (by pending payout)
              </h2>
            </div>
            
            <div className="space-y-3">
              {topPerformers.slice(0, 5).map((influencer, index) => (
                <div key={influencer.id} className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold' : 'bg-gray-700 text-white'}`}>
                      {index + 1}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{influencer.displayName}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {influencer.stats?.totalReferrals || 0} referrals • {(influencer.stats?.conversionRate || 0).toFixed(1)}% conversion
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-300">
                      {formatCurrency(influencer.stats?.pendingPayout || 0)}
                    </p>
                    <button
                      onClick={() => onProcessPayout(influencer)}
                      className="mt-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Payouts */}
        <div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Pending Payout Requests
              </h2>
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                {pendingPayouts.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {pendingPayouts.slice(0, 3).map((payout) => (
                <div key={payout.id} className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm truncate">Payout Request</p>
                    <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded">
                      Pending
                    </span>
                  </div>
                  <p className="text-lg font-bold text-yellow-300">
                    {formatCurrency(payout.amount)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    Requested {formatTimeAgo(payout.createdAt?.toDate())}
                  </p>
                  <button 
                    onClick={onViewPayouts}
                    className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-1.5 rounded-lg text-sm"
                  >
                    Process Now
                  </button>
                </div>
              ))}
              {pendingPayouts.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No pending payout requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{activity.details}</p>
                  <p className="text-sm text-gray-400 truncate">
                    By {activity.adminName} • {formatTimeAgo(activity.timestamp?.toDate())}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 hidden md:block">
                {activity.action.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Influencers Tab Component - UPDATED WITH PAYOUT BUTTONS
const InfluencersTab = ({ 
  influencers, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  payoutConfig,
  onApprove, 
  onReject, 
  onSuspend, 
  onDelete, 
  onViewDetails,
  onProcessPayout,
  onExport,
  exporting 
}) => {
  const [actionMenu, setActionMenu] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'pending_approval': return 'bg-yellow-500/20 text-yellow-400';
      case 'suspended': return 'bg-red-500/20 text-red-400';
      case 'rejected': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const eligibleInfluencers = influencers.filter(i => 
    (i.stats?.pendingPayout || 0) >= payoutConfig.minPayoutAmount
  );

  const handlePayAllEligible = async () => {
    if (!window.confirm(`Pay ${eligibleInfluencers.length} influencers? This will create individual payout records.`)) return;
    
    for (const influencer of eligibleInfluencers) {
      await onProcessPayout(influencer);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Influencer Management</h2>
          <p className="text-gray-400">Manage all influencer accounts</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search influencers..."
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-full"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
          
          {eligibleInfluencers.length > 0 && (
            <button
              onClick={handlePayAllEligible}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Pay All ({eligibleInfluencers.length})
            </button>
          )}
          
          <button
            onClick={onExport}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Influencers Grid/Table */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4">Influencer</th>
                <th className="text-left p-4">Tier & Status</th>
                <th className="text-left p-4">Referrals</th>
                <th className="text-left p-4">Lifetime Earnings</th>
                <th className="text-left p-4">Pending Payout</th>
                <th className="text-left p-4">Quick Pay</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {influencers.length > 0 ? (
                influencers.map((influencer) => {
                  const canPay = (influencer.stats?.pendingPayout || 0) >= payoutConfig.minPayoutAmount;
                  return (
                    <tr key={influencer.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      {/* Influencer Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                            {influencer.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{influencer.displayName}</p>
                            <p className="text-sm text-gray-400">{influencer.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Tier & Status */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${influencer.influencerData?.tier === 'Diamond' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-700'}`}>
                            {influencer.influencerData?.tier || 'Bronze'}
                          </span>
                          <div className={`px-2 py-1 rounded text-xs ${getStatusColor(influencer.influencerData?.status)}`}>
                            {influencer.influencerData?.status?.replace('_', ' ') || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      
                      {/* Referrals */}
                      <td className="p-4">
                        <div>
                          <p className="font-bold">{influencer.stats?.totalReferrals || 0}</p>
                          <p className="text-sm text-gray-400">
                            {influencer.stats?.ticketsSold || 0} tickets
                          </p>
                        </div>
                      </td>
                      
                      {/* Lifetime Earnings */}
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-green-400">
                            {formatCurrency(influencer.stats?.lifetimeEarnings || 0)}
                          </p>
                          <p className="text-xs text-gray-400">Total earned</p>
                        </div>
                      </td>
                      
                      {/* Pending Payout */}
                      <td className="p-4">
                        <div className="text-center">
                          <p className="text-xl font-bold text-yellow-300">
                            {formatCurrency(influencer.stats?.pendingPayout || 0)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Min: {formatCurrency(payoutConfig.minPayoutAmount)}
                          </p>
                        </div>
                      </td>
                      
                      {/* Quick Pay Button */}
                      <td className="p-4">
                        {canPay ? (
                          <button
                            onClick={() => onProcessPayout(influencer)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                          >
                            <DollarSign className="w-4 h-4" />
                            Pay {formatCurrency(influencer.stats?.pendingPayout || 0)}
                          </button>
                        ) : (
                          <div className="text-center text-gray-500 text-sm">
                            Below minimum
                          </div>
                        )}
                      </td>
                      
                      {/* Actions Menu */}
                      <td className="p-4">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenu(actionMenu === influencer.id ? null : influencer.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {actionMenu === influencer.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => {
                                  onViewDetails(influencer);
                                  setActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full p-3 hover:bg-gray-700 text-left"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              
                              {canPay && (
                                <button
                                  onClick={() => {
                                    onProcessPayout(influencer);
                                    setActionMenu(null);
                                  }}
                                  className="flex items-center gap-2 w-full p-3 hover:bg-green-700/30 text-green-400 text-left"
                                >
                                  <DollarSign className="w-4 h-4" />
                                  Process Payout
                                </button>
                              )}
                              
                              {influencer.influencerData?.status === 'pending_approval' && (
                                <>
                                  <button
                                    onClick={() => {
                                      onApprove(influencer.id);
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full p-3 hover:bg-green-700/30 text-green-400 text-left"
                                  >
                                    <Check className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Enter rejection reason:');
                                      if (reason) onReject(influencer.id, reason);
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full p-3 hover:bg-red-700/30 text-red-400 text-left"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              {influencer.influencerData?.status === 'active' && (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Enter suspension reason:');
                                    if (reason) onSuspend(influencer.id, reason);
                                    setActionMenu(null);
                                  }}
                                  className="flex items-center gap-2 w-full p-3 hover:bg-yellow-700/30 text-yellow-400 text-left"
                                >
                                  <Ban className="w-4 h-4" />
                                  Suspend
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${influencer.displayName}? This cannot be undone.`)) {
                                    onDelete(influencer.id);
                                  }
                                  setActionMenu(null);
                                }}
                                className="flex items-center gap-2 w-full p-3 hover:bg-red-700/30 text-red-400 text-left border-t border-gray-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No influencers found</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {influencers.length > 0 ? (
            <div className="space-y-3 p-4">
              {influencers.map((influencer) => {
                const canPay = (influencer.stats?.pendingPayout || 0) >= payoutConfig.minPayoutAmount;
                return (
                  <div key={influencer.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                          {influencer.displayName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold">{influencer.displayName}</p>
                          <p className="text-sm text-gray-400">{influencer.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActionMenu(actionMenu === influencer.id ? null : influencer.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <div className={`px-2 py-1 rounded text-xs inline-block ${getStatusColor(influencer.influencerData?.status)}`}>
                          {influencer.influencerData?.status?.replace('_', ' ') || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Referrals</p>
                        <p className="font-bold">{influencer.stats?.totalReferrals || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Earnings</p>
                        <p className="font-bold text-green-400">{formatCurrency(influencer.stats?.lifetimeEarnings || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Pending</p>
                        <p className="font-bold text-yellow-300">{formatCurrency(influencer.stats?.pendingPayout || 0)}</p>
                      </div>
                    </div>
                    
                    {/* Mobile Pay Button */}
                    {canPay ? (
                      <button
                        onClick={() => onProcessPayout(influencer)}
                        className="w-full mb-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <DollarSign className="w-5 h-5" />
                        Pay {formatCurrency(influencer.stats?.pendingPayout || 0)}
                      </button>
                    ) : (
                      <div className="w-full mb-3 text-center text-gray-500 text-sm py-2 bg-gray-800/50 rounded-lg">
                        Below minimum payout ({formatCurrency(payoutConfig.minPayoutAmount)})
                      </div>
                    )}
                    
                    {actionMenu === influencer.id && (
                      <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
                        <button
                          onClick={() => {
                            onViewDetails(influencer);
                            setActionMenu(null);
                          }}
                          className="flex items-center gap-2 w-full p-2 hover:bg-gray-700 rounded text-left"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        
                        {influencer.influencerData?.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => {
                                onApprove(influencer.id);
                                setActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full p-2 hover:bg-green-700/30 text-green-400 text-left rounded"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason:');
                                if (reason) onReject(influencer.id, reason);
                                setActionMenu(null);
                              }}
                              className="flex items-center gap-2 w-full p-2 hover:bg-red-700/30 text-red-400 text-left rounded"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No influencers found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Payouts Tab Component
const PayoutsTab = ({ pendingPayouts, influencers, onProcessPayout, onExport, exporting }) => {
  const [selectedPayouts, setSelectedPayouts] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [processingBulk, setProcessingBulk] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPayouts.size === 0) return;
    
    setProcessingBulk(true);
    
    try {
      if (bulkAction === 'approve') {
        for (const payoutId of selectedPayouts) {
          const payout = pendingPayouts.find(p => p.id === payoutId);
          if (payout) {
            await onProcessPayout(payout.influencerId, payout.amount, 'bulk');
          }
        }
      }
      
      setSelectedPayouts(new Set());
      setBulkAction('');
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setProcessingBulk(false);
    }
  };

  const getInfluencerInfo = (userId) => {
    const influencer = influencers.find(i => i.id === userId);
    return {
      name: influencer?.displayName || 'Unknown',
      email: influencer?.email || 'N/A',
      avatar: influencer?.displayName?.charAt(0) || 'U'
    };
  };

  // Filter payouts by search
  const filteredPayouts = useMemo(() => {
    if (!searchQuery) return pendingPayouts;
    
    return pendingPayouts.filter(payout => {
      const influencer = getInfluencerInfo(payout.influencerId);
      return (
        influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        influencer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.amount.toString().includes(searchQuery)
      );
    });
  }, [pendingPayouts, searchQuery]);

  // Calculate total pending amount
  const totalPending = filteredPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-4 md:p-6 border border-blue-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Payout Management</h2>
            <p className="text-gray-400">Process influencer payouts and withdrawals</p>
          </div>
          
          <div className="flex flex-col md:items-end gap-2">
            <div className="text-2xl md:text-3xl font-bold text-yellow-300">
              {formatCurrency(totalPending)}
            </div>
            <div className="text-sm text-gray-400">
              Total Pending • {filteredPayouts.length} requests
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by influencer name, email, or amount..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedPayouts.size > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm">
                {selectedPayouts.size} selected
              </div>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Bulk Action</option>
                <option value="approve">Approve Selected</option>
                <option value="reject">Reject Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || processingBulk}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                {processingBulk ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Apply'
                )}
              </button>
              <button
                onClick={() => setSelectedPayouts(new Set())}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Clear
              </button>
            </div>
          )}
          
          <button
            onClick={onExport}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        {filteredPayouts.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedPayouts.size === filteredPayouts.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPayouts(new Set(filteredPayouts.map(p => p.id)));
                          } else {
                            setSelectedPayouts(new Set());
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="text-left p-4">Influencer</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Bank Details</th>
                    <th className="text-left p-4">Requested</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((payout) => {
                    const influencer = getInfluencerInfo(payout.influencerId);
                    return (
                      <tr key={payout.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedPayouts.has(payout.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedPayouts);
                              if (e.target.checked) {
                                newSelected.add(payout.id);
                              } else {
                                newSelected.delete(payout.id);
                              }
                              setSelectedPayouts(newSelected);
                            }}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                              {influencer.avatar}
                            </div>
                            <div>
                              <p className="font-medium">{influencer.name}</p>
                              <p className="text-sm text-gray-400">{influencer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-2xl font-bold text-yellow-300">
                            {formatCurrency(payout.amount)}
                          </p>
                        </td>
                        <td className="p-4">
                          {payout.bankDetails ? (
                            <div>
                              <p className="font-medium">{payout.bankDetails.bankName}</p>
                              <p className="text-sm text-gray-400">
                                {payout.bankDetails.accountName}
                              </p>
                              <p className="text-sm text-gray-400">
                                •••• {payout.bankDetails.accountNumber?.slice(-4)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-500">No bank details</span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{formatDate(payout.createdAt?.toDate())}</p>
                          <p className="text-xs text-gray-400">
                            {formatTimeAgo(payout.createdAt?.toDate())}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => onProcessPayout(payout.influencerId, payout.amount, 'single')}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Reject this payout request?')) {
                                  // Handle rejection
                                  console.log('Reject payout:', payout.id);
                                }
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              <div className="p-4 space-y-4">
                {filteredPayouts.map((payout) => {
                  const influencer = getInfluencerInfo(payout.influencerId);
                  return (
                    <div key={payout.id} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedPayouts.has(payout.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedPayouts);
                              if (e.target.checked) {
                                newSelected.add(payout.id);
                              } else {
                                newSelected.delete(payout.id);
                              }
                              setSelectedPayouts(newSelected);
                            }}
                            className="w-5 h-5 mt-1"
                          />
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                            {influencer.avatar}
                          </div>
                          <div>
                            <p className="font-bold">{influencer.name}</p>
                            <p className="text-sm text-gray-400">{influencer.email}</p>
                          </div>
                        </div>
                        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-3xl font-bold text-yellow-300 text-center mb-2">
                          {formatCurrency(payout.amount)}
                        </p>
                        
                        {payout.bankDetails && (
                          <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                            <p className="font-medium text-sm">{payout.bankDetails.bankName}</p>
                            <p className="text-sm text-gray-400">{payout.bankDetails.accountName}</p>
                            <p className="text-sm text-gray-400">
                              •••• {payout.bankDetails.accountNumber?.slice(-4)}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-400 text-center">
                          Requested {formatTimeAgo(payout.createdAt?.toDate())}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onProcessPayout(payout.influencerId, payout.amount, 'single')}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Reject this payout request?')) {
                              // Handle rejection
                              console.log('Reject payout:', payout.id);
                            }
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Pending Payouts</h3>
            <p className="text-gray-400 mb-6">All payout requests have been processed</p>
            <button
              onClick={onExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export All Payouts
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredPayouts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-4 rounded-xl border border-yellow-800/50">
            <p className="text-sm text-gray-400">Total Pending</p>
            <p className="text-2xl font-bold text-yellow-300">{formatCurrency(totalPending)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-4 rounded-xl border border-blue-800/50">
            <p className="text-sm text-gray-400">Average Payout</p>
            <p className="text-2xl font-bold">
              {formatCurrency(filteredPayouts.length > 0 ? totalPending / filteredPayouts.length : 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 p-4 rounded-xl border border-red-800/50">
            <p className="text-sm text-gray-400">Processing Fee (1.5%)</p>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(totalPending * 0.015)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-4 rounded-xl border border-green-800/50">
            <p className="text-sm text-gray-400">Net Amount</p>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(totalPending * 0.985)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Raffles Tab Component
const RafflesTab = ({ raffles, onViewRaffle, onExport, exporting }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'upcoming': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Raffle Management</h2>
          <p className="text-gray-400">View all raffles and their details</p>
        </div>
        
        <button
          onClick={onExport}
          disabled={exporting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export CSV</span>
            </>
          )}
        </button>
      </div>

      {/* Raffles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {raffles.length > 0 ? (
          raffles.map((raffle) => (
            <div key={raffle.id} className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="overflow-hidden">
                  <h3 className="font-bold truncate">{raffle.title}</h3>
                  <p className="text-sm text-gray-400 truncate">ID: {raffle.id}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(raffle.status)}`}>
                  {raffle.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Prize Value</span>
                  <span className="font-bold text-green-400">{formatCurrency(raffle.prizeValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Ticket Price</span>
                  <span className="font-bold">{formatCurrency(raffle.ticketPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Tickets Sold</span>
                  <span className="font-bold">{raffle.ticketsSold || 0} / {raffle.totalTickets || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="font-bold">
                    {raffle.totalTickets ? Math.round((raffle.ticketsSold || 0) / raffle.totalTickets * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ 
                    width: `${raffle.totalTickets ? Math.min((raffle.ticketsSold || 0) / raffle.totalTickets * 100, 100) : 0}%` 
                  }}
                ></div>
              </div>
              
              <button
                onClick={() => onViewRaffle(raffle)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No raffles found</p>
            <p className="text-sm mt-2">No raffles have been created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics, summary, onViewDetails, onExport, exporting }) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-4 rounded-xl border border-blue-800/50">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Avg Conversion Rate</p>
              <p className="text-xl font-bold">
                {analytics.conversionRates.reduce((sum, r) => sum + r.conversionRate, 0) / 
                 (analytics.conversionRates.length || 1)
                .toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {analytics.conversionRates.slice(0, 3).map((rate) => (
              <div key={rate.tier} className="flex justify-between text-sm">
                <span>{rate.tier}</span>
                <span>{rate.conversionRate.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-4 rounded-xl border border-purple-800/50">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Top Performer</p>
              <p className="text-xl font-bold truncate">
                {analytics.topPerformers[0]?.displayName?.split(' ')[0] || 'N/A'}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Pending Payout</span>
              <span className="text-green-400">
                {formatCurrency(analytics.topPerformers[0]?.stats?.pendingPayout || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Referrals</span>
              <span>{analytics.topPerformers[0]?.stats?.totalReferrals || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-4 rounded-xl border border-green-800/50">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Monthly Growth</p>
              <p className="text-xl font-bold">
                {analytics.monthlyTrends.length >= 2 
                  ? `${(((analytics.monthlyTrends[analytics.monthlyTrends.length - 1].payouts - 
                       analytics.monthlyTrends[analytics.monthlyTrends.length - 2].payouts) / 
                       analytics.monthlyTrends[analytics.monthlyTrends.length - 2].payouts) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>This Month</span>
              <span>{formatCurrency(summary.thisMonthPayouts)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Last Month</span>
              <span>
                {formatCurrency(
                  analytics.monthlyTrends.length >= 2 
                    ? analytics.monthlyTrends[analytics.monthlyTrends.length - 2].payouts 
                    : 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Monthly Payout Trends</h3>
            <button 
              onClick={onViewDetails}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View Details →
            </button>
          </div>
          
          <div className="h-64">
            {analytics.monthlyTrends.length > 0 ? (
              <div className="flex items-end h-48 gap-2">
                {analytics.monthlyTrends.map((trend, index) => {
                  const maxPayout = Math.max(...analytics.monthlyTrends.map(t => t.payouts));
                  const height = (trend.payouts / maxPayout) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                      <div className="text-xs text-gray-400 mt-2 truncate w-full text-center">
                        {trend.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No trend data available
              </div>
            )}
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
          <h3 className="font-bold mb-4">Tier Distribution</h3>
          <div className="space-y-4">
            {analytics.tierDistribution.map((item) => (
              <div key={item.tier} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.tier}</span>
                  <span>{item.count} influencers ({item.percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">Export Analytics Data</h3>
            <p className="text-sm text-gray-400">Download comprehensive reports and analytics</p>
          </div>
          
          <button
            onClick={onExport}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Transactions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Payout Modal Component
const PayoutModal = ({ influencer, payoutAmount, setPayoutAmount, payoutConfig, onClose, onProcess, processing, calculatePayout }) => {
  const [calculatedPayout, setCalculatedPayout] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayoutCalculation();
  }, [influencer.id]);

  const loadPayoutCalculation = async () => {
    setLoading(true);
    try {
      const payout = await calculatePayout(influencer.id);
      setCalculatedPayout(payout);
      if (!payoutAmount && payout.totalPayout > 0) {
        setPayoutAmount(payout.totalPayout.toString());
      }
    } catch (error) {
      console.error('Error calculating payout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Process Payout</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">Process payout for {influencer.displayName}</p>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-gray-400">Calculating payout...</p>
            </div>
          ) : calculatedPayout ? (
            <div className="space-y-4">
              {/* Payout Breakdown */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h4 className="font-bold mb-2">Payout Breakdown</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Ticket Commissions ({payoutConfig.ticketCommissionRate * 100}%):</span>
                    <span>{formatCurrency(calculatedPayout.breakdown.ticketCommissions)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Prize Bonuses ({payoutConfig.prizeBonusRate * 100}%):</span>
                    <span>{formatCurrency(calculatedPayout.breakdown.prizeBonuses)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-1 mt-1">
                    <div className="flex justify-between font-bold text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculatedPayout.breakdown.totalBeforeFees)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-red-400">
                    <span>Processing Fee ({payoutConfig.processingFee * 100}%):</span>
                    <span>-{formatCurrency(calculatedPayout.breakdown.processingFee)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-400">
                    <span>Tax ({payoutConfig.taxRate * 100}%):</span>
                    <span>-{formatCurrency(calculatedPayout.breakdown.tax)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-1 mt-1">
                    <div className="flex justify-between font-bold text-green-400 text-sm">
                      <span>Net Payout:</span>
                      <span>{formatCurrency(calculatedPayout.breakdown.netPayout)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per Raffle Breakdown */}
              {calculatedPayout.perRaffleBreakdown && calculatedPayout.perRaffleBreakdown.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <h4 className="font-bold mb-2">Per Raffle Breakdown</h4>
                  <div className="space-y-2">
                    {calculatedPayout.perRaffleBreakdown.map((raffle, index) => (
                      <div key={index} className="text-xs border-b border-gray-700/50 pb-2 last:border-0">
                        <div className="font-medium truncate">{raffle.raffleTitle}</div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <span>Tickets: {raffle.ticketsSold}</span>
                          <span className="text-right">Ticket Share: {raffle.ticketShare.toFixed(1)}%</span>
                          <span>Commission: {formatCurrency(raffle.ticketCommission)}</span>
                          <span className="text-right">
                            {raffle.qualifiesForBonus && raffle.prizeBonus > 0 ? (
                              <span className="text-green-400">Bonus: {formatCurrency(raffle.prizeBonus)}</span>
                            ) : raffle.qualifiesForBonus ? (
                              <span className="text-yellow-400">Qualified</span>
                            ) : (
                              <span className="text-gray-400">Not Qualified</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bonus Qualification Status */}
              <div className={`p-3 rounded-lg ${calculatedPayout.qualifiedForBonus ? 'bg-green-900/20 border border-green-800/50' : 'bg-gray-800/50'}`}>
                <div className="flex items-center gap-2">
                  <Gift className={`w-4 h-4 ${calculatedPayout.qualifiedForBonus ? 'text-green-400' : 'text-gray-400'}`} />
                  <span className={`font-medium ${calculatedPayout.qualifiedForBonus ? 'text-green-400' : 'text-gray-400'}`}>
                    {calculatedPayout.qualifiedForBonus ? '✓ Qualified for Prize Bonus' : 'Not qualified for prize bonus'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Requirements: ≥{payoutConfig.ticketShareThreshold * 100}% ticket share OR ≥{payoutConfig.lifetimeReferralsThreshold} lifetime referrals + referred winner
                </p>
              </div>

              {/* Payout Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Payout Amount (₦)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  placeholder="Enter amount"
                  min={payoutConfig.minPayoutAmount}
                  max={calculatedPayout.totalPayout}
                  step="100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Available: {formatCurrency(calculatedPayout.totalPayout)} • 
                  Min: {formatCurrency(payoutConfig.minPayoutAmount)}
                </p>
              </div>

              {/* Bank Details */}
              {influencer.influencerData?.bankDetails && (
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
                  <h4 className="font-bold mb-1 text-sm">Bank Details</h4>
                  <p className="text-sm">{influencer.influencerData.bankDetails.bankName}</p>
                  <p className="text-sm">
                    {influencer.influencerData.bankDetails.accountName} • 
                    •••{influencer.influencerData.bankDetails.accountNumber?.slice(-4)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Unable to calculate payout</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={() => onProcess(influencer.id, parseFloat(payoutAmount))}
              disabled={processing || !payoutAmount || parseFloat(payoutAmount) > (calculatedPayout?.totalPayout || 0)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  Processing...
                </>
              ) : (
                'Process Payout'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Influencer Details Modal
const InfluencerDetailsModal = ({ influencer, onClose, onApprove, onReject, onSuspend, onDelete, calculatePayout, payoutConfig, onProcessPayout }) => {
  const [payoutData, setPayoutData] = useState(null);
  const [loadingPayout, setLoadingPayout] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    loadPayoutData();
  }, [influencer.id]);

  const loadPayoutData = async () => {
    setLoadingPayout(true);
    try {
      const payout = await calculatePayout(influencer.id);
      setPayoutData(payout);
    } catch (error) {
      console.error('Error loading payout data:', error);
    } finally {
      setLoadingPayout(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">{influencer.displayName}</h3>
              <p className="text-gray-400 text-sm">{influencer.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${influencer.influencerData?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {influencer.influencerData?.status?.replace('_', ' ') || 'Unknown'}
              </span>
              <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-800 overflow-x-auto">
          {['details', 'performance', 'payout'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-2">Profile Information</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Display Name</p>
                    <p className="font-medium">{influencer.displayName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{influencer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="font-medium">{influencer.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Referral Code</p>
                    <p className="font-medium">{influencer.influencerData?.referralCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tier</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${influencer.influencerData?.tier === 'Diamond' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-700'}`}>
                      {influencer.influencerData?.tier || 'Bronze'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-2">Bank Details</h4>
                {influencer.influencerData?.bankDetails ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400">Bank Name</p>
                      <p className="font-medium">{influencer.influencerData.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Name</p>
                      <p className="font-medium">{influencer.influencerData.bankDetails.accountName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Number</p>
                      <p className="font-medium">{influencer.influencerData.bankDetails.accountNumber}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No bank details provided</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h4 className="font-bold mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Total Referrals</p>
                  <p className="text-xl font-bold">{influencer.stats?.totalReferrals || 0}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Tickets Sold</p>
                  <p className="text-xl font-bold">{influencer.stats?.ticketsSold || 0}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Lifetime Earnings</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(influencer.stats?.lifetimeEarnings || 0)}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Conversion Rate</p>
                  <p className="text-xl font-bold">
                    {(influencer.stats?.conversionRate || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
              {(influencer.stats?.pendingPayout || 0) >= payoutConfig.minPayoutAmount && (
                <button
                  onClick={() => onProcessPayout(influencer)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium"
                >
                  Process Payout of {formatCurrency(influencer.stats?.pendingPayout || 0)}
                </button>
              )}
            </div>
          )}

          {activeTab === 'payout' && (
            <div>
              <h4 className="font-bold mb-3">Payout Information</h4>
              {loadingPayout ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : payoutData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-3 rounded-lg border border-blue-800/50">
                      <p className="text-sm text-gray-400">Available Payout</p>
                      <p className="text-xl font-bold text-green-400">
                        {formatCurrency(payoutData.totalPayout)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-3 rounded-lg border border-purple-800/50">
                      <p className="text-sm text-gray-400">Last Payout</p>
                      <p className="text-xl font-bold">
                        {influencer.influencerData?.lastPayout 
                          ? formatTimeAgo(influencer.influencerData.lastPayout.toDate())
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  {payoutData.perRaffleBreakdown && payoutData.perRaffleBreakdown.length > 0 && (
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h5 className="font-bold mb-2">Per Raffle Breakdown</h5>
                      <div className="space-y-2">
                        {payoutData.perRaffleBreakdown.map((raffle, index) => (
                          <div key={index} className="border-b border-gray-700/50 pb-2 last:border-0">
                            <div className="font-medium text-sm truncate">{raffle.raffleTitle}</div>
                            <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                              <span>Tickets: {raffle.ticketsSold}</span>
                              <span className="text-right">Commission: {formatCurrency(raffle.ticketCommission)}</span>
                              {raffle.prizeBonus > 0 && (
                                <span className="text-green-400">Bonus: {formatCurrency(raffle.prizeBonus)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Unable to load payout data</p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {influencer.influencerData?.status === 'pending_approval' && (
              <>
                <button
                  onClick={() => onApprove(influencer.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Approve Account
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) onReject(influencer.id, reason);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  Reject Account
                </button>
              </>
            )}
            
            {influencer.influencerData?.status === 'active' && (
              <button
                onClick={() => {
                  const reason = prompt('Enter suspension reason:');
                  if (reason) onSuspend(influencer.id, reason);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                Suspend Account
              </button>
            )}
            
            <button
              onClick={() => {
                if (window.confirm(`Delete ${influencer.displayName} permanently?`)) {
                  onDelete(influencer.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Raffle Details Modal
const RaffleDetailsModal = ({ raffle, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{raffle.title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Prize Value</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(raffle.prizeValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Ticket Price</p>
              <p className="text-xl font-bold">{formatCurrency(raffle.ticketPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Tickets Sold</p>
              <p className="text-xl font-bold">{raffle.ticketsSold || 0} / {raffle.totalTickets || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-xl font-bold">{raffle.status}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Progress</p>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                style={{ 
                  width: `${raffle.totalTickets ? Math.min((raffle.ticketsSold || 0) / raffle.totalTickets * 100, 100) : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-400 mt-1">
              {raffle.totalTickets ? Math.round((raffle.ticketsSold || 0) / raffle.totalTickets * 100) : 0}%
            </p>
          </div>

          {raffle.description && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Description</p>
              <p className="text-sm">{raffle.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Start Date</p>
              <p className="text-sm">{formatDate(raffle.startDate?.toDate())}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">End Date</p>
              <p className="text-sm">{formatDate(raffle.endDate?.toDate())}</p>
            </div>
          </div>

          {raffle.winnerId && (
            <div className="p-3 bg-green-900/20 rounded-lg border border-green-800/50">
              <p className="text-sm font-medium text-green-400">Winner: {raffle.winnerId}</p>
              {raffle.winnerDetails && (
                <p className="text-sm text-gray-400 mt-1">{raffle.winnerDetails.name}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Payout Settings Modal
const PayoutSettingsModal = ({ payoutConfig, onClose, onSave }) => {
  const [settings, setSettings] = useState(payoutConfig);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Payout Settings</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Commission Settings */}
          <div className="space-y-3">
            <h4 className="font-bold">Commission Structure</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Ticket Commission Rate (% per ticket)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.ticketCommissionRate * 100}
                  onChange={(e) => setSettings({
                    ...settings,
                    ticketCommissionRate: parseFloat(e.target.value) / 100
                  })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-24"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Percentage of ticket price earned per ticket bought by referrals
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Prize Bonus Rate (% of prize value)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.prizeBonusRate * 100}
                  onChange={(e) => setSettings({
                    ...settings,
                    prizeBonusRate: parseFloat(e.target.value) / 100
                  })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-24"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Percentage of prize value earned when referred user wins
              </p>
            </div>
          </div>

          {/* Bonus Qualification */}
          <div className="space-y-3">
            <h4 className="font-bold">Bonus Qualification</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Ticket Share Threshold (% for bonus)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.ticketShareThreshold * 100}
                  onChange={(e) => setSettings({
                    ...settings,
                    ticketShareThreshold: parseFloat(e.target.value) / 100
                  })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-24"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Minimum ticket share required to qualify for prize bonus
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Lifetime Referrals Threshold
              </label>
              <input
                type="number"
                value={settings.lifetimeReferralsThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  lifetimeReferralsThreshold: parseInt(e.target.value)
                })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-full"
                min="0"
                step="1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Number of lifetime referrals required to automatically qualify for prize bonus
              </p>
            </div>
          </div>

          {/* Payout Settings */}
          <div className="space-y-3">
            <h4 className="font-bold">Payout Settings</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Payout Amount (₦)
              </label>
              <input
                type="number"
                value={settings.minPayoutAmount}
                onChange={(e) => setSettings({
                  ...settings,
                  minPayoutAmount: parseFloat(e.target.value)
                })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-full"
                min="0"
                step="100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum amount required for payout
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Processing Fee (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.processingFee * 100}
                  onChange={(e) => setSettings({
                    ...settings,
                    processingFee: parseFloat(e.target.value) / 100
                  })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-24"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Fee deducted from each payout for processing
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Tax Rate (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.taxRate * 100}
                  onChange={(e) => setSettings({
                    ...settings,
                    taxRate: parseFloat(e.target.value) / 100
                  })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-24"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Tax deducted from each payout
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Details Modal
const AnalyticsDetailsModal = ({ analytics, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Detailed Analytics</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Top Performers Table */}
            <div>
              <h4 className="font-bold mb-3">Top Performers</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-2">Rank</th>
                      <th className="text-left p-2">Influencer</th>
                      <th className="text-left p-2">Tier</th>
                      <th className="text-left p-2">Referrals</th>
                      <th className="text-left p-2">Tickets</th>
                      <th className="text-left p-2">Pending Payout</th>
                      <th className="text-left p-2">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPerformers.map((influencer, index) => (
                      <tr key={influencer.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="p-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold' : 'bg-gray-700 text-white'}`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs">
                              {influencer.displayName?.charAt(0)}
                            </div>
                            <span className="truncate max-w-[100px]">{influencer.displayName}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-1 rounded text-xs bg-gray-700">
                            {influencer.influencerData?.tier || 'Bronze'}
                          </span>
                        </td>
                        <td className="p-2 font-medium">
                          {influencer.stats?.totalReferrals || 0}
                        </td>
                        <td className="p-2 font-medium">
                          {influencer.stats?.ticketsSold || 0}
                        </td>
                        <td className="p-2 font-bold text-green-400">
                          {formatCurrency(influencer.stats?.pendingPayout || 0)}
                        </td>
                        <td className="p-2">
                          {(influencer.stats?.conversionRate || 0).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Trends */}
            <div>
              <h4 className="font-bold mb-3">Monthly Trends</h4>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2">Month</th>
                        <th className="text-left p-2">Total Payouts</th>
                        <th className="text-left p-2">Influencers Paid</th>
                        <th className="text-left p-2">Transactions</th>
                        <th className="text-left p-2">Avg. Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.monthlyTrends.map((trend, index) => (
                        <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="p-2">{trend.month}</td>
                          <td className="p-2 font-bold">{formatCurrency(trend.payouts)}</td>
                          <td className="p-2">{trend.influencers}</td>
                          <td className="p-2">{trend.transactions}</td>
                          <td className="p-2">
                            {formatCurrency(trend.influencers > 0 ? trend.payouts / trend.influencers : 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Conversion Rates by Tier */}
            <div>
              <h4 className="font-bold mb-3">Conversion Rates by Tier</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {analytics.conversionRates.map((rate) => (
                  <div key={rate.tier} className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="font-bold text-center mb-1">{rate.tier}</p>
                    <p className="text-2xl font-bold text-center mb-1">
                      {rate.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      {rate.total} influencers
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInfluencerDashboard;