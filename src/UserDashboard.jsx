// UserDashboard.jsx - UPDATED VERSION (USERS COLLECTION ONLY)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Firebase imports
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query, 
  where, 
  getDocs, 
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment,
  writeBatch
} from 'firebase/firestore';
import { app } from './firebaseConfig';

// Lucide React Icons
import {
  User, Settings, LogOut, Bell, Wallet, Ticket, Gift, Users,
  ChevronRight, ChevronLeft, Home, HelpCircle, Shield, Mail,
  Phone, Lock, Globe, CreditCard, TrendingUp, Calendar, CheckCircle,
  XCircle, Clock, Award, Crown, Star, Share2, Copy, ExternalLink,
  Filter, Search, Plus, Minus, Eye, EyeOff, Edit2, Save, Trash2,
  MessageSquare, BarChart, Download, Upload, RefreshCw, Zap,
  Target, DollarSign, Percent, Package, ShoppingBag, Camera,
  Smartphone, Laptop, Car, Home as HomeIcon, Plane, BookOpen,
  Coffee, Gamepad, Watch, Diamond, Headphones, ShoppingCart,
  Heart, MapPin, Users as UsersIcon, Bell as BellIcon,
  TrendingUp as TrendingIcon, AlertCircle, Info,
  X, Menu, Grid, List, Trophy, ShoppingCart as CartIcon,
  UserCheck, Percent as PercentIcon, Loader, ArrowUpRight,
  MessageCircle, QrCode, ShieldCheck, TrendingDown, Briefcase,
  Image as ImageIcon, FileText, Bookmark, Flag, Heart as HeartIcon,
  ThumbsUp, Send, Paperclip, Mic, Smile, MoreVertical,
  Video, Music, File, Folder, Database, Server, Cpu, HardDrive,
  Wifi, Bluetooth, Battery, Volume2, Sun, Moon, Cloud, CloudRain,
  Wind, Thermometer, Droplet, Sunrise, Sunset, CloudSnow,
  CloudLightning, Umbrella, AlertTriangle, BatteryCharging,
  Power, Settings as SettingsIcon, BatteryLow, WifiOff,
  BluetoothConnected, Radio, Satellite, Map, Navigation,
  Compass, Target as TargetIcon, Crosshair, ZoomIn, ZoomOut,
  Layers, Globe as GlobeIcon, MapPin as MapPinIcon,
  Navigation2, Compass as CompassIcon, Map as MapIcon
} from 'lucide-react';

// ==================== FIREBASE INITIALIZATION ====================
const db = getFirestore(app);
const auth = getAuth(app);

// ==================== PAYSTACK SCRIPT LOADER ====================
const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};

// ==================== REAL-TIME DATA FETCHING ====================
const useRealtimeCollection = (collectionName, conditions = [], order = null, limitCount = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hasInvalidConditions = conditions.some(condition => 
      condition.some(val => val === undefined || val === null)
    );
    
    if (hasInvalidConditions) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      let queryRef = collection(db, collectionName);
      
      if (conditions && conditions.length > 0) {
        conditions.forEach(condition => {
          if (condition && condition.length === 3) {
            queryRef = query(queryRef, where(condition[0], condition[1], condition[2]));
          }
        });
      }
      
      if (order && order[0]) {
        queryRef = query(queryRef, orderBy(order[0], order[1] || 'desc'));
      }
      
      if (limitCount) {
        queryRef = query(queryRef, limit(limitCount));
      }

      const unsubscribe = onSnapshot(
        queryRef,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error(`Error setting up query for ${collectionName}:`, err);
      setError(err);
      setLoading(false);
      return () => {};
    }
  }, [collectionName, JSON.stringify(conditions), JSON.stringify(order), limitCount]);

  return { data, loading, error };
};

