import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';

// Import components directly
import LoadingSkeleton from './components/LoadingSkeleton';
import PaystackLogo from './components/PaystackLogo';

// Firebase imports - only import what's needed
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
  addDoc, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { app } from './firebaseConfig';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = 'pk_test_8659b5b554f5e935476df72b2e0950d3b1f560ad';

// Import only essential icons
import {
  Trophy, Star, Users, Calendar, DollarSign,
  Zap, Clock, Heart, Target, Shield, ChevronRight,
  ChevronLeft, TrendingUp, CheckCircle, ArrowRight,
  ShoppingCart, TrendingDown, BarChart, Percent,
  Car, Smartphone, Laptop, Home, Plane,
  ShoppingBag, MessageSquare, Bell, Info, HelpCircle,
  Search, Menu, X, Filter, Grid, List, Home as HomeIcon,
  MessageCircle, User, Ticket, Award as AwardIcon,
  ChevronUp, Plus, Minus, Briefcase,
  Gamepad, Diamond, Ship, Watch, Camera, Headphones,
  BookOpen, Coffee as CoffeeIcon, Tag, Eye, Share2,
  ArrowLeft, ExternalLink, Bookmark, Flag, Gift as GiftIcon,
  Package, ShoppingCart as CartIcon, UserCheck,
  Percent as PercentIcon, TrendingUp as TrendingIcon,
  RefreshCw, AlertCircle, Loader, CreditCard, Wallet,
  MapPin, Mail, Crown, Sparkles, Flame,
  Briefcase as BusinessIcon, Gamepad as GamingIcon,
  Watch as WatchesIcon, ShoppingBag as FashionIcon,
  BookOpen as EducationIcon, CoffeeIcon as FoodIcon,
  Plane as TravelIcon, Home as HomeAppliancesIcon,
  Megaphone, TrendingUp as GrowthIcon, Users as TeamIcon,
  Award as BadgeIcon, Globe as WorldIcon, BarChart as StatsIcon,
  LineChart, Share, Zap as ZapIcon, Rocket, Users as InfluencerIcon,
  LogIn, UserPlus, ChevronDown
} from 'lucide-react';

