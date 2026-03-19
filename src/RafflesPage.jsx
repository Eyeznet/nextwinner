import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Firebase imports with selective imports
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  startAfter, 
  doc, 
  getDoc,
  increment, 
  serverTimestamp,
  updateDoc, 
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { app } from './firebaseConfig';

// Optimized icon imports - only what's needed initially
import { 
  Trophy, DollarSign, Clock, User, Ticket, 
  Grid, List, ChevronDown, X, Search, Home, MessageCircle,
  Wallet, Zap, Package, AlertTriangle,
  Eye, ShoppingCart, Plus, Minus, Calendar,
  Target, CheckCircle, CreditCard, AlertCircle
} from 'lucide-react';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_8659b5b554f5e935476df72b2e0950d3b1f560ad';

// Add CSS for animations
const styles = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slideDown {
    animation: slideDown 0.2s ease-out;
  }
`;

const RafflesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // State management
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceFilter, setPriceFilter] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState({});
  const [showQuickBuyModal, setShowQuickBuyModal] = useState(null);
  const [buySuccess, setBuySuccess] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRaffles, setFilteredRaffles] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalRaffles, setTotalRaffles] = useState(0);
  const [stats, setStats] = useState({
    totalRaffles: 0,
    totalValue: '₦0',
    endingSoon: 0,
    nearlySoldOut: 0
  });

  // Payment states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('balance');

  // State for Firebase data
  const [raffles, setRaffles] = useState([]);
  const [loadingRaffles, setLoadingRaffles] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  // Refs for optimization
  const searchInputRef = useRef(null);
  const observerRef = useRef(null);
  const raffleCache = useRef({});
  const userBalanceCache = useRef({});
  const filterTimeoutRef = useRef(null);

  // Optimized categories - all categories included
  const categories = [
    { id: 'all', label: '🔥 All Raffles', color: 'from-red-500 to-orange-500' },
    { id: 'featured', label: '⭐ Featured', color: 'from-yellow-500 to-orange-500' },
    { id: 'cars', label: '🚗 Cars', color: 'from-blue-500 to-cyan-500' },
    { id: 'cash', label: '💰 Cash', color: 'from-green-500 to-emerald-500' },
    { id: 'electronics', label: '📱 Electronics', color: 'from-purple-500 to-pink-500' },
    { id: 'property', label: '🏠 Property', color: 'from-yellow-500 to-orange-500' },
    { id: 'travel', label: '✈️ Travel', color: 'from-blue-500 to-indigo-500' },
    { id: 'luxury', label: '💎 Luxury', color: 'from-pink-500 to-rose-500' },
    { id: 'food', label: '🍔 Food', color: 'from-orange-500 to-red-500' },
    { id: 'watches', label: '⌚ Watches', color: 'from-gray-500 to-slate-500' },
    { id: 'gaming', label: '🎮 Gaming', color: 'from-green-500 to-lime-500' },
    { id: 'fashion', label: '👕 Fashion', color: 'from-pink-500 to-purple-500' },
    { id: 'education', label: '📚 Education', color: 'from-blue-500 to-cyan-500' },
    { id: 'business', label: '💼 Business', color: 'from-gray-700 to-gray-900' },
    { id: 'home', label: '🏡 Home', color: 'from-yellow-500 to-amber-500' },
    { id: 'others', label: '📦 Others', color: 'from-gray-500 to-slate-500' },
    { id: 'ending', label: '⏰ Ending Soon', color: 'from-red-500 to-pink-500' },
    { id: 'almost', label: '🎯 Almost Sold', color: 'from-green-500 to-emerald-500' }
  ];

  // Sort options
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'ending', label: 'Ending Soon' },
    { id: 'popular', label: 'Most Popular' }
  ];

  // Check if draw date has passed
  const isDrawDatePassed = useCallback((drawDate) => {
    if (!drawDate) return false;
    const now = new Date();
    return drawDate < now;
  }, []);

  // URL query params for category
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');
    if (categoryFromUrl && categories.find(c => c.id === categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [location]);

  // Load Paystack Script only when needed
  useEffect(() => {
    if (!isLoggedIn || paystackLoaded) return;

    const loadPaystack = () => {
      if (window.PaystackPop) {
        setPaystackLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.defer = true;
      script.onload = () => setPaystackLoaded(true);
      document.body.appendChild(script);
    };

    loadPaystack();
  }, [isLoggedIn, paystackLoaded]);

  // Check auth state with optimized listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoggedIn(!!currentUser);
      setUser(currentUser);
      
      if (currentUser) {
        await loadUserData(currentUser.uid);
      } else {
        setWalletBalance(0);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Load user data with cache
  const loadUserData = useCallback(async (userId) => {
    if (userBalanceCache.current[userId]) {
      setWalletBalance(userBalanceCache.current[userId]);
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const balance = userData.balance || 0;
        setWalletBalance(balance);
        userBalanceCache.current[userId] = balance;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setWalletBalance(0);
    }
  }, [db]);

  // Fetch all raffles with optimized queries
  useEffect(() => {
    let mounted = true;
    
    const fetchRaffles = async () => {
      if (!mounted) return;
      
      try {
        setLoadingRaffles(true);
        setLoadingError(null);
        
        // Base query with optimized Firestore reads
        let rafflesQuery = query(
          collection(db, 'raffles'),
          where('status', 'in', ['active', 'Active']),
          orderBy('createdAt', 'desc'),
          limit(12)
        );
        
        const querySnapshot = await getDocs(rafflesQuery);
        
        if (!mounted) return;
        
        if (querySnapshot.empty) {
          setRaffles([]);
          setLoadingRaffles(false);
          return;
        }
        
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        setHasMore(querySnapshot.docs.length === 12);
        
        // Process data efficiently
        const { rafflesData, stats: newStats } = processRaffleData(querySnapshot);
        
        if (mounted) {
          setRaffles(rafflesData);
          setTotalRaffles(rafflesData.length);
          setStats(newStats);
        }
        
      } catch (error) {
        console.error('❌ Error fetching raffles:', error);
        if (mounted) {
          setLoadingError(`Failed to load raffles: ${error.message}`);
          // Use cached data if available
          if (Object.keys(raffleCache.current).length > 0) {
            const cachedRaffles = Object.values(raffleCache.current);
            setRaffles(cachedRaffles.slice(0, 12));
            setTotalRaffles(cachedRaffles.length);
          }
        }
      } finally {
        if (mounted) {
          setLoadingRaffles(false);
        }
      }
    };

    fetchRaffles();
    
    return () => {
      mounted = false;
    };
  }, [db]);

  // Process raffle data efficiently
  const processRaffleData = useCallback((querySnapshot) => {
    const rafflesData = [];
    let totalValue = 0;
    let endingSoonCount = 0;
    let nearlySoldOutCount = 0;
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Convert Firestore Timestamp to Date
      const drawDate = data.drawDate?.toDate ? data.drawDate.toDate() : new Date(data.drawDate || data.endDate);
      const now = new Date();
      const hoursUntilDraw = (drawDate - now) / (1000 * 60 * 60);
      
      const raffle = {
        id: docSnap.id,
        title: data.title || 'Untitled Raffle',
        value: data.value || '₦0',
        ticketPrice: data.ticketPrice || 1000,
        ticketsSold: data.ticketsSold || 0,
        totalTickets: data.totalTickets || 100,
        category: data.category || 'others',
        image: data.image || data.images?.[0] || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        drawDate: drawDate,
        featured: data.featured || false,
        status: data.status || 'active',
        description: data.description || '',
        rules: data.rules || [],
        createdBy: data.createdBy || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        // Calculate derived fields
        progress: ((data.ticketsSold || 0) / (data.totalTickets || 100)) * 100,
        ticketsLeft: (data.totalTickets || 100) - (data.ticketsSold || 0),
        percentageSold: ((data.ticketsSold || 0) / (data.totalTickets || 100)) * 100,
        isEndingSoon: hoursUntilDraw < 24,
        isNearlySoldOut: ((data.totalTickets || 100) - (data.ticketsSold || 0)) < 20,
        isDrawDatePassed: isDrawDatePassed(drawDate)
      };
      
      rafflesData.push(raffle);
      raffleCache.current[docSnap.id] = raffle;
      
      // Calculate stats
      totalValue += extractNumericValue(data.value);
      
      if (raffle.isEndingSoon) endingSoonCount++;
      if (raffle.isNearlySoldOut) nearlySoldOutCount++;
    });
    
    return {
      rafflesData,
      stats: {
        totalRaffles: rafflesData.length,
        totalValue: `₦${formatLargeNumber(totalValue)}`,
        endingSoon: endingSoonCount,
        nearlySoldOut: nearlySoldOutCount
      }
    };
  }, [isDrawDatePassed]);

  // Helper function to extract numeric value
  const extractNumericValue = (value) => {
    if (typeof value === 'string') {
      const valueMatch = value.match(/[\d,]+/);
      if (valueMatch) {
        return parseInt(valueMatch[0].replace(/,/g, '')) || 0;
      }
    } else if (typeof value === 'number') {
      return value;
    }
    return 0;
  };

  // Format large numbers
  const formatLargeNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return formatNumber(num);
  };

  // Load more raffles with optimized batch processing
  const loadMoreRaffles = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      let rafflesQuery = query(
        collection(db, 'raffles'),
        where('status', 'in', ['active', 'Active']),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(8) // Reduced from 12 for better performance
      );
      
      const querySnapshot = await getDocs(rafflesQuery);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        return;
      }
      
      const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(newLastVisible);
      setHasMore(querySnapshot.docs.length === 8);
      
      const { rafflesData } = processRaffleData(querySnapshot);
      
      setRaffles(prev => [...prev, ...rafflesData]);
      setTotalRaffles(prev => prev + rafflesData.length);
      
    } catch (error) {
      console.error('Error loading more raffles:', error);
      setLoadingError('Failed to load more raffles');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, lastVisible, db, processRaffleData]);

  // Intersection Observer with cleanup
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreRaffles();
        }
      },
      { threshold: 0.1 } // Reduced threshold for earlier loading
    );
    
    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadingMore, loadMoreRaffles]);

  // Handle scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showSearchBar]);

  // Debounced filter effect
  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    filterTimeoutRef.current = setTimeout(() => {
      const filtered = getFilteredRaffles();
      setFilteredRaffles(filtered);
    }, 150); // Debounce for better performance
    
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [searchQuery, raffles, selectedCategory, sortBy, priceFilter]);

  // Filter raffles based on selections
  const getFilteredRaffles = useCallback(() => {
    let filtered = [...raffles];

    // Category filter
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'featured':
          filtered = filtered.filter(r => r.featured);
          break;
        case 'ending':
          filtered = filtered.filter(r => r.isEndingSoon);
          break;
        case 'almost':
          filtered = filtered.filter(r => r.isNearlySoldOut);
          break;
        default:
          filtered = filtered.filter(r => r.category === selectedCategory);
      }
    }

    // Price filter
    if (priceFilter) {
      filtered = filtered.filter(r => {
        const price = r.ticketPrice;
        switch (priceFilter) {
          case 'under-1000': return price < 1000;
          case '1000-5000': return price >= 1000 && price <= 5000;
          case '5000-10000': return price > 5000 && price <= 10000;
          case 'over-10000': return price > 10000;
          default: return true;
        }
      });
    }

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'price-low':
          return a.ticketPrice - b.ticketPrice;
        case 'price-high':
          return b.ticketPrice - a.ticketPrice;
        case 'ending':
          return a.drawDate - b.drawDate;
        case 'popular':
          return b.ticketsSold - a.ticketsSold;
        default:
          return 0;
      }
    });

    return filtered;
  }, [raffles, selectedCategory, priceFilter, searchQuery, sortBy]);

  // Handle ticket quantity change
  const updateTicketQuantity = useCallback((raffleId, change) => {
    setTicketQuantity(prev => {
      const current = prev[raffleId] || 1;
      const newValue = Math.max(1, Math.min(20, current + change));
      return { ...prev, [raffleId]: newValue };
    });
  }, []);

  // Format functions
  const formatNumber = useCallback((num) => {
    return num?.toLocaleString('en-US') || '0';
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'Coming soon';
    try {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Coming soon';
    }
  }, []);

  const formatTimeLeft = useCallback((date) => {
    if (!date) return '';
    const now = new Date();
    const diff = date - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }, []);

  // Calculate odds
  const calculateOdds = useCallback((raffle) => {
    if (!raffle.totalTickets || raffle.totalTickets === 0) return 'N/A';
    return `1 in ${formatNumber(raffle.totalTickets)}`;
  }, [formatNumber]);

  // Payment handlers with batch operations
  const handleQuickBuy = async (raffle) => {
    if (!isLoggedIn || !user) {
      navigate(`/login?returnUrl=/raffles`);
      return;
    }

    // Check if draw date has passed
    if (isDrawDatePassed(raffle.drawDate)) {
      setPaymentError('This raffle has ended. Ticket sales are closed.');
      return;
    }

    const quantity = ticketQuantity[raffle.id] || 1;
    const totalAmount = quantity * raffle.ticketPrice;
    
    setProcessingPayment(true);
    setPaymentError(null);
    setShowQuickBuyModal(raffle);

    try {
      if (selectedPaymentMethod === 'balance' && walletBalance >= totalAmount) {
        await handleBalancePayment(raffle, quantity, totalAmount);
      } else {
        handlePaystackPayment(raffle, quantity, totalAmount);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError('Payment failed. Please try again.');
      setProcessingPayment(false);
      setShowQuickBuyModal(null);
    }
  };

  const handleBalancePayment = async (raffle, quantity, amount) => {
    const batch = writeBatch(db);
    
    try {
      // Update user balance
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        balance: increment(-amount),
        lastActivity: serverTimestamp(),
        'stats.totalSpent': increment(amount),
        'stats.ticketsPurchased': increment(quantity)
      });

      // Create transaction record
      const transactionsRef = doc(collection(db, 'transactions'));
      batch.set(transactionsRef, {
        userId: user.uid,
        amount: amount,
        date: new Date().toISOString(),
        description: `${quantity} ticket(s) for ${raffle.title}`,
        type: 'purchase',
        status: 'completed',
        method: 'balance',
        reference: `BALANCE_${Date.now()}`,
        raffleId: raffle.id,
        raffleTitle: raffle.title,
        ticketQuantity: quantity,
        createdAt: serverTimestamp(),
        userEmail: user.email
      });

      // Update raffle tickets
      const raffleRef = doc(db, 'raffles', raffle.id);
      batch.update(raffleRef, {
        ticketsSold: increment(quantity),
        updatedAt: serverTimestamp()
      });

      // Create tickets in batch
      const ticketsRef = collection(db, 'tickets');
      const ticketNumbers = Array.from({ length: quantity }, (_, i) => 
        `NXTWINNER-${raffle.id.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      );

      ticketNumbers.forEach(ticketNumber => {
        const ticketRef = doc(ticketsRef);
        batch.set(ticketRef, {
          ticketNumber,
          userId: user.uid,
          raffleId: raffle.id,
          raffleTitle: raffle.title,
          raffleValue: raffle.value,
          purchaseDate: serverTimestamp(),
          drawDate: raffle.drawDate,
          status: 'active',
          price: raffle.ticketPrice,
          checkedIn: false
        });
      });

      // Commit all writes in a single batch
      await batch.commit();

      // Update local state
      const newBalance = walletBalance - amount;
      userBalanceCache.current[user.uid] = newBalance;
      setWalletBalance(newBalance);

      // Update raffles state
      setRaffles(prev => prev.map(r => 
        r.id === raffle.id 
          ? { ...r, ticketsSold: r.ticketsSold + quantity }
          : r
      ));

      // Show success
      setBuySuccess({
        raffleId: raffle.id,
        quantity,
        total: amount,
        ticketNumbers: ticketNumbers,
        raffleTitle: raffle.title
      });
      setTicketQuantity(prev => ({ ...prev, [raffle.id]: 1 }));
      setProcessingPayment(false);
      setShowQuickBuyModal(null);
      
      setTimeout(() => setBuySuccess(null), 5000);
      
    } catch (error) {
      console.error('Balance payment error:', error);
      setPaymentError('Payment failed. Please try again.');
      throw error;
    }
  };

  const handlePaystackPayment = (raffle, quantity, amount) => {
    if (!window.PaystackPop && !paystackLoaded) {
      setPaymentError('Payment system not available. Please refresh.');
      setProcessingPayment(false);
      setShowQuickBuyModal(null);
      return;
    }

    const reference = `NXTWINNER_${Date.now()}_${raffle.id}`;
    
    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: amount * 100,
        ref: reference,
        currency: 'NGN',
        metadata: {
          raffleId: raffle.id,
          ticketQuantity: quantity,
          userId: user.uid,
          raffleTitle: raffle.title
        },
        callback: async (response) => {
          try {
            // Create transaction record
            await createTransactionRecord('paystack', response, raffle, quantity, amount);
            const ticketNumbers = await createTicketsBatch(raffle, quantity);
            await updateRaffleTickets(raffle.id, quantity);
            
            setBuySuccess({
              raffleId: raffle.id,
              quantity,
              total: amount,
              ticketNumbers: ticketNumbers,
              raffleTitle: raffle.title
            });
            setTicketQuantity(prev => ({ ...prev, [raffle.id]: 1 }));
            setProcessingPayment(false);
            setShowQuickBuyModal(null);
            
            setTimeout(() => setBuySuccess(null), 5000);
          } catch (error) {
            console.error('Error finalizing:', error);
            setPaymentError('Payment succeeded but ticket creation failed. Contact support.');
          }
        },
        onClose: () => {
          setProcessingPayment(false);
          setShowQuickBuyModal(null);
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('PayStack setup error:', error);
      setPaymentError('Error initializing payment. Please try again.');
      setProcessingPayment(false);
      setShowQuickBuyModal(null);
    }
  };

  const createTransactionRecord = async (method, paystackResponse, raffle, quantity, amount) => {
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: amount,
        date: new Date().toISOString(),
        description: `${quantity} ticket(s) for ${raffle.title}`,
        type: 'purchase',
        status: 'completed',
        method: method,
        reference: paystackResponse?.reference || `BALANCE_${Date.now()}`,
        raffleId: raffle.id,
        raffleTitle: raffle.title,
        ticketQuantity: quantity,
        createdAt: serverTimestamp(),
        userEmail: user.email
      });
    } catch (error) {
      console.error('Transaction record error:', error);
      throw error;
    }
  };

  const createTicketsBatch = async (raffle, quantity) => {
    const batch = writeBatch(db);
    const ticketsRef = collection(db, 'tickets');
    const ticketNumbers = [];
    
    for (let i = 0; i < quantity; i++) {
      const ticketNumber = `NXTWINNER-${raffle.id.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      ticketNumbers.push(ticketNumber);
      
      const ticketRef = doc(ticketsRef);
      batch.set(ticketRef, {
        ticketNumber,
        userId: user.uid,
        raffleId: raffle.id,
        raffleTitle: raffle.title,
        raffleValue: raffle.value,
        purchaseDate: serverTimestamp(),
        drawDate: raffle.drawDate,
        status: 'active',
        price: raffle.ticketPrice,
        checkedIn: false
      });
    }
    
    await batch.commit();
    return ticketNumbers;
  };

  const updateRaffleTickets = async (raffleId, quantity) => {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      await updateDoc(raffleRef, {
        ticketsSold: increment(quantity),
        updatedAt: serverTimestamp()
      });
      
      // Update local cache
      if (raffleCache.current[raffleId]) {
        raffleCache.current[raffleId].ticketsSold += quantity;
      }
      
      // Update raffles state
      setRaffles(prev => prev.map(r => 
        r.id === raffleId 
          ? { ...r, ticketsSold: r.ticketsSold + quantity }
          : r
      ));
    } catch (error) {
      console.error('Error updating raffle:', error);
    }
  };

  // Loading skeleton
  if (loadingRaffles && raffles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <header className="fixed top-0 left-0 right-0 bg-white/12 backdrop-blur-2xl border-b border-white/20 z-50">
          <div className="px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-yellow-500/90 to-orange-500/90 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-black bg-gradient-to-r from-yellow-400/90 to-orange-400/90 bg-clip-text text-transparent">
                  NEXTWINNER
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse"></div>
                <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-16 px-3">
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Filters skeleton */}
          <div className="flex gap-2 overflow-hidden mb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-28 h-10 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Raffle cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl overflow-hidden">
                <div className="h-48 bg-white/10 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-white/10 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-6 bg-white/10 rounded animate-pulse mb-3 w-1/2"></div>
                  <div className="h-2 bg-white/10 rounded animate-pulse mb-1"></div>
                  <div className="h-10 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
      {/* Add styles */}
      <style>{styles}</style>
      
      {/* Enhanced Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-white/12 backdrop-blur-2xl shadow-xl' : 'bg-white/8 backdrop-blur-xl'
      }`}>
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-500/90 to-orange-500/90 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 border border-white/20">
                <Zap size={20} className="text-white" />
              </div>
              <div className="leading-tight">
  <h1 className="text-xl font-black bg-gradient-to-r from-yellow-400/90 to-orange-400/90 bg-clip-text text-transparent">
    NEXTWINNER
  </h1>
  <p className="text-[9px]  tracking-widest text-white/60">
    (A Subsidiary of SmartchildNation)
  </p>
</div>

            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              {/* Balance Display */}
              {isLoggedIn && (
                <button 
                  onClick={() => navigate('/dashboard?tab=balance')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl text-sm font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all border border-blue-500/30"
                >
                  <Wallet size={14} />
                  <span className="font-bold">₦{walletBalance.toLocaleString()}</span>
                </button>
              )}
              
              {/* Search Icon */}
              <button 
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10"
              >
                <Search size={18} />
              </button>
              
              {/* Back to Home */}
              <button 
                onClick={() => navigate('/')}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10"
              >
                <Home size={18} />
              </button>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          {showSearchBar && (
            <div className="mt-2 bg-white/12 backdrop-blur-2xl rounded-xl border border-white/20 shadow-2xl p-2 animate-slideDown">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-white/70" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search raffles, categories, prizes..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {/* Search Results */}
              {searchQuery.trim() !== '' && filteredRaffles.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {filteredRaffles.slice(0, 5).map(raffle => (
                    <div 
                      key={raffle.id}
                      className="p-2 hover:bg-white/10 rounded-lg cursor-pointer border-b border-white/5 last:border-0"
                      onClick={() => {
                        navigate(`/item/${raffle.id}`);
                        setShowSearchBar(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={raffle.image} 
                          alt={raffle.title} 
                          className="w-8 h-8 rounded-lg object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium">{raffle.title}</div>
                          <div className="text-xs text-white/60">{raffle.category} • ₦{formatNumber(raffle.ticketPrice)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Banner */}
        <div className="relative mx-3 mt-2 rounded-3xl overflow-hidden">
          <div className="relative h-40 md:h-48">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="All Raffles Banner"
              className="w-full h-full object-cover brightness-110 contrast-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 opacity-60"></div>
            <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">All Active Raffles</h1>
              <p className="text-sm md:text-base text-white/95 mt-2 drop-shadow">
                Browse, filter, and win amazing prizes
              </p>
              <div className="mt-3 flex gap-2">
                <div className="px-3 py-1 bg-white/25 backdrop-blur-xl border border-white/40 text-white text-xs font-bold rounded-full">
                  {totalRaffles} Active Raffles
                </div>
                <div className="px-3 py-1 bg-white/25 backdrop-blur-xl border border-white/40 text-white text-xs font-bold rounded-full">
                  {stats.endingSoon} Ending Soon
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mx-2 mt-2 grid grid-cols-4 md:grid-cols-4 gap-2">
          {[
            { 
              label: 'Total Raffles', 
              value: stats.totalRaffles, 
              color: 'text-blue-400',
              bgColor: 'from-blue-500/10 to-cyan-500/10'
            },
            { 
              label: 'Total Prize Value', 
              value: stats.totalValue, 
              color: 'text-green-400',
              bgColor: 'from-green-500/10 to-emerald-500/10'
            },
            { 
              label: 'Ending Soon', 
              value: stats.endingSoon, 
              color: 'text-red-400',
              bgColor: 'from-red-500/10 to-pink-500/10'
            },
            { 
              label: 'Nearly Sold Out', 
              value: stats.nearlySoldOut, 
              color: 'text-yellow-400',
              bgColor: 'from-yellow-500/10 to-orange-500/10'
            }
          ].map((stat, index) => (
            <div
              key={index}
              className={`
                relative
                bg-gradient-to-r ${stat.bgColor} 
                backdrop-blur-xl 
                rounded-xl md:rounded-2xl
                p-3
                text-center
                border border-white/20
                before:absolute before:inset-0 before:rounded-xl md:before:rounded-2xl
                before:border before:border-white/30
                before:pointer-events-none
                shadow-lg shadow-white/10
                overflow-hidden
              `}
            >
              {/* Neon-like glowing border */}
              <div className="absolute inset-0 rounded-xl md:rounded-2xl border border-white/10 pointer-events-none shadow-[0_0_10px_#ffffff20]"></div>

              <div className={`text-lg md:text-xl font-black ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[9px] md:text-[10px] text-white/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter and Sort Section */}
        <div className="mt-3 px-2 md:px-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3 mb-3 md:mb-4">
            <div>
              <h2 className="text-base md:text-lg font-black">
                Browse All Raffles
              </h2>
              <p className="text-xs md:text-sm text-white/70">
                Filter by category, price, or sort by your preference
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xl rounded-xl p-0.5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 md:p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 md:p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-2.5 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 appearance-none pr-7"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/60"
                />
              </div>
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-3">
            <div className="text-xs font-bold text-white mb-1.5">
              Filter by Price
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setPriceFilter(null)}
                className={`px-2.5 py-1 rounded-xl text-xs md:text-sm transition-all ${
                  priceFilter === null
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                All Prices
              </button>

              <button
                onClick={() => setPriceFilter('under-1000')}
                className={`px-2.5 py-1 rounded-xl text-xs md:text-sm transition-all ${
                  priceFilter === 'under-1000'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                Under ₦1,000
              </button>

              <button
                onClick={() => setPriceFilter('1000-5000')}
                className={`px-2.5 py-1 rounded-xl text-xs md:text-sm transition-all ${
                  priceFilter === '1000-5000'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                ₦1,000 - ₦5,000
              </button>

              <button
                onClick={() => setPriceFilter('5000-10000')}
                className={`px-2.5 py-1 rounded-xl text-xs md:text-sm transition-all ${
                  priceFilter === '5000-10000'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                ₦5,000 - ₦10,000
              </button>

              <button
                onClick={() => setPriceFilter('over-10000')}
                className={`px-2.5 py-1 rounded-xl text-xs md:text-sm transition-all ${
                  priceFilter === 'over-10000'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-white/90'
                }`}
              >
                Over ₦10,000
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all backdrop-blur-xl ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white font-bold shadow-lg border border-white/30`
                      : 'bg-white/10 text-white/90 border border-white/10 hover:bg-white/15'
                  }`}
                >
                  <span className="text-xs md:text-sm">
                    {category.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Raffle Grid/List */}
        <div className="px-2">
          {loadingError && (
            <div className="mx-1 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-2xl rounded-2xl border border-white/20 text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle size={20} className="text-red-400" />
                <h3 className="font-bold text-white">Connection Error</h3>
              </div>
              <p className="text-sm text-white/80 mb-3">
                Showing cached data. Some features may be limited.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Retry Connection
              </button>
            </div>
          )}

          {getFilteredRaffles().length === 0 ? (
            <div className="mx-1 p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-bold text-white mb-2">No Raffles Found</h3>
              <p className="text-sm text-white/80 mb-4">
                Try adjusting your filters or check back later for new raffles.
              </p>
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceFilter(null);
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
                  {getFilteredRaffles().map((raffle) => (
                    <RaffleCard 
                      key={raffle.id}
                      raffle={raffle}
                      ticketQuantity={ticketQuantity}
                      updateTicketQuantity={updateTicketQuantity}
                      handleQuickBuy={handleQuickBuy}
                      navigate={navigate}
                      processingPayment={processingPayment}
                      formatNumber={formatNumber}
                      formatDate={formatDate}
                      formatTimeLeft={formatTimeLeft}
                      calculateOdds={calculateOdds}
                      isDrawDatePassed={isDrawDatePassed}
                    />
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-3">
                  {getFilteredRaffles().map((raffle) => (
                    <RaffleListItem 
                      key={raffle.id}
                      raffle={raffle}
                      ticketQuantity={ticketQuantity}
                      updateTicketQuantity={updateTicketQuantity}
                      handleQuickBuy={handleQuickBuy}
                      navigate={navigate}
                      processingPayment={processingPayment}
                      formatNumber={formatNumber}
                      formatDate={formatDate}
                      formatTimeLeft={formatTimeLeft}
                      calculateOdds={calculateOdds}
                      isDrawDatePassed={isDrawDatePassed}
                    />
                  ))}
                </div>
              )}

              {/* Load More Trigger */}
              {hasMore && (
                <div 
                  ref={observerRef}
                  className="mt-6 flex justify-center"
                >
                  {loadingMore ? (
                    <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <button 
                      onClick={loadMoreRaffles}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-white/25 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                      Load More Raffles
                    </button>
                  )}
                </div>
              )}

              {/* End of Results */}
              {!hasMore && getFilteredRaffles().length > 0 && (
                <div className="mt-6 text-center text-white/70 text-sm">
                  <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-3"></div>
                  You've reached the end! No more raffles to show.
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Quick Buy Modal */}
      {showQuickBuyModal && (
        <QuickBuyModal
          raffle={showQuickBuyModal}
          ticketQuantity={ticketQuantity}
          updateTicketQuantity={updateTicketQuantity}
          isLoggedIn={isLoggedIn}
          user={user}
          walletBalance={walletBalance}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          processingPayment={processingPayment}
          paymentError={paymentError}
          handleQuickBuy={handleQuickBuy}
          setShowQuickBuyModal={setShowQuickBuyModal}
          formatNumber={formatNumber}
          formatWalletBalance={() => `₦${walletBalance.toLocaleString()}`}
          navigate={navigate}
          isDrawDatePassed={isDrawDatePassed}
        />
      )}

      {/* Success Modal */}
      {buySuccess && (
        <SuccessModal
          buySuccess={buySuccess}
          setBuySuccess={setBuySuccess}
          navigate={navigate}
          formatNumber={formatNumber}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/15 backdrop-blur-2xl border-t border-white/25 z-40 py-1.5">
        <div className="flex">
          {[
            { id: 'home', label: 'Home', icon: Home, route: '/' },
            { id: 'raffles', label: 'Raffles', icon: Ticket, route: '/raffles', active: true },
            { id: 'winners', label: 'Winners', icon: Trophy, route: '/winners' },
             { id: 'draw', label: 'Live', icon: Clock, route: '/live-draw' },
                        { id: 'forum', label: 'Forum', icon: MessageCircle, route: '/forum' },
            { id: 'profile', label: isLoggedIn ? 'Me' : 'Login', icon: User, route: isLoggedIn ? '/dashboard' : '/login' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.route || item.active;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`flex-1 flex flex-col items-center justify-center relative transition-all ${
                  isActive ? 'text-yellow-400' : 'text-white/80'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 w-3/4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-b-full"></div>
                )}
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/15 backdrop-blur-sm' : ''}`}>
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

// Raffle Card Component for Grid View
const RaffleCard = ({ 
  raffle, 
  ticketQuantity, 
  updateTicketQuantity, 
  handleQuickBuy, 
  navigate, 
  processingPayment,
  formatNumber,
  formatDate,
  formatTimeLeft,
  calculateOdds,
  isDrawDatePassed
}) => {
  const progress = ((raffle.ticketsSold || 0) / (raffle.totalTickets || 100)) * 100;
  const drawDatePassed = isDrawDatePassed(raffle.drawDate);
  
  return (
    <div className={`bg-white/10 backdrop-blur-2xl rounded-xl md:rounded-2xl overflow-hidden border transition-all shadow-md md:shadow-lg group mb-2 mx-0.5 md:mb-0 md:mx-0 ${
      drawDatePassed ? 'border-gray-500/40' : 'border-white/20 hover:border-yellow-500/40'
    }`}>
      
      {/* Image with badges */}
<div className="relative h-32 md:h-48 overflow-hidden">
  <img
    src={raffle.image}
    alt={raffle.title}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    loading="lazy"
    onError={(e) => {
      e.target.src =
        'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80';
    }}
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

  {/* Badges */}
  <div className="absolute top-1 left-1 md:top-3 md:left-3 flex flex-col gap-0.5 md:gap-1">
    {raffle.featured && (
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[9px] md:text-[10px] px-1 py-[2px] md:px-1.5 md:py-0.5 rounded-md font-bold">
        FEATURED
      </div>
    )}
    {raffle.isEndingSoon && !drawDatePassed && (
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] md:text-[10px] px-1 py-[2px] md:px-1.5 md:py-0.5 rounded-md font-bold">
        ENDING SOON
      </div>
    )}
    {raffle.isNearlySoldOut && !drawDatePassed && (
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] md:text-[10px] px-1 py-[2px] md:px-1.5 md:py-0.5 rounded-md font-bold">
        ALMOST SOLD
      </div>
    )}
    {drawDatePassed && (
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white text-[9px] md:text-[10px] px-1 py-[2px] md:px-1.5 md:py-0.5 rounded-md font-bold">
        ENDED
      </div>
    )}
  </div>

  <div className="absolute bottom-0 left-0 right-0 p-1 md:p-4">
    <div className="text-xs md:text-sm font-bold text-white truncate">
      {raffle.title}
    </div>
    <div className="text-lg md:text-xl font-black text-yellow-400">
      {raffle.value}
    </div>
  </div>
</div>

{/* Details */}
<div className="p-[3px] md:p-4">

  {/* Progress Bar */}
  <div className="mb-1 md:mb-3">
    <div className="flex justify-between text-[10px] md:text-[11px] text-white/70 mb-[2px] md:mb-1">
      <span>{formatNumber(raffle.ticketsSold)} sold</span>
      <span>{formatNumber(raffle.totalTickets)} total</span>
    </div>

    <div className="h-1 md:h-2 bg-white/15 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          drawDatePassed
            ? 'bg-gradient-to-r from-gray-500 to-gray-700'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>

    <div className="flex justify-between text-[9px] md:text-[11px] text-white/60 mt-[2px]">
      <span>{raffle.ticketsLeft} left</span>
      <span>{progress.toFixed(0)}%</span>
    </div>
  </div>

  {/* Info Grid */}
  <div className="grid grid-cols-2 gap-[3px] md:gap-1 mb-1 md:mb-4">
    <div className="bg-white/5 rounded-md p-[3px] md:p-2">
      <div className="text-[9px] md:text-[10px] text-white/60">
        Ticket Price
      </div>
      <div className="text-xs md:text-sm font-bold">
        ₦{formatNumber(raffle.ticketPrice)}
      </div>
    </div>

    <div className="bg-white/5 rounded-md p-[3px] md:p-2">
      <div className="text-[9px] md:text-[10px] text-white/60">
        Draw Date
      </div>
      <div className="text-xs font-bold">
        {formatDate(raffle.drawDate)}
      </div>
    </div>

    <div className="bg-white/5 rounded-md p-[3px] md:p-2">
      <div className="text-[9px] md:text-[10px] text-white/60">
        Time Left
      </div>
      <div
        className={`text-xs font-bold ${
          drawDatePassed ? 'text-gray-400' : 'text-yellow-400'
        }`}
      >
        {drawDatePassed ? 'Ended' : formatTimeLeft(raffle.drawDate)}
      </div>
    </div>

    <div className="bg-white/5 rounded-md p-[3px] md:p-2">
      <div className="text-[9px] md:text-[10px] text-white/60">
        Your Odds
      </div>
      <div className="text-xs font-bold">
        {calculateOdds(raffle)}
      </div>
    </div>
  </div>

  {/* Ticket Control */}
  <div className="flex items-center justify-between mb-1 md:mb-4">
    <div>
      <div className="text-[9px] md:text-[11px] text-white/70">
        Select Quantity
      </div>
      <div className="flex items-center gap-[3px] md:gap-2">
        <button
          onClick={() => !drawDatePassed && updateTicketQuantity(raffle.id, -1)}
          className={`w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center ${
            drawDatePassed
              ? 'bg-white/5 cursor-not-allowed'
              : 'bg-white/15'
          }`}
          disabled={drawDatePassed}
        >
          <Minus size={14} />
        </button>

        <span className="text-sm md:text-lg font-bold min-w-[22px] text-center">
          {ticketQuantity[raffle.id] || 1}
        </span>

        <button
          onClick={() => !drawDatePassed && updateTicketQuantity(raffle.id, 1)}
          className={`w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center ${
            drawDatePassed
              ? 'bg-gray-500/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
          }`}
          disabled={drawDatePassed}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>

    <div className="text-right">
      <div className="text-[9px] md:text-[11px] text-white/70">
        Total
      </div>
      <div
        className={`text-base md:text-lg font-black ${
          drawDatePassed ? 'text-gray-400' : 'text-yellow-400'
        }`}
      >
        ₦
        {formatNumber(
          (ticketQuantity[raffle.id] || 1) * raffle.ticketPrice
        )}
      </div>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-[3px] md:gap-2">
    <button
      onClick={() => navigate(`/item/${raffle.id}`)}
      className="flex-1 py-1 md:py-2.5 bg-white/15 backdrop-blur-xl border border-white/25 rounded-lg text-xs md:text-sm font-medium hover:bg-white/25 transition-all"
    >
      Details
    </button>

    <button
      onClick={() => !drawDatePassed && handleQuickBuy(raffle)}
      disabled={processingPayment || drawDatePassed}
      className={`flex-1 py-1 md:py-2.5 rounded-lg transition-all ${
        drawDatePassed
          ? 'bg-gray-500/30 text-gray-300 cursor-not-allowed'
          : processingPayment
          ? 'bg-gradient-to-r from-yellow-500/50 to-orange-500/50 opacity-70'
          : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:shadow-xl hover:shadow-yellow-500/40'
      }`}
    >
      {processingPayment
        ? 'Processing…'
        : drawDatePassed
        ? 'Draw Ended'
        : 'Buy Ticket'}
    </button>
  </div>
</div>

    </div>
  );
};

// Raffle List Item Component for List View
const RaffleListItem = ({ 
  raffle, 
  ticketQuantity, 
  updateTicketQuantity, 
  handleQuickBuy, 
  navigate, 
  processingPayment,
  formatNumber,
  formatDate,
  formatTimeLeft,
  calculateOdds,
  isDrawDatePassed
}) => {
  const progress = ((raffle.ticketsSold || 0) / (raffle.totalTickets || 100)) * 100;
  const drawDatePassed = isDrawDatePassed(raffle.drawDate);
  
  return (
    <div className={`bg-white/10 backdrop-blur-2xl rounded-2xl border transition-all p-4 ${
      drawDatePassed ? 'border-gray-500/40' : 'border-white/20 hover:border-yellow-500/40'
    }`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image */}
        <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={raffle.image}
            alt={raffle.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {raffle.featured && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] px-2 py-1 rounded-lg font-bold">
                FEATURED
              </div>
            )}
            {drawDatePassed && (
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white text-[10px] px-2 py-1 rounded-lg font-bold">
                ENDED
              </div>
            )}
          </div>
        </div>
        
        {/* Details */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">{raffle.title}</h3>
              <div className="text-xl font-black text-yellow-400 mt-1">{raffle.value}</div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1 text-sm text-white/70">
                  <Calendar size={14} />
                  {formatDate(raffle.drawDate)}
                </div>
                <div className="flex items-center gap-1 text-sm text-white/70">
                  <Clock size={14} />
                  {drawDatePassed ? 'Ended' : `${formatTimeLeft(raffle.drawDate)} left`}
                </div>
                <div className="flex items-center gap-1 text-sm text-white/70">
                  <Target size={14} />
                  {calculateOdds(raffle)}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-white/70">Ticket Price</div>
              <div className="text-2xl font-black text-yellow-400">₦{formatNumber(raffle.ticketPrice)}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/70 mb-1">
              <span>{formatNumber(raffle.ticketsSold)} sold • {raffle.ticketsLeft} left</span>
              <span>{progress.toFixed(1)}% sold</span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  drawDatePassed ? 'bg-gradient-to-r from-gray-500 to-gray-700' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Action Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-white/70">Quantity:</div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => !drawDatePassed && updateTicketQuantity(raffle.id, -1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    drawDatePassed ? 'bg-white/5 cursor-not-allowed' : 'bg-white/15 backdrop-blur-sm hover:bg-white/25'
                  }`}
                  disabled={drawDatePassed}
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-bold min-w-[30px] text-center">
                  {ticketQuantity[raffle.id] || 1}
                </span>
                <button 
                  onClick={() => !drawDatePassed && updateTicketQuantity(raffle.id, 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    drawDatePassed ? 'bg-gray-500/50 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg'
                  }`}
                  disabled={drawDatePassed}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className={`text-lg font-bold ${drawDatePassed ? 'text-gray-400' : 'text-yellow-400'}`}>
                Total: ₦{formatNumber((ticketQuantity[raffle.id] || 1) * raffle.ticketPrice)}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/item/${raffle.id}`)}
                className="px-4 py-2.5 bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl text-sm font-medium hover:bg-white/25 transition-all flex items-center gap-2"
              >
                <Eye size={16} />
                View Details
              </button>
              <button 
                onClick={() => !drawDatePassed && handleQuickBuy(raffle)}
                disabled={processingPayment || drawDatePassed}
                className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  drawDatePassed 
                    ? 'bg-gray-500/30 text-gray-300 cursor-not-allowed' 
                    : processingPayment 
                      ? 'bg-gradient-to-r from-yellow-500/50 to-orange-500/50 opacity-70' 
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:shadow-xl hover:shadow-yellow-500/40'
                }`}
              >
                {processingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : drawDatePassed ? (
                  'Draw Ended'
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Buy Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Buy Modal Component
const QuickBuyModal = ({
  raffle,
  ticketQuantity,
  updateTicketQuantity,
  isLoggedIn,
  user,
  walletBalance,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  processingPayment,
  paymentError,
  handleQuickBuy,
  setShowQuickBuyModal,
  formatNumber,
  formatWalletBalance,
  navigate,
  isDrawDatePassed
}) => {
  const drawDatePassed = isDrawDatePassed(raffle.drawDate);
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/25 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {drawDatePassed ? 'Raffle Ended' : 'Complete Purchase'}
            </h3>
            <button
              onClick={() => setShowQuickBuyModal(null)}
              disabled={processingPayment}
              className="text-white/60 hover:text-white disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {drawDatePassed ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-500/30 to-gray-700/30 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/20">
                <X size={40} className="text-gray-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">This Raffle Has Ended</h4>
              <p className="text-white/80 mb-6">
                Ticket sales for this raffle are closed. The draw date has passed.
              </p>
              <button
                onClick={() => setShowQuickBuyModal(null)}
                className="w-full py-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Raffle Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-yellow-500/50">
                  <img
                    src={raffle.image}
                    alt={raffle.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="font-bold text-lg text-white">{raffle.title}</div>
                  <div className="text-2xl font-black text-yellow-400">{raffle.value}</div>
                  <div className="text-sm text-white/60">
                    ₦{formatNumber(raffle.ticketPrice)} per ticket
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <div className="text-sm font-bold text-white mb-3">Select Quantity</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateTicketQuantity(raffle.id, -1)}
                      className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-all"
                      disabled={processingPayment}
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-2xl font-bold min-w-[40px] text-center">
                      {ticketQuantity[raffle.id] || 1}
                    </span>
                    <button 
                      onClick={() => updateTicketQuantity(raffle.id, 1)}
                      className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center hover:shadow-lg transition-all"
                      disabled={processingPayment}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/70">Total Amount</div>
                    <div className="text-3xl font-black text-yellow-400">
                      ₦{formatNumber((ticketQuantity[raffle.id] || 1) * raffle.ticketPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              {isLoggedIn && (
                <div className="mb-6">
                  <div className="text-sm font-bold text-white mb-3">Select Payment Method</div>
                  <div className="space-y-3">
                    {/* Balance Option */}
                    <div 
                      onClick={() => setSelectedPaymentMethod('balance')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'balance'
                          ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-500/50'
                          : 'bg-white/10 border-white/10 hover:bg-white/15'
                      } ${walletBalance < ((ticketQuantity[raffle.id] || 1) * raffle.ticketPrice) ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedPaymentMethod === 'balance' ? 'bg-green-500/20' : 'bg-white/10'
                          }`}>
                            <Wallet size={20} className={selectedPaymentMethod === 'balance' ? 'text-green-400' : 'text-white/70'} />
                          </div>
                          <div>
                            <div className="font-bold text-white">Account Balance</div>
                            <div className="text-sm text-white/60">{formatWalletBalance()}</div>
                          </div>
                        </div>
                        {selectedPaymentMethod === 'balance' && (
                          <CheckCircle size={20} className="text-green-400" />
                        )}
                      </div>
                      {walletBalance < ((ticketQuantity[raffle.id] || 1) * raffle.ticketPrice) && (
                        <div className="mt-2 text-sm text-yellow-400 font-bold">
                          Insufficient balance. Need ₦{formatNumber(((ticketQuantity[raffle.id] || 1) * raffle.ticketPrice) - walletBalance)} more
                        </div>
                      )}
                    </div>

                    {/* Card Option */}
                    <div 
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'card'
                          ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-500/50'
                          : 'bg-white/10 border-white/10 hover:bg-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedPaymentMethod === 'card' ? 'bg-blue-500/20' : 'bg-white/10'
                          }`}>
                            <CreditCard size={20} className={selectedPaymentMethod === 'card' ? 'text-blue-400' : 'text-white/70'} />
                          </div>
                          <div>
                            <div className="font-bold text-white">Credit/Debit Card</div>
                            <div className="text-sm text-white/60">Pay with PayStack</div>
                          </div>
                        </div>
                        {selectedPaymentMethod === 'card' && (
                          <CheckCircle size={20} className="text-blue-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {paymentError && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-400" />
                    <div className="text-sm text-white">{paymentError}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isLoggedIn ? (
                  <button 
                    onClick={() => {
                      setShowQuickBuyModal(null);
                      navigate(`/login?returnUrl=/raffles`);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-yellow-500/40 transition-all"
                  >
                    <User size={20} className="inline mr-2" />
                    Login to Buy Tickets
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleQuickBuy(raffle)}
                      disabled={processingPayment || (selectedPaymentMethod === 'balance' && walletBalance < ((ticketQuantity[raffle.id] || 1) * raffle.ticketPrice))}
                      className={`w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl transition-all ${
                        processingPayment ? 'opacity-70' : 'hover:shadow-xl hover:shadow-yellow-500/40'
                      }`}
                    >
                      {processingPayment ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing Payment...
                        </div>
                      ) : selectedPaymentMethod === 'balance' ? (
                        `🎫 Buy with Balance`
                      ) : (
                        `💳 Pay with Card`
                      )}
                    </button>
                    
                    {isLoggedIn && selectedPaymentMethod === 'balance' && walletBalance < ((ticketQuantity[raffle.id] || 1) * raffle.ticketPrice) && (
                      <button 
                        onClick={() => {
                          setShowQuickBuyModal(null);
                          navigate('/dashboard?tab=balance');
                        }}
                        className="w-full py-3 text-blue-400 hover:text-blue-300 transition-colors text-sm font-bold"
                      >
                        + Fund Your Account
                      </button>
                    )}
                  </>
                )}
                
                <button 
                  onClick={() => setShowQuickBuyModal(null)}
                  disabled={processingPayment}
                  className="w-full py-3 text-white/70 hover:text-white transition-colors text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ buySuccess, setBuySuccess, navigate, formatNumber }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-2xl rounded-3xl max-w-md w-full border border-white/25 shadow-2xl">
        <div className="p-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/20">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h3 className="font-black text-2xl mb-3 text-white">🎉 Purchase Successful!</h3>
          <p className="text-sm text-white/80 mb-6">
            You bought {buySuccess.quantity} ticket(s) for <span className="font-bold text-yellow-400">₦{formatNumber(buySuccess.total)}</span>
          </p>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 mb-6 border border-white/15">
            <div className="text-sm font-bold text-white mb-2">🎟️ Your Ticket Numbers:</div>
            <div className="space-y-2">
              {buySuccess.ticketNumbers.map((num, index) => (
                <div key={index} className="text-sm font-mono text-green-400 bg-black/20 p-2 rounded-lg">
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setBuySuccess(null)}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
            >
              Continue Browsing
            </button>
            <button 
              onClick={() => {
                setBuySuccess(null);
                navigate('/dashboard?tab=tickets');
              }}
              className="w-full py-3 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold rounded-xl hover:bg-white/25 transition-all"
            >
              View All My Tickets
            </button>
            <button 
              onClick={() => navigate(`/item/${buySuccess.raffleId}`)}
              className="w-full py-3 text-white/70 hover:text-white transition-colors text-sm"
            >
              View Raffle Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RafflesPage;