// ==================== PAYSTACK PAYMENT INTEGRATION ====================
const handleWalletTopUp = async (userId, amount, email, onSuccess, onError) => {
  try {
    console.log('Starting Paystack payment...');
    
    if (!window.PaystackPop) {
      console.log('Paystack not loaded, loading now...');
      await loadPaystackScript();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!window.PaystackPop) {
      throw new Error('Paystack failed to load. Please refresh the page.');
    }

    const reference = `NW_TOPUP_${userId}_${Date.now()}`;
    const paystackPublicKey = 'pk_test_8659b5b554f5e935476df72b2e0950d3b1f560ad';
    
    console.log('Payment details:', { email, amount, reference });
    
    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: email,
      amount: amount * 100,
      ref: reference,
      currency: 'NGN',
      metadata: {
        userId: userId,
        type: 'wallet_topup',
        amount: amount
      },
      callback: function(response) {
        console.log('Paystack success:', response);
        onSuccess(response);
      },
      onClose: function() {
        console.log('Payment window closed');
        onError({ message: 'Payment cancelled' });
      }
    });

    handler.openIframe();
    
  } catch (error) {
    console.error('Payment setup error:', error);
    onError(error);
  }
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';
  
  // State Management
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountName: '',
    bankName: ''
  });
  const [showBalance, setShowBalance] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successModal, setSuccessModal] = useState(null);
  
  // Real-time data fetching
  const { data: transactions, loading: transactionsLoading } = useRealtimeCollection(
    'transactions',
    user?.uid ? [['userId', '==', user.uid]] : [],
    user?.uid ? ['date', 'desc'] : null,
    50
  );

  const { data: tickets, loading: ticketsLoading } = useRealtimeCollection(
    'tickets',
    user?.uid ? [['userId', '==', user.uid]] : [],
    user?.uid ? ['purchaseDate', 'desc'] : null,
    50
  );

  const { data: notifications, loading: notificationsLoading } = useRealtimeCollection(
    'notifications',
    user?.uid ? [['userId', '==', user.uid]] : [],
    user?.uid ? ['createdAt', 'desc'] : null,
    20
  );

  // Get user balance
  const userBalance = userData?.balance || 0;

  // Load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Load user document from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({ 
              id: userDoc.id, 
              ...data,
              balance: data.balance || 0,
              stats: data.stats || {
                ticketsPurchased: 0,
                totalSpent: 0,
                totalWins: 0,
                referralEarnings: 0,
                referralCount: 0
              },
              preferences: data.preferences || {
                emailNotifications: true,
                smsNotifications: false,
                marketingEmails: true
              }
            });
          } else {
            // Create user document if it doesn't exist
            const newUserData = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || `User${Math.floor(1000 + Math.random() * 9000)}`,
              firstName: currentUser.displayName?.split(' ')[0] || '',
              lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
              photoURL: currentUser.photoURL || '',
              isEmailVerified: currentUser.emailVerified || false,
              accountType: 'user',
              balance: 0,
              referralCode: `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
              referredBy: null,
              stats: {
                ticketsPurchased: 0,
                totalSpent: 0,
                totalWins: 0,
                referralEarnings: 0,
                referralCount: 0,
                activeTickets: 0
              },
              preferences: {
                emailNotifications: true,
                smsNotifications: false,
                marketingEmails: true
              },
              createdAt: serverTimestamp(),
              lastActivity: serverTimestamp()
            };
            
            await setDoc(userDocRef, newUserData);
            setUserData({ id: currentUser.uid, ...newUserData });
          }
          
          // Update last login
          await updateDoc(doc(db, 'users', currentUser.uid), {
            lastActivity: serverTimestamp()
          });
          
        } catch (error) {
          console.error('Error loading user:', error);
        }
      } else {
        navigate('/login?redirect=/dashboard');
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);

  // Load Paystack script
  useEffect(() => {
    const loadPaystack = async () => {
      try {
        if (window.PaystackPop) {
          setPaystackLoaded(true);
          return;
        }

        const existingScript = document.querySelector('script[src*="paystack"]');
        if (existingScript) {
          setPaystackLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ Paystack script loaded');
          setPaystackLoaded(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Paystack');
          setPaymentError('Payment system failed to load');
        };
        
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading Paystack:', error);
      }
    };

    if (user) {
      loadPaystack();
    }
  }, [user]);

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('tab', activeTab);
    navigate({ search: params.toString() }, { replace: true });
  }, [activeTab, location.search, navigate]);

  // Handle top-up payment
  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      setPaymentError('Please enter a valid amount');
      return;
    }

    if (!user || !user.email) {
      setPaymentError('User email not found');
      return;
    }

    const amount = parseFloat(topUpAmount);
    setProcessingPayment(true);
    setPaymentError(null);

    console.log('Starting top-up process:', { amount, email: user.email });

    try {
      await handleWalletTopUp(
        user.uid,
        amount,
        user.email,
        async (response) => {
          console.log('Payment successful:', response);
          
          try {
            const userRef = doc(db, 'users', user.uid);
            const transactionId = `TX_${Date.now()}`;
            
            // Update user balance
            await updateDoc(userRef, {
              balance: increment(amount),
              lastActivity: serverTimestamp()
            });

            // Create transaction record
            const transactionsRef = collection(db, 'transactions');
            await addDoc(transactionsRef, {
              userId: user.uid,
              id: transactionId,
              type: 'deposit',
              amount: amount,
              status: 'completed',
              date: serverTimestamp(),
              description: `Wallet top-up via Paystack`,
              reference: response.reference,
              method: 'card'
            });

            // Create notification
            const notificationsRef = collection(db, 'notifications');
            await addDoc(notificationsRef, {
              userId: user.uid,
              type: 'deposit',
              title: 'Deposit Successful',
              message: `₦${amount.toLocaleString()} has been added to your balance`,
              read: false,
              createdAt: serverTimestamp()
            });

            // Update user data state
            setUserData(prev => ({
              ...prev,
              balance: (prev.balance || 0) + amount
            }));

            // Show success modal
            setSuccessModal({
              type: 'deposit',
              title: '🎉 Payment Successful!',
              message: `Your deposit of ₦${amount.toLocaleString()} was successful.`,
              details: `Transaction ID: ${response.reference}`,
              buttonText: 'Continue',
              onClose: () => {
                setSuccessModal(null);
                setTopUpAmount('');
                setShowWalletModal(false);
                setProcessingPayment(false);
              }
            });

          } catch (dbError) {
            console.error('Database update error:', dbError);
            
            // Show success modal anyway (payment was successful)
            setSuccessModal({
              type: 'deposit',
              title: '⚠️ Payment Recorded Locally',
              message: `Your payment of ₦${amount.toLocaleString()} was successful!`,
              details: `Please contact support with reference: ${response.reference}`,
              buttonText: 'Continue',
              onClose: () => {
                setSuccessModal(null);
                setTopUpAmount('');
                setShowWalletModal(false);
                setProcessingPayment(false);
              }
            });
          }
        },
        (error) => {
          console.error('Payment error:', error);
          setPaymentError(error.message || 'Payment failed');
          setProcessingPayment(false);
          
          if (error.message && error.message.includes('cancelled')) {
            alert('Payment was cancelled. You can try again.');
          } else {
            alert('Payment failed. Please try again or contact support.');
          }
        }
      );
    } catch (error) {
      console.error('Top-up error:', error);
      setPaymentError('Error: ' + error.message);
      setProcessingPayment(false);
      alert('Payment setup failed. Please refresh the page and try again.');
    }
  };

  // Handle withdrawal request
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    
    if (amount > userBalance) {
      alert('Insufficient balance');
      return;
    }

    if (amount < 1000) {
      alert('Minimum withdrawal is ₦1,000');
      return;
    }

    if (withdrawMethod === 'bank' && (!bankDetails.accountNumber || !bankDetails.accountName || !bankDetails.bankName)) {
      alert('Please provide complete bank details');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const transactionId = `TX_${Date.now()}`;
      
      // Update user balance
      await updateDoc(userRef, {
        balance: increment(-amount),
        lastActivity: serverTimestamp()
      });

      // Create transaction record
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
        userId: user.uid,
        id: transactionId,
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        date: serverTimestamp(),
        description: `Withdrawal request to ${withdrawMethod === 'bank' ? 'bank transfer' : 'mobile money'}`,
        bankDetails: withdrawMethod === 'bank' ? bankDetails : null,
        method: withdrawMethod
      });

      // Create notification
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId: user.uid,
        type: 'withdrawal',
        title: 'Withdrawal Request Submitted',
        message: `Your withdrawal request of ₦${amount.toLocaleString()} has been submitted for processing.`,
        read: false,
        createdAt: serverTimestamp()
      });

      // Update user data state
      setUserData(prev => ({
        ...prev,
        balance: (prev.balance || 0) - amount
      }));

      // Show success modal
      setSuccessModal({
        type: 'withdrawal',
        title: '✅ Withdrawal Request Sent!',
        message: `Your withdrawal of ₦${amount.toLocaleString()} has been submitted.`,
        details: 'It will be processed within 24-48 hours.',
        buttonText: 'Continue',
        onClose: () => {
          setSuccessModal(null);
          setWithdrawAmount('');
          setBankDetails({ accountNumber: '', accountName: '', bankName: '' });
          setShowWithdrawModal(false);
        }
      });

    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Error submitting withdrawal request: ' + error.message);
    }
  };

  // Simulate ticket purchase (for testing)
  const handleTestTicketPurchase = () => {
    const ticketNumbers = Array.from({length: 3}, () => 
      Math.floor(100000 + Math.random() * 900000)
    );
    
    setSuccessModal({
      type: 'ticket',
      title: '🎉 Ticket Purchase Successful!',
      message: `You purchased 3 tickets for ₦1,500`,
      details: `Ticket Numbers: ${ticketNumbers.join(', ')}`,
      buttonText: 'View Tickets',
      onClose: () => {
        setSuccessModal(null);
        setActiveTab('tickets');
      }
    });
  };

  // Handle profile update
  const handleProfileUpdate = async (field) => {
    if (!editValue.trim()) return;
    
    try {
      if (field === 'displayName') {
        await updateProfile(user, { displayName: editValue });
      } else if (field === 'email') {
        await updateEmail(user, editValue);
        await sendEmailVerification(user);
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 
        [field]: editValue,
        lastActivity: serverTimestamp()
      });

      setUserData({ ...userData, [field]: editValue });
      setEditingField(null);
      setEditValue('');
      
      // Show success modal
      setSuccessModal({
        type: 'profile',
        title: '✅ Profile Updated!',
        message: 'Your profile has been updated successfully.',
        details: `${field} changed to ${editValue}`,
        buttonText: 'Continue',
        onClose: () => setSuccessModal(null)
      });
    } catch (error) {
      alert('Error updating: ' + error.message);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.new.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.current
      );
      
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.new);
      
      // Show success modal
      setSuccessModal({
        type: 'password',
        title: '✅ Password Updated!',
        message: 'Your password has been changed successfully.',
        details: 'Please use your new password for future logins.',
        buttonText: 'Continue',
        onClose: () => {
          setSuccessModal(null);
          setPasswordData({ current: '', new: '', confirm: '' });
          setShowChangePassword(false);
        }
      });
    } catch (error) {
      alert('Error updating password: ' + error.message);
    }
  };

  // Copy referral code
  const copyReferralCode = () => {
    const code = userData?.referralCode || '';
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    
    // Show success modal
    setSuccessModal({
      type: 'referral',
      title: '📋 Copied!',
      message: 'Referral link copied to clipboard.',
      details: 'Share with friends to earn rewards!',
      buttonText: 'Continue',
      onClose: () => setSuccessModal(null)
    });
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      let dateObj;
      if (date.toDate) {
        dateObj = date.toDate();
      } else if (date.seconds) {
        dateObj = new Date(date.seconds * 1000);
      } else {
        dateObj = new Date(date);
      }
      
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    
    try {
      let past;
      if (date.toDate) {
        past = date.toDate();
      } else if (date.seconds) {
        past = new Date(date.seconds * 1000);
      } else {
        past = new Date(date);
      }
      
      const now = new Date();
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      
      return formatDate(date);
    } catch (error) {
      return 'Recently';
    }
  };

  // Calculate stats
  const userStats = userData?.stats || {};
  const quickStats = {
    totalSpent: userStats.totalSpent || 0,
    ticketsPurchased: userStats.ticketsPurchased || tickets.length,
    totalWins: userStats.totalWins || 0,
    referralEarnings: userStats.referralEarnings || 0,
    activeTickets: tickets.filter(t => t.status === 'active').length,
    winningProbability: tickets.length > 0 
      ? ((userStats.totalWins || 0) / tickets.length * 100).toFixed(1) 
      : 0
  };

  // Quick actions
  const quickActions = [
    { 
      label: 'Buy Ticket', 
      icon: Ticket, 
      action: () => navigate('/raffles'), 
      color: 'from-yellow-500 to-orange-500' 
    },
    { 
      label: 'Top Up', 
      icon: Wallet, 
      action: () => setShowWalletModal(true), 
      color: 'from-green-500 to-emerald-500' 
    },
    { 
      label: 'Withdraw', 
      icon: Download, 
      action: () => setShowWithdrawModal(true), 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      label: 'Refer & Earn', 
      icon: Users, 
      action: () => setActiveTab('referrals'), 
      color: 'from-purple-500 to-pink-500' 
    }
  ];

  // Filter recent transactions (last 3)
  const recentTransactions = transactions.slice(0, 3);

  // Loading skeleton
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // ==================== RENDER COMPONENTS ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/12 backdrop-blur-2xl border-b border-white/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowDrawer(!showDrawer)}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="text-sm text-white/80">Welcome back,</div>
                <div className="font-black text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {userData?.firstName || userData?.displayName || 'User'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/')}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                title="Home"
              >
                <HomeIcon size={20} />
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                title="Notifications"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-2xl rounded-3xl p-5 mb-4 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/40 to-orange-500/40 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <div>
                <div className="text-sm text-white/80">Account Balance</div>
                <div className="text-2xl font-black">
                  {showBalance ? formatCurrency(userBalance) : '******'}
                </div>
                <div className="text-xs text-white/60">
                  {transactionsLoading ? 'Loading...' : `${transactions.length} transactions`}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowWalletModal(true)}
              className="py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-green-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Top Up
            </button>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} /> Withdraw
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { 
              label: 'Total Spent', 
              value: formatCurrency(quickStats.totalSpent), 
              icon: DollarSign, 
              color: 'text-red-400' 
            },
            { 
              label: 'Tickets', 
              value: quickStats.ticketsPurchased, 
              icon: Ticket, 
              color: 'text-yellow-400' 
            },
            { 
              label: 'Wins', 
              value: quickStats.totalWins, 
              icon: Award, 
              color: 'text-green-400' 
            },
            { 
              label: 'Active Tickets', 
              value: quickStats.activeTickets, 
              icon: Ticket, 
              color: 'text-blue-400' 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/8 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                    <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                  </div>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-black mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 hover:bg-white/15 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-xs text-center">{action.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/15 overflow-hidden mb-20">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-white/10">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'tickets', label: 'Tickets', icon: Ticket },
              { id: 'referrals', label: 'Referrals', icon: Users },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b-2 border-yellow-500'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="p-4">
            {/* Overview Panel */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="font-black text-lg mb-3">Dashboard Overview</h3>
                
                {/* Performance Card */}
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Your Performance</div>
                      <div className="text-sm text-white/80">Winning probability: {quickStats.winningProbability}%</div>
                    </div>
                    <TrendingUp size={24} className="text-green-400" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-white/60">Win Rate</div>
                      <div className="text-lg font-black text-green-400">
                        {quickStats.totalWins > 0 ? 'Good' : 'New'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/60">Activity</div>
                      <div className="text-lg font-black text-yellow-400">
                        {quickStats.ticketsPurchased > 10 ? 'High' : quickStats.ticketsPurchased > 3 ? 'Medium' : 'Low'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/60">Rank</div>
                      <div className="text-lg font-black text-purple-400">Top {Math.min(quickStats.ticketsPurchased * 10, 100)}%</div>
                    </div>
                  </div>
                </div>

                {/* Recent Tickets */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">Recent Tickets</h4>
                    <button 
                      onClick={() => setActiveTab('tickets')}
                      className="text-sm text-yellow-400 font-bold flex items-center gap-1"
                    >
                      View All <ChevronRight size={16} />
                    </button>
                  </div>
                  {ticketsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : tickets.slice(0, 3).map(ticket => (
                    <div 
                      key={ticket.id} 
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-3 mb-2 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm truncate max-w-[150px]">{ticket.raffleTitle}</div>
                          <div className="text-xs text-white/60">#{ticket.ticketNumber}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-yellow-400">{formatCurrency(ticket.price)}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            ticket.status === 'won' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {ticket.status || 'active'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Transactions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold">Recent Transactions</h4>
                    <button 
                      onClick={() => setActiveTab('tickets')}
                      className="text-sm text-yellow-400 font-bold flex items-center gap-1"
                    >
                      View All <ChevronRight size={16} />
                    </button>
                  </div>
                  {transactionsLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : recentTransactions.map(transaction => (
                    <div key={transaction.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 mb-2 border border-white/10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            transaction.type === 'deposit' 
                              ? 'bg-green-500/20' 
                              : transaction.type === 'withdrawal'
                              ? 'bg-red-500/20'
                              : 'bg-yellow-500/20'
                          }`}>
                            {transaction.type === 'deposit' ? <Download size={20} className="text-green-400" /> :
                             transaction.type === 'withdrawal' ? <Upload size={20} className="text-red-400" /> :
                             <ShoppingCart size={20} className="text-yellow-400" />}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{transaction.description}</div>
                            <div className="text-xs text-white/60">
                              {transaction.date ? formatDate(transaction.date) : 'Recently'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tickets Panel */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-lg">My Tickets ({tickets.length})</h3>
                  <button 
                    onClick={() => navigate('/raffles')}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    Buy More
                  </button>
                </div>
                
                {/* Ticket Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/8 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Active</div>
                    <div className="text-xl font-black text-green-400">
                      {tickets.filter(t => t.status === 'active').length}
                    </div>
                  </div>
                  <div className="bg-white/8 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Won</div>
                    <div className="text-xl font-black text-yellow-400">
                      {tickets.filter(t => t.status === 'won').length}
                    </div>
                  </div>
                  <div className="bg-white/8 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Expired</div>
                    <div className="text-xl font-black text-gray-400">
                      {tickets.filter(t => t.status === 'expired').length}
                    </div>
                  </div>
                </div>

                {/* Tickets List */}
                {ticketsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>
                    ))}
                  </div>
                ) : tickets.length > 0 ? (
                  tickets.map(ticket => (
                    <div 
                      key={ticket.id} 
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-3 border border-white/15 hover:border-yellow-500/40 transition-all cursor-pointer"
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-bold text-lg truncate">{ticket.raffleTitle}</div>
                          <div className="text-sm text-white/60">
                            Draw: {ticket.drawDate ? formatDate(ticket.drawDate) : 'Coming soon'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-yellow-400">{formatCurrency(ticket.price)}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            ticket.status === 'won' ? 'bg-yellow-500/20 text-yellow-400' :
                            ticket.status === 'expired' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {ticket.status || 'active'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white/5 rounded-xl p-2">
                          <div className="text-xs text-white/60">Ticket Number</div>
                          <div className="font-mono font-bold text-sm">{ticket.ticketNumber}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-2">
                          <div className="text-xs text-white/60">Purchase Date</div>
                          <div className="font-bold text-sm">
                            {ticket.purchaseDate ? formatDate(ticket.purchaseDate) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(ticket.ticketNumber);
                            setSuccessModal({
                              type: 'copy',
                              title: '📋 Copied!',
                              message: 'Ticket number copied to clipboard.',
                              buttonText: 'Continue',
                              onClose: () => setSuccessModal(null)
                            });
                          }}
                          className="flex-1 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl font-medium hover:bg-white/25 transition-all text-sm"
                        >
                          Copy Number
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/raffle/${ticket.raffleId}`);
                          }}
                          className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm"
                        >
                          View Raffle 
                        </button>
                        
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎫</div>
                    <div className="font-bold mb-2">No tickets yet</div>
                    <div className="text-sm text-white/60 mb-4">Buy your first ticket to start winning</div>
                    <button 
                      onClick={() => navigate('/raffles')}
                      className="py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      Browse Raffles
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Referrals Panel */}
            {activeTab === 'referrals' && (
              <div className="space-y-4">
                <h3 className="font-black text-lg mb-3">Refer & Earn</h3>
                
                {/* Referral Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/8 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Total Referrals</div>
                    <div className="text-xl font-black text-blue-400">{userStats.referralCount || 0}</div>
                  </div>
                  <div className="bg-white/8 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-sm text-white/60">Earned</div>
                    <div className="text-xl font-black text-green-400">
                      {formatCurrency(userStats.referralEarnings || 0)}
                    </div>
                  </div>
                </div>

                {/* Referral Code Card */}
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30 mb-4">
                  <div className="text-sm text-white/80 mb-2">Your Referral Code</div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-2xl font-black bg-white/10 px-4 py-2 rounded-xl">
                      {userData?.referralCode || 'Loading...'}
                    </div>
                    <button 
                      onClick={copyReferralCode}
                      className="p-3 bg-white/15 backdrop-blur-sm rounded-xl hover:bg-white/25 transition-all"
                      title="Copy referral link"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                  <div className="text-xs text-white/60 mb-3">
                    💰 Earn ₦500 for each friend who signs up and buys their first ticket
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        const text = `Join NextWinner and win amazing prizes! Use my code ${userData?.referralCode} to get started. ${window.location.origin}/register?ref=${userData?.referralCode}`;
                        navigator.clipboard.writeText(text);
                        setSuccessModal({
                          type: 'referral',
                          title: '📋 Copied!',
                          message: 'Referral message copied to clipboard.',
                          details: 'Share with friends to earn rewards!',
                          buttonText: 'Continue',
                          onClose: () => setSuccessModal(null)
                        });
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      Copy Referral Message
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(`https://wa.me/?text=Join%20NextWinner%20and%20win%20amazing%20prizes!%20Use%20my%20code%20${userData?.referralCode}%20to%20get%20started.%20${window.location.origin}/register?ref=${userData?.referralCode}`, '_blank')}
                        className="flex-1 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-medium hover:bg-green-500/30 transition-all"
                      >
                        WhatsApp
                      </button>
                      <button 
                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=Join%20NextWinner%20and%20win%20amazing%20prizes!%20Use%20my%20code%20${userData?.referralCode}%20to%20get%20started.%20${window.location.origin}/register?ref=${userData?.referralCode}`, '_blank')}
                        className="flex-1 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium hover:bg-blue-500/30 transition-all"
                      >
                        Twitter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Referral Info */}
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="font-bold mb-2">Share Your Code</div>
                  <div className="text-sm text-white/60">
                    Share your referral code with friends. When they sign up and buy their first ticket, you earn ₦500!
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Panel */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-lg">Notifications</h3>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <button 
                      onClick={async () => {
                        try {
                          const unreadNotifications = notifications.filter(n => !n.read);
                          const batch = writeBatch(db);
                          
                          unreadNotifications.forEach(notification => {
                            const notifRef = doc(db, 'notifications', notification.id);
                            batch.update(notifRef, {
                              read: true,
                              readAt: serverTimestamp()
                            });
                          });
                          
                          await batch.commit();
                          setSuccessModal({
                            type: 'notification',
                            title: '✅ Done!',
                            message: 'All notifications marked as read.',
                            buttonText: 'Continue',
                            onClose: () => setSuccessModal(null)
                          });
                        } catch (error) {
                          console.error('Error marking all as read:', error);
                        }
                      }}
                      className="text-sm text-yellow-400 font-bold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                {notificationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`bg-white/${notification.read ? '5' : '10'} backdrop-blur-xl rounded-2xl p-4 mb-3 border border-white/15 ${!notification.read ? 'border-yellow-500/30' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          notification.type === 'deposit' ? 'bg-green-500/20' :
                          notification.type === 'withdrawal' ? 'bg-blue-500/20' :
                          notification.type === 'win' ? 'bg-yellow-500/20' :
                          'bg-purple-500/20'
                        }`}>
                          {notification.type === 'deposit' ? <Download size={20} className="text-green-400" /> :
                           notification.type === 'withdrawal' ? <Upload size={20} className="text-blue-400" /> :
                           notification.type === 'win' ? <Award size={20} className="text-yellow-400" /> :
                           <Bell size={20} className="text-purple-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="font-bold">{notification.title}</div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            )}
                          </div>
                          <div className="text-sm text-white/80 mt-1">{notification.message}</div>
                          <div className="text-xs text-white/60 mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🔔</div>
                    <div className="font-bold mb-2">No notifications</div>
                    <div className="text-sm text-white/60">You're all caught up!</div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Panel */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="font-black text-lg mb-3">Settings</h3>
                
                {/* Profile Section */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 mb-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <User size={18} /> Profile Settings
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/60">Full Name</div>
                        <div className="font-medium">{userData?.displayName || 'Not set'}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingField('displayName');
                          setEditValue(userData?.displayName || '');
                        }}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/60">Email</div>
                        <div className="font-medium">{user?.email}</div>
                      </div>
                      {!user?.emailVerified && (
                        <button 
                          onClick={() => sendEmailVerification(user)}
                          className="text-xs px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/60">Phone</div>
                        <div className="font-medium">{userData?.phone || 'Not set'}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingField('phone');
                          setEditValue(userData?.phone || '');
                        }}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/60">Referral Code</div>
                        <div className="font-mono font-medium">{userData?.referralCode || 'Loading...'}</div>
                      </div>
                      <button 
                        onClick={copyReferralCode}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 mb-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Shield size={18} /> Security
                  </h4>
                  
                  {!showChangePassword ? (
                    <button 
                      onClick={() => setShowChangePassword(true)}
                      className="w-full py-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl font-medium hover:bg-white/25 transition-all"
                    >
                      Change Password
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Current Password</div>
                        <input
                          type="password"
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">New Password</div>
                        <input
                          type="password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Confirm Password</div>
                        <input
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handlePasswordChange}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                        >
                          Update Password
                        </button>
                        <button 
                          onClick={() => setShowChangePassword(false)}
                          className="flex-1 py-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl font-medium hover:bg-white/25 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Actions */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15">
                  <h4 className="font-bold mb-3">Account Actions</h4>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => navigate('/help')}
                      className="w-full py-3 text-left px-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                      <HelpCircle size={18} />
                      <span>Help & Support</span>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/privacy')}
                      className="w-full py-3 text-left px-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                      <Shield size={18} />
                      <span>Privacy Policy</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                          signOut(auth).then(() => navigate('/login'));
                        }
                      }}
                      className="w-full py-3 text-left px-4 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-3"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Side Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDrawer(false)}
          ></div>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-2xl border-r border-white/20 shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="font-bold">{userData?.displayName || 'User'}</div>
                    <div className="text-sm text-white/60 truncate">{user?.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-sm text-white/60">Account Status</div>
                  <div className="font-bold text-green-400 flex items-center gap-2">
                    <CheckCircle size={16} /> Verified User
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-sm text-white/60">Member Since</div>
                  <div className="font-bold">
                    {userData?.createdAt ? formatDate(userData.createdAt) : 'Recently'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                {[
                  { label: 'Dashboard', icon: BarChart, action: () => { setActiveTab('overview'); setShowDrawer(false); } },
                  { label: 'My Profile', icon: User, action: () => { setActiveTab('settings'); setShowDrawer(false); } },
                  { label: 'My Tickets', icon: Ticket, action: () => { setActiveTab('tickets'); setShowDrawer(false); } },
                  { label: 'Referrals', icon: Users, action: () => { setActiveTab('referrals'); setShowDrawer(false); } },
                  { label: 'Notifications', icon: Bell, action: () => { setActiveTab('notifications'); setShowDrawer(false); } },
                  { label: 'Logout', icon: LogOut, action: () => signOut(auth).then(() => navigate('/login')), color: 'text-red-400' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all text-left"
                    >
                      <Icon size={20} className={item.color || 'text-white/70'} />
                      <span className={item.color || ''}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Top-up Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/20 shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-xl">Top Up Balance</h3>
                <button 
                  onClick={() => {
                    setShowWalletModal(false);
                    setPaymentError(null);
                    setProcessingPayment(false);
                  }}
                  className="p-2 rounded-xl hover:bg-white/10 transition-all"
                  disabled={processingPayment}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-white/60 mb-2">Amount (₦)</div>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-2xl font-bold"
                  disabled={processingPayment}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1000, 2500, 5000, 10000, 25000, 50000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className="py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
                    disabled={processingPayment}
                  >
                    ₦{amount.toLocaleString()}
                  </button>
                ))}
              </div>
              
              <div className="bg-white/5 rounded-xl p-3 mb-4">
                <div className="text-sm text-white/60">Payment Method</div>
                <div className="font-bold flex items-center gap-2">
                  <CreditCard size={16} /> Card Payment
                </div>
                <div className="text-xs text-white/60">Secure payment powered by Paystack</div>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                  <div className="text-sm text-red-400">{paymentError}</div>
                </div>
              )}
              
              <button 
                onClick={handleTopUp}
                disabled={processingPayment || !topUpAmount || parseFloat(topUpAmount) <= 0}
                className={`w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl transition-all ${
                  processingPayment ? 'opacity-70' : 'hover:shadow-xl hover:shadow-green-500/40'
                }`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Proceed to Pay ₦${topUpAmount ? parseFloat(topUpAmount).toLocaleString() : '0'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/20 shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-xl">Withdraw Funds</h3>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-white/60 mb-2">Amount (₦)</div>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-2xl font-bold"
                />
                <div className="text-xs text-white/60 mt-1">
                  Available: {formatCurrency(userBalance)} • Min: ₦1,000
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-white/60 mb-2">Withdrawal Method</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWithdrawMethod('bank')}
                    className={`py-3 rounded-xl transition-all ${
                      withdrawMethod === 'bank' 
                        ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/50' 
                        : 'bg-white/10 border border-white/10 hover:bg-white/15'
                    }`}
                  >
                    Bank Transfer
                  </button>
                  <button
                    onClick={() => setWithdrawMethod('mobile')}
                    className={`py-3 rounded-xl transition-all ${
                      withdrawMethod === 'mobile' 
                        ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50' 
                        : 'bg-white/10 border border-white/10 hover:bg-white/15'
                    }`}
                  >
                    Mobile Money
                  </button>
                </div>
              </div>
              
              {withdrawMethod === 'bank' && (
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="text-sm text-white/60 mb-1">Account Number</div>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      placeholder="Enter account number"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-1">Account Name</div>
                    <input
                      type="text"
                      value={bankDetails.accountName}
                      onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                      placeholder="Enter account name"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-1">Bank Name</div>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                      placeholder="Enter bank name"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-white/5 rounded-xl p-3 mb-4">
                <div className="text-sm text-white/60">Processing Time</div>
                <div className="font-bold">24-48 hours</div>
                <div className="text-xs text-white/60">Withdrawals are processed within 1-2 business days</div>
              </div>
              
              <button 
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < 1000 || parseFloat(withdrawAmount) > userBalance}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Field Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/20 shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-xl">
                  Edit {editingField === 'displayName' ? 'Name' : editingField}
                </h3>
                <button 
                  onClick={() => {
                    setEditingField(null);
                    setEditValue('');
                  }}
                  className="p-2 rounded-xl hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter ${editingField === 'displayName' ? 'your name' : editingField}`}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleProfileUpdate(editingField)}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => {
                    setEditingField(null);
                    setEditValue('');
                  }}
                  className="flex-1 py-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl font-medium hover:bg-white/25 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-xs w-full border border-white/25 shadow-2xl">
            <div className="p-5 text-center">
              <div className={`w-20 h-20 ${
                successModal.type === 'deposit' ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30' :
                successModal.type === 'withdrawal' ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30' :
                successModal.type === 'ticket' ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30' :
                'bg-gradient-to-r from-purple-500/30 to-pink-500/30'
              } backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20`}>
                <CheckCircle size={32} className={
                  successModal.type === 'deposit' ? 'text-green-400' :
                  successModal.type === 'withdrawal' ? 'text-blue-400' :
                  successModal.type === 'ticket' ? 'text-yellow-400' :
                  'text-purple-400'
                } />
              </div>
              <h3 className="font-black text-xl mb-2 text-white">{successModal.title}</h3>
              <p className="text-sm text-white/80 mb-3">
                {successModal.message}
              </p>
              {successModal.details && (
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 mb-4 border border-white/15">
                  <div className="text-xs font-medium text-white/70 mb-1">Details:</div>
                  <div className="text-xs font-mono text-green-400 break-words">
                    {successModal.details}
                  </div>
                </div>
              )}
              <button 
                onClick={successModal.onClose}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all mb-2"
              >
                {successModal.buttonText || 'Continue'}
              </button>
              {successModal.type === 'ticket' && (
                <button 
                  onClick={() => {
                    successModal.onClose();
                    navigate('/dashboard?tab=tickets');
                  }}
                  className="w-full py-2 text-white/80 hover:text-white transition-colors text-sm"
                >
                  View My Tickets
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/15 backdrop-blur-2xl border-t border-white/25 z-40 py-1.5 lg:hidden">
        <div className="flex">
          {[
            { id: 'overview', label: 'Home', icon: BarChart },
            { id: 'tickets', label: 'Tickets', icon: Ticket },
            { id: 'referrals', label: 'Refer', icon: Users },
            { id: 'notifications', label: 'Alerts', icon: Bell },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center relative transition-all ${
                  activeTab === item.id ? 'text-yellow-400' : 'text-white/80'
                }`}
              >
                {activeTab === item.id && (
                  <div className="absolute top-0 w-3/4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-b-full"></div>
                )}
                <div className={`p-1.5 rounded-lg ${activeTab === item.id ? 'bg-white/15 backdrop-blur-sm' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default UserDashboard;