// Main HomePage component with performance optimizations
const HomePage = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  
  // Initialize Firestore
  const [db, setDb] = useState(null);
  useEffect(() => {
    try {
      const firestore = getFirestore(app);
      setDb(firestore);
    } catch (error) {
      console.error('Error initializing Firestore:', error);
    }
  }, []);

  // State management
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('featured');
  const [ticketQuantity, setTicketQuantity] = useState({});
  const [showQuickBuyModal, setShowQuickBuyModal] = useState(null);
  const [buySuccess, setBuySuccess] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedWinnerStory, setSelectedWinnerStory] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRaffles, setFilteredRaffles] = useState([]);
  const searchInputRef = useRef(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Payment states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // State for Firebase data
  const [featuredRaffles, setFeaturedRaffles] = useState([]);
  const [loadingRaffles, setLoadingRaffles] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [latestWinners, setLatestWinners] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(true);
  const [stats, setStats] = useState({
    totalWinners: 0,
    totalPayout: '₦0',
    liveUsers: 25,
    ticketsSoldToday: 0,
    totalRaffles: 0,
    conversionRate: '8.5%'
  });

  // Magic notification state
  const [magicNotification, setMagicNotification] = useState(null);
  const notificationIntervalRef = useRef(null);

  // Local cache for performance
  const raffleCache = useRef({});
  const userBalanceCache = useRef({});
  const [skeletonCount] = useState(6);

  // Hero Slides with clear differentiation
  const heroSlides = useMemo(() => [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "PLAY & WIN BIG!",
      subtitle: "Join Regular Users to Win Amazing Prizes",
      cta: "Play Now",
      color: "from-blue-500/80 to-cyan-500/80",
      emotionalTrigger: "Your winning moment starts here",
      marketingHook: "Simple registration, instant play",
      conversionText: "Join thousands of winners",
      badge: "🎯 PLAY TO WIN",
      type: "user",
      buttonColor: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "EARN AS INFLUENCER",
      subtitle: "15% Commission on Referrals",
      cta: "Become Influencer",
      color: "from-purple-500/80 to-pink-500/80",
      emotionalTrigger: "Earn while helping others win",
      marketingHook: "Top influencers earn ₦2M+ monthly",
      conversionText: "Start earning with your audience",
      badge: "💰 EARN MONEY",
      type: "influencer",
      buttonColor: "from-purple-500 to-pink-600"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "LIVE DRAW EVERY SUNDAY",
      subtitle: "Winners Announced 6PM",
      cta: "Watch Live",
      color: "from-green-500/80 to-emerald-500/80",
      emotionalTrigger: "Real-time excitement",
      marketingHook: "See real winners in action",
      conversionText: "Your chance could be next",
      badge: "⏰ LIVE SOON",
      type: "both",
      buttonColor: "from-green-500 to-emerald-600"
    }
  ], []);

  // Clear marketing messages with differentiation
  const magicNotifications = useMemo(() => [
    "🎯 REGULAR USER: Register to play and win amazing prizes!",
    "💰 INFLUENCER: Earn 15% commission on referrals",
    "⚡ Regular users buy tickets, Influencers earn commissions",
    "🏆 Two paths: Play to win OR Earn as influencer",
    "💡 Choose your journey: Win prizes or Earn money",
    "🚀 Users: Play to win. Influencers: Refer to earn.",
    "✨ Simple choice: Want to win? Register as user. Want to earn? Join as influencer."
  ], []);

  // Load PayStack Script only when needed
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadPaystack = () => {
      if (window.PaystackPop) {
        setPaystackLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) {
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
    
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, [isLoggedIn]);

  // Auto slide for hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Load user data and balance from USERS collection
  const loadUserData = useCallback(async (userId) => {
    if (!db || !userId) {
      console.log('Database not loaded or no user ID');
      return;
    }

    // Check cache first
    if (userBalanceCache.current[userId] !== undefined) {
      setWalletBalance(userBalanceCache.current[userId]);
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        // Get balance from users collection - using the 'balance' field
        const balance = parseFloat(userData.balance) || 0;
        
        // Update cache
        userBalanceCache.current[userId] = balance;
        
        // Update state
        setWalletBalance(balance);
        
        // Also update user state with other data if needed
        setUser(prev => ({
          ...prev,
          ...userData
        }));
      } else {
        setWalletBalance(0);
        userBalanceCache.current[userId] = 0;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setWalletBalance(0);
    }
  }, [db]);

  // Check auth state and load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoggedIn(!!currentUser);
      
      if (currentUser) {
        // Set basic user info
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        });
        
        // Load user data if db is ready
        if (db) {
          await loadUserData(currentUser.uid);
        }
      } else {
        setUser(null);
        setWalletBalance(0);
        userBalanceCache.current = {};
      }
    });
    
    return () => unsubscribe();
  }, [auth, db]);

  // Load user data when db becomes available
  useEffect(() => {
    if (db && user?.uid) {
      loadUserData(user.uid);
    }
  }, [db, user?.uid]);

  // Magic notification interval
  useEffect(() => {
    // Clear any existing interval
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }

    // Set new interval for random notifications
    notificationIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * magicNotifications.length);
      setMagicNotification(magicNotifications[randomIndex]);
      
      // Auto hide after 10 seconds
      setTimeout(() => {
        setMagicNotification(null);
      }, 10000);
    }, 180000); // Every 3 minutes (180000 ms)

    // Show first notification after 30 seconds
    const initialTimeout = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * magicNotifications.length);
      setMagicNotification(magicNotifications[randomIndex]);
      
      setTimeout(() => {
        setMagicNotification(null);
      }, 10000);
    }, 30000);

    return () => {
      clearInterval(notificationIntervalRef.current);
      clearTimeout(initialTimeout);
    };
  }, [magicNotifications]);

  // Simulate live users count
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const currentUsers = prev.liveUsers;
        const change = Math.random() > 0.5 ? 1 : -1;
        const newUsers = Math.max(5, Math.min(25, currentUsers + change));
        return { ...prev, liveUsers: newUsers };
      });
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Helper function to parse prize value
  const parsePrizeValue = useCallback((value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    
    const strValue = value.toString();
    const numericString = strValue.replace(/[^0-9.]/g, '');
    if (!numericString) return 0;
    
    const numValue = parseFloat(numericString);
    
    if (strValue.toLowerCase().includes('m')) return numValue * 1000000;
    if (strValue.toLowerCase().includes('k')) return numValue * 1000;
    
    return isNaN(numValue) ? 0 : numValue;
  }, []);

  // Helper function to format prize value
  const formatPrizeValue = useCallback((value) => {
    if (!value) return '₦0';
    if (typeof value === 'number') {
      if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `₦${(value / 1000).toFixed(1)}K`;
      return `₦${value.toLocaleString()}`;
    }
    return value;
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = useCallback((timestamp) => {
    if (!timestamp) return 'Recently';
    
    let date;
    try {
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Recently';
      }
    } catch (error) {
      return 'Recently';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Fetch featured raffles (only 5 random ones)
  useEffect(() => {
    if (!db) return;
    
    let mounted = true;
    
    const fetchFeaturedRaffles = async () => {
      if (!mounted) return;
      
      try {
        setLoadingRaffles(true);
        setLoadingError(null);
        
        // Check cache first to reduce Firebase reads
        const cacheKey = 'featuredRaffles_cache';
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // Use cache if less than 5 minutes old
        if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 300000) {
          const parsedData = JSON.parse(cachedData);
          setFeaturedRaffles(parsedData.featuredRaffles);
          setStats(parsedData.stats);
          setLoadingRaffles(false);
          return;
        }
        
        // Fetch active raffles
        const rafflesQuery = query(
          collection(db, 'raffles'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(20) // Reduced from 50 to 20
        );
        
        const rafflesSnapshot = await getDocs(rafflesQuery);
        
        if (!mounted) return;
        
        if (!rafflesSnapshot.empty) {
          const allRaffles = [];
          let totalTicketsSold = 0;
          let totalValue = 0;
          
          rafflesSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const raffleData = {
              id: docSnap.id,
              title: data.title || 'Untitled Raffle',
              value: formatPrizeValue(data.value) || '₦0',
              ticketPrice: data.ticketPrice || 1000,
              ticketsSold: data.ticketsSold || 0,
              totalTickets: data.totalTickets || 100,
              category: data.category || 'others',
              image: data.image || data.images?.[0] || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              drawDate: data.drawDate || data.endDate,
              featured: data.featured || false,
              status: data.status || 'active',
              progress: ((data.ticketsSold || 0) / (data.totalTickets || 100)) * 100,
              urgency: `${(data.totalTickets || 100) - (data.ticketsSold || 0)} left`,
              odds: `1 in ${data.totalTickets || 100}`,
              createdAt: data.createdAt
            };
            
            allRaffles.push(raffleData);
            raffleCache.current[docSnap.id] = { ...data, id: docSnap.id };
            
            totalTicketsSold += (data.ticketsSold || 0);
            
            if (data.value) {
              const numValue = parsePrizeValue(data.value);
              if (!isNaN(numValue)) totalValue += numValue;
            }
          });
          
          // Get 5 random featured raffles
          const shuffled = [...allRaffles].sort(() => 0.5 - Math.random());
          const featured = shuffled.slice(0, 5);
          
          const lastVisibleDoc = rafflesSnapshot.docs[rafflesSnapshot.docs.length - 1];
          
          setLastVisible(lastVisibleDoc);
          setHasMore(allRaffles.length > 0);
          setFeaturedRaffles(featured);
          
          // Calculate stats
          const ticketsSoldToday = Math.floor(totalTicketsSold * 0.1);
          
          const updatedStats = {
            totalWinners: stats.totalWinners,
            totalPayout: `₦${(totalValue / 1000000).toFixed(1)}M`,
            liveUsers: stats.liveUsers,
            ticketsSoldToday: ticketsSoldToday,
            totalRaffles: rafflesSnapshot.size,
            conversionRate: '8.5%'
          };
          
          setStats(updatedStats);
          
          // Cache the data
          const cacheData = {
            featuredRaffles: featured,
            stats: updatedStats
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          
        }
        
      } catch (error) {
        console.error('Error fetching raffles:', error);
        if (mounted) {
          setLoadingError(`Failed to load raffles: ${error.message}`);
        }
      } finally {
        if (mounted) {
          setLoadingRaffles(false);
        }
      }
    };

    fetchFeaturedRaffles();
    
    return () => {
      mounted = false;
    };
  }, [db, formatPrizeValue, parsePrizeValue]);

  // Fetch winners from Firebase with caching
  useEffect(() => {
    if (!db) return;
    
    let mounted = true;
    
    const fetchWinners = async () => {
      if (!mounted) return;
      
      try {
        setLoadingWinners(true);
        
        // Check cache first
        const cacheKey = 'latestWinners_cache';
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 300000) {
          const parsedData = JSON.parse(cachedData);
          setLatestWinners(parsedData.winners);
          setStats(prev => ({ ...prev, totalWinners: parsedData.totalWinners }));
          setLoadingWinners(false);
          return;
        }
        
        const winnersQuery = query(
          collection(db, 'winners'),
          where('public', '==', true),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        
        const winnersSnapshot = await getDocs(winnersQuery);
        
        if (!mounted) return;
        
        if (winnersSnapshot.empty) {
          setLatestWinners([]);
          setStats(prev => ({
            ...prev,
            totalWinners: 0
          }));
          return;
        }
        
        const winnersData = [];
        
        for (const docSnap of winnersSnapshot.docs) {
          try {
            const winner = docSnap.data();
            
            let winDate = new Date();
            if (winner.timestamp) {
              if (winner.timestamp.toDate && typeof winner.timestamp.toDate === 'function') {
                winDate = winner.timestamp.toDate();
              } else if (winner.timestamp instanceof Date) {
                winDate = winner.timestamp;
              } else if (typeof winner.timestamp === 'string') {
                winDate = new Date(winner.timestamp);
              } else if (typeof winner.timestamp === 'number') {
                winDate = new Date(winner.timestamp);
              }
            }
            
            // Use minimal data fetching - don't fetch user/raffle docs unless absolutely necessary
            let userData = {};
            let raffleData = {};
            
            if (winner.userName) {
              userData = { displayName: winner.userName };
            } else if (winner.userId) {
              try {
                const userDoc = await getDoc(doc(db, 'users', winner.userId));
                if (userDoc.exists()) {
                  userData = userDoc.data();
                }
              } catch (userError) {
                console.log('Error fetching user data:', userError);
              }
            }
            
            if (winner.prize?.title) {
              raffleData = { title: winner.prize.title, value: winner.prize.value };
            } else if (winner.raffleId) {
              try {
                const raffleDoc = await getDoc(doc(db, 'raffles', winner.raffleId));
                if (raffleDoc.exists()) {
                  raffleData = raffleDoc.data();
                }
              } catch (raffleError) {
                console.log('Error fetching raffle data:', raffleError);
              }
            }
            
            const winnerName = winner.userName || 
                             userData?.firstName || 
                             userData?.displayName || 
                             'Anonymous Winner';
            
            const winnerImage = userData?.photoURL || 
                              userData?.profileImage || 
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
            
            const prizeTitle = raffleData?.raffleTitle || 
                             raffleData?.title || 
                             winner.prize?.title ||
                             'Amazing Prize';
            
            const prizeValue = formatPrizeValue(raffleData?.value) || 
                             formatPrizeValue(winner.prize?.value) || 
                             '₦0';
            
            const prizeImage = raffleData?.image || 
                             winner.prize?.image ||
                             'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            
            const location = userData?.city || 
                           userData?.location || 
                           winner.userLocation || 
                           'Nigeria';
            
            const profession = userData?.profession || 
                             userData?.occupation || 
                             winner.userProfession ||
                             'Winner';
            
            const ticketPrice = raffleData?.ticketPrice || winner.ticketPrice || 0;
            const story = winner.prize?.description || 
                         winner.story || 
                         `I won ${prizeTitle}!`;
            
            winnersData.push({
              id: docSnap.id,
              name: winnerName,
              prize: prizeTitle,
              prizeValue: prizeValue,
              prizeImage: prizeImage,
              winnerImage: winnerImage,
              location: location,
              profession: profession,
              ticketPrice: ticketPrice,
              timeAgo: formatTimeAgo(winner.timestamp || winner.createdAt),
              story: story,
              verified: winner.verified || false,
              raffleId: winner.raffleId,
              userId: winner.userId
            });
            
          } catch (error) {
            console.error('Error processing winner:', error);
          }
        }
        
        if (mounted) {
          setLatestWinners(winnersData);
          setStats(prev => ({
            ...prev,
            totalWinners: winnersData.length
          }));
          
          // Cache winners data
          const cacheData = {
            winners: winnersData,
            totalWinners: winnersData.length
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        }
        
      } catch (error) {
        console.error('❌ Error fetching winners:', error);
        if (mounted) {
          setLatestWinners([]);
        }
      } finally {
        if (mounted) {
          setLoadingWinners(false);
        }
      }
    };

    fetchWinners();
    
    return () => {
      mounted = false;
    };
  }, [db, formatPrizeValue, formatTimeAgo]);

  // Load more raffles for infinite scroll
  const loadMoreRaffles = useCallback(async () => {
    if (loadingMore || !hasMore || !lastVisible || !db) return;
    
    try {
      setLoadingMore(true);
      
      const rafflesQuery = query(
        collection(db, 'raffles'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(6)
      );
      
      const querySnapshot = await getDocs(rafflesQuery);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        return;
      }
      
      const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(newLastVisible);
      setHasMore(querySnapshot.docs.length === 6);
      
      const newRaffles = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Untitled Raffle',
          value: formatPrizeValue(data.value) || '₦0',
          ticketPrice: data.ticketPrice || 1000,
          ticketsSold: data.ticketsSold || 0,
          totalTickets: data.totalTickets || 100,
          category: data.category || 'others',
          image: data.image || data.images?.[0] || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
          drawDate: data.drawDate || data.endDate,
          featured: data.featured || false,
          progress: ((data.ticketsSold || 0) / (data.totalTickets || 100)) * 100,
          urgency: `${(data.totalTickets || 100) - (data.ticketsSold || 0)} left`,
          odds: `1 in ${data.totalTickets || 100}`
        };
      });
      
      setFeaturedRaffles(prev => [...prev, ...newRaffles]);
      
    } catch (error) {
      console.error('Error loading more raffles:', error);
      setLoadingError('Failed to load more raffles');
    } finally {
      setLoadingMore(false);
    }
  }, [db, loadingMore, hasMore, lastVisible, formatPrizeValue]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore || selectedCategory !== 'featured') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreRaffles();
        }
      },
      { threshold: 0.5 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loadingMore, selectedCategory, loadMoreRaffles]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRaffles([]);
    } else {
      const filtered = featuredRaffles.filter(raffle =>
        raffle.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        raffle.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRaffles(filtered);
    }
  }, [searchQuery, featuredRaffles]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  // Handle scroll for header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Categories with PLASTIC BUTTON DESIGN - ALL 17 CATEGORIES
  const categories = useMemo(() => [
    { id: 'featured', label: '🔥 Featured', icon: AwardIcon, color: 'from-red-500 to-orange-500', plasticColor: 'bg-gradient-to-b from-red-400 to-red-600' },
    { id: 'cars', label: '🚗 Cars', icon: Car, color: 'from-blue-500 to-cyan-500', plasticColor: 'bg-gradient-to-b from-blue-400 to-blue-600' },
    { id: 'cash', label: '💰 Cash', icon: DollarSign, color: 'from-green-500 to-emerald-500', plasticColor: 'bg-gradient-to-b from-green-400 to-green-600' },
    { id: 'electronics', label: '📱 Tech', icon: Smartphone, color: 'from-purple-500 to-pink-500', plasticColor: 'bg-gradient-to-b from-purple-400 to-purple-600' },
    { id: 'property', label: '🏠 Property', icon: Home, color: 'from-yellow-500 to-orange-500', plasticColor: 'bg-gradient-to-b from-yellow-400 to-yellow-600' },
    { id: 'travel', label: '✈️ Travel', icon: TravelIcon, color: 'from-cyan-500 to-blue-500', plasticColor: 'bg-gradient-to-b from-cyan-400 to-cyan-600' },
    { id: 'luxury', label: '💎 Luxury', icon: Diamond, color: 'from-pink-500 to-rose-500', plasticColor: 'bg-gradient-to-b from-pink-400 to-pink-600' },
    { id: 'food', label: '🍔 Food', icon: FoodIcon, color: 'from-orange-500 to-red-500', plasticColor: 'bg-gradient-to-b from-orange-400 to-orange-600' },
    { id: 'watches', label: '⌚ Watches', icon: WatchesIcon, color: 'from-gray-500 to-slate-500', plasticColor: 'bg-gradient-to-b from-gray-400 to-gray-600' },
    { id: 'gaming', label: '🎮 Gaming', icon: GamingIcon, color: 'from-green-500 to-lime-500', plasticColor: 'bg-gradient-to-b from-green-400 to-green-600' },
    { id: 'fashion', label: '👕 Fashion', icon: FashionIcon, color: 'from-purple-500 to-indigo-500', plasticColor: 'bg-gradient-to-b from-purple-400 to-purple-600' },
    { id: 'education', label: '📚 Education', icon: EducationIcon, color: 'from-blue-500 to-indigo-500', plasticColor: 'bg-gradient-to-b from-blue-400 to-blue-600' },
    { id: 'business', label: '💼 Business', icon: BusinessIcon, color: 'from-gray-700 to-gray-900', plasticColor: 'bg-gradient-to-b from-gray-600 to-gray-800' },
    { id: 'home', label: '🏡 Home', icon: HomeAppliancesIcon, color: 'from-amber-500 to-orange-500', plasticColor: 'bg-gradient-to-b from-amber-400 to-amber-600' },
    { id: 'others', label: '📦 Others', icon: Package, color: 'from-gray-500 to-slate-500', plasticColor: 'bg-gradient-to-b from-gray-400 to-gray-600' }
  ], []);

  // Filter raffles by category - UPDATED to show all raffles when category is selected
  const getFilteredRaffles = useCallback(() => {
    if (searchQuery.trim() !== '' && filteredRaffles.length > 0) {
      return filteredRaffles;
    }
    
    if (selectedCategory === 'featured') {
      return featuredRaffles;
    }
    
    if (selectedCategory === 'all' || selectedCategory === 'others') {
      return featuredRaffles;
    }
    
    // For specific categories, filter but don't return empty if none match
    const categoryRaffles = featuredRaffles.filter(r => r.category === selectedCategory);
    
    // If no raffles in this category, show all featured raffles with a badge
    if (categoryRaffles.length === 0) {
      return featuredRaffles;
    }
    
    return categoryRaffles;
  }, [searchQuery, filteredRaffles, selectedCategory, featuredRaffles]);

  // Handle ticket quantity change
  const updateTicketQuantity = useCallback((raffleId, change) => {
    setTicketQuantity(prev => {
      const current = prev[raffleId] || 1;
      const newValue = Math.max(1, Math.min(20, current + change));
      return { ...prev, [raffleId]: newValue };
    });
  }, []);

  // Check if raffle is still active (draw date not passed)
  const isRaffleActive = useCallback((raffle) => {
    if (!raffle.drawDate) return true;
    
    try {
      const drawDate = new Date(raffle.drawDate);
      const now = new Date();
      return drawDate > now;
    } catch (error) {
      return true;
    }
  }, []);

  // Payment system integration
  const handleQuickBuy = useCallback(async (raffle) => {
    if (!isLoggedIn || !user) {
      navigate(`/login?returnUrl=/`);
      return;
    }

    // Check if raffle is still active
    if (!isRaffleActive(raffle)) {
      setPaymentError('This raffle has ended. Please select another raffle.');
      setShowQuickBuyModal(raffle);
      return;
    }

    const quantity = ticketQuantity[raffle.id] || 1;
    const totalAmount = quantity * raffle.ticketPrice;
    
    setProcessingPayment(true);
    setPaymentError(null);
    setShowQuickBuyModal(raffle);

    try {
      if (walletBalance >= totalAmount) {
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
  }, [isLoggedIn, user, navigate, isRaffleActive, ticketQuantity, walletBalance]);

  const handleBalancePayment = useCallback(async (raffle, quantity, amount) => {
    try {
      if (!db) throw new Error('Database not loaded');
      
      // Deduct from user balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-amount),
        lastActivity: serverTimestamp()
      });

      const newBalance = walletBalance - amount;
      userBalanceCache.current[user.uid] = newBalance;
      setWalletBalance(newBalance);

      // Create transaction record
      await createTransactionRecord('balance', null, raffle, quantity, amount);
      
      // Create tickets
      const ticketNumbers = await createTickets(raffle, quantity);
      
      // Update raffle ticket count
      await updateRaffleTickets(raffle.id, quantity);
      
      // Show success
      showSuccessModalHandler(raffle, quantity, amount, ticketNumbers);
      
    } catch (error) {
      console.error('Balance payment error:', error);
      userBalanceCache.current[user.uid] = walletBalance;
      throw error;
    }
  }, [db, user, walletBalance]);

  const handlePaystackPayment = useCallback((raffle, quantity, amount) => {
    if (!window.PaystackPop && !paystackLoaded) {
      setPaymentError('Payment system not available. Please refresh.');
      setProcessingPayment(false);
      setShowQuickBuyModal(null);
      return;
    }

    const reference = `NXTWINNER_${Date.now()}_${raffle.id}`;
    
    try {
      const paymentCallback = function(response) {
        console.log('Payment successful:', response);
        
        const processPayment = async () => {
          try {
            await createTransactionRecord('paystack', response, raffle, quantity, amount);
            const ticketNumbers = await createTickets(raffle, quantity);
            await updateRaffleTickets(raffle.id, quantity);
            showSuccessModalHandler(raffle, quantity, amount, ticketNumbers);
          } catch (error) {
            console.error('Error finalizing:', error);
            setPaymentError('Payment succeeded but ticket creation failed. Contact support.');
          }
        };
        
        processPayment();
      };

      const paymentOnClose = function() {
        console.log('Payment window closed');
        setProcessingPayment(false);
        setShowQuickBuyModal(null);
      };

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
        callback: paymentCallback,
        onClose: paymentOnClose
      });

      handler.openIframe();
    } catch (error) {
      console.error('PayStack setup error:', error);
      setPaymentError('Error initializing payment. Please try again.');
      setProcessingPayment(false);
      setShowQuickBuyModal(null);
    }
  }, [paystackLoaded, user]);

  const createTransactionRecord = useCallback(async (method, paystackResponse, raffle, quantity, amount) => {
    try {
      if (!db) throw new Error('Database not loaded');
      
      const transactionsRef = collection(db, 'transactions');
      await addDoc(transactionsRef, {
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
  }, [db, user]);

  const createTickets = useCallback(async (raffle, quantity) => {
    const ticketNumbers = Array.from({ length: quantity }, (_, i) => 
      `NXTWINNER-${raffle.id.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    );

    try {
      if (!db) throw new Error('Database not loaded');
      
      const ticketsRef = collection(db, 'tickets');
      const batchPromises = ticketNumbers.map(ticketNumber => 
        addDoc(ticketsRef, {
          ticketNumber,
          userId: user.uid,
          raffleId: raffle.id,
          raffleTitle: raffle.title,
          raffleValue: raffle.value,
          purchaseDate: serverTimestamp(),
          drawDate: raffle.drawDate,
          status: 'active',
          price: raffle.ticketPrice
        })
      );

      await Promise.all(batchPromises);
    } catch (error) {
      console.error('Ticket creation error:', error);
      throw error;
    }

    return ticketNumbers;
  }, [db, user]);

  const updateRaffleTickets = useCallback(async (raffleId, quantity) => {
    try {
      if (!db) throw new Error('Database not loaded');
      
      const raffleRef = doc(db, 'raffles', raffleId);
      await updateDoc(raffleRef, {
        ticketsSold: increment(quantity),
        updatedAt: serverTimestamp()
      });
      
      // Update local cache
      if (raffleCache.current[raffleId]) {
        raffleCache.current[raffleId].ticketsSold = (raffleCache.current[raffleId].ticketsSold || 0) + quantity;
      }
      
      // Update featured raffles state
      setFeaturedRaffles(prev => prev.map(r => 
        r.id === raffleId 
          ? { ...r, ticketsSold: r.ticketsSold + quantity }
          : r
      ));
    } catch (error) {
      console.error('Error updating raffle:', error);
    }
  }, [db]);

  const showSuccessModalHandler = useCallback((raffle, quantity, amount, ticketNumbers) => {
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
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Coming soon';
    try {
      const date = new Date(dateString);
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

  // Format number with commas
  const formatNumber = useCallback((num) => {
    return num?.toLocaleString('en-US') || '0';
  }, []);

  // Format wallet balance - FIXED VERSION
  const formatWalletBalance = useCallback(() => {
    if (walletBalance === null || walletBalance === undefined) return 'Loading...';
    if (walletBalance === 0) return '₦0';
    return `₦${parseFloat(walletBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [walletBalance]);

  // Calculate next Sunday 6pm for countdown
  const nextDrawTime = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSunday = day === 0 ? 7 : 7 - day;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(18, 0, 0, 0);
    return nextSunday;
  }, []);

  // Countdown timer
  const getCountdown = useCallback(() => {
    const now = new Date();
    const diff = nextDrawTime - now;
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  }, [nextDrawTime]);

  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, [getCountdown]);

  // Marketing Strategy Components
  const TrustBadge = useCallback(({ icon: Icon, text, subtext, color }) => (
    <div className={`${color} backdrop-blur-xl rounded-2xl p-3 flex items-center gap-3 border border-white/20 shadow-lg`}>
      <div className="p-2 bg-white/20 rounded-lg">
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="font-bold text-white">{text}</div>
        <div className="text-xs text-white/80">{subtext}</div>
      </div>
    </div>
  ), []);

  // CLEAR PATH SELECTION BANNER - New Component for Clear Differentiation
  const PathSelectionBanner = () => (
    <div className="mt-4 px-3">
      <PlasticCard plasticColor="bg-gradient-to-b from-gray-900/40 to-gray-800/40">
        <div className="p-4 text-center">
          <h3 className="text-lg font-black text-white mb-3">🎯 CHOOSE YOUR PATH</h3>
          
          <div className="grid grid-cols-2 gap-2">

  {/* Regular User Path */}
  <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-xl rounded-xl px-3 py-2 border border-blue-500/30 flex flex-col justify-between">

    {/* Header */}
    <div className="flex items-center gap-2 mb-2">
      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
        <UserPlus size={18} className="text-white" />
      </div>
      <div className="leading-none">
        <h4 className="text-sm font-extrabold">PLAY TO WIN</h4>
        <p className="text-[10px] text-blue-200">Regular User</p>
      </div>
    </div>

    {/* Benefits */}
    <div className="space-y-[3px] mb-2">
      <div className="flex items-center gap-1.5 text-[11px]">
        <CheckCircle size={12} className="text-green-400" />
        Buy tickets & win prizes
      </div>
      <div className="flex items-center gap-1.5 text-[11px]">
        <CheckCircle size={12} className="text-green-400" />
        Simple registration
      </div>
      <div className="flex items-center gap-1.5 text-[11px]">
        <CheckCircle size={12} className="text-green-400" />
        Instant play
      </div>
    </div>

    {/* Action */}
    <button
      onClick={() => navigate('/register')}
      className="w-full py-2 text-[12px] font-bold rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 active:scale-[0.98]"
    >
      🎫 Register
    </button>
  </div>

  {/* Influencer Path */}
  <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-xl rounded-xl px-3 py-2 border border-purple-500/30 flex flex-col justify-between">

    {/* Header */}
    <div className="flex items-center gap-2 mb-2">
      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
        <Crown size={18} className="text-white" />
      </div>
      <div className="leading-none">
        <h4 className="text-sm font-extrabold">EARN MONEY</h4>
        <p className="text-[10px] text-purple-200">Influencer</p>
      </div>
    </div>

    {/* Benefits */}
    <div className="space-y-[3px] mb-2">
      <div className="flex items-center gap-1.5 text-[11px]">
        <CheckCircle size={12} className="text-green-400" />
        15% referral commission
      </div>
      <div className="flex items-center gap-1.5 text-[11px]">
        <CheckCircle size={12} className="text-green-400" />
        Earn ₦500K+ monthly
      </div>
      <div className="flex items-center gap-1.5 text-[11px]">
        <CheckCircle size={12} className="text-green-400" />
        Influencer dashboard
      </div>
    </div>

    {/* Action */}
    <button
      onClick={() => navigate('/influencers/auth')}
      className="w-full py-2 text-[12px] font-bold rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 active:scale-[0.98]"
    >
      👑 Become Influencer
    </button>
  </div>

</div>

          
          <p className="text-xs text-white/60 mt-4">
            Choose your journey: Win prizes as a user OR Earn commissions as an influencer
          </p>
        </div>
      </PlasticCard>
    </div>
  );

  // Plastic Card Component
  const PlasticCard = ({ children, className = '', border = true, plasticColor = 'bg-gradient-to-b from-white/15 to-white/5' }) => (
    <div className={`
      ${plasticColor}
      backdrop-blur-2xl 
      ${border ? 'border border-white/30 shadow-2xl' : ''}
      rounded-2xl
      shadow-lg
      overflow-hidden
      relative
      before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:via-transparent before:to-transparent
      before:pointer-events-none
      ${className}
    `}>
      {children}
    </div>
  );

  // Plastic Button Component
  const PlasticButton = ({ children, onClick, className = '', plasticColor = 'bg-gradient-to-b from-yellow-400 to-orange-500' }) => (
    <button
      onClick={onClick}
      className={`
        ${plasticColor}
        text-white font-bold
        rounded-xl
        px-4 py-3
        relative
        overflow-hidden
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-2xl
        active:scale-95
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-50
        after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-black/10
        shadow-lg
        border border-white/40
        ${className}
      `}
    >
      <span className="relative z-10 drop-shadow-sm">{children}</span>
    </button>
  );

  // Loading skeleton
  if (loadingRaffles && featuredRaffles.length === 0) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gray-900"></div>}>
        <LoadingSkeleton />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-20">
      {/* Magic Notification */}
      {magicNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce">
          <div className="bg-gradient-to-r from-yellow-500/95 to-orange-500/95 backdrop-blur-2xl text-white text-sm font-bold px-4 py-3 rounded-2xl shadow-2xl border border-yellow-300/30 max-w-xs text-center">
            ✨ {magicNotification}
            <button 
              onClick={() => setMagicNotification(null)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Glassmorphic Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-white/15 backdrop-blur-2xl shadow-2xl' : 'bg-white/10 backdrop-blur-xl'
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
                <p className="text-[9px] tracking-widest text-white/60">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl text-sm font-bold hover:from-blue-500/30 hover:to-purple-500/30 transition-all border border-blue-500/30 shadow-lg"
                >
                  <Wallet size={14} />
                  <span className="font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {formatWalletBalance()}
                  </span>
                </button>
              )}
              
              {/* Search Icon */}
              <button 
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10 shadow-lg"
              >
                <Search size={18} />
              </button>
              
              {/* Hamburger Menu */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/10 shadow-lg"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Enhanced Glassmorphic Search Bar */}
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
                  {filteredRaffles.map(raffle => (
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

        {/* Enhanced Glassmorphic Menu Drawer */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-2xl border-t border-white/30 shadow-2xl">
            <PlasticCard className="m-3">
              <div className="p-3 space-y-1">
                {[
                  { label: 'Dashboard', route: '/dashboard', icon: User, show: isLoggedIn },
                  { label: 'My Tickets', route: '/dashboard?tab=tickets', icon: Ticket, show: isLoggedIn },
                  { label: 'My Balance', route: '/dashboard?tab=balance', icon: Wallet, show: isLoggedIn },
                  { label: 'My Raffles', route: '/dashboard?tab=raffles', icon: AwardIcon, show: isLoggedIn },
                  { label: 'Become Influencer', route: '/influencers/auth', icon: Crown, show: true },
                  { label: 'Influencer Dashboard', route: '/influencer-dashboard', icon: StatsIcon, show: isLoggedIn },
                  { label: 'How It Works', route: '/how-it-works', icon: HelpCircle, show: true },
                  { label: 'Winners', route: '/winners', icon: Trophy, show: true },
                  { label: 'Live Draw', route: '/live-draw', icon: Clock, show: true },
                  { label: 'About Us', route: '/about', icon: Info, show: true },
                  { label: 'Contact', route: '/contact', icon: Mail, show: true },
                  { label: 'Legal', route: '/legal', icon: Shield, show: true },
                  { label: 'Register as User', route: '/register', icon: UserPlus, show: !isLoggedIn },
                  { label: 'Login as User', route: '/login', icon: LogIn, show: !isLoggedIn }
                ].filter(item => item.show).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.route}
                      onClick={() => {
                        navigate(item.route);
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl hover:bg-white/20 transition-all font-medium bg-white/10 backdrop-blur-sm text-white"
                    >
                      <Icon size={18} className="text-white/90" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </PlasticCard>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Enhanced Glassmorphic Hero Section with Marketing */}
        <div className="relative mx-3 mt-2 rounded-3xl overflow-hidden">
          <div className="relative h-56">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover brightness-110 contrast-110"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${slide.color} opacity-40`}></div>
                <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-lg">
                        {slide.badge}
                      </span>
                      {slide.type === 'user' && (
                        <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-lg">
                          FOR REGULAR USERS
                        </span>
                      )}
                      {slide.type === 'influencer' && (
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-lg">
                          FOR INFLUENCERS
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-white drop-shadow-lg">{slide.title}</h2>
                    <p className="text-sm text-white/95 mt-1 drop-shadow">{slide.subtitle}</p>
                    <div className="mt-2 text-xs text-yellow-300/95 font-medium italic">
                      "{slide.emotionalTrigger}"
                    </div>
                    {/* Marketing Hook */}
                    <div className="mt-1 text-[10px] text-white/80 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg inline-block">
                      🎯 {slide.marketingHook}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <PlasticButton
                        onClick={() => {
                          if (slide.id === 1) navigate('/register');
                          else if (slide.id === 2) navigate('/influencers/auth');
                          else navigate('/live-draw');
                        }}
                        plasticColor={`bg-gradient-to-b ${slide.buttonColor}`}
                      >
                        {slide.cta}
                      </PlasticButton>
                      <button 
                        onClick={() => slide.id === 2 ? navigate('/influencers/auth') : navigate('/learn')}
                        className="px-4 py-2 bg-white/15 backdrop-blur-xl border border-white/30 text-white text-sm font-bold rounded-xl hover:bg-white/25 transition-all shadow-lg"
                      >
                        {slide.id === 2 ? 'Learn More' : 'How It Works'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicators */}
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-yellow-400 w-6' : 'bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CLEAR PATH SELECTION BANNER - Immediately after hero */}
        <PathSelectionBanner />

        {/* Live Draw Banner with Urgency */}
        <div className="mx-3 mt-3 bg-gradient-to-r from-red-500/25 via-orange-500/25 to-yellow-500/25 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500/40 to-orange-500/40 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
                    <Clock size={24} className="text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white/90">LIVE DRAW IN</div>
                  <div className="text-white font-black text-xl">
                    {countdown.days}d {countdown.hours}h {countdown.minutes}m
                  </div>
                  <div className="text-[10px] text-white/70">Every Sunday 6PM</div>
                  <div className="text-[10px] text-yellow-300 font-bold mt-1">
                    ⚡ Last chance for this week's prizes!
                  </div>
                </div>
              </div>
              <PlasticButton
                onClick={() => navigate('/live-draw')}
                plasticColor="bg-gradient-to-b from-red-400 to-orange-500"
              >
                WATCH LIVE
              </PlasticButton>
            </div>
          </div>
        </div>

        {/* Quick Stats – Compact Native Style */}
<div className="mx-2 mt-2 grid grid-cols-2 md:grid-cols-4 gap-[6px]">

  {[
    { 
      label: 'Winners', 
      value: stats.totalWinners.toLocaleString(), 
      color: 'text-yellow-400', 
      icon: Trophy,
      gradient: 'from-yellow-500/20 to-orange-500/20',
      subtext: 'Real wins'
    },
    { 
      label: 'Paid Out', 
      value: stats.totalPayout, 
      color: 'text-green-400', 
      icon: DollarSign,
      gradient: 'from-green-500/20 to-emerald-500/20',
      subtext: 'To users'
    },
    { 
      label: 'Live', 
      value: stats.liveUsers.toLocaleString(), 
      color: 'text-blue-400', 
      icon: Users,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      subtext: 'Online'
    },
    { 
      label: 'Influencers', 
      value: '2.5K+', 
      color: 'text-purple-400', 
      icon: Crown,
      gradient: 'from-purple-500/20 to-pink-500/20',
      subtext: '15% earn'
    }
  ].map((stat, index) => {
    const Icon = stat.icon;
    return (
      <PlasticCard key={index} border={false}>
        <div className="px-2 py-2 text-center leading-none">

          {/* Icon */}
          <div
            className={`w-8 h-8 mx-auto mb-1 rounded-lg bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}
          >
            <Icon size={16} className={stat.color} />
          </div>

          {/* Value */}
          <div className={`text-sm md:text-base font-extrabold ${stat.color}`}>
            {stat.value}
          </div>

          {/* Label */}
          <div className="text-[10px] text-white/70">
            {stat.label}
          </div>

          {/* Subtext */}
          <div className="text-[9px] text-white/45">
            {stat.subtext}
          </div>

        </div>
      </PlasticCard>
    );
  })}

</div>


        {/* Trust Badges - Marketing Strategy */}
        <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
          <TrustBadge
            icon={Shield}
            text="100% Secure"
            subtext="Bank-level encryption"
            color="bg-gradient-to-r from-green-500/20 to-emerald-500/20"
          />
          <TrustBadge
            icon={CheckCircle}
            text="Verified Wins"
            subtext="Real winners, real stories"
            color="bg-gradient-to-r from-blue-500/20 to-purple-500/20"
          />
        </div>

        {/* Category Filters with PLASTIC BUTTON DESIGN - ALL 17 CATEGORIES */}
        <div className="mt-4 px-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black">🔥 Categories</h2>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/15 backdrop-blur-sm shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/15 backdrop-blur-sm shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <List size={18} />
              </button>
              {loadingError && (
                <button 
                  onClick={() => window.location.reload()}
                  className="p-2 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 transition-all"
                  title="Reload raffles"
                >
                  <RefreshCw size={18} className="text-red-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all backdrop-blur-xl
                    ${selectedCategory === category.id
                      ? `${category.plasticColor} text-white font-bold shadow-2xl border border-white/40 relative overflow-hidden
                         before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:opacity-30
                         after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-black/10`
                      : 'bg-white/5 text-white/90 border border-white/10 hover:border-white/20 hover:bg-white/10'}`
                  }
                >
                  <Icon size={20} />
                  <span className="text-xs">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Raffle Cards with PLASTIC DESIGN */}
        <div className="mt-4 px-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-black">
              {searchQuery ? `Search Results (${filteredRaffles.length})` : 
               selectedCategory === 'featured' ? '🔥 Featured Raffles' : 
               `${categories.find(c => c.id === selectedCategory)?.label} Raffles`}
            </h2>
            <button 
              onClick={() => navigate('/raffles')}
              className="text-sm bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold flex items-center gap-1 group"
            >
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loadingError && (
            <div className="mx-1 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-2xl rounded-2xl border border-white/20 text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle size={20} className="text-red-400" />
                <h3 className="font-bold text-white">Connection Error</h3>
              </div>
              <p className="text-sm text-white/80 mb-3">
                {loadingError}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:shadow-xl transition-all"
              >
                Retry Connection
              </button>
            </div>
          )}

          {loadingRaffles && featuredRaffles.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-white/80">Loading raffles...</div>
            </div>
          ) : getFilteredRaffles().length === 0 ? (
            <div className="mx-1 p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-white mb-2">No Raffles Found</h3>
              <p className="text-sm text-white/80 mb-4">
                {selectedCategory === 'featured' 
                  ? 'No featured raffles available. Check back soon!' 
                  : `No ${selectedCategory} raffles available. Try another category.`}
              </p>
            </div>
          ) : (
            <>
              <div className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[6px] md:gap-2'
                  : 'flex flex-col gap-2'
              }`}>
                {getFilteredRaffles().map((raffle) => {
                  const progress = ((raffle.ticketsSold || 0) / (raffle.totalTickets || 100)) * 100;
                  const ticketsLeft = (raffle.totalTickets || 100) - (raffle.ticketsSold || 0);
                  const isActive = isRaffleActive(raffle);
                  
                  return (
                    <div
                      key={raffle.id}
                      className="group relative"
                    >
                      {/* Enhanced Plastic Card */}
                      <PlasticCard className="h-full">
                        {/* Prize Image with Hover Effect */}
                        <div className="relative h-32 md:h-36 overflow-hidden">
                          <img
                            src={raffle.image}
                            alt={raffle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                          
                          {/* Odds Badge */}
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[9px] px-2 py-[2px] rounded-md border border-white/10">
                            1 in {raffle.totalTickets || 1000}
                          </div>
                          
                          {/* Featured Badge */}
                          {raffle.featured && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[9px] px-2 py-[2px] rounded-md font-bold border border-yellow-300">
                              FEATURED
                            </div>
                          )}

                          {/* Ended Badge */}
                          {!isActive && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] px-2 py-[2px] rounded-md font-bold border border-red-300">
                              ENDED
                            </div>
                          )}
                          
                          {/* Title and Value Overlay */}
                          <div className="absolute bottom-0 inset-x-0 px-2 py-2">
                            <div className="text-[11px] font-semibold leading-tight truncate text-white">
                              {raffle.title}
                            </div>
                            <div className="text-sm font-bold text-yellow-400 leading-none">
                              {raffle.value}
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="px-2 pt-2 pb-2">
                          {/* Progress Bar with Urgency */}
                          <div className="mb-2">
                            <div className="flex justify-between text-[9px] text-white/60 mb-[2px]">
                              <span>{formatNumber(raffle.ticketsSold)} sold</span>
                              <span>{formatNumber(raffle.totalTickets)} total</span>
                            </div>
                            <div className="h-[3px] bg-white/15 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-yellow-400 font-semibold mt-[2px] flex items-center gap-1">
                              <Zap size={8} /> {ticketsLeft} left • {Math.round(progress)}% filled
                            </div>
                          </div>

                          {/* Draw Date */}
                          <div className="flex items-center gap-1 text-[9px] text-white/60 mb-2">
                            <Calendar size={10} />
                            {formatDate(raffle.drawDate)}
                            {!isActive && <span className="text-red-400 ml-1">(Ended)</span>}
                          </div>

                          {/* Ticket Controls */}
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="text-[9px] text-white/60">Ticket</div>
                              <div className="text-[11px] font-bold">
                                ₦{formatNumber(raffle.ticketPrice)}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTicketQuantity(raffle.id, -1);
                                }}
                                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                                disabled={!isActive}
                              >
                                <Minus size={12} />
                              </button>

                              <span className="text-[11px] font-bold w-6 text-center">
                                {ticketQuantity[raffle.id] || 1}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTicketQuantity(raffle.id, 1);
                                }}
                                className="w-7 h-7 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isActive}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => navigate(`/item/${raffle.id}`)}
                              className="flex-1 text-[10px] py-1.5 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                            >
                              Details
                            </button>

                            <PlasticButton
                              onClick={() => handleQuickBuy(raffle)}
                              disabled={processingPayment || !isActive}
                              className={`flex-1 text-[10px] py-2.5 ${
                                !isActive
                                  ? 'bg-gray-500/50 cursor-not-allowed'
                                  : processingPayment
                                  ? 'bg-yellow-500/50'
                                  : ''
                              }`}
                            >
                              {!isActive ? (
                                'Ended'
                              ) : processingPayment ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                  Buying...
                                </div>
                              ) : (
                                'Buy Tickets'
                              )}
                            </PlasticButton>
                          </div>
                        </div>
                      </PlasticCard>
                    </div>
                  );
                })}
              </div>

              {/* Load More Trigger for Infinite Scroll */}
              {selectedCategory === 'featured' && hasMore && (
                <div 
                  ref={observerRef}
                  className="mt-4 flex justify-center"
                >
                  {loadingMore ? (
                    <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PlasticButton
                      onClick={loadMoreRaffles}
                      plasticColor="bg-gradient-to-b from-blue-400 to-purple-500"
                    >
                      Load More Raffles
                    </PlasticButton>
                  )}
                </div>
              )}
            </>
          )}

          {/* CLEAR REGISTRATION CTA - Simplified for Regular Users */}
          {!isLoggedIn && getFilteredRaffles().length > 0 && (
            <div className="mt-4 mx-1">
              <PlasticCard plasticColor="bg-gradient-to-b from-blue-500/20 to-blue-600/20">
                <div className="p-4 text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-bold text-white mb-2">Ready to Play & Win?</h3>
                  <p className="text-sm text-white/80 mb-3">
                    Register as a regular user to buy tickets and join the draws.
                    Simple registration, instant play!
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <PlasticButton
                      onClick={() => navigate('/register')}
                      plasticColor="bg-gradient-to-b from-blue-400 to-blue-600"
                    >
                      <UserPlus size={16} className="inline mr-2" />
                      Register as User
                    </PlasticButton>
                    <button 
                      onClick={() => navigate('/login')}
                      className="py-2.5 bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold rounded-xl hover:bg-white/25 transition-all"
                    >
                      <LogIn size={16} className="inline mr-2" />
                      Login
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-3">
                    Want to earn commissions instead? <button 
                      onClick={() => navigate('/influencers/auth')}
                      className="text-purple-300 hover:text-purple-200 font-bold"
                    >
                      Become an Influencer
                    </button>
                  </p>
                </div>
              </PlasticCard>
            </div>
          )}
        </div>

        {/* Latest Winners - From Firebase Collection */}
        <div className="mt-6 px-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black">🏆 Latest Winners</h2>
            <button 
              onClick={() => navigate('/winners')}
              className="text-sm bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold flex items-center gap-1 group"
            >
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loadingWinners ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/20">
                  <div className="h-32 bg-white/10 animate-pulse"></div>
                  <div className="p-3">
                    <div className="h-4 bg-white/10 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-white/10 rounded animate-pulse mb-3"></div>
                    <div className="h-8 bg-white/10 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestWinners.length === 0 ? (
            <div className="text-center py-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold text-white mb-2">No Winners Yet</h3>
              <p className="text-sm text-white/80 mb-4">
                Be the first winner! Register as a user and join a raffle today.
              </p>
              <PlasticButton
                onClick={() => navigate('/register')}
                plasticColor="bg-gradient-to-b from-blue-400 to-blue-600"
              >
                <UserPlus size={16} className="inline mr-2" />
                Register to Play
              </PlasticButton>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {latestWinners.map((winner) => (
                <div 
                  key={winner.id} 
                  className="group cursor-pointer"
                  onClick={() => setSelectedWinnerStory(winner)}
                >
                  <PlasticCard>
                    {/* Prize Image */}
                    <div className="relative h-32">
                      <img
                        src={winner.prizeImage}
                        alt={winner.prize}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      {/* Verified Badge */}
                      {winner.verified && (
                        <div className="absolute top-2 right-2 bg-green-500/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-300/30">
                          <CheckCircle size={8} /> Verified
                        </div>
                      )}
                      
                      {/* Prize Info */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-xs font-bold text-white truncate">{winner.prize}</div>
                        <div className="text-sm font-black text-yellow-400">{winner.prizeValue}</div>
                      </div>
                    </div>

                    {/* Winner Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500/50">
                          <img
                            src={winner.winnerImage}
                            alt={winner.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{winner.name}</div>
                          <div className="text-[10px] text-white/60 flex items-center gap-1">
                            <MapPin size={10} /> {winner.location}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-center mb-2">
                        <div className="bg-white/5 rounded p-1.5">
                          <div className="text-[10px] text-white/60">Ticket</div>
                          <div className="text-xs font-bold">₦{formatNumber(winner.ticketPrice)}</div>
                        </div>
                        <div className="bg-white/5 rounded p-1.5">
                          <div className="text-[10px] text-white/60">Won</div>
                          <div className="text-xs font-bold text-green-400">{winner.timeAgo}</div>
                        </div>
                      </div>

                      {/* View Story Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWinnerStory(winner);
                        }}
                        className="w-full text-xs py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-all"
                      >
                        View Story
                      </button>
                    </div>
                  </PlasticCard>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFLUENCER PROMOTION BANNER - Clear separation */}
        <div className="mt-6 px-3">
          <PlasticCard plasticColor="bg-gradient-to-b from-purple-500/20 to-pink-500/20">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Crown size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">👑 FOR INFLUENCERS ONLY</h3>
                  <p className="text-sm text-white/80">Earn 15% commission on referrals</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-xs text-white/60">Per Referral</div>
                  <div className="text-lg font-black text-green-400">₦3,750</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-xs text-white/60">Monthly</div>
                  <div className="text-lg font-black text-yellow-400">₦500K+</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-xs text-white/60">Top Earners</div>
                  <div className="text-lg font-black text-pink-400">₦2M+</div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm font-bold text-white mb-2">Separate from regular users:</div>
                <div className="text-xs text-white/70 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>Separate influencer dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>15% commission on all referrals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>Advanced tracking & analytics</span>
                  </div>
                </div>
              </div>
              
              <PlasticButton
                onClick={() => navigate('/influencers/auth')}
                plasticColor="bg-gradient-to-b from-purple-400 to-pink-500"
                className="w-full"
              >
                👑 Join Influencer Program
              </PlasticButton>
              
              <p className="text-xs text-white/60 mt-2 text-center">
                Want to play instead? <button 
                  onClick={() => navigate('/register')}
                  className="text-blue-300 hover:text-blue-200 font-bold"
                >
                  Register as Regular User
                </button>
              </p>
            </div>
          </PlasticCard>
        </div>

        {/* Paystack Security Badge */}
        <div className="mt-6 mx-3 text-center">
          <PlasticCard>
            <div className="p-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} className="text-green-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">Secure Payments</div>
                  <div className="text-xs text-white/60">Powered by Paystack</div>
                </div>
              </div>
              <p className="text-xs text-white/70 mb-3">
                All transactions are 100% secure with bank-level encryption
              </p>
              <div className="flex justify-center">
                <Suspense fallback={<div className="h-6 w-24 bg-white/10 rounded animate-pulse"></div>}>
                  <PaystackLogo />
                </Suspense>
              </div>
            </div>
          </PlasticCard>
        </div>

        {/* FINAL CTA BANNER - Clear Dual Options */}
        <div className="mt-6 mx-3 mb-20">
          <PlasticCard plasticColor="bg-gradient-to-b from-gray-900/40 to-gray-800/40">
            <div className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10 p-5 text-center">
                <h3 className="font-black text-white text-xl mb-3">🎯 READY TO GET STARTED?</h3>
                <p className="text-white/95 text-sm mb-4">
                  Choose your path: Play to win OR Earn as influencer
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                  {/* Regular User CTA */}
                  <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl p-4 border border-blue-500/30">
                    <div className="text-2xl mb-2">🎫</div>
                    <h4 className="font-bold text-white mb-2">PLAY & WIN PRIZES</h4>
                    <p className="text-xs text-blue-200 mb-3">For Regular Users</p>
                    <PlasticButton
                      onClick={() => navigate('/register')}
                      plasticColor="bg-gradient-to-b from-blue-400 to-blue-600"
                      className="w-full"
                    >
                      Register as User
                    </PlasticButton>
                  </div>
                  
                  {/* Influencer CTA */}
                  <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-4 border border-purple-500/30">
                    <div className="text-2xl mb-2">👑</div>
                    <h4 className="font-bold text-white mb-2">EARN COMMISSIONS</h4>
                    <p className="text-xs text-purple-200 mb-3">For Influencers</p>
                    <PlasticButton
                      onClick={() => navigate('/influencers/auth')}
                      plasticColor="bg-gradient-to-b from-purple-400 to-pink-500"
                      className="w-full"
                    >
                      Become Influencer
                    </PlasticButton>
                  </div>
                </div>
                
                <p className="text-xs text-white/70 mt-3">
                  Already have an account? 
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-yellow-300 hover:text-yellow-200 font-bold ml-1"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          </PlasticCard>
        </div>
      </main>

      {/* Enhanced Glassmorphic Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/15 backdrop-blur-2xl border-t border-white/25 z-40 py-1.5">
        <div className="flex">
          {[
            { id: 'home', label: 'Home', icon: HomeIcon, route: '/' },
            { id: 'raffles', label: 'Raffles', icon: Ticket, route: '/raffles' },
            { id: 'winners', label: 'Winners', icon: Trophy, route: '/winners' },
            { id: 'live-draw', label: 'Live', icon: Clock, route: '/live-draw' },
            { id: 'forum', label: 'Forum', icon: MessageCircle, route: '/forum' },
            { id: 'profile', label: isLoggedIn ? 'Me' : 'Login', icon: User, route: isLoggedIn ? '/dashboard' : '/login' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.route;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={`flex-1 flex flex-col items-center justify-center relative transition-all ${
                  isActive ? 'text-yellow-400' : 'text-white/80'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 w-3/4 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-b-full shadow-lg shadow-yellow-500/30"></div>
                )}
                <div className={`p-1.5 rounded-lg transition-all ${
                  isActive ? 'bg-white/15 backdrop-blur-sm shadow-lg' : 'hover:bg-white/10'
                }`}>
                  <Icon size={20} />
                </div>
                <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Buy Modal */}
      {showQuickBuyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <PlasticCard className="max-w-xs w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white">Buy Tickets</h3>
                <button
                  onClick={() => {
                    setShowQuickBuyModal(null);
                    setProcessingPayment(false);
                  }}
                  disabled={processingPayment}
                  className="text-white/60 hover:text-white disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={showQuickBuyModal.image}
                  alt={showQuickBuyModal.title}
                  className="w-16 h-16 rounded-xl object-cover border border-white/20"
                  loading="lazy"
                />
                <div>
                  <div className="font-bold text-sm">{showQuickBuyModal.title}</div>
                  <div className="text-lg font-black text-yellow-400">{showQuickBuyModal.value}</div>
                  <div className="text-xs text-white/60">
                    ₦{formatNumber(showQuickBuyModal.ticketPrice)} per ticket
                  </div>
                  {!isRaffleActive(showQuickBuyModal) && (
                    <div className="text-xs text-red-400 font-bold mt-1">⚠️ This raffle has ended</div>
                  )}
                </div>
              </div>

              {isLoggedIn && (
                <div className="mb-4">
                  <div className="text-sm font-bold text-white mb-2">Payment Method</div>
                  <div className="space-y-2">
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${
                      walletBalance >= (ticketQuantity[showQuickBuyModal.id] || 1) * showQuickBuyModal.ticketPrice
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                        : 'bg-white/10 border-white/10'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Wallet size={18} className="text-green-400" />
                        <div>
                          <div className="text-sm font-bold text-white">Account Balance</div>
                          <div className="text-xs text-white/60">{formatWalletBalance()}</div>
                        </div>
                      </div>
                      {walletBalance >= (ticketQuantity[showQuickBuyModal.id] || 1) * showQuickBuyModal.ticketPrice ? (
                        <div className="text-xs text-green-400 font-bold">✓ Available</div>
                      ) : (
                        <div className="text-xs text-yellow-400 font-bold">Add Funds</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10">
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-blue-400" />
                        <div>
                          <div className="text-sm font-bold text-white">Pay with Card</div>
                          <div className="text-xs text-white/60">PayStack Secure</div>
                        </div>
                      </div>
                      <div className="text-xs text-blue-400 font-bold">PayStack</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-white">Quantity</div>
                  <div className="text-sm font-bold text-yellow-400">
                    {ticketQuantity[showQuickBuyModal.id] || 1} ticket{(ticketQuantity[showQuickBuyModal.id] || 1) > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">Total Amount</div>
                  <div className="text-lg font-black text-yellow-400">
                    ₦{formatNumber((ticketQuantity[showQuickBuyModal.id] || 1) * showQuickBuyModal.ticketPrice)}
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400" />
                    <div className="text-sm text-white">{paymentError}</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <PlasticButton
                  onClick={() => handleQuickBuy(showQuickBuyModal)}
                  disabled={processingPayment || !isRaffleActive(showQuickBuyModal)}
                  plasticColor={!isRaffleActive(showQuickBuyModal) ? 'bg-gradient-to-b from-gray-500 to-gray-700' : 'bg-gradient-to-b from-yellow-400 to-orange-500'}
                >
                  {processingPayment ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : !isRaffleActive(showQuickBuyModal) ? (
                    'Raffle Ended'
                  ) : !isLoggedIn ? (
                    <>
                      <User size={20} className="inline mr-2" />
                      Login to Buy Tickets
                    </>
                  ) : walletBalance >= (ticketQuantity[showQuickBuyModal.id] || 1) * showQuickBuyModal.ticketPrice ? (
                    `🎫 Buy with Balance`
                  ) : (
                    `💳 Pay with Card`
                  )}
                </PlasticButton>
                
                {isLoggedIn && walletBalance < (ticketQuantity[showQuickBuyModal.id] || 1) * showQuickBuyModal.ticketPrice && isRaffleActive(showQuickBuyModal) && (
                  <button 
                    onClick={() => navigate('/dashboard?tab=balance')}
                    className="w-full py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-bold"
                  >
                    + Fund Your Account
                  </button>
                )}
              </div>
            </div>
          </PlasticCard>
        </div>
      )}

      {/* Winner Story Modal */}
      {selectedWinnerStory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <PlasticCard className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-yellow-400">Winner's Story</h2>
                <button
                  onClick={() => setSelectedWinnerStory(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-500">
                  <img
                    src={selectedWinnerStory.winnerImage}
                    alt={selectedWinnerStory.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="text-lg font-bold">{selectedWinnerStory.name}</div>
                  <div className="text-sm text-white/70">{selectedWinnerStory.profession}</div>
                  <div className="text-sm text-white/60">{selectedWinnerStory.location}</div>
                </div>
              </div>

              <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                <img
                  src={selectedWinnerStory.prizeImage}
                  alt={selectedWinnerStory.prize}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="text-lg font-bold text-white">{selectedWinnerStory.prize}</div>
                  <div className="text-xl font-black text-yellow-400">{selectedWinnerStory.prizeValue}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2 text-white">The Winning Journey</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  "{selectedWinnerStory.story}"
                </p>
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-sm font-bold text-yellow-400 mb-1">🎯 Other Tickets could Change your Life :</div>
                  <div className="text-sm text-white">Never underestimate small chances; one decision can change your entire life!</div>
                  <div className="text-xs text-white/60 mt-2">
                    Ticket: ₦{formatNumber(selectedWinnerStory.ticketPrice)} • Won: {selectedWinnerStory.timeAgo}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <PlasticButton
                  onClick={() => navigate('/register')}
                  plasticColor="bg-gradient-to-b from-blue-400 to-blue-600"
                  className="w-full"
                >
                  <UserPlus size={16} className="inline mr-2" />
                  Join as User & Start Winning
                </PlasticButton>
                <button 
                  onClick={() => navigate('/raffles')}
                  className="w-full py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-all"
                >
                  Browse Similar Raffles
                </button>
                <button 
                  onClick={() => setSelectedWinnerStory(null)}
                  className="w-full py-2 text-white/70 hover:text-white transition-colors"
                >
                  Close Story
                </button>
              </div>
            </div>
          </PlasticCard>
        </div>
      )}

      {/* Quick Buy Success Modal */}
      {buySuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <PlasticCard className="max-w-xs w-full" plasticColor="bg-gradient-to-b from-green-500/20 to-emerald-500/20">
            <div className="p-5 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="font-black text-xl mb-2 text-white">🎉 Purchase Successful!</h3>
              <p className="text-sm text-white/80 mb-3">
                You bought {buySuccess.quantity} ticket(s) for ₦{buySuccess.total.toLocaleString()}
              </p>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 mb-4 border border-white/15">
                <div className="text-xs font-medium text-white/70 mb-1">Ticket Numbers:</div>
                <div className="text-xs font-mono text-green-400">
                  {buySuccess.ticketNumbers.join(', ')}
                </div>
              </div>
              <PlasticButton
                onClick={() => setBuySuccess(null)}
                plasticColor="bg-gradient-to-b from-yellow-400 to-orange-500"
                className="w-full mb-2"
              >
                Continue Browsing
              </PlasticButton>
              <button 
                onClick={() => navigate('/dashboard?tab=tickets')}
                className="w-full py-2 text-white/80 hover:text-white transition-colors text-sm"
              >
                View My Tickets
              </button>
            </div>
          </PlasticCard>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default HomePage;